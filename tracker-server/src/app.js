import express from 'express';

import IndexRouter from 'routes/index';

const app = express();

app.use('/', IndexRouter);

export default app;
