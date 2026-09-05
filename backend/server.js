const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Configure CORS to accept requests from both desktop and mobile
app.use(
    cors({
        origin: true, // Automatically mirrors incoming origin (localhost:5173, 10.201.42.237:5173, etc.)
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/listings", require("./routes/listings"));

// Test health endpoint
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// MongoDB Atlas Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Atlas Connected successfully."))
    .catch((err) => console.error("MongoDB Atlas connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`CampusBazaar server running on http://localhost:${PORT}`);
});