import http from 'http';

import app from 'app';
import io from 'socket';

const server = http.createServer(app);
io.listen(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Tracker server is currently listening on port ${PORT}...`);
})
