import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors());

// Demo data
const demoData = {
  "title": "Understanding the Wheatstone Bridge",
  "scenes": [
    {
      "seq": 1,
      "text":
        "What is a Wheatstone bridge? It's a circuit used to precisely measure an unknown electrical resistance by balancing two legs of a bridge, where one leg contains the unknown component.",
      "anim":
        "A diamond-shaped circuit diagram animates onto the screen. It shows a voltage source connected to four resistors labeled R1, R2, R3, and Rx. A galvanometer (labeled G) connects the two middle points. The title 'Wheatstone Bridge' appears above.",
      "duration_sec": 14,
    },
    {
      "seq": 2,
      "text":
        "The magic happens when the bridge is 'balanced'. In this state, the voltage at the center of each branch is equal, meaning no current flows through the galvanometer in the middle.",
      "anim":
        "The circuit diagram is shown. Animated arrows representing current flow from the source and split into the two branches. The needle on the galvanometer (G) is shown at zero. The text 'V_A = V_B' and 'Current = 0' appears next to the galvanometer.",
      "duration_sec": 13,
    },
    {
      "seq": 3,
      "text":
        "When the bridge is balanced, the ratio of resistances in the known leg is equal to the ratio of resistances in the leg with the unknown component.",
      "anim":
        "The circuit diagram is highlighted. Resistors R1 and R2 glow, and the formula 'R2 / R1' appears beside them. Then, resistors R3 and Rx glow, and the formula 'Rx / R3' appears. An equals sign animates between them to form the full equation: R2 / R1 = Rx / R3.",
      "duration_sec": 12,
    },
    {
      "seq": 4,
      "text":
        "By simply rearranging this equation, we can solve for the unknown resistance. Rx equals R3 multiplied by the ratio of R2 to R1. This is how many modern sensors work.",
      "anim":
        "The equation on screen rearranges itself to become 'Rx = R3 * (R2 / R1)'. Example values appear for the known resistors (R1=100Ω, R2=200Ω, R3=150Ω) and the calculation animates to show the result: Rx = 300Ω. The scene briefly transitions to show icons of a strain gauge and a thermostat.",
      "duration_sec": 15,
    },
  ],
};

// POST endpoint to receive text and uid, return demo data
app.post("/submit", (req, res) => {
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

    // Return demo data directly to the specific user
    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: demoData,
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
