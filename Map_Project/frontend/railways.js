fetch('../backend/data/railways.geojson')
    .then(response => response.json())
    .then(data => {
        // Separate Point features (railway nodes)
        const pointFeatures = data.features.filter(f => f.geometry.type === 'Point');

        // Extract coordinates from the points and convert to [lat, lng]
        const coordinates = pointFeatures.map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0]]);

        // Function to find the closest point
        function connectClosestPoints(coords) {
            const connectedPath = [];
            const remainingPoints = [...coords];

            // Start with the first point
            let currentPoint = remainingPoints.shift();
            connectedPath.push(currentPoint);

            while (remainingPoints.length > 0) {
                // Find the closest point to the current point
                let closestIndex = 0;
                let closestDistance = Infinity;

                remainingPoints.forEach((point, index) => {
                    const distance = Math.sqrt(
                        Math.pow(currentPoint[0] - point[0], 2) + Math.pow(currentPoint[1] - point[1], 2)
                    );
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = index;
                    }
                });

                // Add the closest point to the path
                currentPoint = remainingPoints.splice(closestIndex, 1)[0];
                connectedPath.push(currentPoint);
            }

            return connectedPath;
        }

        // Connect the points to form a path
        const connectedCoordinates = connectClosestPoints(coordinates);

        // Draw a line connecting the points
        const railwayLine = L.polyline(connectedCoordinates, {
            color: 'red',      // Line color
            weight: 5,          // Line thickness
            opacity: 0.8        // Line opacity
        });

        // Add the railway line to the map
        railwayLine.addTo(map);

        // Add a halo (300m wide) around the railway line
        const railwayHalo = L.polyline(connectedCoordinates, {
            color: 'red',       // Halo color
            weight: 30,        // Halo thickness (300m)
            opacity: 0.2,       // Halo opacity
            interactive: false  // Make the halo non-interactive
        });

        // Add the railway halo to the map
        railwayHalo.addTo(map);

        // Add toggle controls for the layers
        const overlayMaps = {
            "Railway Line": railwayLine,
            "Railway Halo": railwayHalo
        };
        L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

        // Add event listener for the toggle checkbox
        document.getElementById('toggleRailways').addEventListener('change', function (e) {
            if (e.target.checked) {
                map.addLayer(railwayLine);
                map.addLayer(railwayHalo);
            } else {
                map.removeLayer(railwayLine);
                map.removeLayer(railwayHalo);
            }
        });
    })
    .catch(error => console.error('❌ Error loading railway data:', error));