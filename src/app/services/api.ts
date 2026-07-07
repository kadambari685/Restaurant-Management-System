const API_URL = "https://restaurant-backend-osnm.onrender.com";

export async function getMenu() {
    const response = await fetch(`${API_URL}/menu`);

    if (!response.ok) {
        throw new Error("Failed to fetch menu");
    }

    return response.json();
}

export async function createReservation(data: any) {
    const response = await fetch(`${API_URL}/reservation`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to create reservation");
    }

    return response.json();
}