const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/Map.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://127.0.0.1:5500`);
});

//Fetch the Firestations data from the backend
app.use('/data', express.static(path.join(__dirname, 'data')));

