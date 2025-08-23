import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {setChatDB} from "./functions/db.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors());

// POST endpoint to receive text and uid, return demo data
app.post("/submit", async (req, res) => {
  try {
    const {text, uid} = req.body;

    // Validate required fields
    if (!text || !uid) {
      return res.status(400).json({
        success: false,
        message: "Text and UID are required",
      });
    }

    console.log(`Received request from ${uid}: ${text}`);

    // Generate script token from external API
    const responseScript = await fetch("http://10.50.51.244:8000/gen_vid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: text,
      }),
    });

    const scriptData = await responseScript.json();
    const {token} = scriptData;
    console.log(`Generated script token for ${uid}: ${token}`);

    // Poll the external API every 5 seconds until the script is ready or timeout after 1 minute
    let scriptReady = false;
    let pollCount = 0;
    const maxPolls = 600; // 60 * 10s = 600s
    let scriptActualData = null;
    while (!scriptReady && pollCount < maxPolls) {
      console.log(
        `Polling for script readiness... (attempt ${pollCount + 1}/${maxPolls})`
      );

      await new Promise((resolve) => setTimeout(resolve, 10000));

      try {
        const pollResponse = await fetch(
          `http://10.50.51.244:8000/get_script?token=${token}`
        );
        const pollData = await pollResponse.json();
        console.log("Poll response:", pollData);

        // Check if the response has scenes (script is ready)
        if (pollData && pollData.scenes && pollData.scenes.length > 0) {
          scriptActualData = pollData;
          scriptReady = true;
          console.log("Script is ready!");
          break;
        }
      } catch (pollError) {
        console.error("Error during polling:", pollError);
      }

      pollCount++;
    }

    // Check if we got the script data
    if (!scriptActualData || !scriptActualData.scenes) {
      console.log("Script data not available after polling");
      return res.status(408).json({
        success: false,
        message: "Script generation timed out or failed",
        token: token,
      });
    }

    console.log("Debug values before setChatDB:");
    console.log("uid:", uid);
    console.log("text:", text);
    console.log("token:", token);
    console.log("scriptActualData:", scriptActualData ? "exists" : "null");

    const dbSts = await setChatDB({
      uid: uid,
      text: text,
      script: scriptActualData,
      scriptToken: token,
    });

    if (dbSts && dbSts.success === false) {
      // Handle DB error
      return res.status(500).json({
        success: false,
        message: "Error saving to database",
      });
    }

    // Return script data and token directly to the specific user
    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: scriptActualData,
      token: token,
      requestInfo: {
        text,
        uid,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

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
  console.log(`  POST   /submit - Submit text and uid, get demo data back`);
});
