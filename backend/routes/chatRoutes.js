const express = require("express");
const { ChatConversation } = require("../models/Chat");

const router = express.Router();

// 1. Fetch all conversations for the student
router.get("/conversations", async (req, res) => {
    try {
        const { rollNo } = req.query;
        if (!rollNo) {
            return res.status(400).json({ success: false, message: "rollNo is required" });
        }

        const cleanRoll = String(rollNo).trim();
        const threads = await ChatConversation.find({
            participants: cleanRoll
        }).sort({ updatedAt: -1 });

        res.json({ success: true, threads });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Open or create conversation for an item
router.post("/conversations/open", async (req, res) => {
    try {
        const { itemId, itemTitle, sellerRoll, sellerName, buyerRoll, buyerName } = req.body;

        const cleanBuyer = String(buyerRoll).trim();
        const cleanSeller = String(sellerRoll).trim();

        let conversation = await ChatConversation.findOne({
            itemId: String(itemId),
            participants: { $all: [cleanBuyer, cleanSeller] }
        });

        if (!conversation) {
            conversation = await ChatConversation.create({
                itemId: String(itemId),
                itemTitle: itemTitle || "Campus Gear",
                sellerRoll: cleanSeller,
                sellerName: sellerName || "Seller",
                buyerRoll: cleanBuyer,
                buyerName: buyerName || "Buyer",
                participants: [cleanSeller, cleanBuyer],
                messages: []
            });
        }

        res.json({ success: true, conversation });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Mark messages as read by recipient
router.put("/conversations/:id/seen", async (req, res) => {
    try {
        const { id } = req.params;
        const { readerRoll } = req.body;

        const conversation = await ChatConversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: "Thread not found" });
        }

        let modified = false;
        conversation.messages.forEach((m) => {
            if (String(m.senderRoll).trim() !== String(readerRoll).trim() && !m.seen) {
                m.seen = true;
                modified = true;
            }
        });

        if (modified) {
            await conversation.save();
        }

        res.json({ success: true, messages: conversation.messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. Send message
router.post("/conversations/:id/messages", async (req, res) => {
    try {
        const { id } = req.params;
        const { senderRoll, senderName, text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: "Message cannot be empty" });
        }

        const now = new Date();
        const timeFormatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const conversation = await ChatConversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: "Thread not found" });
        }

        const newMsg = {
            senderRoll: String(senderRoll).trim(),
            senderName: senderName || "Student",
            text: text.trim(),
            time: timeFormatted,
            seen: false
        };

        conversation.messages.push(newMsg);
        await conversation.save();

        res.json({ success: true, message: newMsg, conversation });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;