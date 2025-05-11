// Load neighborhood boundaries from GeoJSON
fetch('../backend/data/neighborhoods.geojson')
    .then(response => response.json())
    .then(neighborhoodData => {
        // Function to sort and connect coordinates to avoid crossovers
        function sortAndConnectCoordinates(coordinates) {
            const sortedCoordinates = [];
            let current = coordinates.shift(); // Start with the first coordinate
            sortedCoordinates.push(...current);

            while (coordinates.length > 0) {
                const nextIndex = coordinates.findIndex(
                    coord => coord[0][0] === current[current.length - 1][0] &&
                             coord[0][1] === current[current.length - 1][1]
                );

                if (nextIndex !== -1) {
                    current = coordinates.splice(nextIndex, 1)[0];
                    sortedCoordinates.push(...current.slice(1)); // Avoid duplicating the connecting point
                } else {
                    break; // Stop if no more coordinates can be connected
                }
            }

            // Ensure the boundary is closed
            if (sortedCoordinates[0][0] !== sortedCoordinates[sortedCoordinates.length - 1][0] ||
                sortedCoordinates[0][1] !== sortedCoordinates[sortedCoordinates.length - 1][1]) {
                sortedCoordinates.push(sortedCoordinates[0]); // Close the polygon
            }

            return [sortedCoordinates];
        }

        // Add neighborhood boundaries to the map as a layer
        const neighborhoodLayer = L.geoJSON(neighborhoodData, {
            style: {
                color: 'blue',       // Boundary color
                weight: 2,           // Boundary thickness
                opacity: 0.6,        // Boundary opacity
                fillColor: 'lightblue', // Fill color
                fillOpacity: 0.8     // Fill opacity
            },
            onEachFeature: (feature, layer) => {
                // Sort and connect coordinates before rendering
                if (feature.geometry && feature.geometry.type === 'Polygon') {
                    feature.geometry.coordinates = sortAndConnectCoordinates(feature.geometry.coordinates[0]);
                }

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

        // Add the neighborhood layer to the map by default
        neighborhoodLayer.addTo(map);

        // Add event listener for the toggle checkbox
        document.getElementById('toggleNeighborhoods').addEventListener('change', function (e) {
            if (e.target.checked) {
                // Add the neighborhood layer to the map
                map.addLayer(neighborhoodLayer);
            } else {
                // Remove the neighborhood layer from the map
                map.removeLayer(neighborhoodLayer);
            }
        });
    })
    .catch(error => console.error('❌ Error loading neighborhood data:', error));