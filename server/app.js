import express from 'express';
import router from './routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1', router);

app.get('/', (req, res) => res.send('API endpoint is at /api/v1/entries'));

app.listen(port);

export default app;
