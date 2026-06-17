import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, BottomNav } from '../components/Layout';
import { TeamModal } from '../components/TeamModal';
import { useLocalTeams, useVisitingTeams, getLeagueLabel, getLeagueDetail } from '../hooks/useLocalTeams';

export default function Configuracion() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { teams: localTeams, reload: reloadLocal } = useLocalTeams();
  const { teams: visitingTeams, reload: reloadVisiting } = useVisitingTeams();
  const [selectedLocalTeamName, setSelectedLocalTeamName] = useState('');
  const [selectedVisitingTeam, setSelectedVisitingTeam] = useState('');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  // Keep selectedLocalTeamName in sync with teams list
  useEffect(() => {
    if (localTeams.length === 0) return;
    if (!localTeams.some(t => t.name === selectedLocalTeamName)) {
      setSelectedLocalTeamName(localTeams[0].name);
    }
  }, [localTeams, selectedLocalTeamName]);

  // Keep selectedVisitingTeam in sync with visiting teams list
  useEffect(() => {
    if (visitingTeams.length === 0) return;
    if (!visitingTeams.some(t => t.name === selectedVisitingTeam)) {
      setSelectedVisitingTeam(visitingTeams[0].name);
    }
  }, [visitingTeams, selectedVisitingTeam]);

  const selectedTeam = localTeams.find(t => t.name === selectedLocalTeamName);

  const handleCloseModal = () => {
    setShowAddModal(false);
    reloadLocal();
    reloadVisiting();
  };

  const handleConfigure = () => {
    if (!selectedTeam || !selectedVisitingTeam) return;
    navigate('/configurar-jornada', {
      state: {
        myTeam: { name: selectedTeam.name, league: selectedTeam.league },
        visitingTeam: selectedVisitingTeam,
        date: matchDate,
      }
    });
  };

  const leagueInfo = selectedTeam?.league === 'cta'
    ? { label: 'Liga CTA', detail: '4 Dobles + 1 Singles', color: 'text-secondary', bg: 'bg-secondary/10' }
    : selectedTeam?.league === 'mixtos'
    ? { label: 'Liga Mixtos', detail: '3 Dobles', color: 'text-team', bg: 'bg-team/10' }
    : { label: 'Liga TOL', detail: '5 Dobles', color: 'text-primary', bg: 'bg-primary/10' };

  return (
    <div className="min-h-screen bg-background pb-32 font-sans text-on-surface">
      <Header />

      <main className="px-6 flex flex-col gap-6 -mt-2">
        <div className="flex items-center justify-between">
          <h2 className="lexend text-2xl font-black text-white">Nueva Jornada</h2>
          <span className="material-symbols-outlined text-on-surface-variant p-2 bg-surface-container-high rounded-full w-10 h-10 flex items-center justify-center">tune</span>
        </div>

        {/* Configuration Form Card */}
        <div className="bg-surface-container-high rounded-[2rem] p-6 shadow-2xl border border-white/5 flex flex-col gap-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>

          {/* My Team */}
          <section className="relative z-10 flex flex-col gap-3">
            <div className="flex justify-between items-end mb-1">
              <label className="lexend text-xs font-bold text-primary uppercase tracking-widest">Mi Equipo</label>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-[10px] text-on-surface-variant hover:text-white flex items-center gap-1 bg-surface-container-highest px-3 py-1.5 rounded-full transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                Administrar
              </button>
            </div>
            <div className="relative">
              <select
                className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 text-on-surface lexend font-semibold text-lg focus:ring-2 focus:ring-primary appearance-none cursor-pointer outline-none"
                value={selectedLocalTeamName}
                onChange={(e) => setSelectedLocalTeamName(e.target.value)}
              >
                {localTeams.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
            {/* League badge */}
            {selectedTeam && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${leagueInfo.bg} w-fit`}>
                <span className="material-symbols-outlined text-sm" style={{ fontSize: '16px', color: 'inherit' }}>sports_tennis</span>
                <span className={`lexend text-xs font-bold ${leagueInfo.color}`}>
                  {leagueInfo.label} · {leagueInfo.detail}
                </span>
              </div>
            )}
          </section>

          {/* Visiting Team */}
          <section className="relative z-10 flex flex-col gap-3">
            <div className="flex justify-between items-end mb-1">
              <label className="lexend text-xs font-bold text-secondary uppercase tracking-widest">Equipo Rival</label>
              <button
                onClick={() => { setShowAddModal(true); }}
                className="text-[10px] text-on-surface-variant hover:text-white flex items-center gap-1 bg-surface-container-highest px-3 py-1.5 rounded-full transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                Administrar
              </button>
            </div>
            <div className="relative">
              <select
                className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 text-on-surface lexend font-semibold text-lg focus:ring-2 focus:ring-secondary appearance-none cursor-pointer outline-none"
                value={selectedVisitingTeam}
                onChange={(e) => setSelectedVisitingTeam(e.target.value)}
              >
                {visitingTeams.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </section>

          {/* Date */}
          <section className="relative z-10 flex flex-col gap-3">
            <label className="lexend text-xs font-bold text-on-surface-variant uppercase tracking-widest">Fecha del Partido</label>
            <input
              className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-on-surface lexend font-semibold text-sm focus:ring-2 focus:ring-primary appearance-none outline-none"
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
            />
          </section>
        </div>

        {/* Action Button */}
        <div className="mt-2 mb-12">
          <button
            onClick={handleConfigure}
            disabled={!selectedTeam || !selectedVisitingTeam}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container lexend font-black text-xl py-5 rounded-2xl shadow-[0_10px_30px_rgba(63,255,139,0.3)] hover:shadow-[0_15px_40px_rgba(63,255,139,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CONFIGURAR JORNADA
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
          </button>
          <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-[0.2em] mt-4 opacity-60">
            {selectedTeam ? `${leagueInfo.detail} · ${selectedVisitingTeam}` : 'Selecciona tu equipo para continuar'}
          </p>
        </div>
      </main>

      <BottomNav />
      <TeamModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}
