const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
    type: { type: String, enum: ["rent", "buy"], required: true },
    itemTitle: { type: String, required: true },
    category: { type: String, required: true },
    condition: { type: String, required: true },
    description: { type: String, default: "" },

    // Pricing
    rentPerDay: { type: Number, default: null },
    rentPerWeek: { type: Number, default: null },
    refundableDeposit: { type: Number, default: 0 },
    buyPrice: { type: Number, default: null },
    originalMrp: { type: Number, default: null },

    // Image paths
    images: [{ type: String }],

    // Student details
    studentName: { type: String, required: true },
    studentPhone: { type: String, required: true },
    department: { type: String, required: true },
    hostelBlock: { type: String, required: true },
    userRollNo: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Listing", ListingSchema);