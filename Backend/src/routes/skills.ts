import { Router, Request, Response } from 'express';
import {
  suggestSkills,
  getActiveRegisteredSkills,
  CANONICAL_SKILLS,
  SKILL_CATEGORIES,
  aiClassifyAndEnhanceSkill,
} from '../services/skillsService';

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

// GET /api/skills/categories - Returns all standardized skill categories
router.get('/categories', async (req: Request, res: Response) => {
  return res.json({
    ok: true,
    data: SKILL_CATEGORIES,
  });
});

// POST /api/skills/suggest - Fast keyword / semantic suggestion
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

// POST /api/skills/ai-classify - Deep Gemini AI dynamic detection & standardization
router.post('/ai-classify', async (req: Request, res: Response) => {
  try {
    const { prompt, locale } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ ok: false, error: { message: 'Prompt string is required' } });
    }

    const classification = await aiClassifyAndEnhanceSkill(prompt.trim(), locale || 'fr');
    return res.json({
      ok: true,
      data: classification,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { message: err.message } });
  }
});

export default router;
