import fetch from 'node-fetch';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Define the new output directory and file path
const outputDir = '../../backend/data';
const outputFile = join(outputDir, 'firestations.geojson');

// Ensure the output directory exists
if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}

// Overpass API query to fetch fire stations within the specified area
const overpassQuery = `
[out:json][timeout:25];
(
    node["amenity"="fire_station"](43.5,-79.5,44.8,-77.5);
    way["amenity"="fire_station"](43.5,-79.5,44.8,-77.5);
    relation["amenity"="fire_station"](43.5,-79.5,44.8,-77.5);
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
                    return {
                        type: 'Feature',
                        id: `node/${element.id}`,
                        properties: {
                            name: element.tags?.name || 'Unnamed Fire Station',
                            tags: element.tags || {}
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [element.lon, element.lat]
                        }
                    };
                } else if (element.type === 'way' && element.geometry) {
                    const coordinates = element.geometry.map(coord => [coord.lon, coord.lat]);
                    if (coordinates.length > 0) {
                        return {
                            type: 'Feature',
                            id: `way/${element.id}`,
                            properties: {
                                name: element.tags?.name || 'Unnamed Fire Station',
                                tags: element.tags || {}
                            },
                            geometry: {
                                type: 'Polygon',
                                coordinates: [coordinates]
                            }
                        };
                    }
                } else if (element.type === 'relation' && element.geometry) {
                    const coordinates = element.geometry.map(coord => [coord.lon, coord.lat]);
                    if (coordinates.length > 0) {
                        return {
                            type: 'Feature',
                            id: `relation/${element.id}`,
                            properties: {
                                name: element.tags?.name || 'Unnamed Fire Station',
                                tags: element.tags || {}
                            },
                            geometry: {
                                type: 'Polygon',
                                coordinates: [coordinates]
                            }
                        };
                    }
                }
                console.warn('Skipping invalid element:', element);
                return null;
            }).filter(feature => feature !== null) // Remove null features
        };

        // Save GeoJSON to a file
        writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
        console.log(`Fire stations data saved to ${outputFile}`);
    })
    .catch(error => console.error('Error fetching fire station data:', error));