// SM-2 spaced repetition algorithm

export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

export function sm2(card, rating) {
  const interval   = card.interval   ?? 0;
  const easeFactor = card.easeFactor ?? 2.5;
  const lapses     = card.lapses     ?? 0;

  let newInterval, newEF = easeFactor, newLapses = lapses;

  if (rating === 'again') {
    newInterval = 1;
    newEF       = Math.max(1.3, easeFactor - 0.2);
    newLapses   = lapses + 1;
  } else if (rating === 'hard') {
    newInterval = interval <= 1 ? 1 : Math.round(interval * 1.2);
    newEF       = Math.max(1.3, easeFactor - 0.15);
  } else {
    // easy
    if (interval === 0)      newInterval = 1;
    else if (interval === 1) newInterval = 6;
    else                     newInterval = Math.round(interval * easeFactor);
    newEF = Math.min(3.0, easeFactor + 0.1);
  }

  const dueDate = new Date(Date.now() + newInterval * 86400000).toISOString().slice(0, 10);
  const level   = newInterval >= 21 ? 'master'
    : newInterval >= 6  ? 'know'
    : newInterval >= 1  ? 'learning'
    : 'new';

  return {
    ...card,
    interval:   newInterval,
    easeFactor: parseFloat(newEF.toFixed(2)),
    lapses:     newLapses,
    dueDate,
    level,
  };
}
