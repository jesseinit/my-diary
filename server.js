import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => res.send('API endpoint is at /api/v1/entries'));

app.listen(port);

export default app;
