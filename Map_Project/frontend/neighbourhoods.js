// Load neighborhood boundaries from GeoJSON
fetch('../backend/data/neighborhoods.geojson')
    .then(response => response.json())
    .then(neighborhoodData => {
        let neighborhoodLayer;

        // Function to filter and display neighborhoods by admin_level
        function filterByAdminLevel(adminLevel) {
            if (neighborhoodLayer) {
                map.removeLayer(neighborhoodLayer); // Remove the existing layer
            }

            // Filter features based on the selected admin_level
            const filteredData = {
                ...neighborhoodData,
                features: neighborhoodData.features.filter(
                    feature => feature.properties.admin_level === adminLevel
                )
            };

            // Add the filtered neighborhood boundaries to the map
            neighborhoodLayer = L.geoJSON(filteredData, {
                style: {
                    color: 'blue',       // Boundary color
                    weight: 2,           // Boundary thickness
                    opacity: 0.6,        // Boundary opacity
                    fillColor: 'lightblue', // Fill color
                    fillOpacity: 0.8     // Fill opacity
                },
                onEachFeature: (feature, layer) => {
                    if (feature.properties && feature.properties.name) {
                        // Bind a popup to display the neighborhood name on click
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

            neighborhoodLayer.addTo(map); // Add the new layer to the map
        }

        // Create a container for the controls at the top of the page
        const controlContainer = L.DomUtil.create('div', 'control-container', map.getContainer());
        controlContainer.style.position = 'absolute';
        controlContainer.style.top = '10px';
        controlContainer.style.left = '10px';
        controlContainer.style.zIndex = '1000';
        controlContainer.style.backgroundColor = 'white';
        controlContainer.style.padding = '10px';
        controlContainer.style.borderRadius = '5px';
        controlContainer.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';

        // Create a dropdown for admin_level selection
        const adminLevelDropdown = L.DomUtil.create('select', '', controlContainer);
        adminLevelDropdown.style.marginBottom = '10px';
        adminLevelDropdown.innerHTML = `
            <option value="6">Admin Level 6 - Upper-Tier Municipalities</option>
            <option value="7" selected>Admin Level 7 </option>
            <option value="8">Admin Level 8 - Lower-Tier Municipalities</option>
            <option value="9">Admin Level 9</option>
            <option value="10">Admin Level 10<- Neighbourhoods / Subdivisions in Municipalities/option>
        `;

        // Add event listener to filter neighborhoods based on selected admin_level
        adminLevelDropdown.addEventListener('change', (e) => {
            const selectedAdminLevel = e.target.value;
            filterByAdminLevel(selectedAdminLevel);
        });

        // Create a toggle button to show/hide the neighborhoods layer
        // const toggleButton = L.DomUtil.create('button', '', controlContainer);
        // //toggleButton.innerHTML = 'Toggle Neighborhoods';
        // toggleButton.style.display = 'block';
        // toggleButton.style.marginTop = '10px';
        // toggleButton.addEventListener('click', () => {
        //     if (map.hasLayer(neighborhoodLayer)) {
        //         map.removeLayer(neighborhoodLayer);
        //     } else {
        //         const selectedAdminLevel = adminLevelDropdown.value;
        //         filterByAdminLevel(selectedAdminLevel);
        //     }
        // });

        // Initialize the map with a default admin level
        filterByAdminLevel('6');
    })
    .catch(error => console.error('❌ Error loading neighborhood data:', error));