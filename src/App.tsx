import { useEffect } from 'react';
import { Lobby } from './components/Lobby';
import { Room } from './components/Room';
import { ThemeToggle } from './components/ThemeToggle';
import { useHashRoute } from './hooks/useHashRoute';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

export default function App() {
  const { roomId, goToLobby, goToRoom } = useHashRoute();
  const [name, setName] = useLocalStorage('scrumpoint:name');
  const [, setLastRoom] = useLocalStorage('scrumpoint:lastRoom');

  useEffect(() => {
    if (roomId) setLastRoom(roomId);
  }, [roomId, setLastRoom]);

  const view = !roomId || !name.trim() ? (
    <Lobby
      initialRoom={roomId}
      onJoin={(id, n) => {
        setName(n);
        goToRoom(id);
      }}
    />
  ) : (
    <Room roomId={roomId} name={name} onLeave={goToLobby} />
  );

  return (
    <>
      <ThemeToggle />
      {view}
    </>
  );
}
