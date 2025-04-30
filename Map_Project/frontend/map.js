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

// Variable to store the fire station layers
let fireStationLayer;
let fireStationMarkers = L.layerGroup(); // Layer group for flame icons

// Fetch fire stations data from the backend
fetch('../backend/data/firestations.geojson')
    .then(response => response.json())
    .then(data => {
        // Handle polygon features
        const polygonFeatures = data.features.filter(f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');

        fireStationLayer = L.geoJSON(polygonFeatures, {
            style: function (feature) {
                return {
                    color: 'red',
                    weight: 2,
                    fillColor: 'orange',
                    fillOpacity: 0.5
                };
            },
            onEachFeature: function (feature, layer) {
                const name = feature.properties.name || "Fire Station";
                layer.bindPopup(`<strong>${name}</strong>`);

                // Calculate centroid and add a marker to the marker layer group
                const centroid = turf.centroid(feature).geometry.coordinates;
                const marker = L.marker([centroid[1], centroid[0]], {
                    icon: L.icon({
                        iconUrl: 'https://img.icons8.com/emoji/48/000000/fire.png',
                        iconSize: [25, 25],
                        iconAnchor: [12, 25],
                        popupAnchor: [0, -25]
                    })
                }).bindPopup(`<strong>${name}</strong>`);
                fireStationMarkers.addLayer(marker);
            }
        });

        // Add the fire station layer and markers to the map by default
        map.addLayer(fireStationLayer);
        map.addLayer(fireStationMarkers);

        // Add event listener for the toggle checkbox
        document.getElementById('toggleFireStations').addEventListener('change', function (e) {
            if (e.target.checked) {
                // Add the fire station layer and markers to the map
                map.addLayer(fireStationLayer);
                map.addLayer(fireStationMarkers);
            } else {
                // Remove the fire station layer and markers from the map
                map.removeLayer(fireStationLayer);
                map.removeLayer(fireStationMarkers);
            }
        });
    })
    .catch(error => console.error("Error loading fire stations:", error));
