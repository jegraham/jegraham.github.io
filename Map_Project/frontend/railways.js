fetch('../backend/data/railways.geojson')
    .then(response => response.json())
    .then(data => {
        // Create a GeoJSON layer for the railways
        const railwayLayer = L.geoJSON(data, {
            style: {
                color: 'blue', // Set the color of the railway lines
                weight: 20,     // Set the thickness of the lines
                opacity: 0.8   // Set the opacity of the lines
            }//,
            // onEachFeature: function (feature, layer) {
            //     // Optionally bind a popup to each railway line
            //     const railwayType = feature.properties.railway || 'Railway';
            //     layer.bindPopup(`<strong>${railwayType}</strong>`);
            // }
        });

        // Add the railway layer to the map
        map.addLayer(railwayLayer);

        // Optionally add a toggle control for the railway layer
        const overlayMaps = {
            "Railways": railwayLayer
        };
        L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

        document.getElementById('toggleRailways').addEventListener('change', function (e) {
            if (e.target.checked) {
                map.addLayer(railwayLayer);
            } else {
                map.removeLayer(railwayLayer);
            }
        });
    })
    .catch(error => console.error('❌ Error loading railway data:', error));