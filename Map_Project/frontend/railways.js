fetch('../backend/data/railways.geojson')
    .then(response => response.json())
    .then(data => {
        // Separate LineString features (railway lines)
        const lineFeatures = data.features.filter(f => f.geometry.type === 'LineString');

        // Create a layer for railway lines
        const railwayLinesLayer = L.geoJSON(lineFeatures, {
            style: {
                color: 'blue', // Line color
                weight: 2,     // Line thickness
                opacity: 0.8   // Line opacity
            },
            onEachFeature: function (feature, layer) {
                // Optionally bind a popup to each railway line
                const railwayType = feature.properties.railway || 'Railway';
                layer.bindPopup(`<strong>${railwayType}</strong>`);

                // Draw a red halo (buffer) around the railway line
                const coordinates = feature.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert to [lat, lng]
                const halo = L.polyline(coordinates, {
                    color: 'red',       // Halo color
                    weight: 3000,        // Halo thickness (300m)
                    opacity: 0.2,       // Halo opacity
                    interactive: false  // Make the halo non-interactive
                });
                halo.addTo(map);
            }
        });

        // Add the railway lines layer to the map
        map.addLayer(railwayLinesLayer);

        // Separate Point features (railway nodes)
        const pointFeatures = data.features.filter(f => f.geometry.type === 'Point');

        // Create a layer for railway points (dots)
        const railwayPointsLayer = L.geoJSON(pointFeatures, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 5,          // Dot size
                    color: 'red',       // Dot border color
                    fillColor: 'red',   // Dot fill color
                    fillOpacity: 1      // Dot opacity
                }).bindPopup(`<strong>Railway Node</strong>`);
            }
        });

        // Add the railway points layer to the map
        map.addLayer(railwayPointsLayer);

        // Add toggle controls for the layers
        const overlayMaps = {
            "Railway Lines": railwayLinesLayer,
            "Railway Points": railwayPointsLayer
        };
        L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

        // Add event listener for the toggle checkbox
        document.getElementById('toggleRailways').addEventListener('change', function (e) {
            if (e.target.checked) {
                map.addLayer(railwayLinesLayer);
                map.addLayer(railwayPointsLayer);
            } else {
                map.removeLayer(railwayLinesLayer);
                map.removeLayer(railwayPointsLayer);
            }
        });
    })
    .catch(error => console.error('❌ Error loading railway data:', error));