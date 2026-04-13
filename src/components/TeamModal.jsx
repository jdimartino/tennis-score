import { useState } from 'react';
import { useLocalTeams, useVisitingTeams, getLeagueLabel, getLeagueDetail } from '../hooks/useLocalTeams';

// ────────────────── Reusable Team Row ──────────────────

function TeamRow({ team, accentClass, onDelete, onEdit, leagueSelector }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const [editLeague, setEditLeague] = useState(team.league ?? null);

  const handleSave = () => {
    if (editName.trim()) {
      onEdit(team.id, editName, editLeague);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2 border border-primary/30">
        <input
          className="w-full bg-surface-container-low rounded-lg py-2 px-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          onKeyUp={e => e.key === 'Enter' && handleSave()}
          autoFocus
        />
        {leagueSelector && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditLeague('tol')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] lexend font-bold uppercase tracking-wider transition-all ${
                editLeague === 'tol' ? 'bg-primary text-background' : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              TOL<span className="block text-[9px] font-normal normal-case opacity-80">5 Dobles</span>
            </button>
            <button
              onClick={() => setEditLeague('cta')}
              className={`flex-1 py-1.5 rounded-lg text-[11px] lexend font-bold uppercase tracking-wider transition-all ${
                editLeague === 'cta' ? 'bg-secondary text-background' : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              CTA<span className="block text-[9px] font-normal normal-case opacity-80">4D + 1S</span>
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-primary text-background py-2 rounded-lg text-xs lexend font-bold active:scale-95"
          >
            Guardar
          </button>
          <button
            onClick={() => { setEditing(false); setEditName(team.name); setEditLeague(team.league ?? null); }}
            className="flex-1 bg-surface-container-low text-on-surface-variant py-2 rounded-lg text-xs lexend font-bold active:scale-95"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-xl transition-colors group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className={`material-symbols-outlined text-sm ${accentClass}/40`}>sports_tennis</span>
        <div className="min-w-0">
          <span className="font-medium text-on-surface text-sm truncate block">{team.name}</span>
          {team.league && (
            <span className={`text-[10px] font-bold uppercase tracking-wider ${accentClass}/70`}>
              {getLeagueLabel(team.league)} · {getLeagueDetail(team.league)}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 ml-2">
        <button
          onClick={() => setEditing(true)}
          className="text-on-surface-variant hover:text-primary p-1.5 rounded-lg transition-all hover:bg-primary/10"
          title="Editar"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
        </button>
        <button
          onClick={() => onDelete(team.id)}
          className="text-error opacity-70 hover:opacity-100 hover:bg-error-container/20 p-1.5 rounded-lg transition-all"
          title="Eliminar"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
        </button>
      </div>
    </div>
  );
}

// ────────────────── Add Team Row ──────────────────

function AddTeamRow({ onAdd, showLeague = false, defaultLeague = 'tol', isPrimary = true }) {
  const [name, setName] = useState('');
  const [league, setLeague] = useState(defaultLeague);

  const handleAdd = () => {
    if (onAdd(name, league)) setName('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          className="flex-1 bg-surface-container-low border-none rounded-xl py-3 px-4 text-on-surface placeholder-on-surface-variant/40 focus:ring-2 focus:ring-primary outline-none text-sm"
          placeholder="Nombre del equipo..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyUp={e => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className={`p-3 rounded-xl hover:opacity-90 transition-opacity active:scale-95 text-background ${isPrimary ? 'bg-primary' : 'bg-secondary'}`}
        >
          <span className="material-symbols-outlined font-bold">add</span>
        </button>
      </div>
      {showLeague && (
        <div className="flex gap-2">
          <button
            onClick={() => setLeague('tol')}
            className={`flex-1 py-2 rounded-xl text-xs lexend font-bold uppercase tracking-wider transition-all ${
              league === 'tol' ? 'bg-primary text-background' : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            TOL<span className="block text-[10px] font-normal normal-case mt-0.5 opacity-80">5 Dobles</span>
          </button>
          <button
            onClick={() => setLeague('cta')}
            className={`flex-1 py-2 rounded-xl text-xs lexend font-bold uppercase tracking-wider transition-all ${
              league === 'cta' ? 'bg-secondary text-background' : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            CTA<span className="block text-[10px] font-normal normal-case mt-0.5 opacity-80">4D + 1S</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ────────────────── Main Modal ──────────────────

export function TeamModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('local'); // 'local' | 'visiting'
  const {
    teams: localTeams,
    addTeam: addLocal,
    removeTeam: removeLocal,
    editTeam: editLocal,
  } = useLocalTeams();

  const {
    teams: visitingTeams,
    addTeam: addVisiting,
    removeTeam: removeVisiting,
    editTeam: editVisiting,
  } = useVisitingTeams();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
      <div className="bg-surface-container-high w-full max-w-sm rounded-3xl shadow-2xl border border-white/5 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="lexend text-xl font-extrabold text-on-surface">Mis Equipos</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 mb-4">
          <button
            onClick={() => setTab('local')}
            className={`flex-1 py-2.5 rounded-xl text-xs lexend font-bold uppercase tracking-wider transition-all ${
              tab === 'local' ? 'bg-primary text-background shadow-[0_4px_12px_rgba(63,255,139,0.25)]' : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined block mx-auto mb-1" style={{ fontSize: '18px' }}>shield</span>
            Mis Equipos
          </button>
          <button
            onClick={() => setTab('visiting')}
            className={`flex-1 py-2.5 rounded-xl text-xs lexend font-bold uppercase tracking-wider transition-all ${
              tab === 'visiting' ? 'bg-secondary text-background shadow-[0_4px_12px_rgba(254,179,0,0.25)]' : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined block mx-auto mb-1" style={{ fontSize: '18px' }}>groups</span>
            Rivales
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-2">
          {tab === 'local' ? (
            <div className="flex flex-col gap-3">
              <AddTeamRow
                onAdd={(name, league) => addLocal(name, league)}
                showLeague
                defaultLeague="tol"
                isPrimary={true}
              />
              <div className="space-y-2 mt-2">
                {localTeams.length === 0 && (
                  <p className="text-center text-on-surface-variant text-xs py-4 opacity-60">Sin equipos registrados</p>
                )}
                {localTeams.map(team => (
                  <TeamRow
                    key={team.id}
                    team={team}
                    accentClass="text-primary"
                    onDelete={removeLocal}
                    onEdit={(id, name, league) => editLocal(id, name, league)}
                    leagueSelector
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AddTeamRow
                onAdd={(name) => addVisiting(name)}
                showLeague={false}
                isPrimary={false}
              />
              <div className="space-y-2 mt-2">
                {visitingTeams.length === 0 && (
                  <p className="text-center text-on-surface-variant text-xs py-4 opacity-60">Sin rivales registrados</p>
                )}
                {visitingTeams.map(team => (
                  <TeamRow
                    key={team.id}
                    team={team}
                    accentClass="text-secondary"
                    onDelete={removeVisiting}
                    onEdit={(id, name) => editVisiting(id, name)}
                    leagueSelector={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4">
          <button
            onClick={onClose}
            className="w-full bg-surface-container-low text-on-surface-variant lexend font-bold py-3 rounded-xl hover:bg-surface-container-low transition-colors"
          >
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
}
