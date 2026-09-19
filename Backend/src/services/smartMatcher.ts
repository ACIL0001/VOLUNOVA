export interface MatchCandidate {
  skills: string[];
  city: string;
  reliabilityScore: number;
}

export interface MatchTarget {
  skillTag: string;
  targetCity: string;
}

export interface ParsedSkill {
  full: string;
  category: string;
  rawInput: string;
}

export function parseSkillParts(skillStr: string): ParsedSkill {
  const full = (skillStr || '').trim();
  const match = full.match(/^([^(]+?)\s*\((.+)\)$/);
  if (match) {
    return {
      full,
      category: match[1].trim(),
      rawInput: match[2].trim(),
    };
  }
  return {
    full,
    category: full,
    rawInput: full,
  };
}

export function findBestMatchingSkill(skills: string[], targetSkillTag: string): string | null {
  if (!skills || skills.length === 0) return null;
  const target = parseSkillParts(targetSkillTag);
  const targetNorm = target.full.toLowerCase();
  const targetCatNorm = target.category.toLowerCase();
  const targetRawNorm = target.rawInput.toLowerCase();

  let bestSkill: string | null = null;
  let highestPrio = 0;

  for (const s of skills) {
    const cand = parseSkillParts(s);
    const candNorm = cand.full.toLowerCase();
    const candCatNorm = cand.category.toLowerCase();
    const candRawNorm = cand.rawInput.toLowerCase();

    // 1. Exact full match
    if (candNorm === targetNorm) {
      return s;
    }
    // 2. Exact category match or raw match
    if (candCatNorm === targetCatNorm || candRawNorm === targetRawNorm) {
      if (highestPrio < 4) {
        highestPrio = 4;
        bestSkill = s;
      }
      continue;
    }
    // 3. Substring inclusion in category or raw
    if (
      candCatNorm.includes(targetCatNorm) ||
      targetCatNorm.includes(candCatNorm) ||
      candRawNorm.includes(targetRawNorm) ||
      targetRawNorm.includes(candRawNorm)
    ) {
      if (highestPrio < 3) {
        highestPrio = 3;
        bestSkill = s;
      }
      continue;
    }
    // 4. Token overlap
    const tokens = targetNorm.split(/[\s,()/-]+/).filter((t) => t.length > 2);
    const hasToken = tokens.some((t) => candNorm.includes(t));
    if (hasToken && highestPrio < 2) {
      highestPrio = 2;
      bestSkill = s;
    }
  }

  return bestSkill || null;
}

export function calculateMatchScore(candidate: MatchCandidate, target: MatchTarget): number {
  const targetParsed = parseSkillParts(target.skillTag);
  const targetNorm = targetParsed.full.toLowerCase();
  const targetCatNorm = targetParsed.category.toLowerCase();
  const targetRawNorm = targetParsed.rawInput.toLowerCase();

  // 1. Skill Match (0 - 50 pts)
  let skillScore = 0; // Strictly 0 if no relevant skill exists

  const skills = candidate.skills || [];
  let directMatch = false;
  let categoryMatch = false;
  let tokenMatch = false;

  for (const s of skills) {
    const cand = parseSkillParts(s);
    const candNorm = cand.full.toLowerCase();
    const candCatNorm = cand.category.toLowerCase();
    const candRawNorm = cand.rawInput.toLowerCase();

    if (
      candNorm === targetNorm ||
      (candNorm.length > 3 && targetNorm.includes(candNorm)) ||
      (targetNorm.length > 3 && candNorm.includes(targetNorm))
    ) {
      directMatch = true;
      break;
    }

    if (
      candCatNorm === targetCatNorm ||
      candRawNorm === targetRawNorm ||
      (candCatNorm.length > 3 && targetCatNorm.includes(candCatNorm)) ||
      (targetCatNorm.length > 3 && candCatNorm.includes(targetCatNorm)) ||
      (candRawNorm.length > 3 && targetRawNorm.includes(candRawNorm)) ||
      (targetRawNorm.length > 3 && candRawNorm.includes(targetRawNorm))
    ) {
      categoryMatch = true;
    }

    const tokens = targetNorm.split(/[\s,()/-]+/).filter((t) => t.length > 3);
    if (tokens.some((t) => candNorm.includes(t))) {
      tokenMatch = true;
    }
  }

  if (directMatch) {
    skillScore = 50;
  } else if (categoryMatch) {
    skillScore = 45;
  } else if (tokenMatch) {
    skillScore = 35;
  }

  // If volunteer has no skill match whatsoever, match score is strictly 0
  if (skillScore === 0) {
    return 0;
  }

  // 2. Proximity Score (0 - 30 pts)
  const isSameCity =
    (candidate.city || '').toLowerCase().trim() === (target.targetCity || '').toLowerCase().trim();
  const proximityScore = isSameCity ? 30 : 12;

  // 3. Reliability & Impact Score (0 - 20 pts)
  const rel = typeof candidate.reliabilityScore === 'number' && candidate.reliabilityScore > 0 ? candidate.reliabilityScore : 0;
  const reliabilityScore = Math.min(20, Math.max(0, Math.round((rel / 100) * 20)));

  const total = skillScore + proximityScore + reliabilityScore;
  return Math.min(99, Math.max(0, total));
}
