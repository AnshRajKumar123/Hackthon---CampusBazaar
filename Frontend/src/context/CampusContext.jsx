import React, { createContext, useContext, useState, useEffect } from "react";

const CampusContext = createContext();

export const CampusProvider = ({ children }) => {
    // Listings State
    const [listings, setListings] = useState(() => {
        const saved = localStorage.getItem("dbu_live_listings");
        return saved ? JSON.parse(saved) : [];
    });

    // Current Logged-in User
    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem("dbu_current_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Registered Users Directory
    const [registeredUsers, setRegisteredUsers] = useState(() => {
        const users = localStorage.getItem("dbu_registered_users");
        return users ? JSON.parse(users) : [];
    });

    // Sync Listings to LocalStorage
    useEffect(() => {
        localStorage.setItem("dbu_live_listings", JSON.stringify(listings));
    }, [listings]);

    // Sync Current User Session to LocalStorage
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem("dbu_current_user", JSON.stringify(currentUser));
        } else {
            localStorage.removeItem("dbu_current_user");
        }
    }, [currentUser]);

    // Sync Registered Users Database to LocalStorage
    useEffect(() => {
        localStorage.setItem("dbu_registered_users", JSON.stringify(registeredUsers));
    }, [registeredUsers]);

    // Auth: Register
    const registerUser = ({ name, rollNo, password, department, hostelBlock, phone }) => {
        const exists = registeredUsers.some(
            (u) => u.rollNo.toLowerCase() === rollNo.trim().toLowerCase()
        );
        if (exists) {
            return { success: false, message: "A student with this CRM / Roll No is already registered." };
        }

        const newUser = {
            id: `usr-${Date.now()}`,
            name,
            rollNo: rollNo.trim(),
            password,
            department: department || "Mechanical Engineering",
            hostelBlock: hostelBlock || "Block A",
            phone: phone || "",
            joinedAt: new Date().toLocaleDateString(),
        };

        setRegisteredUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
        return { success: true };
    };

    // Auth: Login
    const loginUser = (rollNo, password) => {
        const user = registeredUsers.find(
            (u) =>
                u.rollNo.toLowerCase() === rollNo.trim().toLowerCase() &&
                u.password === password
        );

        if (!user) {
            return { success: false, message: "Invalid CRM / Roll No or password." };
        }

        setCurrentUser(user);
        return { success: true };
    };

    // Auth: Logout
    const logoutUser = () => {
        setCurrentUser(null);
    };

    // Update Profile Details
    const updateUserProfile = (updatedDetails) => {
        const updated = { ...currentUser, ...updatedDetails };
        setCurrentUser(updated);
        setRegisteredUsers((prev) =>
            prev.map((u) => (u.rollNo === updated.rollNo ? updated : u))
        );
    };

    // Listings: Add Item (Automatically stamps author rollNo and ID)
    const addStudentListing = (itemData) => {
        const newItem = {
            id: `item-${Date.now()}`,
            userId: currentUser?.id,
            userRollNo: currentUser?.rollNo,
            ...itemData,
            createdAt: new Date().toISOString(),
            timestamp: "Just now",
        };
        setListings((prev) => [newItem, ...prev]);
        return newItem;
    };

    // Listings: Delete Single Item
    const deleteListing = (id) => {
        setListings((prev) => prev.filter((item) => item.id !== id));
    };

    // Profile: Delete Entire User Account & All Their Uploaded Gear
    const deleteUserProfile = () => {
        if (!currentUser) return;

        // 1. Remove all items created by this exact student
        setListings((prevListings) =>
            prevListings.filter((item) => {
                // Match by userRollNo / userId if available, fallback safely to name & non-empty phone
                if (item.userRollNo) return item.userRollNo !== currentUser.rollNo;
                if (item.userId) return item.userId !== currentUser.id;

                const isSameName = item.studentName?.toLowerCase() === currentUser.name?.toLowerCase();
                const isSamePhone = currentUser.phone && item.studentPhone === currentUser.phone;
                return !(isSameName && isSamePhone);
            })
        );

        // 2. Remove user from registered student directory
        setRegisteredUsers((prevUsers) =>
            prevUsers.filter((u) => u.rollNo.toLowerCase() !== currentUser.rollNo.toLowerCase())
        );

        // 3. Clear active session (triggers return to login gate)
        setCurrentUser(null);
    };

    return (
        <CampusContext.Provider
            value={{
                listings,
                currentUser,
                registerUser,
                loginUser,
                logoutUser,
                updateUserProfile,
                deleteUserProfile,
                addStudentListing,
                deleteListing,
            }}
        >
            {children}
        </CampusContext.Provider>
    );
};

export const useCampus = () => useContext(CampusContext);