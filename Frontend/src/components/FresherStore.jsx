import React, { useState, useEffect, useRef } from "react";
import { useCampus } from "../context/CampusContext";
import RentDetailModal from "./RentDetailModal";
import EditListingModal from "./EditListingModal";
import "../styles/FresherStore.css";

// Helper function to resolve photo URLs safely
export const getImageUrl = (img) => {
    if (!img) return "https://placehold.co/600x400?text=No+Photo";
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
        return img;
    }
    return `http://localhost:5001${img.startsWith("/") ? "" : "/"}${img}`;
};

// Reusable Custom Dropdown Component for Filters
const CustomStoreDropdown = ({ label, icon, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="CustomDropdownWrapper" ref={dropdownRef}>
            <button
                type="button"
                className={`CustomDropdownTrigger ${isOpen ? "active" : ""}`}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <div className="TriggerLabelBlock">
                    <i className={icon}></i>
                    <span>{value || label}</span>
                </div>
                <i className={`bx bx-chevron-down DropdownChevron ${isOpen ? "rotate" : ""}`}></i>
            </button>

            {isOpen && (
                <ul className="CustomDropdownList">
                    <li
                        className={`CustomDropdownItem ${!value ? "selected" : ""}`}
                        onClick={() => {
                            onChange("");
                            setIsOpen(false);
                        }}
                    >
                        <span>{label}</span>
                        {!value && <i className="bx bx-check"></i>}
                    </li>
                    {options.map((option) => (
                        <li
                            key={option}
                            className={`CustomDropdownItem ${value === option ? "selected" : ""}`}
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
    );
};

const categoryFilterOptions = [
    "Drawing & Drafting",
    "Electronics & Sensors",
    "Lab Tools",
    "Core Textbooks",
    "Calculators & Instruments",
];

const hostelFilterOptions = [
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
];

const FresherStore = ({ onOpenChat }) => {
    const { listings, fetchListings, deleteListing, currentUser } = useCampus();

    const [activeTab, setActiveTab] = useState("all"); // "all" | "rent" | "buy"
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedHostel, setSelectedHostel] = useState("");

    // Modal view states
    const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);

    const myRoll = String(
        currentUser?.rollNo ||
        currentUser?.identifier ||
        currentUser?.studentRollNo ||
        currentUser?.roll ||
        ""
    ).trim();
    const myName = String(currentUser?.name || "").trim().toLowerCase();

    // Check if the current user owns this specific item
    const checkIsSeller = (item) => {
        const itemRoll = String(
            item.studentRollNo ||
            item.rollNo ||
            item.studentRoll ||
            item.sellerRoll ||
            ""
        ).trim();

        const itemSellerName = String(item.studentName || item.sellerName || "").trim().toLowerCase();

        return (myRoll && itemRoll && itemRoll === myRoll) || (myName && itemSellerName && itemSellerName === myName);
    };

    // Filter calculations
    const filteredListings = listings.filter((item) => {
        if (activeTab === "rent" && item.type !== "rent") return false;
        if (activeTab === "buy" && item.type !== "buy") return false;

        if (selectedCategory && item.category !== selectedCategory) return false;
        if (selectedHostel && item.hostelBlock !== selectedHostel) return false;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const titleMatch = item.itemTitle?.toLowerCase().includes(query);
            const deptMatch = item.department?.toLowerCase().includes(query);
            const hostelMatch = item.hostelBlock?.toLowerCase().includes(query);
            const sellerMatch = item.studentName?.toLowerCase().includes(query);
            if (!titleMatch && !deptMatch && !hostelMatch && !sellerMatch) return false;
        }

        return true;
    });

    const handleDelete = async (itemId, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await deleteListing(itemId);
                fetch("http://localhost:5001/api/notifications/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        recipientRoll: myRoll,
                        title: "Listing Removed",
                        message: `Your item "${title}" has been deleted from CampusBazaar.`,
                        type: "LISTING_DELETE"
                    })
                }).catch(() => {});
            } catch (err) {
                alert("Failed to delete item: " + err.message);
            }
        }
    };

    return (
        <section id="fresher-store-section" className="FresherStoreSection">
            <div className="StoreContainer">

                {/* Section Header */}
                <div className="StoreHeaderDeck">
                    <div>
                        <span className="StoreBadgePill">CAMPUS STORE</span>
                        <h2 className="StoreMainTitle">Browse Real Student Items ({filteredListings.length})</h2>
                        <p className="StoreSubtitle">
                            Real listings uploaded by students across Desh Bhagat University.
                        </p>
                    </div>

                    {/* Rent / Sale Tabs */}
                    <div className="StoreSegmentedTabs">
                        <button
                            type="button"
                            className={`StoreTabBtn ${activeTab === "all" ? "active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            All ({listings.length})
                        </button>
                        <button
                            type="button"
                            className={`StoreTabBtn ${activeTab === "rent" ? "active" : ""}`}
                            onClick={() => setActiveTab("rent")}
                        >
                            Rentals
                        </button>
                        <button
                            type="button"
                            className={`StoreTabBtn ${activeTab === "buy" ? "active" : ""}`}
                            onClick={() => setActiveTab("buy")}
                        >
                            For Sale
                        </button>
                    </div>
                </div>

                {/* Search & Custom Dropdown Filter Controls */}
                <div className="StoreFilterBarDeck">
                    <div className="StoreSearchBox">
                        <i className="bx bx-search"></i>
                        <input
                            type="text"
                            placeholder="Search gear, textbooks, department, or hostel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="FilterDropdownRow">
                        <CustomStoreDropdown
                            label="All Categories"
                            icon="bx bx-tag"
                            value={selectedCategory}
                            options={categoryFilterOptions}
                            onChange={(val) => setSelectedCategory(val)}
                        />

                        <CustomStoreDropdown
                            label="All Hostels"
                            icon="bx bx-building"
                            value={selectedHostel}
                            options={hostelFilterOptions}
                            onChange={(val) => setSelectedHostel(val)}
                        />
                    </div>
                </div>

                {/* Listing Grid */}
                {filteredListings.length === 0 ? (
                    <div className="StoreEmptyState">
                        <i className="bx bx-package"></i>
                        <h3>No items found</h3>
                        <p>Try adjusting your search query, department, or hostel filters.</p>
                    </div>
                ) : (
                    <div className="StoreProductGrid">
                        {filteredListings.map((item) => {
                            const isSeller = checkIsSeller(item);
                            const primaryImage = item.images && item.images.length > 0
                                ? item.images[0]
                                : "https://placehold.co/600x400?text=No+Photo";

                            return (
                                <article key={item._id || item.id} className="StudentItemCard">
                                    <div className="ItemCardMedia">
                                        <img
                                            src={getImageUrl(primaryImage)}
                                            alt={item.itemTitle}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = "https://placehold.co/600x400?text=No+Photo";
                                            }}
                                        />
                                        <span className={`ItemTypeTag ${item.type === "rent" ? "rent" : "buy"}`}>
                                            {item.type === "rent" ? "FOR RENT" : "FOR SALE"}
                                        </span>

                                        {/* Seller Delete Action */}
                                        {isSeller && (
                                            <button
                                                type="button"
                                                className="ItemDeleteFloatingBtn"
                                                title="Delete Listing"
                                                onClick={() => handleDelete(item._id || item.id, item.itemTitle)}
                                            >
                                                <i className="bx bx-trash"></i>
                                            </button>
                                        )}
                                    </div>

                                    <div className="ItemCardBody">
                                        <span className="CardCategoryText">{item.category}</span>
                                        <h4 className="CardItemTitle">{item.itemTitle}</h4>

                                        <div className="CardOwnerInfo">
                                            <span>
                                                <i className="bx bx-user"></i> {item.studentName} ({item.department})
                                            </span>
                                            <span>
                                                <i className="bx bx-building"></i> {item.hostelBlock}
                                            </span>
                                        </div>

                                        {/* Pricing Block */}
                                        <div className="CardPricingBox">
                                            {item.type === "rent" ? (
                                                <>
                                                    <div className="CardPriceRow">
                                                        <strong>₹{item.rentPerWeek}</strong>
                                                        <span>/ week (₹{item.rentPerDay}/day)</span>
                                                    </div>
                                                    {item.refundableDeposit > 0 && (
                                                        <small className="CardDepositText">
                                                            ₹{item.refundableDeposit} security deposit
                                                        </small>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="CardPriceRow">
                                                    <strong>₹{item.buyPrice}</strong>
                                                    <span>(Permanent Buy)</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Actions: Seller vs Buyer */}
                                        <div className="CardActionCluster">
                                            {isSeller ? (
                                                <button
                                                    type="button"
                                                    className="BtnCardUpdateDetails"
                                                    onClick={() => setItemToEdit(item)}
                                                >
                                                    <i className="bx bx-edit-alt"></i>
                                                    <span>Update Details</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="BtnCardLiveChat"
                                                    onClick={() => {
                                                        if (typeof onOpenChat === "function") {
                                                            onOpenChat(item);
                                                        } else {
                                                            console.warn("onOpenChat prop missing in FresherStore");
                                                        }
                                                    }}
                                                >
                                                    <i className="bx bx-message-rounded-dots"></i>
                                                    <span>Live Chat</span>
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="BtnCardDetails"
                                                onClick={() => setSelectedItemForDetails(item)}
                                            >
                                                <span>Details</span>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedItemForDetails && (
                <RentDetailModal
                    item={selectedItemForDetails}
                    onClose={() => setSelectedItemForDetails(null)}
                    onOpenChat={onOpenChat}
                />
            )}

            {/* Seller Edit Listing Modal */}
            {itemToEdit && (
                <EditListingModal
                    item={itemToEdit}
                    onClose={() => setItemToEdit(null)}
                    onUpdateSuccess={() => {
                        if (fetchListings) fetchListings();
                    }}
                />
            )}
        </section>
    );
};

export default FresherStore;