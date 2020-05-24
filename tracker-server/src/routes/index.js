import { Router } from 'express';
import redis from 'db';

const router = Router();

router.get('/', (req, res) => {
  res.send("Ahihi...");
});

router.get('/test-string', async (req, res) => {
  try {
    const { key, value } = req.query;
    const result = await redis.set(key, value);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

export default router;
