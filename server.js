import express from 'express';
import v1 from './routes/v1/index';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1', v1);

app.get('/', (req, res) => res.send('API endpoint is at /api/v1/entries'));

app.listen(port);

export default app;
