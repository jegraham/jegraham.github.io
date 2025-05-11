// Variable to store the police station layers
let policeStationLayer;
let policeStationMarkers = L.layerGroup(); // Layer group for police station circles and icons

// Fetch police station data from the backend
fetch('../backend/data/policestations.geojson')
    .then(response => response.json())
    .then(data => {
        // Handle point features
        const pointFeatures = data.features.filter(f => f.geometry.type === 'Point');

        policeStationLayer = L.geoJSON(pointFeatures, {
            onEachFeature: function (feature, layer) {
                const name = feature.properties.name || "Police Station";

                // Get the coordinates of the police station point
                const coordinates = feature.geometry.coordinates;
                const latLng = [coordinates[1], coordinates[0]];

                // Add concentric circles with varying opacity
                // Innermost circle (very dark)
                const innerCircle = L.circle(latLng, {
                    radius: 300, // Radius in meters
                    color: 'blue', // Circle border color
                    fillColor: 'blue', // Circle fill color
                    fillOpacity: 0.7, // Darkest opacity
                    weight: 0 // No border
                });
                policeStationMarkers.addLayer(innerCircle);

                // Middle circle (medium dark)
                const middleCircle = L.circle(latLng, {
                    radius: 400, // Radius in meters
                    color: 'blue', // Circle border color
                    fillColor: 'blue', // Circle fill color
                    fillOpacity: 0.5, // Medium opacity
                    weight: 0 // No border
                });
                policeStationMarkers.addLayer(middleCircle);

                // Outermost circle (light)
                const outerCircle = L.circle(latLng, {
                    radius: 500, // Radius in meters
                    color: 'blue', // Circle border color
                    fillColor: 'blue', // Circle fill color
                    fillOpacity: 0.3, // Lightest opacity
                    weight: 0 // No border
                });
                policeStationMarkers.addLayer(outerCircle);

                // Add a police car icon marker at the police station location
                const marker = L.marker(latLng, {
                    icon: L.icon({
                        iconUrl: 'https://img.icons8.com/emoji/48/000000/oncoming-police-car.png', // Police car icon URL
                        iconSize: [20, 20], // Icon size
                        iconAnchor: [10, 10], // Anchor point of the icon
                        popupAnchor: [0, -25] // Popup anchor point
                    })
                }).bindPopup(`<strong>${name}</strong>`); // Popup with police station name
                policeStationMarkers.addLayer(marker);
            }
        });

        // Add the police station markers to the map by default
        map.addLayer(policeStationMarkers);

        // Add event listener for the toggle checkbox
        document.getElementById('togglePoliceStations').addEventListener('change', function (e) {
            if (e.target.checked) {
                // Add the police station markers to the map
                map.addLayer(policeStationMarkers);
            } else {
                // Remove the police station markers from the map
                map.removeLayer(policeStationMarkers);
            }
        });
    })
    .catch(error => console.error("Error loading police stations:", error));