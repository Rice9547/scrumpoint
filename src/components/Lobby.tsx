import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Props = {
  initialRoom?: string | null;
  onJoin: (roomId: string, name: string) => void;
};

function randomRoomId() {
  return Math.random().toString(36).slice(2, 8);
}

export function Lobby({ initialRoom, onJoin }: Props) {
  const [name, setName] = useLocalStorage('scrumpoint:name');
  const [lastRoom] = useLocalStorage('scrumpoint:lastRoom');
  const [roomId, setRoomId] = useState(initialRoom || lastRoom);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const r = roomId.trim();
    if (!n || !r) return;
    onJoin(r, n);
  };

  const createNew = () => {
    const n = name.trim();
    if (!n) return;
    onJoin(randomRoomId(), n);
  };

  return (
    <div className="lobby">
      <div className="lobby-head">
        <h1 className="lobby-title grad-title">Scrum Poker</h1>
        <p className="lobby-subtitle">輕量估點，開房就估</p>
      </div>
      <form onSubmit={submit} className="lobby-card">
        <div className="field">
          <label htmlFor="lobby-name">你的名字</label>
          <input
            id="lobby-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：Rice"
            maxLength={30}
          />
        </div>
        <div className="field">
          <label htmlFor="lobby-room">房號</label>
          <input
            id="lobby-room"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder={lastRoom || '輸入或開新房'}
            maxLength={40}
          />
        </div>
        <div className="lobby-actions">
          <button
            type="submit"
            className="btn btn-full"
            disabled={!name.trim() || !roomId.trim()}
          >
            進入房間
          </button>
          <button
            type="button"
            className="btn btn-outline btn-full"
            onClick={createNew}
            disabled={!name.trim()}
          >
            開新房
          </button>
        </div>
      </form>
    </div>
  );
}
