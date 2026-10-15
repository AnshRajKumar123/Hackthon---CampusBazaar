const express = require("express");
const { ChatConversation } = require("../models/Chat");
const { Notification } = require("../models/Notification");

const router = express.Router();

// 1. Fetch all conversations for the student (matches by roll number OR student name)
router.get("/conversations", async (req, res) => {
    try {
        const { rollNo, name } = req.query;
        const cleanRoll = String(rollNo || "").trim();
        const cleanName = String(name || "").trim();

        if (!cleanRoll && !cleanName) {
            return res.status(400).json({ success: false, message: "rollNo or name is required" });
        }

        const conditions = [];

        if (cleanRoll) {
            conditions.push(
                { participants: cleanRoll },
                { sellerRoll: cleanRoll },
                { buyerRoll: cleanRoll }
            );
        }

        if (cleanName && cleanName !== "Me" && cleanName !== "Student") {
            const nameRegex = new RegExp(`^${cleanName}$`, "i");
            conditions.push(
                { participants: cleanName },
                { sellerName: { $regex: nameRegex } },
                { buyerName: { $regex: nameRegex } }
            );
        }

        const threads = await ChatConversation.find({ $or: conditions }).sort({ updatedAt: -1 });

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

        const cleanItemId = String(itemId || "").trim();
        const cleanBuyer = String(buyerRoll || "").trim();
        const cleanSeller = String(sellerRoll || "").trim();
        const cleanBuyerName = String(buyerName || "").trim();
        const cleanSellerName = String(sellerName || "").trim();

        if (!cleanItemId) {
            return res.status(400).json({ success: false, message: "itemId is required" });
        }

        // Look for existing conversation for this item
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
        }

        // Check by itemId and buyer name if roll is absent
        if (!conversation && cleanBuyerName) {
            conversation = await ChatConversation.findOne({
                itemId: cleanItemId,
                $or: [
                    { buyerName: new RegExp(`^${cleanBuyerName}$`, "i") },
                    { sellerName: new RegExp(`^${cleanBuyerName}$`, "i") }
                ]
            });
        }

        // Fallback: Check if ANY conversation exists for this itemId
        if (!conversation) {
            conversation = await ChatConversation.findOne({ itemId: cleanItemId }).sort({ updatedAt: -1 });
        }

        // Create new conversation if none exists
        if (!conversation) {
            const finalSellerRoll = cleanSeller || "seller";
            const finalBuyerRoll = cleanBuyer || "buyer";

            const allParticipants = Array.from(new Set([
                finalSellerRoll,
                finalBuyerRoll,
                cleanSellerName,
                cleanBuyerName
            ].filter(Boolean)));

            conversation = await ChatConversation.create({
                itemId: cleanItemId,
                itemTitle: itemTitle || "Campus Gear",
                sellerRoll: finalSellerRoll,
                sellerName: cleanSellerName || "Listing Owner",
                buyerRoll: finalBuyerRoll,
                buyerName: cleanBuyerName || "Inquiring Student",
                participants: allParticipants,
                messages: []
            });
        } else {
            // Ensure participants array stays synchronized
            let modified = false;
            const participantsToAdd = [cleanBuyer, cleanSeller, cleanBuyerName, cleanSellerName].filter(Boolean);
            participantsToAdd.forEach((p) => {
                if (!conversation.participants.includes(p)) {
                    conversation.participants.push(p);
                    modified = true;
                }
            });
            if (modified) {
                await conversation.save();
            }
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
        const { readerRoll, readerName } = req.body;

        if (!id || id === "undefined" || id === "null") {
            return res.status(400).json({ success: false, message: "Invalid conversation ID" });
        }

        const conversation = await ChatConversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: "Thread not found" });
        }

        const cleanRoll = String(readerRoll || "").trim();
        const cleanName = String(readerName || "").trim().toLowerCase();

        let modified = false;
        conversation.messages.forEach((m) => {
            const msgRoll = String(m.senderRoll || "").trim();
            const msgName = String(m.senderName || "").trim().toLowerCase();

            const isSentByReader = (cleanRoll && msgRoll === cleanRoll) || (cleanName && msgName === cleanName);

            if (!isSentByReader && !m.seen) {
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

// 4. Send a new message & safely trigger notification for the other participant
router.post("/conversations/:id/messages", async (req, res) => {
    try {
        const { id } = req.params;
        const { senderRoll, senderName, text } = req.body;

        if (!id || id === "undefined" || id === "null") {
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

        const cleanSenderRoll = String(senderRoll || "").trim();
        const cleanSenderName = String(senderName || "Student").trim();

        const newMsg = {
            senderRoll: cleanSenderRoll,
            senderName: cleanSenderName,
            text: text.trim(),
            time: timeFormatted,
            seen: false
        };

        conversation.messages.push(newMsg);

        if (cleanSenderRoll && !conversation.participants.includes(cleanSenderRoll)) {
            conversation.participants.push(cleanSenderRoll);
        }
        if (cleanSenderName && !conversation.participants.includes(cleanSenderName)) {
            conversation.participants.push(cleanSenderName);
        }

        await conversation.save();

        // Safe recipient calculation: ensures recipientRoll is never "undefined"
        try {
            let recipientRoll = "";
            const isSenderSeller = conversation.sellerRoll && String(conversation.sellerRoll).trim() === cleanSenderRoll;

            if (isSenderSeller && conversation.buyerRoll) {
                recipientRoll = String(conversation.buyerRoll).trim();
            } else if (!isSenderSeller && conversation.sellerRoll) {
                recipientRoll = String(conversation.sellerRoll).trim();
            } else if (Array.isArray(conversation.participants)) {
                const alt = conversation.participants.find(
                    (p) => p && p !== cleanSenderRoll && p !== "seller" && p !== "buyer" && p !== "undefined"
                );
                if (alt) recipientRoll = String(alt).trim();
            }

            if (
                recipientRoll &&
                recipientRoll !== "undefined" &&
                recipientRoll !== "null" &&
                recipientRoll !== cleanSenderRoll
            ) {
                await Notification.create({
                    recipientRoll: recipientRoll,
                    title: `New message from ${cleanSenderName}`,
                    message: text.length > 55 ? `${text.slice(0, 55)}...` : text,
                    type: "CHAT",
                    metadata: { itemId: conversation.itemId, itemTitle: conversation.itemTitle }
                });
            }
        } catch (notifErr) {
            console.error("Notification creation failed:", notifErr);
        }

        res.json({ success: true, message: newMsg, conversation });
    } catch (err) {
        console.error("Send message error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;