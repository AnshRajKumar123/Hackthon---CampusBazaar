import React, { useState, useEffect, useRef } from "react";
import "../styles/CampusChatModal.css";

const CampusChatModal = ({ item, currentUser, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef(null);

    // Target seller / borrower details
    const partnerName = item?.studentName || "Verified Student";
    const partnerDepartment = item?.department || "DBU Student";
    const partnerInitial = partnerName.charAt(0).toUpperCase();

    // Unique chat conversation key between current student and listing owner
    const chatStorageKey = `campus_chat_${item?.id || item?._id}_${currentUser?.rollNo}`;

    useEffect(() => {
        const saved = localStorage.getItem(chatStorageKey);
        if (saved) {
            setMessages(JSON.parse(saved));
        } else {
            // First automated opening inquiry
            const initialMsg = {
                id: "msg_1",
                sender: "me",
                text: `Hi ${partnerName}, I saw your listing for "${item?.itemTitle}" on CampusBazaar. Is it still available at ${item?.hostelBlock}?`,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setMessages([initialMsg]);
            localStorage.setItem(chatStorageKey, JSON.stringify([initialMsg]));
        }
    }, [chatStorageKey, partnerName, item]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMsg = {
            id: `msg_${Date.now()}`,
            sender: "me",
            text: inputText.trim(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        const updated = [...messages, newMsg];
        setMessages(updated);
        localStorage.setItem(chatStorageKey, JSON.stringify(updated));
        setInputText("");

        // Simulated seller reply
        setTimeout(() => {
            const replyMsg = {
                id: `reply_${Date.now()}`,
                sender: "partner",
                text: `Hi ${currentUser?.name?.split(" ")[0] || "there"}! Yes, it's available. We can meet near ${item?.hostelBlock || "the hostel"} to check it out.`,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setMessages((prev) => {
                const withReply = [...prev, replyMsg];
                localStorage.setItem(chatStorageKey, JSON.stringify(withReply));
                return withReply;
            });
        }, 1200);
    };

    return (
        <div className="ChatModalBackdrop" onClick={onClose}>
            <div className="ChatModalCard" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="ChatHeader">
                    <div className="ChatHeaderLeft">
                        <div className="ChatAvatar">{partnerInitial}</div>
                        <div className="ChatHeaderMeta">
                            <span className="ChatPartnerName">{partnerName}</span>
                            <span className="ChatPartnerBadge">
                                <i className="bx bxs-check-shield"></i>
                                {partnerDepartment} · DBU Verified
                            </span>
                        </div>
                    </div>
                    <button type="button" className="ChatHeaderCloseBtn" onClick={onClose}>
                        <i className="bx bx-x"></i>
                    </button>
                </div>

                {/* Privacy Badge: Shields user phone numbers */}
                <div className="PrivacyNoticeBanner">
                    <i className="bx bx-lock-alt"></i>
                    <span>Private & Protected: Personal phone numbers are masked on both sides.</span>
                </div>

                {/* Messages stream */}
                <div className="ChatBodyStream">
                    <div className="ChatDateStamp">Today</div>

                    {messages.map((m) => (
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
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Dock */}
                <form className="ChatInputDock" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="ChatInputField"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="ChatSendBtn">
                        <i className="bx bxs-send"></i>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CampusChatModal;