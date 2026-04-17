export type Player = {
  name: string;
  vote: string | null;
  joinedAt: number;
};

export type RoomState = {
  revealed: boolean;
  players: Record<string, Player>;
};

export const CARD_DECK = ['0', '0.5', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];
