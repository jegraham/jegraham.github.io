// Create the map
var map = L.map('map').setView([43.9, -78.9], 12); // Durham Region center

// Base tile layer (optional for context)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add WMS Layer - Durham Region (roads, etc.)
var durhamWMS = L.tileLayer.wms('https://gis.durham.ca/arcgis/services/Public/OpenData/MapServer/WMSServer', {
    layers: '7', // Example: Major Roads
    format: 'image/png',
    transparent: true,
    attribution: 'Durham Region GIS'
}).addTo(map);
  

var fireIcon = L.icon({
  iconUrl: 'https://img.icons8.com/emoji/48/000000/fire.png',  // Make sure you place this image in public folder
  iconSize: [25, 25],               // Size of the icon
  iconAnchor: [12, 25],             // Point of the icon that corresponds to marker's location
  popupAnchor: [0, -25]             // Position of popup relative to icon

});

// Fetch fire stations data from the backend
fetch('../backend/data/firestations.geojson')
  .then(response => response.json())
  .then(data => {
    // Handle polygon features
    const polygonFeatures = data.features.filter(f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');
    L.geoJSON(polygonFeatures, {
      style: function (feature) {
        return {
          color: 'red',
          weight: 2,
          fillColor: 'orange',
          fillOpacity: 0.5
        };
      },
      onEachFeature: function (feature, layer) {
        const name = feature.properties.name || "Fire Station";
        layer.bindPopup(`<strong>${name}</strong>`);

        // Calculate centroid and add a marker
        const centroid = turf.centroid(feature).geometry.coordinates;
        L.marker([centroid[1], centroid[0]], {
          icon: L.icon({
            iconUrl: 'https://img.icons8.com/emoji/48/000000/fire.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          })
        }).addTo(map).bindPopup(`<strong>${name}</strong>`);
      }
    }).addTo(map);
  })
  .catch(error => console.error("Error loading fire stations:", error));
