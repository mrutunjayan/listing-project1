if (typeof listingData !== "undefined" && document.getElementById("map")) {

    const coordinates = listingData.coordinates;

    const map = L.map("map").setView([coordinates[1], coordinates[0]], 9);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const redIcon = new L.Icon({
        iconUrl: 'https://img.icons8.com/ios-filled/100/FA5252/marker.png', 
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [30, 42],       
        iconAnchor: [15, 42],   
        popupAnchor: [0, -40],   
        shadowSize: [41, 41]      
    });

    L.marker([coordinates[1], coordinates[0]], { icon: redIcon })
        .addTo(map)
        .bindPopup(`<h3>${listingData.title}</h3>  
           <p>Exact Location will be provided after booking</p> `)
        .openPopup();
}