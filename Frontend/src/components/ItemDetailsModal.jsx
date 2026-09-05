import React, { useState } from "react";
import "../styles/ItemDetailsModal.css";

const ItemDetailsModal = ({ item, onClose }) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    if (!item) return null;

    const isRent = item.type === "rent";
    const images = item.images && item.images.length > 0
        ? item.images
        : ["https://placehold.co/600x400?text=No+Image"];

    // WhatsApp prefilled message
    const cleanPhone = (item.studentPhone || "").replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const whatsappMessage = encodeURIComponent(
        `Hi ${item.studentName}, I saw your listing for "${item.itemTitle}" on DBU CampusBazaar. Is it still available?`
    );
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${whatsappMessage}`;

    return (
        <div className="ModalBackdrop" onClick={onClose}>
            <div className="ModalCard" onClick={(e) => e.stopPropagation()}>
                <button className="ModalCloseBtn" onClick={onClose}>
                    <i className="bx bx-x"></i>
                </button>

                <div className="ModalGrid">
                    {/* Left: Image Gallery */}
                    <div className="ModalGallery">
                        <div className="MainImageWrapper">
                            <img src={images[activeImageIndex]} alt={item.itemTitle} />
                            <span className={`ModalBadge ${isRent ? "rent" : "buy"}`}>
                                {isRent ? "FOR RENT" : "FOR SALE"}
                            </span>
                        </div>

                        {images.length > 1 && (
                            <div className="ThumbnailsRow">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        className={`ThumbBtn ${activeImageIndex === idx ? "active" : ""}`}
                                        onClick={() => setActiveImageIndex(idx)}
                                    >
                                        <img src={img} alt={`Thumb ${idx + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Item Specs & Contact */}
                    <div className="ModalDetails">
                        <span className="CategoryPill">{item.category}</span>
                        <h2 className="ModalTitle">{item.itemTitle}</h2>

                        <div className="PriceBox">
                            {isRent ? (
                                <>
                                    <div className="RateGroup">
                                        <span className="Price">₹{item.rentPerDay}</span>
                                        <span className="PriceLabel">/ day</span>
                                    </div>
                                    <div className="RateGroup">
                                        <span className="Price">₹{item.rentPerWeek}</span>
                                        <span className="PriceLabel">/ week</span>
                                    </div>
                                    {item.refundableDeposit > 0 && (
                                        <div className="DepositNote">
                                            Deposit: ₹{item.refundableDeposit} (Refundable)
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="RateGroup">
                                    <span className="Price">₹{item.buyPrice}</span>
                                    {item.originalMrp && (
                                        <span className="MrpCrossed">MRP ₹{item.originalMrp}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="SpecsList">
                            <div className="SpecRow">
                                <i className="bx bx-check-shield"></i>
                                <div>
                                    <strong>Condition</strong>
                                    <p>{item.condition || "Functional"}</p>
                                </div>
                            </div>

                            <div className="SpecRow">
                                <i className="bx bx-map-pin"></i>
                                <div>
                                    <strong>Pickup Point</strong>
                                    <p>{item.hostelBlock}</p>
                                </div>
                            </div>

                            <div className="SpecRow">
                                <i className="bx bx-user"></i>
                                <div>
                                    <strong>Listed By</strong>
                                    <p>{item.studentName} ({item.department})</p>
                                </div>
                            </div>
                        </div>

                        {item.description && (
                            <div className="DescriptionBox">
                                <h4>Description</h4>
                                <p>{item.description}</p>
                            </div>
                        )}

                        <div className="ModalActions">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="WhatsAppChatBtn"
                            >
                                <i className="bx bxl-whatsapp"></i>
                                <span>Chat on WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailsModal;