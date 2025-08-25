import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import weatherRoute from './routes/weather.route.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// static website
app.use(express.static('src/public'));

// api routes
app.use('/api', weatherRoute);

// health check
app.get('/health', (_, res) => res.json({ ok: true }));

// error handler
app.use(errorHandler);

export default app;
