import { Fragment } from 'react';

export default function ScoreDisplay({ matchState, status }) {
  if (!matchState) return null;

  const baseClass = 'lexend text-2xl font-black tracking-tight leading-none';

  const tokens = [];

  // Render completed sets — per number: winner=green, loser=red
  matchState.completedSets.forEach((s, i) => {
    if (i > 0) tokens.push('  ');

    if (s.superTie) {
      const localWon = s.superTie[0] > s.superTie[1];
      const winCls = localWon ? 'text-primary/80' : 'text-error/80';
      const loseCls = localWon ? 'text-error/80' : 'text-primary/80';
      tokens.push(
        <Fragment key={`cs-${i}`}>
          <span className="text-white/20">ST </span>
          <span className={winCls}>{s.superTie[0]}</span>
          <span className="text-white/20">-</span>
          <span className={loseCls}>{s.superTie[1]}</span>
        </Fragment>
      );
    } else {
      const localWon = s.games[0] > s.games[1];
      const winCls = localWon ? 'text-primary/80' : 'text-error/80';
      const loseCls = localWon ? 'text-error/80' : 'text-primary/80';
      const loser = s.tiebreak ? Math.min(s.tiebreak[0], s.tiebreak[1]) : null;
      const tbWinner = s.tiebreak ? (s.tiebreak[0] > s.tiebreak[1]) : null;
      const tbWinCls = tbWinner ? 'text-primary/80' : 'text-error/80';
      const tbLoseCls = tbWinner ? 'text-error/80' : 'text-primary/80';
      tokens.push(
        <Fragment key={`cs-${i}`}>
          <span className={winCls}>{s.games[0]}</span>
          <span className="text-white/20">-</span>
          <span className={loseCls}>{s.games[1]}</span>
          {loser !== null && (
            <>
              <span className="text-white/20"> (</span>
              <span className={tbWinCls}>{s.tiebreak[0]}</span>
              <span className="text-white/20">-</span>
              <span className={tbLoseCls}>{s.tiebreak[1]}</span>
              <span className="text-white/20">)</span>
            </>
          )}
        </Fragment>
      );
    }
  });

  // In Progress — current set: ALWAYS blue for local, yellow for visitor
  if (!matchState.isMatchOver) {
    if (matchState.completedSets.length > 0) tokens.push('  ');

    if (matchState.setsWon?.[0] === 1 && matchState.setsWon?.[1] === 1 && matchState.superTie) {
      tokens.push(
        <Fragment key="cur">
          <span className="text-white/20">ST </span>
          <span className="text-team/80">{matchState.superTie.points[0]}</span>
          <span className="text-white/20">-</span>
          <span className="text-secondary/80">{matchState.superTie.points[1]}</span>
        </Fragment>
      );
    } else if (matchState.current[0] === 6 && matchState.current[1] === 6 && matchState.tiebreak) {
      tokens.push(
        <Fragment key="cur">
          <span className="text-team/80">6</span>
          <span className="text-white/20">-</span>
          <span className="text-secondary/80">6</span>
          <span className="text-white/20"> (</span>
          <span className="text-team/80">{matchState.tiebreak.points[0]}</span>
          <span className="text-white/20">-</span>
          <span className="text-secondary/80">{matchState.tiebreak.points[1]}</span>
          <span className="text-white/20">)</span>
        </Fragment>
      );
    } else {
      tokens.push(
        <Fragment key="cur">
          <span className="text-team/80">{matchState.current[0]}</span>
          <span className="text-white/20">-</span>
          <span className="text-secondary/80">{matchState.current[1]}</span>
        </Fragment>
      );
    }
  }

  return <span className={baseClass}>{tokens}</span>;
}