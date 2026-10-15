import React, { useState, useEffect, useRef } from "react";
import "../styles/CampusChatModal.css";

const API_BASE = "http://localhost:5001/api/chat";

const CampusChatModal = ({ item, currentUser, onClose }) => {
    const [threads, setThreads] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const myRoll = String(currentUser?.rollNo || "").trim();
    const myName = String(currentUser?.name || "Me").trim();

    // Helper: Determine the conversation partner's display info dynamically
    const getPartnerInfo = (conversation) => {
        if (!conversation) return { name: "DBU Student", dept: "Verified Student" };

        const isMeSeller = String(conversation.sellerRoll).trim() === myRoll;
        const otherName = isMeSeller ? conversation.buyerName : conversation.sellerName;
        const otherRole = isMeSeller ? "Student Buyer" : "Verified Seller";
        const otherRoll = isMeSeller ? conversation.buyerRoll : conversation.sellerRoll;

        return {
            name: otherName || (isMeSeller ? "Student Buyer" : "Listing Owner"),
            dept: otherRole,
            roll: otherRoll
        };
    };

    // 1. Fetch all conversations for current user from MongoDB
    const fetchThreads = async () => {
        if (!myRoll) return [];
        try {
            const res = await fetch(`${API_BASE}/conversations?rollNo=${myRoll}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (data.success && Array.isArray(data.threads)) {
                setThreads(data.threads);
                return data.threads;
            }
        } catch (err) {
            console.error("Failed to load threads from MongoDB:", err);
        }
        return [];
    };

    // 2. Mark unseen messages as read
    const markAsSeen = async (conversationId) => {
        if (!conversationId || !myRoll) return;
        try {
            await fetch(`${API_BASE}/conversations/${conversationId}/seen`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ readerRoll: myRoll })
            });
        } catch (err) {
            console.error("Failed to mark seen:", err);
        }
    };

    // 3. Initialize or open active conversation
    useEffect(() => {
        let isMounted = true;

        const initChat = async () => {
            setLoading(true);
            const userThreads = await fetchThreads();

            if (item) {
                const itemId = String(item.id || item._id || "").trim();

                // Check all possible field variations for owner's roll number
                const rawSellerRoll = String(
                    item.studentRollNo ||
                    item.rollNo ||
                    item.studentRoll ||
                    item.sellerRoll ||
                    item.userRoll ||
                    ""
                ).trim();

                const isItemOwner = rawSellerRoll && rawSellerRoll === myRoll;

                const payload = {
                    itemId,
                    itemTitle: item.itemTitle || item.title || "Campus Gear",
                    sellerRoll: rawSellerRoll || (isItemOwner ? myRoll : "seller"),
                    sellerName: item.studentName || item.sellerName || (isItemOwner ? myName : "Listing Owner"),
                    buyerRoll: isItemOwner ? "" : myRoll,
                    buyerName: isItemOwner ? "" : myName
                };

                try {
                    const res = await fetch(`${API_BASE}/conversations/open`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (isMounted && data.success && data.conversation) {
                            setActiveConversation(data.conversation);
                            setMessages(data.conversation.messages || []);
                            markAsSeen(data.conversation._id);
                            fetchThreads();
                        } else if (isMounted && userThreads.length > 0) {
                            setActiveConversation(userThreads[0]);
                            setMessages(userThreads[0].messages || []);
                        }
                    }
                } catch (err) {
                    console.error("Open conversation error:", err);
                }
            } else if (userThreads && userThreads.length > 0) {
                if (isMounted) {
                    setActiveConversation(userThreads[0]);
                    setMessages(userThreads[0].messages || []);
                    markAsSeen(userThreads[0]._id);
                }
            }

            if (isMounted) setLoading(false);
        };

        initChat();

        return () => {
            isMounted = false;
        };
    }, [item, myRoll]);

    // 4. Polling for live incoming messages from MongoDB (every 2 seconds)
    useEffect(() => {
        if (!myRoll) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/conversations?rollNo=${myRoll}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.threads)) {
                        setThreads(data.threads);

                        // If viewing a conversation, update messages live
                        if (activeConversation?._id) {
                            const updatedActive = data.threads.find(
                                (t) => String(t._id) === String(activeConversation._id)
                            );
                            if (updatedActive) {
                                setMessages(updatedActive.messages || []);
                            }
                        } else if (data.threads.length > 0) {
                            // If none was focused, select the latest one
                            setActiveConversation(data.threads[0]);
                            setMessages(data.threads[0].messages || []);
                        }
                    }
                }
            } catch {
                // Ignore transient network errors
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [activeConversation?._id, myRoll]);

    // Switch conversation from sidebar
    const handleSelectThread = async (thread) => {
        setActiveConversation(thread);
        setMessages(thread.messages || []);
        await markAsSeen(thread._id);
    };

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 5. Send message directly to MongoDB
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        let targetId = activeConversation?._id;

        // If no conversation in state yet, create one before sending
        if (!targetId && item) {
            const rawSeller = String(
                item.studentRollNo ||
                item.rollNo ||
                item.studentRoll ||
                item.sellerRoll ||
                ""
            ).trim();

            const res = await fetch(`${API_BASE}/conversations/open`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId: String(item.id || item._id),
                    itemTitle: item.itemTitle || item.title || "Campus Gear",
                    sellerRoll: rawSeller || "seller",
                    sellerName: item.studentName || item.sellerName || "Listing Owner",
                    buyerRoll: myRoll,
                    buyerName: myName
                })
            });
            const data = await res.json();
            if (data.success && data.conversation) {
                targetId = data.conversation._id;
                setActiveConversation(data.conversation);
            }
        }

        if (!targetId) return;

        const textToSend = inputText.trim();
        setInputText("");

        try {
            const res = await fetch(`${API_BASE}/conversations/${targetId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderRoll: myRoll,
                    senderName: myName,
                    text: textToSend
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.conversation) {
                    setActiveConversation(data.conversation);
                    setMessages(data.conversation.messages || []);
                    fetchThreads();
                }
            }
        } catch (err) {
            console.error("Failed to send message to MongoDB:", err);
        }
    };

    const partner = getPartnerInfo(activeConversation);
    const partnerInitial = (partner.name.charAt(0) || "S").toUpperCase();

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
                        {loading && threads.length === 0 ? (
                            <div className="SidebarEmptyState">
                                <p>Loading conversations...</p>
                            </div>
                        ) : threads.length === 0 ? (
                            <div className="SidebarEmptyState">
                                <i className="bx bx-message-square-dots"></i>
                                <p>No active chats yet</p>
                            </div>
                        ) : (
                            threads.map((t) => {
                                const tPartner = getPartnerInfo(t);
                                const lastMsg = t.messages?.[t.messages.length - 1];

                                return (
                                    <div
                                        key={t._id}
                                        className={`ChatThreadItem ${activeConversation?._id === t._id ? "active" : ""}`}
                                        onClick={() => handleSelectThread(t)}
                                    >
                                        <div className="ThreadAvatar">
                                            {(tPartner.name.charAt(0) || "S").toUpperCase()}
                                        </div>
                                        <div className="ThreadMeta">
                                            <div className="ThreadTopRow">
                                                <span className="ThreadName">{tPartner.name}</span>
                                                <span className="ThreadTime">{lastMsg?.time || ""}</span>
                                            </div>
                                            <div className="ThreadItemTitle">{t.itemTitle}</div>
                                            <p className="ThreadLastMsg">
                                                {lastMsg ? lastMsg.text : "Tap to open chat..."}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* 2. RIGHT MAIN PANE: CHAT MESSENGER */}
                <main className="ChatMainPane">
                    <header className="ChatHeader">
                        <div className="ChatHeaderLeft">
                            <div className="ThreadAvatar">{partnerInitial}</div>
                            <div>
                                <div className="ChatPartnerName">{partner.name}</div>
                                <div className="ChatPartnerBadge">
                                    <i className="bx bxs-check-shield"></i>
                                    {partner.dept} · DBU Verified
                                </div>
                            </div>
                        </div>
                        <button type="button" className="ChatHeaderCloseBtn" onClick={onClose} aria-label="Close">
                            <i className="bx bx-x"></i>
                        </button>
                    </header>

                    <div className="PrivacyNoticeBanner">
                        <i className="bx bx-shield-quarter"></i>
                        <span>Privacy Protected: Stored securely in DBU Cloud Database.</span>
                    </div>

                    <div className="ChatBodyStream">
                        {messages.length === 0 ? (
                            <div className="ChatNoMessagesState">
                                <i className="bx bx-chat" style={{ fontSize: "28px", marginBottom: "6px" }}></i>
                                <span>No messages yet. Send an inquiry below!</span>
                            </div>
                        ) : (
                            messages.map((m) => {
                                const isSentByMe = String(m.senderRoll).trim() === myRoll;

                                return (
                                    <div
                                        key={m._id || m.id}
                                        className={`ChatMessageBubble ${isSentByMe ? "sent" : "received"}`}
                                    >
                                        <span>{m.text}</span>
                                        <div className="MessageFooter">
                                            <span>{m.time}</span>
                                            {isSentByMe && (
                                                <i
                                                    className={`bx bx-check-double ${m.seen ? "seen" : "delivered"}`}
                                                    title={m.seen ? "Seen" : "Delivered"}
                                                ></i>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

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