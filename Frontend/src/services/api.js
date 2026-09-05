// Automatically handles switching between localhost and your local IP on mobile
const PRODUCTION_API = "https://campusbazaar-backend-ajve.onrender.com/api";

const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname.startsWith("10.") ||
    window.location.hostname.startsWith("192.") ||
    window.location.hostname === "127.0.0.1";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : isLocal
        ? `http://${window.location.hostname}:5001/api`
        : PRODUCTION_API;

export const api = {
    // Auth
    register: async (userData) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        return res.json();
    },

    login: async (credentials) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        return res.json();
    },

    deleteProfile: async (userId) => {
        const res = await fetch(`${API_BASE}/auth/delete-profile/${userId}`, {
            method: "DELETE",
        });
        return res.json();
    },

    // Listings
    fetchListings: async () => {
        const res = await fetch(`${API_BASE}/listings`);
        return res.json();
    },

    createListing: async (listingData) => {
        const res = await fetch(`${API_BASE}/listings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(listingData),
        });
        return res.json();
    },

    deleteListing: async (id) => {
        const res = await fetch(`${API_BASE}/listings/${id}`, {
            method: "DELETE",
        });
        return res.json();
    },
};