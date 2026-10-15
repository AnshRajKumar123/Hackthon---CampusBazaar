import React, { useState, useEffect } from "react";
import WebLogo from "../assets/CampusImage/WebLogo.png";
import { useCampus } from "../context/CampusContext";
import NotificationCenter from "./NotificationCenter";
import "../styles/CampusNavbar.css";

const API_BASE = "http://localhost:5001/api/notifications";

const CampusNavbar = ({ onOpenAuth, onOpenProfile, onOpenChats }) => {
    const { currentUser } = useCampus();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallBtn, setShowInstallBtn] = useState(false);
    const [activeSection, setActiveSection] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);

    const myRoll = String(
        currentUser?.rollNo ||
        currentUser?.studentRollNo ||
        currentUser?.identifier ||
        currentUser?.roll ||
        ""
    ).trim();

    // Poll unread notifications count for the navlink pill badge
    const fetchUnread = async () => {
        if (!myRoll) return;
        try {
            const res = await fetch(`${API_BASE}?rollNo=${encodeURIComponent(myRoll)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setUnreadCount(data.unreadCount || 0);
                }
            }
        } catch {
            // Transient error ignored
        }
    };

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 3000);
        return () => clearInterval(interval);
    }, [myRoll]);

    useEffect(() => {
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBtn(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);
        return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("To install: Tap Share -> 'Add to Home Screen' on iOS, or Chrome menu -> Install App.");
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") setShowInstallBtn(false);
        setDeferredPrompt(null);
    };

    const scrollTo = (id) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <header className="NavModernRoot">
            <div className="NavModernContainer">

                {/* Brand Group */}
                <div
                    className="NavBrandBlock"
                    onClick={() => {
                        setActiveSection("");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                >
                    <div className="BrandLogoWrapper">
                        <img src={WebLogo} alt="CampusBazaar" className="BrandLogoImg" />
                        <span className="LiveStatusBeacon"></span>
                    </div>
                    <div className="BrandTextMeta">
                        <div className="BrandNameRow">
                            <span className="BrandPrimaryWord">Campus</span>
                            <span className="BrandSecondaryWord">Bazaar</span>
                        </div>
                        <span className="BrandCampusTag">DBU · P2P Exchange</span>
                    </div>
                </div>

                {/* Center Pill Dock Navigation */}
                <nav className="NavCenterPillDock">
                    <button
                        type="button"
                        className={`DockLink ${activeSection === "list-gear-section" ? "active" : ""}`}
                        onClick={() => scrollTo("list-gear-section")}
                    >
                        <i className="bx bx-plus-circle"></i>
                        <span>List Gear</span>
                    </button>

                    <button
                        type="button"
                        className={`DockLink ${activeSection === "fresher-store-section" ? "active" : ""}`}
                        onClick={() => scrollTo("fresher-store-section")}
                    >
                        <i className="bx bx-store-alt"></i>
                        <span>Campus Store</span>
                    </button>

                    <button
                        type="button"
                        className={`DockLink ${activeSection === "chats" ? "active" : ""}`}
                        onClick={() => {
                            setActiveSection("chats");
                            if (onOpenChats) onOpenChats();
                        }}
                    >
                        <i className="bx bx-message-rounded-dots"></i>
                        <span>Live Chats</span>
                    </button>

                    {/* Dedicated Notifications Navlink in the Center Dock */}
                    {currentUser && (
                        <button
                            type="button"
                            className={`DockLink ${activeSection === "notifications" ? "active" : ""}`}
                            onClick={() => {
                                setActiveSection("notifications");
                                const bellBtn = document.querySelector(".NotificationBellBtn");
                                if (bellBtn) bellBtn.click();
                            }}
                        >
                            <i className="bx bx-bell"></i>
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                                <span className="NavlinkBadgePill">{unreadCount}</span>
                            )}
                        </button>
                    )}

                    <button
                        type="button"
                        className={`DockLink ${activeSection === "about-section" ? "active" : ""}`}
                        onClick={() => scrollTo("about-section")}
                    >
                        <i className="bx bx-compass"></i>
                        <span>How it Works</span>
                    </button>

                    <button
                        type="button"
                        className={`DockLink ${activeSection === "safety-section" ? "active" : ""}`}
                        onClick={() => scrollTo("safety-section")}
                    >
                        <i className="bx bx-shield-quarter"></i>
                        <span>Rules</span>
                    </button>
                </nav>

                {/* Right Member Controls & Notification Bell Dropdown */}
                <div className="NavControlsCluster">
                    {showInstallBtn && (
                        <button type="button" className="InstallPillBtn" onClick={handleInstallClick}>
                            <i className="bx bx-download"></i>
                            <span>App</span>
                        </button>
                    )}

                    {/* Notification Bell Component */}
                    {currentUser && <NotificationCenter currentUser={currentUser} />}

                    {currentUser ? (
                        <button type="button" className="ModernMemberBadge" onClick={onOpenProfile}>
                            <div className="MemberAvatar">
                                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="MemberMeta">
                                <span className="MemberName">
                                    {currentUser.name ? currentUser.name.split(" ")[0] : "Student"}
                                </span>
                                <span className="MemberRoll">{currentUser.rollNo}</span>
                            </div>
                            <i className="bx bx-chevron-right NavMemberArrow"></i>
                        </button>
                    ) : (
                        <button type="button" className="SignInActionBtn" onClick={onOpenAuth}>
                            <i className="bx bx-user-circle"></i>
                            <span>Student Portal</span>
                        </button>
                    )}
                </div>

            </div>
        </header>
    );
};

export default CampusNavbar;