// Variable to store the fire station layers
let fireStationLayer;
let fireStationMarkers = L.layerGroup(); // Layer group for fire station circles

// Fetch fire station data from the backend
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
                    fillColor: 'red',
                    fillOpacity: 0.3, // Adjusted fill opacity for better visibility
                    opacity: 0.5    // Adjusted border opacity
                };
            },
            onEachFeature: function (feature, layer) {
                const name = feature.properties.name || "Fire Station";
                layer.bindPopup(`<strong>${name}</strong>`);

                // Add a 100-meter radius circle around the fire station
                const centroid = turf.centroid(feature).geometry.coordinates;
                const circle = L.circle([centroid[1], centroid[0]], {
                    radius: 1000, // Radius in meters
                    color: 'orange', // Circle border color
                    fillColor: 'orange', // Circle fill color
                    fillOpacity: 0.3, // Circle fill transparency
                    weight: 1 // Circle border weight
                });
                fireStationMarkers.addLayer(circle);

                // Add a fire icon marker at the centroid
                const marker = L.marker([centroid[1], centroid[0]], {
                    icon: L.icon({
                        iconUrl: 'https://img.icons8.com/emoji/48/000000/fire.png', // Fire icon URL
                        iconSize: [25, 25], // Icon size
                        iconAnchor: [12, 12], // Anchor point of the icon
                        popupAnchor: [0, -25] // Popup anchor point
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