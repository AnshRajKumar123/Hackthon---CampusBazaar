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

    // GATEKEEPER: If the student is not logged in, force the login/register screen
    if (!currentUser) {
        return <AuthModal isFullScreen={true} />;
    }

    return (
        <div className="CampusAppRoot">
            <CampusNavbar
                onOpenProfile={() => setShowProfileModal(true)}
                onOpenChats={() => {
                    if (listings && listings.length > 0) {
                        setActiveChatItem(listings[0]);
                    } else {
                        alert("No active student listings to chat with right now.");
                    }
                }}
            />

            <main>
                <CampusHero onRentClick={(item) => setSelectedItemForModal(item)} />
                <StudentListingForm />
                <FresherStore
                    onRentClick={(item) => setSelectedItemForModal(item)}
                    onChatClick={(item) => setActiveChatItem(item)}
                />
                <CampusAboutAndSafety />
            </main>
            <CampusFooter />

            {/* Item Details Modal */}
            {selectedItemForModal && (
                <RentDetailModal
                    item={selectedItemForModal}
                    onClose={() => setSelectedItemForModal(null)}
                    onOpenChat={(item) => setActiveChatItem(item)}
                />
            )}

            {/* Profile Modal */}
            {showProfileModal && (
                <ProfileModal onClose={() => setShowProfileModal(false)} />
            )}

            {/* Privacy-Protected Live Chat Modal */}
            {activeChatItem && (
                <CampusChatModal
                    item={activeChatItem}
                    currentUser={currentUser}
                    onClose={() => setActiveChatItem(null)}
                />
            )}
        </div>
    );
}

export default App;