// Variable to store the police station layers
let policeStationLayer;
let policeStationMarkers = L.layerGroup(); // Layer group for police station circles and icons

// Fetch police station data from the backend
fetch('../backend/data/policestations.geojson')
    .then(response => response.json())
    .then(data => {
        // Handle polygon features
        const polygonFeatures = data.features.filter(f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');

        policeStationLayer = L.geoJSON(polygonFeatures, {
            style: function (feature) {
                return {
                    color: 'blue',
                    weight: 2,
                    fillColor: 'blue',
                    fillOpacity: 0.3, // Adjusted fill opacity for better visibility
                    opacity: 0.5    // Adjusted border opacity
                };
            },
            onEachFeature: function (feature, layer) {
                const name = feature.properties.name || "Police Station";
                layer.bindPopup(`<strong>${name}</strong>`);

                // Calculate the centroid of the police station polygon
                const centroid = turf.centroid(feature).geometry.coordinates;

                // Add a 100-meter radius circle around the police station
                const circle = L.circle([centroid[1], centroid[0]], {
                    radius: 10000, // Radius in meters
                    color: 'blue', // Circle border color
                    fillColor: 'blue', // Circle fill color
                    fillOpacity: 0.3, // Circle fill transparency
                    weight: 1 // Circle border weight
                });
                policeStationMarkers.addLayer(circle);

                // Add a police icon marker at the centroid
                const marker = L.marker([centroid[1], centroid[0]], {
                    icon: L.icon({
                        iconUrl: 'https://img.icons8.com/emoji/48/000000/police-car-light.png', // Police icon URL
                        iconSize: [35, 35], // Icon size
                        iconAnchor: [17, 17], // Anchor point of the icon
                        popupAnchor: [0, -25] // Popup anchor point
                    })
                }).bindPopup(`<strong>${name}</strong>`);
                policeStationMarkers.addLayer(marker);
            }
        });

        // Add the police station layer and markers to the map by default
        map.addLayer(policeStationLayer);
        map.addLayer(policeStationMarkers);

        // Add event listener for the toggle checkbox
        document.getElementById('togglePoliceStations').addEventListener('change', function (e) {
            if (e.target.checked) {
                // Add the police station layer and markers to the map
                map.addLayer(policeStationLayer);
                map.addLayer(policeStationMarkers);
            } else {
                // Remove the police station layer and markers from the map
                map.removeLayer(policeStationLayer);
                map.removeLayer(policeStationMarkers);
            }
        });
    })
    .catch(error => console.error("Error loading police stations:", error));