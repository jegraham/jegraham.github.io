const fetch = require('node-fetch');
const fs = require('fs');

// Overpass API query to fetch police stations
const overpassQuery = `
[out:json];
node["amenity"="police"](43.5,-79.5,44.5,-78.5); // Bounding box for Durham Region
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
                    amenity: element.tags?.amenity || 'police',
                },
                geometry: {
                    type: 'Point',
                    coordinates: [element.lon, element.lat]
                }
            }))
        };

        // Save GeoJSON to a file
        fs.writeFileSync('./data/policestations.geojson', JSON.stringify(geojson, null, 2));
        console.log('Police stations data saved to ./data/policestations.geojson');
    })
    .catch(error => console.error('Error fetching police station data:', error));