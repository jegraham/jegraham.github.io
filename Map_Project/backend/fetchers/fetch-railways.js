import fetch from 'node-fetch';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const outputDir = '../data';
const outputFile = join(outputDir, 'railways.geojson');

// Ensure the output directory exists
if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}

// Overpass API query to fetch railway lines and their nodes
const overpassQuery = `
[out:json][timeout:25];
(
    way["railway"="rail"](43.5,-79.5,44.8,-77.5); // Adjust the bounding box as needed
    node(w); // Fetch all nodes associated with the ways
);
out body;
>;
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
        // Create a map to associate nodes with their parent railway name
        const wayNames = {};
        data.elements.forEach(element => {
            if (element.type === 'way' && element.tags?.name) {
                element.nodes.forEach(nodeId => {
                    wayNames[nodeId] = element.tags.name; // Map node ID to railway name
                });
            }
        });

        // Convert Overpass JSON to GeoJSON
        const rawFeatures = data.elements.map(element => {
            if (element.type === 'node' && element.lat && element.lon) {
                // Convert node to Point and add railway name if available
                return {
                    type: 'Feature',
                    id: `node/${element.id}`,
                    properties: {
                        type: 'Railway Node',
                        name: wayNames[element.id] || 'Unnamed Railway' // Add railway name to the point
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [element.lon, element.lat]
                    }
                };
            } else if (element.type === 'way' && element.geometry) {
                // Convert way geometry to LineString
                const coordinates = element.geometry.map(coord => [coord.lon, coord.lat]);
                return {
                    type: 'Feature',
                    id: `way/${element.id}`,
                    properties: {
                        ...element.tags, // Include all metadata (tags)
                        railway: element.tags?.railway || 'rail',
                        name: element.tags?.name || 'Unnamed Railway', // Add railway name
                        subdivision: element.tags?.subdivision || 'Unknown Subdivision' // Add subdivision name
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: coordinates
                    }
                };
            }
            return null; // Skip unsupported elements
        }).filter(f => f !== null); // Remove null features

        // Create a GeoJSON object
        const geojson = {
            type: 'FeatureCollection',
            features: rawFeatures
        };

        // Save the GeoJSON to a file
        writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
        console.log(`✅ Railway data saved to ${outputFile}`);
    })
    .catch(error => console.error('❌ Error fetching railway data:', error));