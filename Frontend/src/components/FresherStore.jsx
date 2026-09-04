import React, { useState } from "react";
import { useCampus } from "../context/CampusContext";
import "../styles/FresherStore.css";

const FresherStore = ({ onRentClick }) => {
    const { listings, deleteListing } = useCampus();
    const [filterMode, setFilterMode] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = listings.filter((item) => {
        const matchesMode = filterMode === "all" || item.type === filterMode;
        const matchesSearch =
            item.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.hostelBlock.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesMode && matchesSearch;
    });

    return (
        <section id="fresher-store-section" className="FresherStoreSection">
            <div className="StoreContainer">
                <div className="StoreHeaderDeck">
                    <div>
                        <span className="SectionCategoryPill">CAMPUS STORE</span>
                        <h2 className="SectionHeading">Browse Real Student Items ({listings.length})</h2>
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

                <div className="StoreControlsBar">
                    <div className="StoreSearchBar">
                        <i className="bx bx-search"></i>
                        <input
                            type="text"
                            placeholder="Search uploaded items by name, department, or hostel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="EmptyCatalogState">
                        <i className="bx bx-box"></i>
                        <h3>No Real Items Available Yet</h3>
                        <p>Use the form above to add an item. It will appear here immediately.</p>
                    </div>
                ) : (
                    <div className="CatalogGrid">
                        {filteredItems.map((item) => (
                            <div key={item.id} className="ProductCard">
                                <div className="CardImageHolder">
                                    <img src={item.images?.[0]} alt={item.itemTitle} />
                                    <span className={`TypeFlag ${item.type}`}>
                                        {item.type === "rent" ? "For Rent" : "For Sale"}
                                    </span>
                                    {/* Delete button to remove real items you create during testing */}
                                    <button
                                        type="button"
                                        className="DeleteListingBtn"
                                        title="Remove item"
                                        onClick={() => {
                                            if (window.confirm(`Delete "${item.itemTitle}"?`)) {
                                                deleteListing(item.id);
                                            }
                                        }}
                                    >
                                        <i className="bx bx-trash"></i>
                                    </button>
                                </div>

                                <div className="CardBody">
                                    <div className="CardCategoryTag">{item.category}</div>
                                    <h3 className="CardTitle">{item.itemTitle}</h3>

                                    <div className="OwnerMetaRow">
                                        <i className="bx bx-user"></i>
                                        <span>{item.studentName} ({item.department})</span>
                                    </div>

                                    <div className="HostelMetaRow">
                                        <i className="bx bx-map-pin"></i>
                                        <span>{item.hostelBlock}</span>
                                    </div>

                                    <div className="CardPricingStrip">
                                        {item.type === "rent" ? (
                                            <div>
                                                <strong className="PrimaryPrice">₹{item.rentPerWeek}</strong>
                                                <span className="PerUnitText">/ week (₹{item.rentPerDay}/day)</span>
                                                {item.refundableDeposit > 0 && (
                                                    <small className="DepositHint">₹{item.refundableDeposit} security deposit</small>
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
                                            href={`https://wa.me/${item.studentPhone?.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(item.studentName)},%20I%20saw%20your%20listing%20for%20"${encodeURIComponent(item.itemTitle)}"%20on%20DBU%20CampusEx.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="WhatsAppActionBtn"
                                        >
                                            <i className="bx bxl-whatsapp"></i> WhatsApp
                                        </a>

                                        <button
                                            type="button"
                                            className="BorrowDetailBtn"
                                            onClick={() => onRentClick(item)}
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FresherStore;