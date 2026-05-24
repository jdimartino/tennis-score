import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header, BottomNav } from '../components/Layout';
import { getJornadaWinner } from '../hooks/useLocalTeams';
import { useJornada } from '../hooks/useJornadas';

export default function Jornada() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { jornada, finishJornada } = useJornada(id);
  const [copied, setCopied] = useState(false);

  // Loading state while Firestore responds
  if (jornada === undefined) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 font-sans text-on-surface">
        <span className="material-symbols-outlined text-5xl text-primary animate-pulse">sports_tennis</span>
        <p className="text-on-surface-variant text-sm">Cargando jornada...</p>
      </div>
    );
  }

  if (!jornada) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 font-sans text-on-surface">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant">sports_tennis</span>
        <p className="text-on-surface-variant text-sm">No hay jornada activa</p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary text-on-primary-container lexend font-bold py-3 px-6 rounded-xl"
        >
          Nueva Jornada
        </button>
      </div>
    );
  }

  const { myTeam, visitingTeam, date, courts } = jornada;
  const myWins    = courts.filter(c => c.winner === 'mine').length;
  const theirWins = courts.filter(c => c.winner === 'theirs').length;
  const jornadaWinner = getJornadaWinner(courts);
  const totalCourts = courts.length;
  const needed = Math.ceil(totalCourts / 2);

  const handleShare = async () => {
    const text = buildShareText(jornada);
    if (navigator.share) {
      try { await navigator.share({ text }); } catch (_) { /* usuario canceló */ }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareLive = async () => {
    const liveUrl = `${window.location.origin}/live/${jornada.id}`;
    const title = `${myTeam.name} vs ${visitingTeam}`;
    const text = '🎾 Sigue el marcador en vivo:';
    if (navigator.share) {
      try { await navigator.share({ title, text, url: liveUrl }); } catch (_) { /* usuario canceló */ }
    } else {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCourtTap = (court) => {
    // Always allow entering a court to view or edit the result
    navigate('/marcador', {
      state: { court, jornada, returnTo: `/jornada/${id}` }
    });
  };

  const handleNewJornada = async () => {
    await finishJornada();
    navigate('/nueva-jornada');
  };

  return (
    <div className="min-h-screen bg-background pb-32 font-sans text-on-surface">
      <Header />

      <main className="px-6 flex flex-col gap-4 -mt-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="lexend text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">
              Reporte de la Jornada
            </p>
            <h2 className="lexend text-base font-black text-white leading-tight">Jornada</h2>
            <p className="text-on-surface-variant text-[11px] mt-0.5">
              {myTeam.name} <span className="opacity-50">vs</span> {visitingTeam}
              {date && <span className="ml-2 opacity-50">· {date}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLive}
              className="relative text-on-surface-variant hover:text-primary p-2 rounded-full bg-surface-container-high transition-colors"
              title="Compartir enlace en vivo"
            >
              <span className="material-symbols-outlined">link</span>
            </button>
            <button
              onClick={handleShare}
              className="relative text-on-surface-variant hover:text-white p-2 rounded-full bg-surface-container-high transition-colors"
              title="Compartir resumen"
            >
              <span className="material-symbols-outlined">share</span>
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-background text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                  ¡Copiado!
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-on-surface-variant hover:text-white p-2 rounded-full bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </div>
        </div>

        {/* Global Score Card */}
        <div className="bg-surface-container-high rounded-[2rem] p-5 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <p className="lexend text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 text-center">
            Marcador de Jornada
          </p>
          <div className="flex items-center justify-center gap-6">
            {/* My team */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="lexend text-5xl font-black text-primary">{myWins}</span>
              <span className="lexend text-xs font-bold text-on-surface truncate max-w-full text-center">{myTeam.name}</span>
            </div>
            {/* Divider */}
            <div className="flex flex-col items-center gap-1">
              <span className="lexend text-2xl font-black text-on-surface-variant">—</span>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">de {needed}</span>
            </div>
            {/* Visiting */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="lexend text-5xl font-black text-secondary">{theirWins}</span>
              <span className="lexend text-xs font-bold text-on-surface truncate max-w-full text-center">{visitingTeam}</span>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-4 flex gap-1">
            {courts.map(c => (
              <div
                key={c.id}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  c.winner === 'mine'
                    ? 'bg-primary'
                    : c.winner === 'theirs'
                      ? 'bg-secondary'
                      : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Jornada Winner Banner */}
        {jornadaWinner && (
          <div className={`rounded-2xl p-4 text-center ${jornadaWinner === 'mine' ? 'bg-primary/15 border border-primary/30' : 'bg-error/15 border border-error/30'}`}>
            <span className="material-symbols-outlined text-3xl mb-1" style={{ fontVariationSettings: "'FILL' 1", color: jornadaWinner === 'mine' ? '#3fff8b' : '#ff5449' }}>
              {jornadaWinner === 'mine' ? 'emoji_events' : 'sentiment_dissatisfied'}
            </span>
            <p className="lexend font-black text-lg text-white">
              {jornadaWinner === 'mine' ? `¡${myTeam.name} gana la jornada!` : `${visitingTeam} gana la jornada`}
            </p>
            <p className="text-on-surface-variant text-xs mt-1">{myWins} – {theirWins}</p>
            <div className="flex gap-2 justify-center mt-3">
              <button
                onClick={handleShare}
                className="bg-primary/20 text-primary lexend font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">share</span>
                Compartir
              </button>
              <button
                onClick={handleNewJornada}
                className="bg-surface-container-low text-on-surface lexend font-bold py-2 px-4 rounded-xl text-sm hover:bg-surface-container-high transition-colors"
              >
                Nueva Jornada
              </button>
            </div>
          </div>
        )}

        {/* Court List */}
        <div className="flex flex-col gap-3">
          {courts.map((court) => (
            <CourtRow
              key={court.id}
              court={court}
              myTeamName={myTeam.name}
              visitingTeam={visitingTeam}
              onTap={() => handleCourtTap(court)}
            />
          ))}
        </div>
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

function CourtRow({ court, onTap }) {
  const isDoubles = court.type === 'doubles';
  const won       = court.winner === 'mine';
  const lost      = court.winner === 'theirs';
  const inProgress = !court.winner && !!court.matchState;
  const pending   = !court.winner && !court.matchState;
  const hasResult = won || lost;

  const playerDisplay = court.myPlayers.filter(Boolean).join(' / ') || '—';
  const scoreString   = buildScoreString(court.matchState);

  return (
    <button
      onClick={onTap}
      className={`w-full text-left bg-surface-container-high rounded-2xl p-4 border transition-all active:scale-[0.98] hover:border-white/15 ${
        won
          ? 'border-primary/30 bg-primary/5'
          : lost
            ? 'border-error/20 bg-error/5'
            : 'border-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Status icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          won ? 'bg-primary/20' : lost ? 'bg-error/20' : inProgress ? 'bg-secondary/15' : 'bg-surface-container-low'
        }`}>
          {won       && <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
          {lost      && <span className="material-symbols-outlined text-error"   style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>}
          {inProgress && <span className="material-symbols-outlined text-secondary">timer</span>}
          {pending   && (
            <span className={`material-symbols-outlined ${isDoubles ? 'text-primary/40' : 'text-secondary/40'}`}>
              {isDoubles ? 'group' : 'person'}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="lexend font-bold text-sm text-on-surface">{court.label}</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              isDoubles ? 'bg-primary/10 text-primary/70' : 'bg-secondary/10 text-secondary/70'
            }`}>
              {isDoubles ? 'D' : 'S'}
            </span>
          </div>
          <p className="text-on-surface-variant text-[13px] mt-0.5 truncate">{playerDisplay}</p>
        </div>

        {/* Result / Edit icon */}
        <div className="shrink-0 flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-2">
            {won        && <span className="lexend text-[13px] font-bold text-primary">GANADO</span>}
            {lost       && <span className="lexend text-[13px] font-bold text-error">PERDIDO</span>}
            {inProgress && <span className="lexend text-[13px] font-bold text-secondary">EN CURSO</span>}
            {(hasResult || inProgress) && (
              <span className={`material-symbols-outlined text-base ${
                won ? 'text-primary/50' : lost ? 'text-error/50' : 'text-secondary/50'
              }`}>edit</span>
            )}
            {pending && <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>}
          </div>
          {scoreString && (
            <span className={`lexend text-xs font-bold tracking-wide ${
              won ? 'text-primary/70' : lost ? 'text-error/70' : 'text-on-surface-variant'
            }`}>
              {scoreString}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
