import React, { createContext, useContext, useState, useEffect } from "react";

const CampusContext = createContext();

export const CampusProvider = ({ children }) => {
    // Safe initial load from localStorage
    const [listings, setListings] = useState(() => {
        try {
            const saved = localStorage.getItem("dbu_live_listings");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Error reading listings from storage:", e);
            return [];
        }
    });

    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("dbu_current_user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error("Error reading current user from storage:", e);
            return null;
        }
    });

    const [registeredUsers, setRegisteredUsers] = useState(() => {
        try {
            const users = localStorage.getItem("dbu_registered_users");
            return users ? JSON.parse(users) : [];
        } catch (e) {
            console.error("Error reading registered users from storage:", e);
            return [];
        }
    });

    // Guarded sync to localStorage to prevent mobile quota crashes
    useEffect(() => {
        try {
            localStorage.setItem("dbu_live_listings", JSON.stringify(listings));
        } catch (error) {
            console.error("LocalStorage quota exceeded when saving listings:", error);
            alert("Storage quota reached on this browser. Please delete an older item or use smaller pictures.");
        }
    }, [listings]);

    useEffect(() => {
        try {
            if (currentUser) {
                localStorage.setItem("dbu_current_user", JSON.stringify(currentUser));
            } else {
                localStorage.removeItem("dbu_current_user");
            }
        } catch (error) {
            console.error("Error syncing current user:", error);
        }
    }, [currentUser]);

    useEffect(() => {
        try {
            localStorage.setItem("dbu_registered_users", JSON.stringify(registeredUsers));
        } catch (error) {
            console.error("Error syncing registered users:", error);
        }
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
            department: department || "Computer Science & Engineering",
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

    // Listings: Add Item (stamps author rollNo and ID)
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

        // 1. Remove all items created by this student
        setListings((prevListings) =>
            prevListings.filter((item) => {
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