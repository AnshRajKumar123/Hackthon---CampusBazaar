import React, { useState, useEffect, useRef } from "react";
import { useCampus } from "../context/CampusContext";
import "../styles/FresherStore.css";

// Resolves relative backend paths against the active host IP for mobile & laptop compatibility
const PRODUCTION_URL = "https://campusbazaar-backend-ajve.onrender.com";

export const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/400x300?text=No+Photo";

    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://") ||
        imagePath.startsWith("data:")
    ) {
        return imagePath;
    }

    const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname.startsWith("10.") ||
        window.location.hostname.startsWith("192.") ||
        window.location.hostname === "127.0.0.1";

    const baseUrl = import.meta.env.VITE_API_URL || (isLocal ? `http://${window.location.hostname}:5001` : PRODUCTION_URL);

    return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const hostelFilters = [
    "All Hostels",
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

const categoryFilters = [
    "All Categories",
    "Drawing & Drafting",
    "Electronics & Sensors",
    "Lab Tools",
    "Core Textbooks",
    "Calculators & Instruments",
];

// Custom Dropdown Component
const StoreCustomSelect = ({ icon, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (
        <div className="StoreCustomSelectContainer" ref={selectRef}>
            <button
                type="button"
                className={`StoreCustomSelectTrigger ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <div className="TriggerContent">
                    {icon && <i className={icon}></i>}
                    <span className="SelectedLabel">{value}</span>
                </div>
                <i className={`bx bx-chevron-down ChevronIcon ${isOpen ? "rotate" : ""}`}></i>
            </button>

            {isOpen && (
                <ul className="StoreCustomOptionsList">
                    {options.map((option) => (
                        <li
                            key={option}
                            className={`StoreCustomOptionItem ${value === option ? "active" : ""}`}
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

const FresherStore = ({ onRentClick }) => {
    const { listings, deleteListing, currentUser, isLoadingListings } = useCampus();

    const [filterMode, setFilterMode] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedHostel, setSelectedHostel] = useState("All Hostels");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = listings.filter((item) => {
        const matchesMode = filterMode === "all" || item.type === filterMode;
        const matchesCategory =
            selectedCategory === "All Categories" || item.category === selectedCategory;
        const matchesHostel =
            selectedHostel === "All Hostels" || item.hostelBlock === selectedHostel;

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
            !q ||
            item.itemTitle?.toLowerCase().includes(q) ||
            item.department?.toLowerCase().includes(q) ||
            item.hostelBlock?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q) ||
            item.studentName?.toLowerCase().includes(q);

        return matchesMode && matchesCategory && matchesHostel && matchesSearch;
    });

    return (
        <section id="fresher-store-section" className="FresherStoreSection">
            <div className="StoreContainer">
                {/* Header Deck */}
                <div className="StoreHeaderDeck">
                    <div>
                        <span className="SectionCategoryPill">CAMPUS STORE</span>
                        <h2 className="SectionHeading">
                            Browse Real Student Items ({listings.length})
                        </h2>
                        <p className="SectionSubheading">
                            Real listings uploaded by students across Desh Bhagat University.
                        </p>
                    </div>

                    <div className="StoreModeFilterPills">
                        <button
                            type="button"
                            className={`ModePill ${filterMode === "all" ? "active" : ""}`}
                            onClick={() => setFilterMode("all")}
                        >
                            All ({listings.length})
                        </button>
                        <button
                            type="button"
                            className={`ModePill ${filterMode === "rent" ? "active" : ""}`}
                            onClick={() => setFilterMode("rent")}
                        >
                            Rentals
                        </button>
                        <button
                            type="button"
                            className={`ModePill ${filterMode === "buy" ? "active" : ""}`}
                            onClick={() => setFilterMode("buy")}
                        >
                            For Sale
                        </button>
                    </div>
                </div>

                {/* Multi-Filter & Search Bar */}
                <div className="StoreControlsBar">
                    <div className="StoreSearchBar">
                        <i className="bx bx-search"></i>
                        <input
                            type="text"
                            placeholder="Search gear, textbooks, department, or hostel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="ClearSearchBtn"
                                onClick={() => setSearchQuery("")}
                            >
                                <i className="bx bx-x"></i>
                            </button>
                        )}
                    </div>

                    <div className="StoreDropdownFilters">
                        <StoreCustomSelect
                            icon="bx bx-purchase-tag-alt"
                            value={selectedCategory}
                            options={categoryFilters}
                            onChange={setSelectedCategory}
                        />

                        <StoreCustomSelect
                            icon="bx bx-building"
                            value={selectedHostel}
                            options={hostelFilters}
                            onChange={setSelectedHostel}
                        />
                    </div>
                </div>

                {/* Dynamic State Rendering */}
                {isLoadingListings ? (
                    <div className="StoreLoadingState">
                        <i className="bx bx-loader-alt bx-spin"></i>
                        <p>Syncing campus gear from MongoDB Atlas...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="EmptyCatalogState">
                        <i className="bx bx-box"></i>
                        <h3>No Items Match Your Filter</h3>
                        <p>Try clearing filters or search keywords to view other student gear.</p>
                        {(searchQuery ||
                            selectedCategory !== "All Categories" ||
                            selectedHostel !== "All Hostels" ||
                            filterMode !== "all") && (
                                <button
                                    type="button"
                                    className="ResetFiltersBtn"
                                    onClick={() => {
                                        setFilterMode("all");
                                        setSelectedCategory("All Categories");
                                        setSelectedHostel("All Hostels");
                                        setSearchQuery("");
                                    }}
                                >
                                    Reset All Filters
                                </button>
                            )}
                    </div>
                ) : (
                    <div className="CatalogGrid">
                        {filteredItems.map((item) => {
                            const isOwner =
                                currentUser &&
                                (currentUser.rollNo === item.userRollNo ||
                                    currentUser.id === item.userId ||
                                    currentUser._id === item.userId);

                            const rawPhone = (item.studentPhone || "").replace(/[^0-9]/g, "");
                            const waNumber = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                            const waMessage = encodeURIComponent(
                                `Hi ${item.studentName}, I found your listing "${item.itemTitle}" on DBU CampusBazaar. Is it still available?`
                            );

                            return (
                                <div key={item.id || item._id} className="ProductCard">
                                    <div className="CardImageHolder">
                                        <img
                                            src={getImageUrl(item.images?.[0])}
                                            alt={item.itemTitle}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = "https://placehold.co/400x300?text=No+Photo";
                                            }}
                                        />
                                        <span className={`TypeFlag ${item.type}`}>
                                            {item.type === "rent" ? "For Rent" : "For Sale"}
                                        </span>

                                        {isOwner && (
                                            <button
                                                type="button"
                                                className="DeleteListingBtn"
                                                title="Delete your item"
                                                onClick={() => {
                                                    if (window.confirm(`Delete "${item.itemTitle}"?`)) {
                                                        deleteListing(item.id || item._id);
                                                    }
                                                }}
                                            >
                                                <i className="bx bx-trash"></i>
                                            </button>
                                        )}
                                    </div>

                                    <div className="CardBody">
                                        <div className="CardCategoryTag">{item.category}</div>
                                        <h3 className="CardTitle" title={item.itemTitle}>
                                            {item.itemTitle}
                                        </h3>

                                        <div className="OwnerMetaRow">
                                            <i className="bx bx-user"></i>
                                            <span>
                                                {item.studentName} ({item.department})
                                            </span>
                                        </div>

                                        <div className="HostelMetaRow">
                                            <i className="bx bx-map-pin"></i>
                                            <span>{item.hostelBlock}</span>
                                        </div>

                                        <div className="CardPricingStrip">
                                            {item.type === "rent" ? (
                                                <div>
                                                    <strong className="PrimaryPrice">₹{item.rentPerWeek}</strong>
                                                    <span className="PerUnitText">
                                                        / week (₹{item.rentPerDay}/day)
                                                    </span>
                                                    {item.refundableDeposit > 0 && (
                                                        <small className="DepositHint">
                                                            ₹{item.refundableDeposit} security deposit
                                                        </small>
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    <strong className="PrimaryPrice">₹{item.buyPrice}</strong>
                                                    <span className="PerUnitText">One-time Buy</span>
                                                    {item.originalMrp && (
                                                        <small className="MrpCut">MRP ₹{item.originalMrp}</small>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="CardActionsRow">
                                            <a
                                                href={`https://wa.me/${waNumber}?text=${waMessage}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="WhatsAppActionBtn"
                                            >
                                                <i className="bx bxl-whatsapp"></i> WhatsApp
                                            </a>

                                            <button
                                                type="button"
                                                className="BorrowDetailBtn"
                                                onClick={() => onRentClick && onRentClick(item)}
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FresherStore;