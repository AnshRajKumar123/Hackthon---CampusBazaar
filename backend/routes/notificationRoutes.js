const express = require("express");
const { Notification } = require("../models/Notification");

const router = express.Router();

// 1. Fetch notifications for a student
router.get("/", async (req, res) => {
    try {
        const { rollNo } = req.query;
        if (!rollNo) {
            return res.status(400).json({ success: false, message: "rollNo is required" });
        }

        const notifications = await Notification.find({
            recipientRoll: String(rollNo).trim()
        })
            .sort({ createdAt: -1 })
            .limit(30);

        const unreadCount = await Notification.countDocuments({
            recipientRoll: String(rollNo).trim(),
            read: false
        });

        res.json({ success: true, notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Create a notification
router.post("/create", async (req, res) => {
    try {
        const { recipientRoll, title, message, type, metadata } = req.body;
        if (!recipientRoll || !title || !message) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const notification = await Notification.create({
            recipientRoll: String(recipientRoll).trim(),
            title,
            message,
            type: type || "CHAT",
            metadata: metadata || {}
        });

        res.json({ success: true, notification });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Mark all notifications as read
router.put("/mark-all-read", async (req, res) => {
    try {
        const { rollNo } = req.body;
        if (!rollNo) {
            return res.status(400).json({ success: false, message: "rollNo is required" });
        }

        await Notification.updateMany(
            { recipientRoll: String(rollNo).trim(), read: false },
            { $set: { read: true } }
        );

        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;