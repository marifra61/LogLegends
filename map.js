let map;

// This makes the function available to the Google Maps script
window.initMap = function() {
    map = new google.maps.Map(document.getElementById("map-display"), {
        center: { lat: 35.584, lng: -78.800 }, 
        zoom: 15,
        disableDefaultUI: true,
        styles: [
            { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
            { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] }
        ]
    });
    console.log("Map successfully rendered.");
};

export function initLogLegendsMap() {
    const apiKey = "YOUR_KEY_FROM_LEAD_FINDER_PRO"; 
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}
