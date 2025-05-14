// Load neighborhood boundaries from GeoJSON
fetch('../backend/data/neighborhoods.geojson')
    .then(response => response.json())
    .then(neighborhoodData => {
        // Function to remove duplicate points and sort coordinates in clockwise order
        function processCoordinates(coords) {
            // Remove duplicate points
            const uniqueCoords = coords.filter((point, index, self) =>
                index === self.findIndex(p => p[0] === point[0] && p[1] === point[1])
            );

            // Sort points in clockwise order
            const centroid = uniqueCoords.reduce(
                (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
                [0, 0]
            ).map(val => val / uniqueCoords.length);

            uniqueCoords.sort((a, b) => {
                const angleA = Math.atan2(a[1] - centroid[1], a[0] - centroid[0]);
                const angleB = Math.atan2(b[1] - centroid[1], b[0] - centroid[0]);
                return angleA - angleB;
            });

            return uniqueCoords;
        }

        // Function to connect points to the nearest neighbor
        function connectNearestPoints(coords) {
            const connectedCoords = [];
            let current = coords.shift(); // Start with the first coordinate
            connectedCoords.push(current);

            while (coords.length > 0) {
                let closestIndex = -1;
                let closestDistance = Infinity;

                coords.forEach((point, index) => {
                    const distance = Math.sqrt(
                        Math.pow(current[0] - point[0], 2) + Math.pow(current[1] - point[1], 2)
                    );
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = index;
                    }
                });

                current = coords.splice(closestIndex, 1)[0];
                connectedCoords.push(current);
            }

            // Ensure the boundary is closed
            if (
                connectedCoords[0][0] !== connectedCoords[connectedCoords.length - 1][0] ||
                connectedCoords[0][1] !== connectedCoords[connectedCoords.length - 1][1]
            ) {
                connectedCoords.push(connectedCoords[0]);
            }

            return connectedCoords;
        }

        // Function to check for and remove self-intersections in a polygon
        function removeIntersections(coords) {
            function segmentsIntersect(p1, p2, q1, q2) {
                const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
                const subtract = (a, b) => [a[0] - b[0], a[1] - b[1]];

                const r = subtract(p2, p1);
                const s = subtract(q2, q1);
                const denominator = cross(r, s);

                if (denominator === 0) return false; // Parallel lines

                const u = cross(subtract(q1, p1), r) / denominator;
                const t = cross(subtract(q1, p1), s) / denominator;

                return t > 0 && t < 1 && u > 0 && u < 1;
            }

            for (let i = 0; i < coords.length - 1; i++) {
                for (let j = i + 2; j < coords.length - 1; j++) {
                    if (segmentsIntersect(coords[i], coords[i + 1], coords[j], coords[j + 1])) {
                        // Remove the intersection by splitting the polygon
                        const newCoords = coords.slice(0, i + 1).concat(coords.slice(j));
                        return removeIntersections(newCoords); // Recursively check for further intersections
                    }
                }
            }

            return coords;
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
            pointToLayer: () => null, // Disable point icons
            onEachFeature: (feature, layer) => {
                // Process and simplify the coordinates before rendering
                if (feature.geometry && feature.geometry.type === 'Polygon') {
                    let processedCoords = processCoordinates(feature.geometry.coordinates[0]);
                    processedCoords = connectNearestPoints(processedCoords);

                    // Remove self-intersections
                    processedCoords = removeIntersections(processedCoords);

                    feature.geometry.coordinates[0] = processedCoords;
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