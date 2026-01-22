let map;

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

function loadGoogleMaps() {
    // Ensure your key is inside the " " quotes below
    const apiKey = "AIzaSyB1DACu4yoRMzIdvo0USYc-Gg4vtRvEDZk"; 
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("LogLegends Dashboard Ready");
    loadGoogleMaps();
});
