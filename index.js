import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {setChatDB, updateChatDB} from "./functions/db.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Store active SSE connections
const sseClients = new Map();

// Middleware
app.use(express.json());
app.use(cors());

// SSE endpoint for real-time script updates
app.get("/events/:chatID", (req, res) => {
  const {chatID} = req.params;

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Store client connection
  sseClients.set(chatID, res);
  console.log(`SSE client connected: ${chatID}`);

  // Send initial connection message
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      message: "Connected to script updates",
      timestamp: new Date().toISOString(),
    })}\n\n`
  );

  // Handle client disconnect
  req.on("close", () => {
    console.log(`SSE client disconnected: ${chatID}`);
    sseClients.delete(chatID);
  });
});

// Function to send script to specific client
function sendScriptToClient(
  chatID,
  scriptData,
  readyToken,
  scriptIndex,
  totalScripts
) {
  const client = sseClients.get(chatID);
  if (client) {
    try {
      client.write(
        `data: ${JSON.stringify({
          type: "script_ready",
          data: scriptData,
          readyToken: readyToken,
          scriptIndex: scriptIndex,
          totalScripts: totalScripts,
          timestamp: new Date().toISOString(),
        })}\n\n`
      );
      console.log(`Sent script ${scriptIndex} to client: ${chatID}`);
      return true;
    } catch (error) {
      console.error(`Error sending script to client ${chatID}:`, error);
      sseClients.delete(chatID);
      return false;
    }
  } else {
    console.warn(`Client ${chatID} not found in active connections`);
    return false;
  }
}

// Function to send completion message
function sendCompletionToClient(chatID, allScripts, allTokens) {
  const client = sseClients.get(chatID);
  if (client) {
    try {
      client.write(
        `data: ${JSON.stringify({
          type: "all_scripts_complete",
          allScripts: allScripts,
          allTokens: allTokens,
          timestamp: new Date().toISOString(),
        })}\n\n`
      );
      console.log(`Sent completion message to client: ${chatID}`);
    } catch (error) {
      console.error(`Error sending completion to client ${chatID}:`, error);
      sseClients.delete(chatID);
    }
  }
}

// POST endpoint to receive text and uid, start script generation
app.post("/submit", async (req, res) => {
  try {
    const {text, uid, chatID} = req.body;

    // Validate required fields
    if (!text || !uid || !chatID) {
      return res.status(400).json({
        success: false,
        message: "Text, UID, and ChatID are required",
      });
    }

    console.log(`Received request from ${uid}: ${text}`);

    // Generate script tokens from external API
    const responseScript = await fetch(process.env.VDO_AI_URL + "/gen_vid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: text,
      }),
    });

    const scriptData = await responseScript.json();
    const {tokens} = scriptData;

    // Handle token as array - ensure we have exactly 3 tokens
    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
    console.log(`Generated script tokens for ${uid}:`, tokenArray);

    // Initialize database with empty scripts array
    const dbSts = await setChatDB({
      uid: uid,
      text: text,
      script: null,
      scriptToken: tokenArray,
      readyToken: null,
      chatID: chatID,
    });

    if (dbSts && dbSts.success === false) {
      return res.status(500).json({
        success: false,
        message: "Error saving to database",
      });
    }

    // Send immediate response with tokens
    res.status(200).json({
      success: true,
      message: "Script generation started",
      tokens: tokenArray,
      chatID: chatID,
      sseEndpoint: `/events/${chatID}`,
    });

    // Start polling for all scripts in the background
    pollAllScripts(tokenArray, chatID, uid, text);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Background function to poll all scripts and stream results
async function pollAllScripts(tokenArray, chatID, uid, text) {
  const maxPolls = 600; // 60 * 10s = 600s
  const completedScripts = [];
  const completedTokens = [];
  const pollingStatus = tokenArray.map(() => ({completed: false, data: null}));

  console.log(`Starting background polling for ${tokenArray.length} scripts`);

  // Poll continuously until all scripts are ready or timeout
  for (let pollCount = 0; pollCount < maxPolls; pollCount++) {
    console.log(`Polling attempt ${pollCount + 1}/${maxPolls}`);

    // Check if all scripts are completed
    if (pollingStatus.every((status) => status.completed)) {
      console.log("All scripts completed!");
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));

    try {
      // Poll each token that hasn't completed yet
      const pollPromises = tokenArray.map(async (token, index) => {
        if (pollingStatus[index].completed) {
          return {
            index,
            token,
            data: null,
            ready: false,
            alreadyCompleted: true,
          };
        }

        try {
          const pollResponse = await fetch(
            `${process.env.VDO_AI_URL}/get_script?token=${token}`
          );
          const pollData = await pollResponse.json();

          // Check if this token's script is ready
          if (pollData && pollData.scenes && pollData.scenes.length > 0) {
            return {
              index,
              token,
              data: pollData,
              ready: true,
              alreadyCompleted: false,
            };
          }
          return {
            index,
            token,
            data: pollData,
            ready: false,
            alreadyCompleted: false,
          };
        } catch (error) {
          console.error(`Error polling token ${token}:`, error);
          return {
            index,
            token,
            data: null,
            ready: false,
            alreadyCompleted: false,
          };
        }
      });

      const pollResults = await Promise.all(pollPromises);

      // Process newly completed scripts
      for (const result of pollResults) {
        if (result.ready && !result.alreadyCompleted) {
          const {index, token, data} = result;

          // Mark as completed
          pollingStatus[index].completed = true;
          pollingStatus[index].data = data;

          // Add to completed arrays
          completedScripts.push(data);
          completedTokens.push(token);

          console.log(`Script ${index + 1} completed for token: ${token}`);

          // Send this script to the client immediately
          sendScriptToClient(chatID, data, token, index + 1, tokenArray.length);

          // Update database with the new script
          try {
            await updateChatDB({
              chatID: chatID,
              script: completedScripts,
              readyToken: completedTokens,
            });
          } catch (dbError) {
            console.error("Error updating database:", dbError);
          }
        }
      }
    } catch (pollError) {
      console.error("Error during polling:", pollError);
    }
  }

  // Send final completion message
  if (completedScripts.length > 0) {
    sendCompletionToClient(chatID, completedScripts, completedTokens);
  }

  console.log(
    `Polling completed. Generated ${completedScripts.length}/${tokenArray.length} scripts`
  );
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET    /health - Health check`);
  console.log(
    `  GET    /events/:chatID - SSE connection for real-time script updates`
  );
  console.log(
    `  POST   /submit - Submit text, uid, chatID to start script generation`
  );
});
