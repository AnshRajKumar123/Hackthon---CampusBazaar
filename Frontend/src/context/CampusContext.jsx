import React, { createContext, useContext, useState, useEffect } from "react";

const CampusContext = createContext();

// Localhost / Local Area Network targeting on port 5001
const API_BASE = `http://${window.location.hostname}:5001/api`;

export const CampusProvider = ({ children }) => {
    const [listings, setListings] = useState([]);
    const [isLoadingListings, setIsLoadingListings] = useState(true);

    // Auth session states in React memory
    const [currentUser, setCurrentUser] = useState(null);
    const [authToken, setAuthToken] = useState(null);

    // Pull all live listings from MongoDB Atlas
    const fetchListings = async () => {
        setIsLoadingListings(true);
        try {
            const res = await fetch(`${API_BASE}/listings`);
            const data = await res.json();
            if (Array.isArray(data)) {
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

    // Auth: Register User
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
                if (data.token) setAuthToken(data.token);
                setCurrentUser(data.user);
                return { success: true };
            }
            return { success: false, message: data.message || "Registration failed" };
        } catch (err) {
            console.error("Registration error:", err);
            return { success: false, message: "Server connection failed. Is backend running on port 5001?" };
        }
    };

    // Auth: Login User
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
                if (data.token) setAuthToken(data.token);
                setCurrentUser(data.user);
                return { success: true };
            }
            return { success: false, message: data.message || "Invalid credentials" };
        } catch (err) {
            console.error("Login error:", err);
            return { success: false, message: "Server connection failed. Is backend running on port 5001?" };
        }
    };

    // Auth: Logout
    const logoutUser = () => {
        setCurrentUser(null);
        setAuthToken(null);
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

            const res = await fetch(`${API_BASE}/listings`, {
                method: "POST",
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                body: formDataPayload,
            });

            const created = await res.json();
            const formatted = { ...created, id: created._id };

            setListings((prev) => [formatted, ...prev]);
            return formatted;
        } catch (err) {
            console.error("Error creating listing in backend:", err);
            throw err;
        }
    };

    // Listings: Delete Single Item
    const deleteListing = async (id) => {
        try {
            await fetch(`${API_BASE}/listings/${id}`, {
                method: "DELETE",
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            });
            setListings((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Failed to delete listing:", err);
        }
    };

    // Profile: Delete User Profile & items
    const deleteUserProfile = async () => {
        if (!currentUser) return;
        const userId = currentUser.id || currentUser._id;

        try {
            await fetch(`${API_BASE}/auth/delete-profile/${userId}`, {
                method: "DELETE",
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            });

            setCurrentUser(null);
            setAuthToken(null);
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
                authToken,
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