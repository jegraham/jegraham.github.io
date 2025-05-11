// Load city boundaries from GeoJSON
fetch('../backend/data/cities.geojson')
    .then(response => response.json())
    .then(cityData => {
        // Add city boundaries to the map
        const cityLayer = L.geoJSON(cityData, {
            style: {
                color: 'green',       // Boundary color
                weight: 2,            // Boundary thickness
                opacity: 0.8,         // Boundary opacity
                fillColor: 'lightgreen', // Fill color
                fillOpacity: 0.4      // Fill opacity
            },
            onEachFeature: (feature, layer) => {
                // Bind a popup to display the city name on click
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup(`<strong>${feature.properties.name}</strong>`);

                    // Bind a tooltip to display the city name on hover
                    layer.bindTooltip(feature.properties.name, {
                        permanent: false, // Tooltip only shows on hover
                        direction: 'center', // Center the tooltip
                        className: 'city-tooltip' // Optional: Add a custom class for styling
                    });
                }
            }
        });

        // Add the city layer to the map by default
        cityLayer.addTo(map);

        // Add a toggle for showing/hiding the city boundaries
        const toggleCitiesCheckbox = document.getElementById('toggleCities');
        toggleCitiesCheckbox.addEventListener('change', () => {
            if (toggleCitiesCheckbox.checked) {
                map.addLayer(cityLayer); // Show the city boundaries
            } else {
                map.removeLayer(cityLayer); // Hide the city boundaries
            }
        });
    })
    .catch(error => console.error('❌ Error loading city data:', error));