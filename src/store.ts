import { create } from 'zustand';

type GameState = {
  status: 'start' | 'playing' | 'gameover';
  gameId: number;
  score: number;
  color: number; // 0: Pink/Red, 1: Yellow
  speed: number;
  setStatus: (status: 'start' | 'playing' | 'gameover') => void;
  reset: () => void;
  switchColor: () => void;
  incScore: (val: number) => void;
  incSpeed: () => void;
};

export const COLORS = ['#ff2a6d', '#ffd700']; // Pink, Yellow

export const useGameStore = create<GameState>((set) => ({
  status: 'start',
  gameId: 0,
  score: 0,
  color: 0,
  speed: 12,
  setStatus: (status) => set({ status }),
  reset: () => set((state) => ({ status: 'playing', gameId: state.gameId + 1, score: 0, color: 0, speed: 12 })),
  switchColor: () => set((state) => ({ color: state.color === 0 ? 1 : 0 })),
  incScore: (val) => set((state) => ({ score: state.score + val })),
  incSpeed: () => set((state) => ({ speed: Math.min(state.speed + 0.05, 25) })),
}));
