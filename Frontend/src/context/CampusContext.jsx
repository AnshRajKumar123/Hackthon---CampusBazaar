import React, { createContext, useContext, useState, useEffect } from "react";

const CampusContext = createContext();

// Automatically targets localhost on desktop and your LAN IP on mobile
const API_BASE = `http://${window.location.hostname}:5000/api`;

export const CampusProvider = ({ children }) => {
    const [listings, setListings] = useState([]);
    const [isLoadingListings, setIsLoadingListings] = useState(true);

    // Synchronize authenticated session state
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("dbu_current_user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    // Pull all live listings from MongoDB Atlas
    const fetchListings = async () => {
        setIsLoadingListings(true);
        try {
            const res = await fetch(`${API_BASE}/listings`);
            const data = await res.json();
            if (Array.isArray(data)) {
                // Normalize _id to id so all React components keep running seamlessly
                setListings(data.map((item) => ({ ...item, id: item._id })));
            }
        } catch (err) {
            console.error("Error fetching listings from MongoDB:", err);
        } finally {
            setIsLoadingListings(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    // Sync current user session locally
    useEffect(() => {
        try {
            if (currentUser) {
                localStorage.setItem("dbu_current_user", JSON.stringify(currentUser));
            } else {
                localStorage.removeItem("dbu_current_user");
                localStorage.removeItem("dbu_auth_token");
            }
        } catch (error) {
            console.error("Failed to sync user storage:", error);
        }
    }, [currentUser]);

    // Auth: Register User in MongoDB
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
            console.error("Registration error:", err);
            return { success: false, message: "Server connection failed. Is backend running on port 5000?" };
        }
    };

    // Auth: Login User against MongoDB Atlas
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
            console.error("Login error:", err);
            return { success: false, message: "Server connection failed. Is backend running on port 5000?" };
        }
    };

    // Auth: Logout
    const logoutUser = () => {
        setCurrentUser(null);
    };

    // Profile: In-session detail update
    const updateUserProfile = (updatedDetails) => {
        setCurrentUser((prev) => ({ ...prev, ...updatedDetails }));
    };

    // Listings: Post item with Multer multipart/form-data
    const addStudentListing = async (formDataPayload) => {
        try {
            if (currentUser) {
                formDataPayload.append("userId", currentUser.id || currentUser._id);
                formDataPayload.append("userRollNo", currentUser.rollNo);
            }

            // Do not manually set Content-Type header so the browser includes the multipart boundary
            const res = await fetch(`${API_BASE}/listings`, {
                method: "POST",
                body: formDataPayload,
            });

            const created = await res.json();
            const formatted = { ...created, id: created._id };

            // Prepend the new item immediately so UI updates without a reload
            setListings((prev) => [formatted, ...prev]);
            return formatted;
        } catch (err) {
            console.error("Error creating listing in backend:", err);
            throw err;
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
            console.error("Failed to delete listing:", err);
        }
    };

    // Profile: Delete Entire User Account & All Their Uploaded Gear from Cloud
    const deleteUserProfile = async () => {
        if (!currentUser) return;
        const userId = currentUser.id || currentUser._id;

        try {
            await fetch(`${API_BASE}/auth/delete-profile/${userId}`, {
                method: "DELETE",
            });

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