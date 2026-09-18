export interface MatchCandidate {
  skills: string[];
  city: string;
  reliabilityScore: number;
}

export interface MatchTarget {
  skillTag: string;
  targetCity: string;
}

export function calculateMatchScore(candidate: MatchCandidate, target: MatchTarget): number {
  const targetSkill = (target.skillTag || '').toLowerCase().trim();

  // 1. Skill Match (0 - 50 pts)
  let skillScore = 15; // baseline interest
  const hasDirectMatch = candidate.skills.some((s) => {
    const norm = (s || '').toLowerCase().trim();
    return norm === targetSkill || norm.includes(targetSkill) || targetSkill.includes(norm);
  });

  if (hasDirectMatch) {
    skillScore = 50;
  } else {
    // Check partial token overlap
    const tokens = targetSkill.split(/\s+/);
    const hasTokenMatch = candidate.skills.some((s) =>
      tokens.some((t) => t.length > 3 && s.toLowerCase().includes(t))
    );
    if (hasTokenMatch) {
      skillScore = 35;
    }
  }

  // 2. Proximity Score (0 - 30 pts)
  const isSameCity =
    (candidate.city || '').toLowerCase().trim() === (target.targetCity || '').toLowerCase().trim();
  const proximityScore = isSameCity ? 30 : 12;

  // 3. Reliability & Impact Score (0 - 20 pts)
  const rel = typeof candidate.reliabilityScore === 'number' ? candidate.reliabilityScore : 90;
  const reliabilityScore = Math.min(20, Math.max(0, Math.round((rel / 100) * 20)));

  const total = skillScore + proximityScore + reliabilityScore;
  return Math.min(99, Math.max(40, total)); // Bounds between 40% and 99%
}
