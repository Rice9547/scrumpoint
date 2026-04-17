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
  const avg =
    numeric.length > 0
      ? numeric.reduce((a, b) => a + b, 0) / numeric.length
      : null;
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
  const votedCount = players.filter((p) => p.vote !== null).length;
  const allVoted = players.length > 0 && votedCount === players.length;

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
    <div className="page">
      <header className="room-header">
        <div>
          <div className="room-label">Room</div>
          <div className="room-id-row">
            <span className="room-id">{roomId}</span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={copyLink}
              title="複製邀請連結"
            >
              複製連結
            </button>
          </div>
        </div>
        <button type="button" className="btn btn-danger-outline" onClick={onLeave}>
          離開
        </button>
      </header>

      <section className="table">
        <h2 className="table-title grad-title">
          {revealed
            ? '翻牌結果'
            : `${votedCount} / ${players.length} 已投票`}
        </h2>

        <div className="players-grid">
          {players.map((p) => {
            const hasVote = p.vote !== null;
            const flipped = revealed && hasVote;
            return (
              <div
                key={p.id}
                className={`player ${p.id === playerId ? 'me' : ''}`}
              >
                <div className={`pcard ${flipped ? 'revealed' : ''}`}>
                  <div className="pcard-inner">
                    <div className={`pcard-back ${hasVote ? '' : 'waiting'}`}>
                      {hasVote ? '?' : '…'}
                    </div>
                    <div className="pcard-front">{p.vote ?? ''}</div>
                  </div>
                </div>
                <div className="player-name">{p.name}</div>
              </div>
            );
          })}
        </div>

        {stats && (
          <div className="stats">
            {stats.avg !== null && (
              <div className="stat-item">
                <div className="stat-label">平均</div>
                <div className="stat-value">{stats.avg.toFixed(1)}</div>
              </div>
            )}
            <div className="stat-item">
              <div className="stat-label">分布</div>
              <div className="stat-tags">
                {stats.top.map(([v, n]) => (
                  <span key={v} className="tag">
                    {v} × {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="deck">
        <div className="deck-title">選張卡</div>
        <div className="deck-grid">
          {CARD_DECK.map((c) => (
            <button
              key={c}
              type="button"
              className={`deck-card ${myVote === c ? 'selected' : ''}`}
              onClick={() => vote(c)}
              disabled={revealed}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="deck-controls">
          {!revealed ? (
            <button
              type="button"
              className="btn"
              onClick={reveal}
              disabled={!allVoted}
            >
              {allVoted ? '翻牌' : '等所有人投票'}
            </button>
          ) : (
            <button type="button" className="btn btn-outline" onClick={reset}>
              開新一輪
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
