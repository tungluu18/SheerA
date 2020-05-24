import http from 'http';

import app from 'app';
import io from 'socket';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Tracker server is currently listening on port ${PORT}...`);
})

io.listen(server);
