fetch('../backend/data/railways.geojson')
    .then(response => response.json())
    .then(data => {
        // Group points by railway identifier
        const railwayGroups = {};
        data.features.forEach(feature => {
            if (feature.geometry.type === 'Point') {
                const railwayId = feature.properties.name || 'Unnamed Railway'; // Use the railway name
                if (!railwayGroups[railwayId]) {
                    railwayGroups[railwayId] = [];
                }
                railwayGroups[railwayId].push([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
            }
        });

        // Function to connect points without forming loops and within a maximum distance
        function connectPoints(coords, maxDistance) {
            const connectedPath = [];
            const visited = new Set(); // Keep track of visited points
            const remainingPoints = [...coords];

            // Start with the first point
            let currentPoint = remainingPoints.shift();
            connectedPath.push(currentPoint);
            visited.add(currentPoint.toString()); // Add the point to the visited set

            while (remainingPoints.length > 0) {
                let closestIndex = -1;
                let closestDistance = Infinity;

                // Find the closest unvisited point within the max distance
                remainingPoints.forEach((point, index) => {
                    const distance = Math.sqrt(
                        Math.pow(currentPoint[0] - point[0], 2) + Math.pow(currentPoint[1] - point[1], 2)
                    );
                    if (distance < closestDistance && distance <= maxDistance && !visited.has(point.toString())) {
                        closestDistance = distance;
                        closestIndex = index;
                    }
                });

                // If no unvisited points are within the max distance, stop connecting
                if (closestIndex === -1) {
                    break;
                }

                // Add the closest point to the path
                currentPoint = remainingPoints.splice(closestIndex, 1)[0];
                connectedPath.push(currentPoint);
                visited.add(currentPoint.toString()); // Mark the point as visited
            }

            return connectedPath;
        }

        // Create a layer group for each railway
        const railwayLayers = {};

        // Draw lines for each railway group
        Object.keys(railwayGroups).forEach(railwayId => {
            const coordinates = railwayGroups[railwayId];
            const maxDistance = 0.03; // 100 meters in kilometers
            const connectedCoordinates = connectPoints(coordinates, maxDistance);

            // Check if there are enough points to draw a line
            if (connectedCoordinates.length > 1) {
                // Create a layer group for the railway
                const railwayLayer = L.layerGroup();

                // Draw a line connecting the points
                const railwayLine = L.polyline(connectedCoordinates, {
                    color: 'red',      // Line color
                    weight: 4,          // Line thickness
                    opacity: 0.8        // Line opacity
                });

                // Add the railway line to the layer group
                railwayLine.addTo(railwayLayer);

                // Add a halo (300m wide) around the railway line
                const railwayHalo = L.polyline(connectedCoordinates, {
                    color: 'red', // Halo color
                    weight: 15,        // Halo thickness (300 meters wide)
                    opacity: 0.1,       // Halo opacity
                    interactive: false  // Make the halo non-interactive
                });

                // Add the railway halo to the layer group
                railwayHalo.addTo(railwayLayer);

                // Add a popup with the railway name
                railwayLine.bindPopup(`<strong>${railwayId}</strong>`);

                // Store the layer group in the railwayLayers object
                railwayLayers[railwayId] = railwayLayer;

                // Add the railway layer to the map by default
                railwayLayer.addTo(map);
            }
        });

        // Add toggle controls for each railway
        const layerControl = L.control.layers(null, railwayLayers, { collapsed: false }).addTo(map);

        // Add a "Select All" checkbox
        const selectAllDiv = L.DomUtil.create('div', 'leaflet-control-layers');
        const selectAllCheckbox = L.DomUtil.create('input', '', selectAllDiv);
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.checked = true;
        const selectAllLabel = L.DomUtil.create('label', '', selectAllDiv);
        selectAllLabel.innerHTML = ' Select All';

        // Add event listener to toggle all layers
        selectAllCheckbox.addEventListener('change', () => {
            const isChecked = selectAllCheckbox.checked;
            Object.values(railwayLayers).forEach(layer => {
                if (isChecked) {
                    map.addLayer(layer);
                } else {
                    map.removeLayer(layer);
                }
            });
        });

        // Insert the "Select All" checkbox at the top of the layer control
        const layerControlContainer = layerControl.getContainer();
        layerControlContainer.insertBefore(selectAllDiv, layerControlContainer.firstChild);
    })
    .catch(error => console.error('❌ Error loading railway data:', error));