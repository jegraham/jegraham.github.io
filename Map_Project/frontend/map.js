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
  
fetch('/data/firestations.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: 'red',
          color: '#900',
          weight: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties.name) {
          layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
        } else {
          layer.bindPopup(`Fire Station`);
        }
      }
    }).addTo(map);
  });
