import { create } from 'zustand';
type AuthState = 'disconnected' | 'connecting' | 'connected';
interface UserProfile {
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  repos: number;
  followers: number;
  following: number;
}
interface AuthStore {
  authState: AuthState;
  user: UserProfile | null;
  connect: () => void;
  disconnect: () => void;
}
const mockUser: UserProfile = {
  name: 'Jane Doe',
  username: 'janedoe',
  avatarUrl: 'https://github.com/shadcn.png',
  bio: 'Building beautiful and reliable web experiences.',
  repos: 128,
  followers: 2048,
  following: 256,
};
export const useAuthStore = create<AuthStore>((set) => ({
  authState: 'disconnected',
  user: null,
  connect: () => {
    set({ authState: 'connecting' });
    setTimeout(() => {
      set({ authState: 'connected', user: mockUser });
    }, 2000); // Simulate a 2-second OAuth flow
  },
  disconnect: () => {
    set({ authState: 'disconnected', user: null });
  },
}));