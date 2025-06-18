// server.js - Entry point for backend server
// This file connects to MongoDB and starts the Express server defined in app.js.

import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

dotenv.config(); // Load environment variables

const PORT = process.env.PORT || 5000; // Default to 5000 if not set

// Connect to MongoDB using Mongoose
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    // Start Express server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    // Log connection errors and exit process
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
