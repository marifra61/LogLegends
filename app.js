// LogLegends Unified App Logic
let map;

// 1. The Global Callback for Google Maps
window.initMap = function() {
    console.log("Google Maps Script loaded. Initializing map...");
    map = new google.maps.Map(document.getElementById("map-display"), {
        center: { lat: 35.584, lng: -78.800 }, 
        zoom: 15,
        disableDefaultUI: true,
        styles: [
            { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
            { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] }
        ]
    });
};

// 2. Load the Script with your Restricted Key
function loadGoogleMaps() {
    const apiKey = "PASTE_YOUR_KEY_FROM_LEAD_FINDER_PRO"; 
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

// 3. Start the App
document.addEventListener('DOMContentLoaded', () => {
    console.log("LogLegends Dashboard Ready");
    loadGoogleMaps();
});
