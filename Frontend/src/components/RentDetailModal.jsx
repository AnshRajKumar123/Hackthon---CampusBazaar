import React, { useState } from "react";
import "../styles/RentDetailModal.css";

const RentDetailModal = ({ item, onClose }) => {
    if (!item) return null;

    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const images = item.images && item.images.length > 0
        ? item.images
        : ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"];

    const cleanPhone = (item.studentPhone || "").replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
        item.studentName || "Student"
    )},%20I%20saw%20your%20listing%20"${encodeURIComponent(
        item.itemTitle || "Item"
    )}"%20on%20DBU%20CampusEx.%20Is%20it%20available%20for%20pickup?`;

    return (
        <div className="ModalOverlay" onClick={onClose}>
            <div className="ModalContainer" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="ModalCloseButton" onClick={onClose} aria-label="Close modal">
                    <i className="bx bx-x"></i>
                </button>

                <div className="ModalLayoutGrid">
                    {/* Gallery Column */}
                    <div className="ModalGalleryCol">
                        <div className="MainImageContainer">
                            <img src={images[activeImageIndex]} alt={item.itemTitle} />
                            <span className={`ModalTypePill ${item.type === "rent" ? "rent" : "buy"}`}>
                                {item.type === "rent" ? "For Rent" : "For Sale"}
                            </span>
                        </div>

                        {images.length > 1 && (
                            <div className="ThumbnailStrip">
                                {images.map((imgSrc, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className={`ThumbButton ${idx === activeImageIndex ? "selected" : ""}`}
                                        onClick={() => setActiveImageIndex(idx)}
                                    >
                                        <img src={imgSrc} alt={`Thumbnail ${idx + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Column */}
                    <div className="ModalDetailsCol">
                        <span className="CategoryTag">{item.category}</span>
                        <h2 className="ModalItemTitle">{item.itemTitle}</h2>
                        <span className="DepartmentMeta">{item.department}</span>

                        {/* Pricing Section */}
                        <div className="PricingHighlightCard">
                            {item.type === "rent" ? (
                                <>
                                    <div className="PriceDisplayRow">
                                        <span className="CurrencySymbol">₹</span>
                                        <strong className="PriceValue">{item.rentPerWeek}</strong>
                                        <span className="PriceDuration">/ week (₹{item.rentPerDay}/day)</span>
                                    </div>
                                    {item.refundableDeposit > 0 && (
                                        <div className="DepositIndicator">
                                            <i className="bx bx-shield-quarter"></i>
                                            <span>₹{item.refundableDeposit} Refundable Security Deposit</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="PriceDisplayRow">
                                    <span className="CurrencySymbol">₹</span>
                                    <strong className="PriceValue">{item.buyPrice}</strong>
                                    <span className="PriceDuration">Permanent Ownership</span>
                                    {item.originalMrp && (
                                        <span className="MrpStrike">MRP ₹{item.originalMrp}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Item Condition & Description */}
                        <div className="ItemSpecsCard">
                            <div className="SpecRow">
                                <span className="SpecLabel">Condition:</span>
                                <span className="SpecValue">{item.condition}</span>
                            </div>
                            <div className="SpecRow">
                                <span className="SpecLabel">Pickup Point:</span>
                                <span className="SpecValue">{item.hostelBlock}</span>
                            </div>
                            {item.description && (
                                <p className="ItemDescriptionText">{item.description}</p>
                            )}
                        </div>

                        {/* Student Owner Info */}
                        <div className="OwnerProfileDeck">
                            <div className="OwnerAvatarCircle">
                                <i className="bx bx-user"></i>
                            </div>
                            <div className="OwnerMetaText">
                                <strong>{item.studentName}</strong>
                                <small>DBU Verified Student Owner</small>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="ModalButtonCluster">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="WhatsAppDirectBtn"
                            >
                                <i className="bx bxl-whatsapp"></i>
                                <span>Message on WhatsApp</span>
                            </a>

                            <a href={`tel:${item.studentPhone}`} className="PhoneDirectBtn">
                                <i className="bx bx-phone-call"></i>
                                <span>Call Student</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentDetailModal;