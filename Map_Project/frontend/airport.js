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
                // const name = feature.properties.name || "Airport";
                layer.bindPopup(`<strong>${name}</strong>`);

                // Add a 100-meter radius circle around the airport
                const circle = L.circle(layer.getLatLng(), {
                    radius: 5000, // Radius in meters
                    color: 'red', // Circle border color
                    fillColor: 'red', // Circle fill color
                    fillOpacity: 0.3, // Circle fill transparency
                    weight: 1 // Circle border weight
                });
                airportMarkers.addLayer(circle);

                // Add an airplane marker
                const marker = L.marker(layer.getLatLng(), {
                    icon: L.icon({
                        iconUrl: 'https://img.icons8.com/emoji/48/000000/small-airplane.png',
                        iconSize: [35, 35],
                        iconAnchor: [15, 15],
                        popupAnchor: [0, -25]
                    })
                }).bindPopup(`<strong>${name}</strong>`);
                airportMarkers.addLayer(marker);
            }
        });

        // Add the airport layer and markers to the map by default
        // map.addLayer(airportLayer);
        map.addLayer(airportMarkers);

        // Add event listener for the toggle checkbox
        document.getElementById('toggleAirports').addEventListener('change', function (e) {
            if (e.target.checked) {
                // Add the airport layer and markers to the map
                map.addLayer(airportLayer);
                map.addLayer(airportMarkers);
            } else {
                // Remove the airport layer and markers from the map
                map.removeLayer(airportLayer);
                map.removeLayer(airportMarkers);
            }
        });
    })
    .catch(error => console.error("Error loading airports:", error));