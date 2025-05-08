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

// Overpass API query to fetch police stations within the specified area
const overpassQuery = `
[out:json];
(
    node["amenity"="police"](43.5,-79.5,44.8,-77.5); // Updated bounding box
    way["amenity"="police"](43.5,-79.5,44.8,-77.5); // Updated bounding box
    relation["amenity"="police"](43.5,-79.5,44.8,-77.5); // Updated bounding box
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
                    name: element.tags?.name || 'Unnamed Police Station',
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
        console.log(`Police stations data saved to ${outputFile}`);
    })
    .catch(error => console.error('Error fetching police station data:', error));