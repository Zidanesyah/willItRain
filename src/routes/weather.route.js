import { Router } from 'express';
import { willItRain } from '../controllers/weather.controller.js';

const router = Router();

// GET /api/will-it-rain?q=Jakarta&units=metric
router.get('/will-it-rain', willItRain);

export default router;
