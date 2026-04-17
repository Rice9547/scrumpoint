import { useMemo } from 'react';
import { useRoom } from '../hooks/useRoom';
import { CARD_DECK } from '../types';

type Props = {
  roomId: string;
  name: string;
  onLeave: () => void;
};

function computeStats(votes: string[]) {
  const numeric = votes
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
  if (!numeric.length) return null;
  const avg = numeric.reduce((a, b) => a + b, 0) / numeric.length;
  const counts = new Map<string, number>();
  for (const v of votes) counts.set(v, (counts.get(v) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return { avg, top };
}

export function Room({ roomId, name, onLeave }: Props) {
  const { state, playerId, vote, reveal, reset } = useRoom(roomId, name);

  const players = useMemo(() => {
    if (!state) return [];
    return Object.entries(state.players)
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => a.joinedAt - b.joinedAt);
  }, [state]);

  const myVote = state?.players[playerId]?.vote ?? null;
  const revealed = state?.revealed ?? false;
  const allVoted = players.length > 0 && players.every((p) => p.vote !== null);

  const votes = players
    .map((p) => p.vote)
    .filter((v): v is string => v !== null);
  const stats = revealed ? computeStats(votes) : null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // clipboard may not be available
    }
  };

  return (
    <div className="room">
      <header className="room-header">
        <div>
          <h2>房號 · <span className="mono">{roomId}</span></h2>
          <button className="link" onClick={copyLink}>複製邀請連結</button>
        </div>
        <button className="secondary" onClick={onLeave}>離開</button>
      </header>

      <section className="players">
        <h3>參與者 ({players.length})</h3>
        <ul>
          {players.map((p) => (
            <li key={p.id} className={p.id === playerId ? 'me' : ''}>
              <span className="name">{p.name}{p.id === playerId && ' (你)'}</span>
              <span className={`vote ${p.vote ? 'voted' : 'waiting'}`}>
                {revealed ? (p.vote ?? '—') : p.vote ? '✓' : '…'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="deck">
        <h3>選張卡</h3>
        <div className="cards">
          {CARD_DECK.map((c) => (
            <button
              key={c}
              className={`card-btn ${myVote === c ? 'selected' : ''}`}
              onClick={() => vote(c)}
              disabled={revealed}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="controls">
        {!revealed ? (
          <button onClick={reveal} disabled={!allVoted}>
            {allVoted ? '翻牌' : '等所有人投票'}
          </button>
        ) : (
          <button onClick={reset}>開新一輪</button>
        )}
      </section>

      {stats && (
        <section className="stats">
          <div>平均：<strong>{stats.avg.toFixed(1)}</strong></div>
          <div>
            分布：
            {stats.top.map(([v, n]) => (
              <span key={v} className="tag">{v} × {n}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
