// Create the map
var map = L.map('map').setView([44.0, -78.5], 9); // Centered to include all regions

// Base tile layer (optional for context)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add WMS Layer - Regional Data (if available)
var regionalWMS = L.tileLayer.wms('http://gis.durham.ca/arcgis/services/Public/OpenData/MapServer/WMSServer', {
    layers: '7', // Ensure this layer includes all regions
    format: 'image/png',
    transparent: true,
    attribution: 'Durham Region GIS'
}).addTo(map);

// Adjust the map bounds to include all regions
var bounds = [
    [43.5, -79.5], // Southwest corner (Durham Region)
    [44.8, -77.5]  // Northeast corner (Peterborough and Northumberland)
];
map.fitBounds(bounds);