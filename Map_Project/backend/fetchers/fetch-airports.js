import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Overpass API query to fetch airports within the specified area
const overpassQuery = `
[out:json];
(
    node["aeroway"="aerodrome"](43.5,-79.5,44.8,-77.5); // Updated bounding box
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
                    name: element.tags?.name || 'Unnamed Airport',
                    aeroway: element.tags?.aeroway || 'aerodrome',
                },
                geometry: {
                    type: 'Point',
                    coordinates: [element.lon, element.lat]
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
        console.log(`Airports data saved to ${outputPath}`);
    })
    .catch(error => console.error('Error fetching airport data:', error));