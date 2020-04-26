import express from 'express';
import cors from 'cors';

import IndexRouter from 'routes/index';

const app = express();

app.use(cors())
app.use('/', IndexRouter);

export default app;
