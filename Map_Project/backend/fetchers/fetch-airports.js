import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Overpass API query to fetch airports within the specified area
const overpassQuery = `
[out:json][timeout:25];
(
    node["aeroway"="aerodrome"](43.5, -79.5, 44.8, -77.5); // Updated bounding box
    way["aeroway"="aerodrome"](43.5, -79.5, 44.8, -77.5); // Include ways
    relation["aeroway"="aerodrome"](43.5, -79.5, 44.8, -77.5); // Include relations
);
out body;
>;
out skel qt;
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
            features: data.elements.map(element => {
                if (element.type === 'node' && element.lat && element.lon) {
                    // Handle nodes
                    return {
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
                    };
                } else if (element.type === 'way' && element.geometry) {
                    // Handle ways
                    return {
                        type: 'Feature',
                        id: `way/${element.id}`,
                        properties: {
                            name: element.tags?.name || 'Unnamed Airport',
                            aeroway: element.tags?.aeroway || 'aerodrome',
                        },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                element.geometry.map(coord => [coord.lon, coord.lat])
                            ]
                        }
                    };
                } else if (element.type === 'relation' && element.geometry) {
                    // Handle relations
                    return {
                        type: 'Feature',
                        id: `relation/${element.id}`,
                        properties: {
                            name: element.tags?.name || 'Unnamed Airport',
                            aeroway: element.tags?.aeroway || 'aerodrome',
                        },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                element.geometry.map(coord => [coord.lon, coord.lat])
                            ]
                        }
                    };
                } else {
                    console.warn('Skipping invalid element:', element);
                    return null;
                }
            }).filter(feature => feature !== null) // Remove null features
        };

        // Remove duplicate features based on their IDs
        const uniqueFeatures = [];
        const seenIds = new Set();
        geojson.features.forEach(feature => {
            if (!seenIds.has(feature.id)) {
                uniqueFeatures.push(feature);
                seenIds.add(feature.id);
            }
        });

        // Create a new GeoJSON object with unique features
        const uniqueGeojson = {
            type: 'FeatureCollection',
            features: uniqueFeatures
        };

        // Define the output path
        const outputPath = path.resolve('../data/airports.geojson');

        // Ensure the directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Save GeoJSON to a file
        fs.writeFileSync(outputPath, JSON.stringify(uniqueGeojson, null, 2));
        console.log(`✅ Airports data saved to ${outputPath}`);
    })
    .catch(error => console.error('❌ Error fetching airport data:', error));