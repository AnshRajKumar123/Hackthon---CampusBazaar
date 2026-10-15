const express = require("express");
const { ChatConversation } = require("../models/Chat");

const router = express.Router();

// 1. Fetch all conversations for the student (either as buyer or seller)
router.get("/conversations", async (req, res) => {
    try {
        const { rollNo } = req.query;
        if (!rollNo) {
            return res.status(400).json({ success: false, message: "rollNo is required" });
        }

        const cleanRoll = String(rollNo).trim();

        const threads = await ChatConversation.find({
            $or: [
                { participants: cleanRoll },
                { sellerRoll: cleanRoll },
                { buyerRoll: cleanRoll }
            ]
        }).sort({ updatedAt: -1 });

        res.json({ success: true, threads });
    } catch (err) {
        console.error("Fetch threads error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Open or create conversation for an item
router.post("/conversations/open", async (req, res) => {
    try {
        const { itemId, itemTitle, sellerRoll, sellerName, buyerRoll, buyerName } = req.body;

        const cleanBuyer = String(buyerRoll || "").trim();
        const cleanSeller = String(sellerRoll || "").trim();
        const cleanItemId = String(itemId || "").trim();

        if (!cleanItemId) {
            return res.status(400).json({ success: false, message: "itemId is required" });
        }

        let conversation = null;

        if (cleanBuyer && cleanSeller && cleanBuyer !== cleanSeller) {
            conversation = await ChatConversation.findOne({
                itemId: cleanItemId,
                $or: [
                    { participants: { $all: [cleanBuyer, cleanSeller] } },
                    { sellerRoll: cleanSeller, buyerRoll: cleanBuyer },
                    { sellerRoll: cleanBuyer, buyerRoll: cleanSeller }
                ]
            });
        } else {
            conversation = await ChatConversation.findOne({
                itemId: cleanItemId
            }).sort({ updatedAt: -1 });
        }

        if (!conversation) {
            if (!cleanBuyer || !cleanSeller || cleanBuyer === cleanSeller) {
                const fallback = await ChatConversation.findOne({
                    $or: [{ sellerRoll: cleanBuyer }, { buyerRoll: cleanBuyer }]
                }).sort({ updatedAt: -1 });

                return res.json({ success: true, conversation: fallback || null });
            }

            conversation = await ChatConversation.create({
                itemId: cleanItemId,
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
        console.error("Open conversation error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Mark messages as read by recipient
router.put("/conversations/:id/seen", async (req, res) => {
    try {
        const { id } = req.params;
        const { readerRoll } = req.body;

        if (!id || id === "undefined") {
            return res.status(400).json({ success: false, message: "Invalid conversation ID" });
        }

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
        console.error("Seen error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. Send a new message
router.post("/conversations/:id/messages", async (req, res) => {
    try {
        const { id } = req.params;
        const { senderRoll, senderName, text } = req.body;

        if (!id || id === "undefined") {
            return res.status(400).json({ success: false, message: "Invalid conversation ID" });
        }

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

        const cleanSender = String(senderRoll).trim();
        if (!conversation.participants.includes(cleanSender)) {
            conversation.participants.push(cleanSender);
        }

        await conversation.save();

        res.json({ success: true, message: newMsg, conversation });
    } catch (err) {
        console.error("Send message error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;