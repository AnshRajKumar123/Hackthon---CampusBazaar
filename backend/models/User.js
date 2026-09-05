const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    password: { type: String, required: true },
    department: { type: String, default: "Computer Science & Engineering" },
    hostelBlock: { type: String, default: "Block A" },
    phone: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);