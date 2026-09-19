import { Router, Request, Response } from 'express';
import { suggestSkills, getActiveRegisteredSkills, CANONICAL_SKILLS } from '../services/skillsService';

const router = Router();

// GET /api/skills - Returns active registered volunteer skills with platform counts
router.get('/', async (req: Request, res: Response) => {
  try {
    const skills = await getActiveRegisteredSkills();
    return res.json({
      ok: true,
      data: skills,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

// GET /api/skills/taxonomy - Returns all canonical standardized skills
router.get('/taxonomy', async (req: Request, res: Response) => {
  return res.json({
    ok: true,
    data: CANONICAL_SKILLS,
  });
});

// POST /api/skills/suggest - Smart AI-powered suggestion & normalization
router.post('/suggest', async (req: Request, res: Response) => {
  try {
    const { query, locale } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ ok: false, error: { message: 'Query string is required' } });
    }

    const suggestions = await suggestSkills(query, locale || 'fr');
    return res.json({
      ok: true,
      data: suggestions,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

export default router;
