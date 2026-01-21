// map.js - The GPS Engine for LogLegends

let map;
let watchId;

export function initLogLegendsMap() {
    // In a Vite/Vibe environment, use import.meta.env
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error("Vibe Check Failed: Google Maps API Key missing from .env");
        return;
    }

    // Load the Google Maps Script dynamically
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=startTracking`;
    script.async = true;
    document.head.appendChild(script);
}

window.startTracking = () => {
    map = new google.maps.Map(document.getElementById("map-display"), {
        center: { lat: 35.584, lng: -78.800 }, // Default to Fuquay-Varina area
        zoom: 15,
        styles: [ /* Add your 'Bold & Bright' custom styles here */ ]
    });

    console.log("Antigravity Map Initialized.");
};

export function startDriveSession() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const pos = { lat: latitude, lng: longitude };
                
                map.setCenter(pos);
                // logic to save to storage.js goes here
            },
            (error) => console.error("GPS Error:", error),
            { enableHighAccuracy: true }
        );
    }
}