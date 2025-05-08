import fetch from 'node-fetch';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Define the new output directory and file path
const outputDir = '../../backend/data'; // Change from './data' to '../data' to point to backend/data
const outputFile = join(outputDir, 'policestations.geojson');

// Ensure the output directory exists
if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}

// Overpass API query to fetch places with "police" in the name
const overpassQuery = `
[out:json];
(
    node["amenity"="police"](43.5,-79.5,44.5,-78);
    way["amenity"="police"](43.5,-79.5,44.5,-78);
    relation["amenity"="police"](43.5,-79.5,44.5,-78);
);
out body;
`;

// Fetch data from Overpass API
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
        // Convert Overpass JSON to GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: data.elements.map(element => ({
                type: 'Feature',
                id: `node/${element.id}`,
                properties: {
                    name: element.tags?.name || 'Unnamed Police Feature',
                    tags: element.tags || {}, // Include all tags for debugging
                },
                geometry: {
                    type: element.type === 'node' ? 'Point' : 'Polygon',
                    coordinates: element.type === 'node'
                        ? [element.lon, element.lat]
                        : element.geometry?.map(coord => [coord.lon, coord.lat]) || []
                }
            }))
        };

        // Save GeoJSON to a file
        writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
        console.log(`All places with "police" in the name saved to ${outputFile}`);
    })
    .catch(error => console.error('Error fetching police data:', error));