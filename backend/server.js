const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Explicit allowed origins for local dev and live Vercel deployments
const allowedOrigins = [
    "http://localhost:5173",
    "https://campusbazaar-dbu.vercel.app",
    "https://campusbazaar-mu.vercel.app"
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow non-browser requests or any subdomains on vercel.app / local LAN
        if (
            !origin ||
            allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app") ||
            origin.includes("10.201.") ||
            origin.includes("192.168.")
        ) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive fallback to ensure no blockage
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
// Handle CORS preflight explicitly across all routes
app.options("*", cors(corsOptions));

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`CampusBazaar server running on port ${PORT}`);
});