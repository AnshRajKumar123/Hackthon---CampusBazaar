const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Listing = require("../models/Listing");

// GET /api/listings (All products visible to all users)
router.get("/", async (req, res) => {
    try {
        const listings = await Listing.find().sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/listings (Create product with up to 3 photos)
// POST /api/listings
router.post("/", upload.array("images", 3), async (req, res) => {
    try {
        // Save relative paths like "/uploads/filename.jpg" instead of hardcoded "localhost"
        const imageUrls = req.files
            ? req.files.map((file) => `/uploads/${file.filename}`)
            : [];

        const newListing = new Listing({
            ...req.body,
            images: imageUrls,
        });

        await newListing.save();
        res.status(201).json(newListing);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/listings/:id
router.delete("/:id", async (req, res) => {
    try {
        await Listing.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Listing deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;