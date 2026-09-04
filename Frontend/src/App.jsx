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

function App() {
    const { currentUser } = useCampus();
    const [selectedItemForModal, setSelectedItemForModal] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // GATEKEEPER: If the student is not logged in, force the login/register screen
    if (!currentUser) {
        return <AuthModal isFullScreen={true} />;
    }

    return (
        <div className="CampusAppRoot">
            <CampusNavbar onOpenProfile={() => setShowProfileModal(true)} />
            <main>
                <CampusHero onRentClick={(item) => setSelectedItemForModal(item)} />
                <StudentListingForm />
                <FresherStore onRentClick={(item) => setSelectedItemForModal(item)} />
                <CampusAboutAndSafety />
            </main>
            <CampusFooter />

            {selectedItemForModal && (
                <RentDetailModal
                    item={selectedItemForModal}
                    onClose={() => setSelectedItemForModal(null)}
                />
            )}

            {showProfileModal && (
                <ProfileModal onClose={() => setShowProfileModal(false)} />
            )}
        </div>
    );
}

export default App;