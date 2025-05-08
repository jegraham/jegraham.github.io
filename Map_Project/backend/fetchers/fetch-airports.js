import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Overpass API query to fetch places with "airport" in the name
const overpassQuery = `
[out:json];
(
    node["name"~"airport",i](43.5,-79.5,44.5,-78); // Search for nodes with "airport" in the name
    way["name"~"airport",i](43.5,-79.5,44.5,-78); // Search for ways with "airport" in the name
    relation["name"~"airport",i](43.5,-79.5,44.5,-78); // Search for relations with "airport" in the name
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
                    name: element.tags?.name || 'Unnamed Place',
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

        // Define the output path
        const outputPath = path.resolve('./backend/data/airports.geojson');

        // Ensure the directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Save GeoJSON to a file
        fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
        console.log(`Places with "airport" in the name saved to ${outputPath}`);
    })
    .catch(error => console.error('Error fetching airport data:', error));