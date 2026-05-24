import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, BottomNav } from '../components/Layout';
import { useFinishedJornadas } from '../hooks/useJornadas';
import { getJornadaWinner } from '../hooks/useLocalTeams';

export default function Historial() {
  const { jornadas } = useFinishedJornadas();

  return (
    <div className="min-h-screen bg-background pb-32 font-sans text-on-surface">
      <Header />

      <main className="px-5 flex flex-col gap-3 -mt-1">
        <div>
          <p className="lexend text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">Registro</p>
          <h2 className="lexend text-lg font-black text-white leading-tight">Historial</h2>
        </div>

        {/* Loading */}
        {jornadas === undefined && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-pulse">history</span>
            <p className="text-on-surface-variant text-sm">Cargando historial...</p>
          </div>
        )}

        {/* Empty */}
        {jornadas !== undefined && jornadas.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">history</span>
            </div>
            <div className="text-center">
              <p className="lexend font-bold text-on-surface text-sm mb-0.5">Sin jornadas finalizadas</p>
              <p className="text-on-surface-variant text-xs">Las jornadas terminadas aparecerán aquí</p>
            </div>
          </div>
        )}

        {/* List */}
        {jornadas && jornadas.length > 0 && (
          <div className="flex flex-col gap-3">
            {jornadas.map(j => (
              <JornadaHistorialCard key={j.id} jornada={j} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function buildShareText(jornada) {
  const { myTeam, visitingTeam, date, courts } = jornada;
  const myWins    = courts.filter(c => c.winner === 'mine').length;
  const theirWins = courts.filter(c => c.winner === 'theirs').length;
  const needed    = Math.ceil(courts.length / 2);
  const jornadaWinner = myWins >= needed ? 'mine' : theirWins >= needed ? 'theirs' : null;

  const lines = [
    `🎾 *${myTeam.name} vs ${visitingTeam}*`,
    date ? `📅 ${date}` : '',
    '',
    ...courts.map(c => {
      const icon   = c.winner === 'mine' ? '✅' : c.winner === 'theirs' ? '❌' : '⏳';
      const player = c.myPlayers.filter(Boolean).join(' / ') || '—';
      const score  = buildScoreString(c.matchState);
      return `${c.label} · ${player}   ${icon}${score ? '  ' + score : ''}`;
    }),
    '',
    '─────────────────',
  ];

  if (jornadaWinner) {
    const winner = jornadaWinner === 'mine' ? myTeam.name : visitingTeam;
    lines.push(`🏆 *${winner} gana  ${myWins} – ${theirWins}*`);
  } else {
    lines.push(`Marcador: ${myTeam.name} ${myWins} – ${theirWins} ${visitingTeam}`);
  }

  return lines.filter(l => l !== null).join('\n');
}

function buildScoreString(matchState) {
  if (!matchState) return null;
  const { completedSets = [], current = [0, 0], isMatchOver } = matchState;
  const sets = completedSets.map(s => {
    if (s.superTie) return `ST ${s.superTie[0]}-${s.superTie[1]}`;
    const loser = s.tiebreak ? Math.min(s.tiebreak[0], s.tiebreak[1]) : null;
    return `${s.games[0]}-${s.games[1]}${loser !== null ? `(${loser})` : ''}`;
  });
  if (!isMatchOver) {
    if (matchState.setsWon?.[0] === 1 && matchState.setsWon?.[1] === 1 && matchState.superTie) {
      sets.push(`ST ${matchState.superTie.points[0]}-${matchState.superTie.points[1]}`);
    } else if (current[0] === 6 && current[1] === 6 && matchState.tiebreak) {
      sets.push(`6-6 (${matchState.tiebreak.points[0]}-${matchState.tiebreak.points[1]})`);
    } else {
      sets.push(`${current[0]}-${current[1]}`);
    }
  }
  return sets.join('  ');
}

function JornadaHistorialCard({ jornada }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { myTeam, visitingTeam, date, courts } = jornada;
  const myWins    = courts.filter(c => c.winner === 'mine').length;
  const theirWins = courts.filter(c => c.winner === 'theirs').length;
  const jornadaWinner = getJornadaWinner(courts);
  const weWon = jornadaWinner === 'mine';

  const handleShare = async (e) => {
    e.stopPropagation();
    const text = buildShareText(jornada);
    if (navigator.share) {
      try { await navigator.share({ text }); } catch (_) { /* usuario canceló */ }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`rounded-2xl border transition-all ${
      weWon ? 'bg-primary/5 border-primary/20' : 'bg-error/5 border-error/15'
    }`}>
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-4"
      >
        <div className="flex items-center gap-3">
          {/* Result icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            weWon ? 'bg-primary/20' : 'bg-error/20'
          }`}>
            <span
              className={`material-symbols-outlined ${weWon ? 'text-primary' : 'text-error'}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {weWon ? 'emoji_events' : 'sentiment_dissatisfied'}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="lexend font-bold text-sm text-white leading-snug">{myTeam.name}</p>
            <p className="lexend text-xs text-on-surface-variant leading-snug">
              <span className="opacity-50">vs</span> {visitingTeam}
            </p>
            {date && <p className="text-[10px] text-on-surface-variant opacity-60 mt-0.5">{date}</p>}
          </div>

          {/* Score + share + chevron */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className={`lexend text-xl font-black ${weWon ? 'text-primary' : 'text-on-surface-variant'}`}>{myWins}</span>
              <span className="lexend text-sm text-on-surface-variant opacity-30">–</span>
              <span className={`lexend text-xl font-black ${!weWon ? 'text-error' : 'text-on-surface-variant'}`}>{theirWins}</span>
            </div>
            <button
              onClick={handleShare}
              className="relative p-1.5 rounded-full bg-white/5 text-on-surface-variant hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-base leading-none">share</span>
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-background text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                  ¡Copiado!
                </span>
              )}
            </button>
            <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform ${expanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </div>
        </div>
      </button>

      {/* Expandable court detail */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-1.5 border-t border-white/5 pt-3">
          {courts.map(court => {
            const won  = court.winner === 'mine';
            const lost = court.winner === 'theirs';
            const score = buildScoreString(court.matchState);
            const players = court.myPlayers.filter(Boolean).join(' / ') || '—';
            return (
              <button
                key={court.id}
                onClick={() => navigate('/marcador', { state: { court, jornada, returnTo: '/historial' } })}
                className="flex flex-col w-full text-left hover:bg-white/5 rounded-xl px-2 py-1.5 -mx-2 transition-colors active:scale-[0.98] gap-0.5"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className={`material-symbols-outlined text-base shrink-0 ${won ? 'text-primary' : lost ? 'text-error' : 'text-on-surface-variant/40'}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {won ? 'check_circle' : lost ? 'cancel' : 'radio_button_unchecked'}
                  </span>
                  <span className="lexend text-xs text-on-surface-variant shrink-0">{court.label}</span>
                  <div className="flex-1" />
                  {score && (
                    <span className={`lexend text-[11px] font-bold shrink-0 ${won ? 'text-primary/70' : lost ? 'text-error/70' : 'text-on-surface-variant'}`}>
                      {score}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-sm shrink-0">edit</span>
                </div>
                {players !== '—' && (
                  <p className="text-xs text-on-surface-variant/50 leading-snug ml-6 break-words">{players}</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
