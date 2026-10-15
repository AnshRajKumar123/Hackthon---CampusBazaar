const mongoose = require("mongoose");

const MessageItemSchema = new mongoose.Schema({
    senderRoll: { type: String, required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: String, required: true },
    seen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const ChatConversationSchema = new mongoose.Schema(
    {
        itemId: { type: String, required: true },
        itemTitle: { type: String, required: true },
        sellerRoll: { type: String, required: true },
        sellerName: { type: String, required: true },
        buyerRoll: { type: String, required: true },
        buyerName: { type: String, required: true },
        participants: [{ type: String, required: true }],
        messages: [MessageItemSchema]
    },
    { timestamps: true }
);

ChatConversationSchema.index({ participants: 1 });
ChatConversationSchema.index({ itemId: 1, buyerRoll: 1 });

const ChatConversation = mongoose.model("ChatConversation", ChatConversationSchema);

module.exports = { ChatConversation };