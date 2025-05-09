import fetch from 'node-fetch';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getDistance } from 'geolib'; // Use 'geolib' for distance calc

const outputDir = '../../backend/data';
const outputFile = join(outputDir, 'firestations.geojson');

if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}

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
        const allFeatures = data.elements.map(element => {
            const name = element.tags?.name || 'Unnamed Fire Station';
            if (element.type === 'node' && element.lat && element.lon) {
                return {
                    type: 'Feature',
                    id: `${element.type}/${element.id}`,
                    properties: { name, tags: element.tags || {} },
                    geometry: {
                        type: 'Point',
                        coordinates: [element.lon, element.lat]
                    }
                };
            } else if ((element.type === 'way' || element.type === 'relation') && element.geometry) {
                const coordinates = element.geometry.map(coord => [coord.lon, coord.lat]);
                if (coordinates.length > 0) {
                    return {
                        type: 'Feature',
                        id: `${element.type}/${element.id}`,
                        properties: { name, tags: element.tags || {} },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [coordinates]
                        }
                    };
                }
            }
            return null;
        }).filter(f => f !== null);

        // Remove near duplicates
        const uniqueFeatures = [];
        for (const feature of allFeatures) {
            const isDuplicate = uniqueFeatures.some(existing => areNearDuplicates(existing, feature));
            if (!isDuplicate) {
                uniqueFeatures.push(feature);
            }
        }

        const geojson = {
            type: 'FeatureCollection',
            features: uniqueFeatures
        };

        writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
        console.log(`✅ Fire stations saved to ${outputFile} without near-duplicates`);
    })
    .catch(error => console.error('❌ Error fetching fire station data:', error));
