import { create } from 'zustand';
import { User } from '@/lib/types';
type AuthState = 'disconnected' | 'connecting' | 'connected';
interface AuthStore {
  authState: AuthState;
  user: User | null;
  login: () => void;
  logout: () => void;
}
const mockUser: User = {
  id: 'user-1',
  name: 'Alex Innovator',
  username: 'alex_innovator',
  avatarUrl: 'https://github.com/shadcn.png',
  bio: 'Passionate about building the future, one idea at a time. Full-stack developer with a love for serverless tech.',
  skills: ['React', 'TypeScript', 'Node.js', 'Cloudflare Workers', 'Go'],
  interests: ['AI/ML', 'Decentralized Systems', 'UX Design'],
};
export const useAuthStore = create<AuthStore>((set) => ({
  authState: 'disconnected',
  user: null,
  login: () => {
    set({ authState: 'connecting' });
    setTimeout(() => {
      set({ authState: 'connected', user: mockUser });
    }, 1500); // Simulate a 1.5-second login flow
  },
  logout: () => {
    set({ authState: 'disconnected', user: null });
  },
}));