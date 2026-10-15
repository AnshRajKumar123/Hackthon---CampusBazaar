import React, { useState } from "react";
import { useCampus } from "./context/CampusContext";
import CampusNavbar from "./components/CampusNavbar";
import CampusHero from "./components/CampusHero";
import StudentListingForm from "./components/StudentListingForm";
import FresherStore from "./components/FresherStore";
import CampusAboutAndSafety from "./components/CampusAboutAndSafety";
import CampusFooter from "./components/CampusFooter";
import RentDetailModal from "./components/RentDetailModal";
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal";
import CampusChatModal from "./components/CampusChatModal";

function App() {
    const { currentUser } = useCampus();
    const [selectedItemForModal, setSelectedItemForModal] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [activeChatItem, setActiveChatItem] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // GATEKEEPER: Require authentication
    if (!currentUser) {
        return <AuthModal isFullScreen={true} />;
    }

    // Handles Live Chat click with safe item ownership detection
    const handleInitiateChat = (item) => {
        if (!item) {
            setActiveChatItem(null);
            setIsChatOpen(true);
            return;
        }

        const myRoll = String(currentUser?.rollNo || currentUser?.studentRollNo || "").trim();
        const itemRoll = String(item.studentRollNo || item.rollNo || item.sellerRoll || "").trim();
        const isOwner =
            (myRoll && itemRoll && myRoll === itemRoll) ||
            currentUser.id === item.userId ||
            currentUser._id === item.userId ||
            (currentUser.name && currentUser.name.toLowerCase() === (item.studentName || "").toLowerCase());

        if (isOwner) {
            alert("This is your listing! Opening your inbox to view inquiries from students...");
            setActiveChatItem(null);
            setIsChatOpen(true);
            return;
        }

        setActiveChatItem(item);
        setIsChatOpen(true);
    };

    return (
        <div className="CampusAppRoot">
            <CampusNavbar
                onOpenProfile={() => setShowProfileModal(true)}
                onOpenChats={() => {
                    setActiveChatItem(null);
                    setIsChatOpen(true);
                }}
            />

            <main>
                <CampusHero onRentClick={(item) => setSelectedItemForModal(item)} />
                <StudentListingForm />
                <FresherStore
                    onOpenChat={handleInitiateChat}
                    onRentClick={(item) => setSelectedItemForModal(item)}
                />
                <CampusAboutAndSafety />
            </main>
            <CampusFooter />

            {/* Item Details Modal */}
            {selectedItemForModal && (
                <RentDetailModal
                    item={selectedItemForModal}
                    onClose={() => setSelectedItemForModal(null)}
                    onOpenChat={handleInitiateChat}
                />
            )}

            {/* Profile Modal */}
            {showProfileModal && (
                <ProfileModal onClose={() => setShowProfileModal(false)} />
            )}

            {/* Dual-Column WhatsApp-Style Live Chat Modal */}
            {isChatOpen && (
                <CampusChatModal
                    item={activeChatItem}
                    currentUser={currentUser}
                    onClose={() => {
                        setIsChatOpen(false);
                        setActiveChatItem(null);
                    }}
                />
            )}
        </div>
    );
}

export default App;