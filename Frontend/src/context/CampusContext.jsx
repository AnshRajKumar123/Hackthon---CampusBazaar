import React, { createContext, useContext, useState, useEffect } from "react";

const CampusContext = createContext();

// Automatically adapts whether you are opening from laptop (localhost) or phone (local IP)
const API_BASE = `http://${window.location.hostname}:5000/api`;

export const CampusProvider = ({ children }) => {
    // Live products loaded from MongoDB Atlas
    const [listings, setListings] = useState([]);
    const [isLoadingListings, setIsLoadingListings] = useState(true);

    // Active student session persisted locally
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("dbu_current_user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error("Failed to load user session:", e);
            return null;
        }
    });

    // Fetch all listings from MongoDB Atlas
    const fetchListings = async () => {
        setIsLoadingListings(true);
        try {
            const res = await fetch(`${API_BASE}/listings`);
            const data = await res.json();
            if (Array.isArray(data)) {
                // Normalize MongoDB _id to id so all your existing components work seamlessly
                setListings(data.map((item) => ({ ...item, id: item._id })));
            }
        } catch (err) {
            console.error("Error fetching listings from MongoDB:", err);
        } finally {
            setIsLoadingListings(false);
        }
    };

    // Initial load from cloud
    useEffect(() => {
        fetchListings();
    }, []);

    // Sync user session to localStorage
    useEffect(() => {
        try {
            if (currentUser) {
                localStorage.setItem("dbu_current_user", JSON.stringify(currentUser));
            } else {
                localStorage.removeItem("dbu_current_user");
                localStorage.removeItem("dbu_auth_token");
            }
        } catch (error) {
            console.error("Error syncing current user:", error);
        }
    }, [currentUser]);

    // Auth: Register (Saves student into MongoDB Atlas)
    const registerUser = async ({ name, rollNo, password, department, hostelBlock, phone }) => {
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    rollNo: rollNo.trim(),
                    password,
                    department: department || "Computer Science & Engineering",
                    hostelBlock: hostelBlock || "Block A",
                    phone: phone || "",
                }),
            });

            const data = await res.json();
            if (data.success) {
                if (data.token) localStorage.setItem("dbu_auth_token", data.token);
                setCurrentUser(data.user);
                return { success: true };
            }
            return { success: false, message: data.message || "Registration failed" };
        } catch (err) {
            console.error("Register network error:", err);
            return { success: false, message: "Server connection failed. Is backend running?" };
        }
    };

    // Auth: Login (Verifies against MongoDB Atlas bcrypt hash)
    const loginUser = async (rollNo, password) => {
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rollNo: rollNo.trim(),
                    password,
                }),
            });

            const data = await res.json();
            if (data.success) {
                if (data.token) localStorage.setItem("dbu_auth_token", data.token);
                setCurrentUser(data.user);
                return { success: true };
            }
            return { success: false, message: data.message || "Invalid credentials" };
        } catch (err) {
            console.error("Login network error:", err);
            return { success: false, message: "Server connection failed. Is backend running?" };
        }
    };

    // Auth: Logout
    const logoutUser = () => {
        setCurrentUser(null);
    };

    // Update Profile Details
    const updateUserProfile = (updatedDetails) => {
        const updated = { ...currentUser, ...updatedDetails };
        setCurrentUser(updated);
    };

    // Listings: Add Item (Saves permanently to MongoDB Atlas)
    const addStudentListing = async (itemData) => {
        try {
            const payload = {
                ...itemData,
                userId: currentUser?.id || currentUser?._id,
                userRollNo: currentUser?.rollNo,
            };

            const res = await fetch(`${API_BASE}/listings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const created = await res.json();
            const formatted = { ...created, id: created._id };

            // Add to local state immediately so UI updates instantly
            setListings((prev) => [formatted, ...prev]);
            return formatted;
        } catch (err) {
            console.error("Failed to save listing to MongoDB:", err);
        }
    };

    // Listings: Delete Single Item from MongoDB Atlas
    const deleteListing = async (id) => {
        try {
            await fetch(`${API_BASE}/listings/${id}`, {
                method: "DELETE",
            });
            setListings((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Failed to delete listing from DB:", err);
        }
    };

    // Profile: Delete Entire User Account & All Their Uploaded Items from MongoDB Atlas
    const deleteUserProfile = async () => {
        if (!currentUser) return;
        const userId = currentUser.id || currentUser._id;

        try {
            await fetch(`${API_BASE}/auth/delete-profile/${userId}`, {
                method: "DELETE",
            });

            // Clear local session and re-fetch global store
            setCurrentUser(null);
            await fetchListings();
        } catch (err) {
            console.error("Failed to delete user profile from DB:", err);
        }
    };

    return (
        <CampusContext.Provider
            value={{
                listings,
                currentUser,
                isLoadingListings,
                registerUser,
                loginUser,
                logoutUser,
                updateUserProfile,
                deleteUserProfile,
                addStudentListing,
                deleteListing,
                refreshListings: fetchListings,
            }}
        >
            {children}
        </CampusContext.Provider>
    );
};

export const useCampus = () => useContext(CampusContext);