import React, { useState } from "react";
import WebLogo from "../assets/CampusImage/WebLogo.png";
import { useCampus } from "../context/CampusContext";
import { getImageUrl } from "./FresherStore";
import "../styles/ProfileModal.css";

const ProfileModal = ({ onClose }) => {
    const {
        currentUser,
        updateUserProfile,
        deleteUserProfile,
        logoutUser,
        listings,
        deleteListing,
    } = useCampus();

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'listings'

    const [editData, setEditData] = useState({
        name: currentUser?.name || "",
        phone: currentUser?.phone || "",
        department: currentUser?.department || "",
        hostelBlock: currentUser?.hostelBlock || "",
    });

    if (!currentUser) return null;

    // Robust matching for student items by rollNo, userId, or phone/name fallback
    const myListings = listings.filter((item) => {
        const matchesRoll = item.userRollNo && currentUser.rollNo && item.userRollNo === currentUser.rollNo;
        const matchesId = item.userId && (item.userId === currentUser.id || item.userId === currentUser._id);
        const matchesName = item.studentName && currentUser.name && item.studentName.toLowerCase() === currentUser.name.toLowerCase();
        const matchesPhone = item.studentPhone && currentUser.phone && item.studentPhone === currentUser.phone;

        return matchesRoll || matchesId || matchesName || matchesPhone;
    });

    const handleSave = (e) => {
        e.preventDefault();
        updateUserProfile(editData);
        setIsEditing(false);
    };

    const handleDeleteAccount = () => {
        const confirmDelete = window.confirm(
            `Are you sure you want to permanently delete your profile (${currentUser.rollNo})?\n\nThis will instantly delete your account and all ${myListings.length} product(s) you have listed on CampusBazaar.`
        );

        if (confirmDelete) {
            deleteUserProfile(currentUser.id || currentUser._id);
            onClose();
        }
    };

    return (
        <div className="ModalOverlay" onClick={onClose}>
            <div className="ProfileCardStage" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="ProfileStageClose" onClick={onClose}>
                    <i className="bx bx-x"></i>
                </button>

                {/* Top Student ID Banner */}
                <header className="StudentIDBanner">
                    <div className="IDWatermark">DBU</div>

                    <div className="IDBrandRow">
                        <div className="IDBrandLeft">
                            <img src={WebLogo} alt="DBU" className="IDEmblem" />
                            <div>
                                <span className="UniversityTag">DESH BHAGAT UNIVERSITY</span>
                                <span className="PortalTitle">Verified CampusBazaar ID</span>
                            </div>
                        </div>
                        <span className="ActiveStatusPill">
                            <span className="PillDot"></span> ACTIVE
                        </span>
                    </div>

                    <div className="IDHeroProfile">
                        <div className="IDAvatarBox">
                            <span>{currentUser.name?.charAt(0).toUpperCase()}</span>
                        </div>

                        <div className="IDMetaDetails">
                            <h2>{currentUser.name}</h2>
                            <div className="IDRollPill">
                                <i className="bx bx-id-card"></i>
                                <strong>{currentUser.rollNo}</strong>
                            </div>
                            <span className="IDJoinedText">Registered Student Member</span>
                        </div>

                        <button
                            type="button"
                            className="IDLogoutTrigger"
                            onClick={() => {
                                logoutUser();
                                onClose();
                            }}
                            title="Sign out of account"
                        >
                            <i className="bx bx-power-off"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                {/* Sub-Navigation Switcher */}
                <div className="ProfileNavStrip">
                    <button
                        type="button"
                        className={`ProfileTabBtn ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        <i className="bx bx-user-check"></i>
                        <span>Account Details</span>
                    </button>
                    <button
                        type="button"
                        className={`ProfileTabBtn ${activeTab === "listings" ? "active" : ""}`}
                        onClick={() => setActiveTab("listings")}
                    >
                        <i className="bx bx-layer"></i>
                        <span>My Uploaded Gear ({myListings.length})</span>
                    </button>
                </div>

                {/* Content Body */}
                <div className="ProfileContentDeck">
                    {activeTab === "profile" ? (
                        isEditing ? (
                            <form onSubmit={handleSave} className="ProfileCardEditForm">
                                <div className="EditGridTwo">
                                    <div className="EditGroup">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) =>
                                                setEditData({ ...editData, name: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="EditGroup">
                                        <label>WhatsApp / Phone</label>
                                        <input
                                            type="tel"
                                            value={editData.phone}
                                            onChange={(e) =>
                                                setEditData({ ...editData, phone: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="EditGridTwo">
                                    <div className="EditGroup">
                                        <label>Department</label>
                                        <input
                                            type="text"
                                            value={editData.department}
                                            onChange={(e) =>
                                                setEditData({ ...editData, department: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="EditGroup">
                                        <label>Hostel / Room Pickup Point</label>
                                        <input
                                            type="text"
                                            value={editData.hostelBlock}
                                            onChange={(e) =>
                                                setEditData({ ...editData, hostelBlock: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="EditButtonRow">
                                    <button type="submit" className="SaveEditsBtn">
                                        <i className="bx bx-check"></i> Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        className="CancelEditsBtn"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="ProfileTilesGrid">
                                <div className="DataTile">
                                    <div className="TileIcon">
                                        <i className="bx bxl-whatsapp"></i>
                                    </div>
                                    <div className="TileBody">
                                        <span className="TileLabel">WhatsApp / Phone</span>
                                        <strong className="TileValue">
                                            {currentUser.phone || "Not set"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="DataTile">
                                    <div className="TileIcon">
                                        <i className="bx bx-book-bookmark"></i>
                                    </div>
                                    <div className="TileBody">
                                        <span className="TileLabel">Department</span>
                                        <strong className="TileValue">
                                            {currentUser.department}
                                        </strong>
                                    </div>
                                </div>

                                <div className="DataTile FullSpan">
                                    <div className="TileIcon">
                                        <i className="bx bx-map-pin"></i>
                                    </div>
                                    <div className="TileBody">
                                        <span className="TileLabel">Hostel Handoff Location</span>
                                        <strong className="TileValue">
                                            {currentUser.hostelBlock}
                                        </strong>
                                    </div>
                                </div>

                                {/* Account Actions Strip */}
                                <div className="TileActionsBar FullSpan">
                                    <button
                                        type="button"
                                        className="ModifyDataBtn"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <i className="bx bx-edit-alt"></i> Edit Profile Info
                                    </button>

                                    <button
                                        type="button"
                                        className="DeleteProfileTriggerBtn"
                                        onClick={handleDeleteAccount}
                                    >
                                        <i className="bx bx-trash"></i> Delete Profile
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="MyListingsView">
                            {myListings.length === 0 ? (
                                <div className="EmptyInventoryBox">
                                    <i className="bx bx-cube-alt"></i>
                                    <h4>No gear listed under this account</h4>
                                    <p>
                                        Submit your idle drafters or textbooks using the listing
                                        form on the home page.
                                    </p>
                                </div>
                            ) : (
                                <div className="InventoryCardsGrid">
                                    {myListings.map((item) => (
                                        <div key={item.id || item._id} className="InventoryMiniCard">
                                            <img
                                                src={getImageUrl(item.images?.[0])}
                                                alt={item.itemTitle}
                                                onError={(e) => {
                                                    e.target.src = "https://placehold.co/400x300?text=No+Photo";
                                                }}
                                            />
                                            <div className="MiniCardMeta">
                                                <span className="MiniTypeBadge">
                                                    {item.type === "rent" ? "Rent" : "Buy"}
                                                </span>
                                                <h4>{item.itemTitle}</h4>
                                                <strong>
                                                    {item.type === "rent"
                                                        ? `₹${item.rentPerWeek}/wk`
                                                        : `₹${item.buyPrice}`}
                                                </strong>
                                            </div>
                                            <button
                                                type="button"
                                                className="MiniTrashBtn"
                                                title="Delete listing"
                                                onClick={() => {
                                                    if (window.confirm(`Remove ${item.itemTitle}?`)) {
                                                        deleteListing(item.id || item._id);
                                                    }
                                                }}
                                            >
                                                <i className="bx bx-trash"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;