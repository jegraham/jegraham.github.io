const fs = require('fs');
const fetch = require('node-fetch');

const overpassUrl = 'https://overpass-api.de/api/interpreter';

const query = `
[out:json][timeout:25];
area["name"="Durham Region"]->.searchArea;
(
  node["amenity"="fire_station"](area.searchArea);
  way["amenity"="fire_station"](area.searchArea);
  relation["amenity"="fire_station"](area.searchArea);
);
out body;
>;
out skel qt;
`;

async function fetchFireStations() {
  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Overpass API returned ${response.status}`);
    }

    const osmData = await response.json();

    // Convert to GeoJSON
    const osmtogeojson = require('osmtogeojson');
    const geojson = osmtogeojson(osmData);

    // Save to file
    fs.writeFileSync('./backend/data/firestations.geojson', JSON.stringify(geojson, null, 2));
    console.log('✅ Fire stations saved to backend/data/firestations.geojson');
  } catch (error) {
    console.error('❌ Error fetching fire stations:', error);
  }
}

fetchFireStations();
