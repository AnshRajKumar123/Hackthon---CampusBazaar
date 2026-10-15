const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        recipientRoll: { type: String, required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["CHAT", "AUTH", "LISTING_ADD", "LISTING_UPDATE", "LISTING_DELETE"],
            default: "CHAT"
        },
        read: { type: Boolean, default: false },
        metadata: { type: Object, default: {} }
    },
    { timestamps: true }
);

NotificationSchema.index({ recipientRoll: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = { Notification };