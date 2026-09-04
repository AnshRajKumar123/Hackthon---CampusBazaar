import React from "react";
import { useCampus } from "../context/CampusContext";
import "../styles/CampusHero.css";

const CampusHero = ({ onRentClick }) => {
    const { listings } = useCampus();
    const recentItems = listings.slice(0, 3);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="ExecutiveHero">
            <div className="HeroBoundary">
                <div className="HeroContentLeft">
                    <div className="MicroPillNotification">
                        <span className="PillAccentTag">DBU CAMPUS HUB</span>
                        <span>Real Student-to-Student Exchange</span>
                    </div>

                    <h1 className="DisplayHeading">
                        Rent senior lab tools for <span>₹10 to ₹40/week</span> or buy directly.
                    </h1>

                    <p className="DisplaySubtext">
                        No dummy items. List your own idle drafters, lab equipment, or textbooks right now, or browse items uploaded by fellow DBU students across hostel blocks.
                    </p>

                    <div className="HeroActionsCluster">
                        <button
                            type="button"
                            className="HeroPrimaryBtn"
                            onClick={() => scrollTo("list-gear-section")}
                        >
                            <i className="bx bx-plus"></i>
                            <span>List Your Real Tool / Book</span>
                        </button>

                        <button
                            type="button"
                            className="HeroSecondaryBtn"
                            onClick={() => scrollTo("fresher-store-section")}
                        >
                            <i className="bx bx-search"></i>
                            <span>Browse Active Gear ({listings.length})</span>
                        </button>
                    </div>

                    <div className="CampusTrustIndicators">
                        <div className="TrustPoint">
                            <i className="bx bx-check-circle"></i>
                            <span>Refundable Security Check</span>
                        </div>
                        <div className="TrustPoint">
                            <i className="bx bx-map-pin"></i>
                            <span>Direct Hostel / Campus Handoff</span>
                        </div>
                    </div>
                </div>

                {/* Live Right-Side Preview */}
                <div className="HeroContentRight">
                    <div className="LiveBoardCard">
                        <div className="LiveBoardHeader">
                            <div>
                                <h3>Live Campus Feed</h3>
                                <p>Real uploads from DBU students</p>
                            </div>
                            <span className="LivePulseTag">
                                <span className="GreenBlinker"></span> {listings.length} Active
                            </span>
                        </div>

                        {recentItems.length === 0 ? (
                            <div className="EmptyHeroPreview">
                                <i className="bx bx-layer-plus"></i>
                                <h4>No Items Uploaded Yet</h4>
                                <p>Be the first student to add a drafter, textbook, or multimeter below!</p>
                                <button
                                    type="button"
                                    className="FirstAddBtn"
                                    onClick={() => scrollTo("list-gear-section")}
                                >
                                    Add First Item
                                </button>
                            </div>
                        ) : (
                            <div className="EquipmentList">
                                {recentItems.map((item) => (
                                    <div key={item.id} className="EquipmentItemRow">
                                        <img
                                            src={item.images?.[0]}
                                            alt={item.itemTitle}
                                            className="ListingThumb"
                                        />
                                        <div className="EquipmentDetails">
                                            <span className="ListingBadge">
                                                {item.type === "rent" ? "For Rent" : "For Sale"}
                                            </span>
                                            <h4>{item.itemTitle}</h4>
                                            <span className="DeptTag">
                                                {item.hostelBlock} · By {item.studentName}
                                            </span>
                                        </div>
                                        <div className="EquipmentPricing">
                                            <strong className="MicroRate">
                                                {item.type === "rent" ? `₹${item.rentPerWeek}/wk` : `₹${item.buyPrice}`}
                                            </strong>
                                            <button
                                                type="button"
                                                className="QuickRentMiniBtn"
                                                onClick={() => onRentClick(item)}
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="ListingCardFooter">
                            <span>{listings.length} live verified listing(s)</span>
                            <button
                                type="button"
                                className="ViewModeFeedBtn"
                                onClick={() => scrollTo("fresher-store-section")}
                            >
                                Open Full Store
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CampusHero;