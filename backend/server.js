const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Permissive CORS for local Vite development and LAN devices
app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health & Ping Endpoints
app.get("/", (req, res) => {
    res.send("CampusBazaar API is running locally.");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});

// Route Handlers
app.use("/api/auth", require("./routes/auth"));
app.use("/api/listings", require("./routes/listings"));

// MongoDB Atlas Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Atlas Connected successfully."))
    .catch((err) => console.error("MongoDB Atlas connection error:", err));

// Local Development Port
const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`CampusBazaar server running on port ${PORT}`);
});