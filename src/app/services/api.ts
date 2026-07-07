const API_URL = "http://127.0.0.1:8000";

export async function getMenu() {
    const response = await fetch(`${API_URL}/menu`);

    if (!response.ok) {
        throw new Error("Failed to fetch menu");
    }

    return response.json();
}

export async function createReservation(data: any) {
    const response = await fetch("http://127.0.0.1:8000/reservation", {
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