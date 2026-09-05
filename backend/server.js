const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Robust CORS Setup for Vercel and Local Development
app.use(
    cors({
        origin: (origin, callback) => callback(null, true),
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health and Root Sanity Checks
app.get("/", (req, res) => {
    res.send("CampusBazaar API is running live on Render.");
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        environment: process.env.NODE_ENV || "production",
        timestamp: new Date(),
    });
});

// Route Handlers
app.use("/api/auth", require("./routes/auth"));
app.use("/api/listings", require("./routes/listings"));

// MongoDB Atlas Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Atlas Connected successfully."))
    .catch((err) => console.error("MongoDB Atlas connection error:", err));

// Render automatically provisions PORT; default to 5001 locally
const PORT = process.env.PORT || 10000;

// Binding to 0.0.0.0 is required for Render's reverse proxy to route traffic
app.listen(PORT, "0.0.0.0", () => {
    console.log(`CampusBazaar server running on port ${PORT}`);
});