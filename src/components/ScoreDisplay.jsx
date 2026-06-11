import { Fragment } from 'react';

export default function ScoreDisplay({ matchState, status }) {
  if (!matchState) return null;

  const baseClass = 'lexend text-2xl font-black tracking-tight leading-none';

  // Finished matches (won/lost) — per-token: winner=green, loser=red
  if (status === 'won' || status === 'lost') {
    const tokens = [];

    matchState.completedSets.forEach((s, i) => {
      if (i > 0) tokens.push('  ');

      if (s.superTie) {
        const localWon = s.superTie[0] > s.superTie[1];
        tokens.push(
          <Fragment key={`cs-${i}`}>
            <span className={localWon ? 'text-primary/80' : 'text-error/80'}>
              <span className="text-white/20">ST </span>
              {s.superTie[0]}<span className="text-white/20">-</span>{s.superTie[1]}
            </span>
          </Fragment>
        );
      } else {
        const localWon = s.games[0] > s.games[1];
        const loser = s.tiebreak ? Math.min(s.tiebreak[0], s.tiebreak[1]) : null;
        tokens.push(
          <Fragment key={`cs-${i}`}>
            <span className={localWon ? 'text-primary/80' : 'text-error/80'}>
              {s.games[0]}<span className="text-white/20">-</span>{s.games[1]}
              {loser !== null && <span className="text-white/20">({loser})</span>}
            </span>
          </Fragment>
        );
      }
    });

    return <span className={baseClass}>{tokens}</span>;
  }

  // In Progress — completed sets: winner=green, loser=red
  // In Progress — current set: ALWAYS blue for local, yellow for visitor
  const tokens = [];

  matchState.completedSets.forEach((s, i) => {
    if (i > 0) tokens.push('  ');

    if (s.superTie) {
      const localWon = s.superTie[0] > s.superTie[1];
      tokens.push(
        <Fragment key={`cs-${i}`}>
          <span className={localWon ? 'text-primary/80' : 'text-error/80'}>
            <span className="text-white/20">ST </span>
            {s.superTie[0]}<span className="text-white/20">-</span>{s.superTie[1]}
          </span>
        </Fragment>
      );
    } else {
      const localWon = s.games[0] > s.games[1];
      const loser = s.tiebreak ? Math.min(s.tiebreak[0], s.tiebreak[1]) : null;
      tokens.push(
        <Fragment key={`cs-${i}`}>
          <span className={localWon ? 'text-primary/80' : 'text-error/80'}>
            {s.games[0]}<span className="text-white/20">-</span>{s.games[1]}
            {loser !== null && <span className="text-white/20">({loser})</span>}
          </span>
        </Fragment>
      );
    }
  });

  if (!matchState.isMatchOver) {
    if (matchState.completedSets.length > 0) tokens.push('  ');

    if (matchState.setsWon?.[0] === 1 && matchState.setsWon?.[1] === 1 && matchState.superTie) {
      tokens.push(
        <Fragment key="cur">
          <span>
            <span className="text-white/20">ST </span>
            <span className="text-team/80">{matchState.superTie.points[0]}</span>
            <span className="text-white/20">-</span>
            <span className="text-secondary/80">{matchState.superTie.points[1]}</span>
          </span>
        </Fragment>
      );
    } else if (matchState.current[0] === 6 && matchState.current[1] === 6 && matchState.tiebreak) {
      tokens.push(
        <Fragment key="cur">
          <span>
            <span className="text-team/80">6</span>
            <span className="text-white/20">-</span>
            <span className="text-secondary/80">6</span>
            <span className="text-white/20"> (</span>
            <span className="text-team/80">{matchState.tiebreak.points[0]}</span>
            <span className="text-white/20">-</span>
            <span className="text-secondary/80">{matchState.tiebreak.points[1]}</span>
            <span className="text-white/20">)</span>
          </span>
        </Fragment>
      );
    } else {
      tokens.push(
        <Fragment key="cur">
          <span>
            <span className="text-team/80">{matchState.current[0]}</span>
            <span className="text-white/20">-</span>
            <span className="text-secondary/80">{matchState.current[1]}</span>
          </span>
        </Fragment>
      );
    }
  }

  return <span className={baseClass}>{tokens}</span>;
}