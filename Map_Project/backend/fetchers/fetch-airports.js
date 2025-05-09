import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { getDistance } from 'geolib';

// Overpass QL to fetch airports
const overpassQuery = `
[out:json][timeout:25];
(
    node["aeroway"="aerodrome"](43.5, -79.5, 44.8, -77.5);
    way["aeroway"="aerodrome"](43.5, -79.5, 44.8, -77.5);
    relation["aeroway"="aerodrome"](43.5, -79.5, 44.8, -77.5);
);
out body;
>;
out skel qt;
`;

// Similarity functions
function nameSimilarity(a, b) {
    const minLength = Math.min(a.length, b.length);
    const matches = [...a].filter((char, i) => char === b[i]).length;
    return matches / minLength;
}

function areNearDuplicates(f1, f2, threshold = 0.85, maxDistance = 2000) {
    const name1 = f1.properties.name.toLowerCase().trim();
    const name2 = f2.properties.name.toLowerCase().trim();
    const similarity = nameSimilarity(name1, name2);
    const coords1 = f1.geometry.coordinates;
    const coords2 = f2.geometry.coordinates;
    const distance = getDistance(
        { latitude: coords1[1], longitude: coords1[0] },
        { latitude: coords2[1], longitude: coords2[0] }
    );
    return similarity >= threshold && distance <= maxDistance;
}

// Fetch and process data
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
        // Convert to GeoJSON features
        const allFeatures = data.elements.map(element => {
            const name = element.tags?.name || 'Unnamed Airport';
            const aeroway = element.tags?.aeroway || 'aerodrome';

            if (element.type === 'node' && element.lat && element.lon) {
                return {
                    type: 'Feature',
                    id: `${element.type}/${element.id}`,
                    properties: { name, aeroway },
                    geometry: {
                        type: 'Point',
                        coordinates: [element.lon, element.lat]
                    }
                };
            } else if ((element.type === 'way' || element.type === 'relation') && element.geometry) {
                const coordinates = element.geometry.map(coord => [coord.lon, coord.lat]);
                return {
                    type: 'Feature',
                    id: `${element.type}/${element.id}`,
                    properties: { name, aeroway },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [coordinates]
                    }
                };
            }
            return null;
        }).filter(f => f !== null);

        // Deduplicate based on name similarity + distance
        const uniqueFeatures = [];
        for (const feature of allFeatures) {
            const isDuplicate = uniqueFeatures.some(existing => areNearDuplicates(existing, feature));
            if (!isDuplicate) {
                uniqueFeatures.push(feature);
            }
        }

        // Final GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: uniqueFeatures
        };

        const outputPath = path.resolve('../data/airports.geojson');
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
        console.log(`✅ Airports data saved to ${outputPath}`);
    })
    .catch(error => console.error('❌ Error fetching airport data:', error));
