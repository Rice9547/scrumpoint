import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Props = {
  onJoin: (roomId: string, name: string) => void;
};

function randomRoomId() {
  return Math.random().toString(36).slice(2, 8);
}

export function Lobby({ onJoin }: Props) {
  const [name, setName] = useLocalStorage('scrumpoint:name');
  const [lastRoom] = useLocalStorage('scrumpoint:lastRoom');
  const [roomId, setRoomId] = useState(lastRoom);

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
      <h1>scrumpoint</h1>
      <p className="tagline">輕量估點，開房就估。</p>
      <form onSubmit={submit} className="card">
        <label>
          你的名字
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：Rice"
            maxLength={30}
          />
        </label>
        <label>
          房號
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder={lastRoom || '輸入或開新房'}
            maxLength={40}
          />
        </label>
        <div className="row">
          <button type="submit" disabled={!name.trim() || !roomId.trim()}>
            進入房間
          </button>
          <button type="button" className="secondary" onClick={createNew} disabled={!name.trim()}>
            開新房
          </button>
        </div>
      </form>
    </div>
  );
}
