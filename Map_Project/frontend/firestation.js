// Variable to store the firestations layers
let firestationsLayer;
let firestationsMarkers = L.layerGroup(); // Layer group for firestations markers

// Fetch fire station data from the backend
fetch('../backend/data/firestations.geojson')
    .then(response => response.json())
    .then(data => {
        // Filter features by geometry type
        const polygonFeatures = data.features.filter(f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');

        firestationsLayer = L.geoJSON(polygonFeatures, {
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

                // Calculate the centroid of the fire station polygon
                if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                    const centroid = turf.centroid(feature).geometry.coordinates;
                    const latLng = [centroid[1], centroid[0]];

                    // Add concentric circles with varying opacity
                    const innerCircle = L.circle(latLng, {
                        radius: 300, // Radius in meters
                        color: 'orange', // Circle border color
                        fillColor: 'orange', // Circle fill color
                        fillOpacity: 0.7, // Darkest opacity
                        weight: 0 // No border
                    });
                    firestationsMarkers.addLayer(innerCircle);

                    const middleCircle = L.circle(latLng, {
                        radius: 500, // Radius in meters
                        color: 'orange', // Circle border color
                        fillColor: 'orange', // Circle fill color
                        fillOpacity: 0.5, // Medium opacity
                        weight: 0 // No border
                    });
                    firestationsMarkers.addLayer(middleCircle);

                    const outerCircle = L.circle(latLng, {
                        radius: 800, // Radius in meters
                        color: 'orange', // Circle border color
                        fillColor: 'orange', // Circle fill color
                        fillOpacity: 0.3, // Lightest opacity
                        weight: 0 // No border
                    });
                    firestationsMarkers.addLayer(outerCircle);

                    // Add a fire icon marker at the centroid
                    const marker = L.marker(latLng, {
                        icon: L.icon({
                            iconUrl: 'https://img.icons8.com/emoji/48/000000/fire--v1.png', // Flame icon URL
                            iconSize: [25, 25], // Icon size
                            iconAnchor: [12, 12], // Anchor point of the icon
                            popupAnchor: [0, 0] // Popup anchor point
                        })
                    }).bindPopup(`<strong>${name}</strong>`);
                    firestationsMarkers.addLayer(marker);
                }
            }
        });

        // Add the fire station layer and markers to the map by default
        map.addLayer(firestationsLayer);
        map.addLayer(firestationsMarkers);

        // Add event listener for the toggle checkbox
        document.getElementById('toggleFireStations').addEventListener('change', function (e) {
            if (e.target.checked) {
                // Add the fire station layer and markers to the map
                map.addLayer(firestationsLayer);
                map.addLayer(firestationsMarkers);
            } else {
                // Remove the fire station layer and markers from the map
                map.removeLayer(firestationsLayer);
                map.removeLayer(firestationsMarkers);
            }
        });
    })
    .catch(error => console.error("Error loading fire stations:", error));