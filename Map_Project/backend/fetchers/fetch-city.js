import fetch from 'node-fetch';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const outputDir = '../data';
const outputFile = join(outputDir, 'cities.geojson');

// Ensure the output directory exists
if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}

// Overpass API query to fetch cities and their boundaries within a bounding box
const overpassQuery = `
[out:json][timeout:25];
(
    relation["place"="city"](43.5,-79.5,44.8,-77.5); // Adjust the bounding box as needed
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

                // Ensure the boundary is closed
                const flattenedCoordinates = coordinates.flat();
                if (
                    flattenedCoordinates[0][0] !== flattenedCoordinates[flattenedCoordinates.length - 1][0] ||
                    flattenedCoordinates[0][1] !== flattenedCoordinates[flattenedCoordinates.length - 1][1]
                ) {
                    flattenedCoordinates.push(flattenedCoordinates[0]); // Close the polygon
                }

                return {
                    type: 'Feature',
                    properties: {
                        name: relation.tags.name // City name
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [flattenedCoordinates] // Use the connected coordinates
                    }
                };
            });

        const geojson = {
            type: 'FeatureCollection',
            features: features
        };

        // Save the GeoJSON to a file
        writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
        console.log(`✅ City data saved to ${outputFile}`);
    })
    .catch(error => console.error('❌ Error fetching city data:', error));