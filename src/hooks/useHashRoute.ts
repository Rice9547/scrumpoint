import { useEffect, useState } from 'react';

export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const match = hash.match(/^#\/room\/([^/?#]+)/);
  const roomId = match ? decodeURIComponent(match[1]) : null;

  return {
    roomId,
    goToLobby: () => {
      window.location.hash = '';
    },
    goToRoom: (id: string) => {
      window.location.hash = `/room/${encodeURIComponent(id)}`;
    },
  };
}
