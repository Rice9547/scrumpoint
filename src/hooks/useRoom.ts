import { useEffect, useState } from 'react';
import {
  onDisconnect,
  onValue,
  ref,
  remove,
  set,
  update,
} from 'firebase/database';
import { db } from '../firebase';
import type { Player, RoomState } from '../types';

function getOrCreatePlayerId(): string {
  const KEY = 'scrumpoint:playerId';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

export function useRoom(roomId: string, name: string) {
  const [state, setState] = useState<RoomState | null>(null);
  const [playerId] = useState(getOrCreatePlayerId);

  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`);
    const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);

    const player: Player = {
      name,
      vote: null,
      joinedAt: Date.now(),
    };
    set(playerRef, player);
    onDisconnect(playerRef).remove();

    const unsub = onValue(roomRef, (snap) => {
      const raw = snap.val() as RoomState | null;
      setState({
        revealed: raw?.revealed ?? false,
        players: raw?.players ?? {},
      });
    });

    return () => {
      unsub();
      remove(playerRef);
    };
  }, [roomId, name, playerId]);

  const vote = (value: string) => {
    update(ref(db, `rooms/${roomId}/players/${playerId}`), { vote: value });
  };

  const reveal = () => {
    set(ref(db, `rooms/${roomId}/revealed`), true);
  };

  const reset = () => {
    const players = state?.players ?? {};
    const updates: Record<string, unknown> = { revealed: false };
    for (const id of Object.keys(players)) {
      updates[`players/${id}/vote`] = null;
    }
    update(ref(db, `rooms/${roomId}`), updates);
  };

  return { state, playerId, vote, reveal, reset };
}
