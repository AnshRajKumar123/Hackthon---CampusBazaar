const API_BASE = `http://${window.location.hostname}:5001/api`;

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