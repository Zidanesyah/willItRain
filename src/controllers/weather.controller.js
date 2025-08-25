import { z } from 'zod';
import { checkRainTomorrow } from '../services/weather.service.js';

const querySchema = z.object({
  q: z.string().min(2, 'City is required and must be ≥2 chars'),
  units: z.enum(['standard','metric','imperial']).optional(),
  lang: z.string().optional()
});

export async function willItRain(req, res, next) {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues.map(i => i.message).join(', ') });
    }

    const data = await checkRainTomorrow(parsed.data);
    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}
