import fetch from 'node-fetch';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const outputDir = '../data';
const outputFile = join(outputDir, 'neighborhoods.geojson');

// Ensure the output directory exists
if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}

// Overpass API query to fetch neighborhoods (place=neighbourhood) within a bounding box
const overpassQuery = `
[out:json][timeout:25];
(
    relation["place"="neighbourhood"](43.5,-79.5,44.8,-77.5); // Adjust the bounding box as needed
    way(r); // Fetch all ways that are part of the relations
    node(w); // Fetch all nodes that are part of the ways
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
        // Create a map of nodes with their coordinates
        const nodes = {};
        data.elements
            .filter(element => element.type === 'node')
            .forEach(node => {
                nodes[node.id] = [node.lon, node.lat];
            });

        // Create a map of ways with their coordinates
        const ways = {};
        data.elements
            .filter(element => element.type === 'way')
            .forEach(way => {
                ways[way.id] = way.nodes.map(nodeId => nodes[nodeId]);
            });

        // Convert relations to GeoJSON features
        const features = data.elements
            .filter(element => element.type === 'relation' && element.tags?.name && element.members)
            .map(relation => {
                const coordinates = relation.members
                    .filter(member => member.type === 'way' && ways[member.ref])
                    .map(member => ways[member.ref]);

                return {
                    type: 'Feature',
                    properties: {
                        name: relation.tags.name // Neighborhood name
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [coordinates.flat()] // Flatten nested arrays for GeoJSON
                    }
                };
            });

        const geojson = {
            type: 'FeatureCollection',
            features: features
        };

        // Save the GeoJSON to a file
        writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
        console.log(`✅ Neighborhood data saved to ${outputFile}`);
    })
    .catch(error => console.error('❌ Error fetching neighborhood data:', error));