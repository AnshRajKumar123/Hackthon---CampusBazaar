const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Listing = require("../models/Listing");

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { name, rollNo, password, department, hostelBlock, phone } = req.body;

        const existing = await User.findOne({ rollNo: rollNo.toUpperCase().trim() });
        if (existing) {
            return res.status(400).json({ success: false, message: "Student with this Roll/CRM already registered." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            rollNo: rollNo.toUpperCase().trim(),
            password: hashedPassword,
            department,
            hostelBlock,
            phone,
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, rollNo: newUser.rollNo }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                rollNo: newUser.rollNo,
                department: newUser.department,
                hostelBlock: newUser.hostelBlock,
                phone: newUser.phone,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { rollNo, password } = req.body;

        const user = await User.findOne({ rollNo: rollNo.toUpperCase().trim() });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid CRM / Roll No or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid CRM / Roll No or password." });
        }

        const token = jwt.sign({ id: user._id, rollNo: user.rollNo }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                rollNo: user.rollNo,
                department: user.department,
                hostelBlock: user.hostelBlock,
                phone: user.phone,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/auth/delete-profile
router.delete("/delete-profile/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // 1. Delete all products uploaded by this student
        await Listing.deleteMany({ userRollNo: user.rollNo });

        // 2. Delete user
        await User.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: "User profile and all associated gear deleted permanently." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;