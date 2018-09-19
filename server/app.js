import express from 'express';
import cors from 'cors';
import path from 'path';
import router from './routes';
import { setupDbTables } from './helpers/connection';

setupDbTables();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/api/v1', router);

app.listen(port);

export default app;
