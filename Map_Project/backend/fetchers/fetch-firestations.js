import fs from 'fs';
import fetch from 'node-fetch';
import osmtogeojson from 'osmtogeojson';

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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const osmData = await response.json();
    console.log('OSM Data:', osmData);

    const geojson = osmtogeojson(osmData);
    console.log('GeoJSON:', geojson);

    if (!geojson.features || geojson.features.length === 0) {
      console.error('❌ No fire stations found in the GeoJSON data.');
      return;
    }

    const outputPath = './backend/data/firestations.geojson';

    // Clear the file before writing (optional)
    fs.writeFileSync(outputPath, '');

    // Write the GeoJSON data to the file
    fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
    console.log('✅ Fire stations saved to backend/data/firestations.geojson');
  } catch (error) {
    console.error('❌ Error fetching fire stations:', error);
  }
}

fetchFireStations();
