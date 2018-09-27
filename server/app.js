import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import router from './routes';
import { setupDbTables } from './helpers/connection';

const swaggerDoc = YAML.load(path.join(process.cwd(), './server/docs/docs.yaml'));

setupDbTables();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/api/v1', router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.listen(port);

export default app;
