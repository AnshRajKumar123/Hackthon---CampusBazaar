import React, { useState, useEffect, useRef } from "react";
import "../styles/CampusChatModal.css";

const CampusChatModal = ({ item, currentUser, onClose }) => {
    const [threads, setThreads] = useState([]);
    const [activeThreadKey, setActiveThreadKey] = useState("");
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef(null);

    // Load all conversations in localStorage associated with this user
    const loadAllThreads = () => {
        const found = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("campus_chat_")) {
                try {
                    const rawData = JSON.parse(localStorage.getItem(key));
                    if (Array.isArray(rawData)) {
                        const metaKey = `meta_${key}`;
                        const meta = JSON.parse(localStorage.getItem(metaKey) || "{}");
                        found.push({
                            key,
                            meta,
                            lastMessage: rawData[rawData.length - 1],
                            messages: rawData,
                        });
                    }
                } catch {
                    // Ignore corrupted entries
                }
            }
        }
        return found;
    };

    // Initialize or focus thread on mount
    useEffect(() => {
        const all = loadAllThreads();
        setThreads(all);

        if (item) {
            const itemId = item.id || item._id;
            const targetKey = `campus_chat_${itemId}_${currentUser?.rollNo}`;
            setActiveThreadKey(targetKey);

            // Store metadata for the sidebar listing
            const metaKey = `meta_${targetKey}`;
            const metaObj = {
                partnerName: item.studentName || "Verified Student",
                department: item.department || "DBU",
                itemTitle: item.itemTitle,
                itemId,
            };
            localStorage.setItem(metaKey, JSON.stringify(metaObj));

            const existing = localStorage.getItem(targetKey);
            setMessages(existing ? JSON.parse(existing) : []);
        } else if (all.length > 0) {
            setActiveThreadKey(all[0].key);
            setMessages(all[0].messages || []);
        }
    }, [item, currentUser]);

    // Update active conversation when clicking sidebar items
    const handleSelectThread = (thread) => {
        setActiveThreadKey(thread.key);
        setMessages(thread.messages || []);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Send a real message (no fake bot/auto-reply)
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeThreadKey) return;

        const newMsg = {
            id: `msg_${Date.now()}`,
            sender: "me",
            senderRoll: currentUser?.rollNo,
            text: inputText.trim(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        const updated = [...messages, newMsg];
        setMessages(updated);
        localStorage.setItem(activeThreadKey, JSON.stringify(updated));
        setInputText("");

        // Refresh thread sidebar list
        setThreads(loadAllThreads());
    };

    // Determine current partner details safely
    const currentMeta = JSON.parse(localStorage.getItem(`meta_${activeThreadKey}`) || "{}");
    const partnerName = currentMeta.partnerName || item?.studentName || "Verified Student";
    const partnerDepartment = currentMeta.department || item?.department || "DBU Student";
    const partnerInitial = partnerName.charAt(0).toUpperCase();

    return (
        <div className="ChatModalBackdrop" onClick={onClose}>
            <div className="ChatModalCard" onClick={(e) => e.stopPropagation()}>
                {/* 1. LEFT SIDEBAR: INBOX THREADS */}
                <aside className="ChatSidebar">
                    <div className="ChatSidebarHeader">
                        <h3>
                            <i className="bx bx-conversation"></i>
                            <span>Student Chats</span>
                        </h3>
                    </div>

                    <div className="ChatThreadList">
                        {threads.length === 0 && !item ? (
                            <div className="SidebarEmptyState">
                                <i className="bx bx-message-square-dots"></i>
                                <p>No active chats yet</p>
                            </div>
                        ) : (
                            threads.map((t) => (
                                <div
                                    key={t.key}
                                    className={`ChatThreadItem ${activeThreadKey === t.key ? "active" : ""}`}
                                    onClick={() => handleSelectThread(t)}
                                >
                                    <div className="ThreadAvatar">
                                        {(t.meta.partnerName || "S").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ThreadMeta">
                                        <div className="ThreadTopRow">
                                            <span className="ThreadName">{t.meta.partnerName || "Student"}</span>
                                            <span className="ThreadTime">{t.lastMessage?.time || ""}</span>
                                        </div>
                                        <div className="ThreadItemTitle">{t.meta.itemTitle || "Listing"}</div>
                                        <p className="ThreadLastMsg">
                                            {t.lastMessage ? t.lastMessage.text : "Tap to open chat..."}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* 2. RIGHT MAIN PANE: CHAT MESSENGER */}
                <main className="ChatMainPane">
                    <header className="ChatHeader">
                        <div className="ChatHeaderLeft">
                            <div className="ThreadAvatar">{partnerInitial}</div>
                            <div>
                                <div className="ChatPartnerName">{partnerName}</div>
                                <div className="ChatPartnerBadge">
                                    <i className="bx bxs-check-shield"></i>
                                    {partnerDepartment} · DBU Verified
                                </div>
                            </div>
                        </div>
                        <button type="button" className="ChatHeaderCloseBtn" onClick={onClose}>
                            <i className="bx bx-x"></i>
                        </button>
                    </header>

                    {/* Masked numbers privacy reminder */}
                    <div className="PrivacyNoticeBanner">
                        <i className="bx bx-shield-quarter"></i>
                        <span>Privacy Protected: Phone numbers are kept hidden on both sides.</span>
                    </div>

                    {/* Message stream */}
                    <div className="ChatBodyStream">
                        {messages.length === 0 ? (
                            <div className="ChatNoMessagesState">
                                <i className="bx bx-chat" style={{ fontSize: "28px", marginBottom: "6px" }}></i>
                                <span>No messages yet. Send an inquiry below!</span>
                            </div>
                        ) : (
                            messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`ChatMessageBubble ${m.sender === "me" ? "sent" : "received"}`}
                                >
                                    <span>{m.text}</span>
                                    <div className="MessageFooter">
                                        <span>{m.time}</span>
                                        {m.sender === "me" && <i className="bx bx-check-double"></i>}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input Dock */}
                    <form className="ChatInputDock" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Type a message to the student..."
                            className="ChatInputField"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="ChatSendBtn" aria-label="Send">
                            <i className="bx bxs-send"></i>
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default CampusChatModal;