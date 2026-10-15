import React, { useState, useEffect, useRef } from "react";
import "../styles/NotificationCenter.css";

const API_BASE = "http://localhost:5001/api/notifications";

export default function NotificationCenter({ currentUser }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Support every possible roll alias in your auth context[cite: 46]
    const myRoll = String(
        currentUser?.rollNo ||
        currentUser?.studentRollNo ||
        currentUser?.identifier ||
        currentUser?.roll ||
        currentUser?.studentRoll ||
        ""
    ).trim();

    const fetchNotifications = async () => {
        if (!myRoll) return;
        try {
            const res = await fetch(`${API_BASE}?rollNo=${encodeURIComponent(myRoll)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unreadCount || 0);
                }
            }
        } catch (err) {
            console.error("Notifications fetch error:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 3000);
        return () => clearInterval(interval);
    }, [myRoll]);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const handleMarkAllRead = async () => {
        if (!myRoll) return;
        try {
            await fetch(`${API_BASE}/mark-all-read`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rollNo: myRoll })
            });
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (err) {
            console.error("Mark read error:", err);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case "CHAT":
                return "bx bx-message-rounded-dots";
            case "AUTH":
                return "bx bx-user-check";
            case "LISTING_ADD":
                return "bx bx-plus-circle";
            case "LISTING_UPDATE":
                return "bx bx-edit";
            case "LISTING_DELETE":
                return "bx bx-trash";
            default:
                return "bx bx-bell";
        }
    };

    return (
        <div className="NotificationRoot" ref={dropdownRef}>
            <button
                type="button"
                className="NotificationBellBtn"
                onClick={() => setIsOpen((prev) => !prev)}
                title="Notifications"
                aria-label="Notifications"
            >
                <i className="bx bx-bell"></i>
                {unreadCount > 0 && <span className="NotificationBadge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="NotificationDropdownCard">
                    <div className="NotificationDropdownHeader">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="bx bx-bell" style={{ fontSize: "16px" }}></i>
                            <h4>Notifications</h4>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                className="BtnMarkAllRead"
                                onClick={handleMarkAllRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="NotificationListBody">
                        {notifications.length === 0 ? (
                            <div className="NotificationEmptyState">
                                <i className="bx bx-bell-off"></i>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    className={`NotificationItemRow ${n.read ? "read" : "unread"}`}
                                >
                                    <div className="NotificationIconWrap">
                                        <i className={getIconForType(n.type)}></i>
                                    </div>
                                    <div className="NotificationMetaContent">
                                        <span className="NotificationTitle">{n.title}</span>
                                        <p className="NotificationDesc">{n.message}</p>
                                        <small className="NotificationTime">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </small>
                                    </div>
                                    {!n.read && <span className="UnreadDot"></span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}