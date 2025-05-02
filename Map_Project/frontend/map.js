// Create the map
var map = L.map('map').setView([43.9, -78.9], 12); // Durham Region center

// Base tile layer (optional for context)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add WMS Layer - Durham Region (roads, etc.)
var durhamWMS = L.tileLayer.wms('https://gis.durham.ca/arcgis/services/Public/OpenData/MapServer/WMSServer', {
    layers: '7', // Example: Major Roads
    format: 'image/png',
    transparent: true,
    attribution: 'Durham Region GIS'
}).addTo(map);
