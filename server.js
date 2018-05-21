const express = require('express');

const PORT = process.env.PORT || 3000;

const server = require('./app.js');

// const server = express.createServer(app);

server.listen(PORT, () => {
  process.stdout.write(`Server listening on port: ${PORT}\n`);
});
