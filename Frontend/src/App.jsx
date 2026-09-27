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
    const { currentUser, listings } = useCampus();
    const [selectedItemForModal, setSelectedItemForModal] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [activeChatItem, setActiveChatItem] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // GATEKEEPER: Require authentication
    if (!currentUser) {
        return <AuthModal isFullScreen={true} />;
    }

    // Handles Live Chat click with self-ownership prevention
    const handleInitiateChat = (item) => {
        const isOwner =
            currentUser.rollNo === item.userRollNo ||
            currentUser.id === item.userId ||
            currentUser._id === item.userId ||
            currentUser.name === item.studentName;

        if (isOwner) {
            alert("This is your listing! Buyers will message you here. Opening your inbox...");
            setActiveChatItem(null); // Opens general sidebar inbox
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
                    onRentClick={(item) => setSelectedItemForModal(item)}
                    onChatClick={handleInitiateChat}
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