// Load neighborhood boundaries from GeoJSON
fetch('../backend/data/neighborhoods.geojson')
    .then(response => response.json())
    .then(neighborhoodData => {
        // Add neighborhood boundaries to the map
        const neighborhoodLayer = L.geoJSON(neighborhoodData, {
            style: {
                color: 'blue',       // Boundary color
                weight: 2,           // Boundary thickness
                opacity: 0.6,        // Boundary opacity
                fillColor: 'lightblue', // Fill color
                fillOpacity: 0.8     // Fill opacity
            },
            onEachFeature: (feature, layer) => {
                // Bind a popup to display the neighborhood name on click
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup(`<strong>${feature.properties.name}</strong>`);

                    // Bind a tooltip to display the neighborhood name on hover
                    layer.bindTooltip(feature.properties.name, {
                        permanent: false, // Tooltip only shows on hover
                        direction: 'center', // Center the tooltip
                        className: 'neighborhood-tooltip' // Optional: Add a custom class for styling
                    });
                }
            }
        });

        // Add the neighborhood layer to the map
        neighborhoodLayer.addTo(map);
    })
    .catch(error => console.error('❌ Error loading neighborhood data:', error));