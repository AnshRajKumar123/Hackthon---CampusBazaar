import React, { useState, useEffect, useRef } from "react";
import "../styles/StudentListingForm.css";

// Reusable Custom Dropdown Component
const CustomFormSelect = ({ label, icon, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (
        <div className="FormGroup" ref={dropdownRef}>
            <label>{label} *</label>
            <div className="FormCustomSelectWrapper">
                <button
                    type="button"
                    className={`FormCustomSelectTrigger ${isOpen ? "open" : ""}`}
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    <div className="TriggerContent">
                        {icon && <i className={icon}></i>}
                        <span className="SelectedText">{value}</span>
                    </div>
                    <i className={`bx bx-chevron-down DropdownChevron ${isOpen ? "rotate" : ""}`}></i>
                </button>

                {isOpen && (
                    <ul className="FormCustomDropdownMenu">
                        {options.map((option) => (
                            <li
                                key={option}
                                className={`FormCustomOptionItem ${value === option ? "selected" : ""}`}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                            >
                                <span>{option}</span>
                                {value === option && <i className="bx bx-check"></i>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const hostelOptions = [
    "Block A",
    "Block B",
    "Block C",
    "Block D",
    "Block E",
    "Block F / Khalsa Hostel",
    "Sirhind Hostel",
    "Girls Hostel",
    "Girls Hostel / Khanna",
    "Room Renter",
    "Central Library North Gate",
    "Engineering Workshop Block",
];

const departmentOptions = [
    "Computer Science & Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical / ECE",
    "Applied Sciences",
];

const conditionOptions = [
    "Brand New (Never used)",
    "Like New (Zero damage)",
    "Good Condition (Fully functional)",
    "Fair / Usable",
];

const categoryOptions = [
    "Drawing & Drafting",
    "Electronics & Sensors",
    "Lab Tools",
    "Core Textbooks",
    "Calculators & Instruments",
];

export default function EditListingModal({ item, onClose, onUpdateSuccess }) {
    if (!item) return null;

    const [formData, setFormData] = useState({
        itemTitle: item.itemTitle || "",
        category: item.category || "Drawing & Drafting",
        condition: item.condition || "Good Condition (Fully functional)",
        hostelBlock: item.hostelBlock || "Block A",
        department: item.department || "Computer Science & Engineering",
        rentPerDay: item.rentPerDay || "",
        rentPerWeek: item.rentPerWeek || "",
        refundableDeposit: item.refundableDeposit || "",
        buyPrice: item.buyPrice || "",
        description: item.description || "",
    });
    const [saving, setSaving] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (field, val) => {
        setFormData((prev) => ({ ...prev, [field]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const itemId = item._id || item.id;
            const res = await fetch(`http://localhost:5001/api/listings/${itemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                // Post notification
                fetch("http://localhost:5001/api/notifications/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        recipientRoll: item.studentRollNo || item.rollNo,
                        title: "Listing Updated",
                        message: `Your item "${formData.itemTitle}" has been updated.`,
                        type: "LISTING_UPDATE"
                    })
                }).catch(() => {});

                if (onUpdateSuccess) onUpdateSuccess(data.listing);
                onClose();
            } else {
                alert("Failed to update item: " + (data.message || "Unknown error"));
            }
        } catch (err) {
            alert("Error updating item: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="ModalOverlay" onClick={onClose}>
            <div className="ModalContainer" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
                <button type="button" className="ModalCloseButton" onClick={onClose} aria-label="Close modal">
                    <i className="bx bx-x"></i>
                </button>

                <div style={{ padding: "24px" }}>
                    <div style={{ marginBottom: "18px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#002b54", margin: "0 0 4px" }}>
                            Update Item Details
                        </h2>
                        <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                            Modify pricing, hostel pickup point, and condition for your listing.
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div className="FormGroup">
                            <label>Item Title *</label>
                            <input
                                type="text"
                                name="itemTitle"
                                value={formData.itemTitle}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="FormGridDouble">
                            <CustomFormSelect
                                label="Category Tag"
                                icon="bx bx-tag"
                                value={formData.category}
                                options={categoryOptions}
                                onChange={(val) => handleDropdownChange("category", val)}
                            />

                            <CustomFormSelect
                                label="Item Condition"
                                icon="bx bx-check-circle"
                                value={formData.condition}
                                options={conditionOptions}
                                onChange={(val) => handleDropdownChange("condition", val)}
                            />
                        </div>

                        <div className="FormGridDouble">
                            <CustomFormSelect
                                label="Hostel / Pickup Point"
                                icon="bx bx-building"
                                value={formData.hostelBlock}
                                options={hostelOptions}
                                onChange={(val) => handleDropdownChange("hostelBlock", val)}
                            />

                            <CustomFormSelect
                                label="Department"
                                icon="bx bx-book"
                                value={formData.department}
                                options={departmentOptions}
                                onChange={(val) => handleDropdownChange("department", val)}
                            />
                        </div>

                        {item.type === "rent" ? (
                            <div className="FormGridTriple">
                                <div className="FormGroup">
                                    <label>Rent Per Day (₹)</label>
                                    <input
                                        type="number"
                                        name="rentPerDay"
                                        value={formData.rentPerDay}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="FormGroup">
                                    <label>Rent Per Week (₹)</label>
                                    <input
                                        type="number"
                                        name="rentPerWeek"
                                        value={formData.rentPerWeek}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="FormGroup">
                                    <label>Deposit (₹)</label>
                                    <input
                                        type="number"
                                        name="refundableDeposit"
                                        value={formData.refundableDeposit}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="FormGroup">
                                <label>Selling Price (₹)</label>
                                <input
                                    type="number"
                                    name="buyPrice"
                                    value={formData.buyPrice}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}

                        <div className="FormGroup">
                            <label>Description</label>
                            <textarea
                                name="description"
                                rows="2"
                                value={formData.description}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{ padding: "10px 18px", borderRadius: "8px", background: "#f1f5f9", border: "none", fontWeight: "700" }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{ padding: "10px 22px", borderRadius: "8px", background: "#059669", color: "#ffffff", border: "none", fontWeight: "800", cursor: "pointer" }}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}