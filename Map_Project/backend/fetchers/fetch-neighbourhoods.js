import fetch from 'node-fetch';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import osmtogeojson from 'osmtogeojson';

const outputDir = '../data';
const outputFile = join(outputDir, 'neighborhoods.geojson');

// Ensure the output directory exists
if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}

// Overpass API query to fetch administrative boundaries (level 7 and 8)
const overpassQuery = `
[out:json][timeout:25];
(
    relation["boundary"="administrative"]["admin_level"~"6|7|8"](43.5,-79.5,44.8,-77.5);
);
out body;
>;
// Include all referenced nodes and ways
out skel qt;
`;

fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: overpassQuery,
    headers: { 'Content-Type': 'text/plain' }
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Convert OSM data to GeoJSON
        const geojson = osmtogeojson(data);

        // Save the GeoJSON to a file
        writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
        console.log(`✅ Neighborhood data saved to ${outputFile}`);
    })
    .catch(error => console.error('❌ Error fetching neighborhood data:', error));