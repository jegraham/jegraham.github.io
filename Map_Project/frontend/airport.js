// Variable to store the airport layers
let airportLayer;
let airportMarkers = L.layerGroup(); // Layer group for airport markers

// Fetch airport data from the backend
fetch('../backend/data/airports.geojson')
    .then(response => response.json())
    .then(data => {
        const pointFeatures = data.features.filter(f => f.geometry.type === 'Point');

        airportLayer = L.geoJSON(pointFeatures, {
            onEachFeature: function (feature, layer) {
                const name = feature.properties.name || "Airport";

                // Add concentric circles with varying opacity
                const latLng = layer.getLatLng();

                // Innermost circle (very dark)
                const innerCircle = L.circle(latLng, {
                    radius: 1000, // Radius in meters
                    color: 'red', // Circle border color
                    fillColor: 'red', // Circle fill color
                    fillOpacity: 0.7, // Darkest opacity
                    weight: 0 // No border
                });
                airportMarkers.addLayer(innerCircle);

                // Middle circle (medium dark)
                const middleCircle = L.circle(latLng, {
                    radius: 2000, // Radius in meters
                    color: 'red', // Circle border color
                    fillColor: 'red', // Circle fill color
                    fillOpacity: 0.5, // Medium opacity
                    weight: 0 // No border
                });
                airportMarkers.addLayer(middleCircle);

                // Outermost circle (light)
                const outerCircle = L.circle(latLng, {
                    radius: 3000, // Radius in meters
                    color: 'red', // Circle border color
                    fillColor: 'red', // Circle fill color
                    fillOpacity: 0.3, // Lightest opacity
                    weight: 0 // No border
                });
                airportMarkers.addLayer(outerCircle);

                // Add an airplane marker
                const marker = L.marker(latLng, {
                    icon: L.icon({
                        iconUrl: 'https://img.icons8.com/emoji/48/000000/small-airplane.png', // Airplane icon URL
                        iconSize: [35, 35], // Icon size
                        iconAnchor: [15, 15], // Anchor point of the icon
                        popupAnchor: [0, -25] // Popup anchor point
                    })
                }).bindPopup(`<strong>${name}</strong>`); // Popup with airport name
                airportMarkers.addLayer(marker);
            }
        });

        // Add the airport markers to the map by default
        map.addLayer(airportMarkers);

        // Add event listener for the toggle checkbox
        document.getElementById('toggleAirports').addEventListener('change', function (e) {
            if (e.target.checked) {
                // Add the airport markers to the map
                map.addLayer(airportMarkers);
            } else {
                // Remove the airport markers from the map
                map.removeLayer(airportMarkers);
            }
        });
    })
    .catch(error => console.error("Error loading airports:", error));