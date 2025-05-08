// Variable to store firestation layers
let firestationsLayer;
let firestationsMarkers = L.layerGroup();
let firestationsPointsLayer; // NEW

fetch('../backend/data/firestations.geojson')
    .then(response => response.json())
    .then(data => {
        // Polygons
        const polygonFeatures = data.features.filter(f => 
            f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');

        firestationsLayer = L.geoJSON(polygonFeatures, {
            style: function (feature) {
                return {
                    color: 'red',
                    weight: 2,
                    fillColor: 'red',
                    fillOpacity: 0.3,
                    opacity: 0.5
                };
            },
            onEachFeature: function (feature, layer) {
                const name = feature.properties.name || "Fire Station";
                layer.bindPopup(`<strong>${name}</strong>`);

                const centroid = turf.centroid(feature).geometry.coordinates;
                const latLng = [centroid[1], centroid[0]];

                addCirclesAndMarker(latLng, name);
            }
        });

        // Points (nodes)
        const pointFeatures = data.features.filter(f => f.geometry.type === 'Point');

        firestationsPointsLayer = L.geoJSON(pointFeatures, {
            pointToLayer: function (feature, latlng) {
                const name = feature.properties.name || "Fire Station";
                addCirclesAndMarker([latlng.lat, latlng.lng], name);
                return null; // Don't add default marker here
            }
        });

        function addCirclesAndMarker(latLng, name) {
            const inner = L.circle(latLng, {
                radius: 300,
                color: 'orange',
                fillColor: 'orange',
                fillOpacity: 0.7,
                weight: 0
            });

            const middle = L.circle(latLng, {
                radius: 500,
                color: 'orange',
                fillColor: 'orange',
                fillOpacity: 0.5,
                weight: 0
            });

            const outer = L.circle(latLng, {
                radius: 800,
                color: 'orange',
                fillColor: 'orange',
                fillOpacity: 0.3,
                weight: 0
            });

            const marker = L.marker(latLng, {
                icon: L.icon({
                    iconUrl: 'https://img.icons8.com/emoji/48/000000/fire--v1.png',
                    iconSize: [25, 25],
                    iconAnchor: [12, 12],
                    popupAnchor: [0, 0]
                })
            }).bindPopup(`<strong>${name}</strong>`);

            firestationsMarkers.addLayer(inner);
            firestationsMarkers.addLayer(middle);
            firestationsMarkers.addLayer(outer);
            firestationsMarkers.addLayer(marker);
        }

        // Add layers to map
        map.addLayer(firestationsLayer);
        map.addLayer(firestationsMarkers);
        map.addLayer(firestationsPointsLayer); // Optional, for debug

        document.getElementById('toggleFireStations').addEventListener('change', function (e) {
            if (e.target.checked) {
                map.addLayer(firestationsLayer);
                map.addLayer(firestationsMarkers);
            } else {
                map.removeLayer(firestationsLayer);
                map.removeLayer(firestationsMarkers);
            }
        });
    })
    .catch(error => console.error("Error loading fire stations:", error));
