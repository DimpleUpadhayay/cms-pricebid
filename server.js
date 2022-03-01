const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const  app_path = '../dist/pricebid-web-app';
// const logger = require('morgan')

// Get our API routes
// const api = require('./server/routes/api');

const app = express();

// Parsers for POST data
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname,app_path)));

// Set our api routes
// app.use('/api', api);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname,app_path + '/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '4201';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`Server running on http://localhost:${port}`));