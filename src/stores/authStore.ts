import { create } from 'zustand';
import { User } from '@shared/types';
import { updateCurrentUser } from '@/lib/apiClient';
type AuthState = 'disconnected' | 'connecting' | 'connected';
interface AuthStore {
  authState: AuthState;
  user: User | null;
  login: () => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  connectGitHub: () => Promise<void>;
  disconnectGitHub: () => void;
}
const mockUser: User = {
  id: 'user-1',
  name: 'Alex Innovator',
  username: 'alex_innovator',
  avatarUrl: 'https://github.com/shadcn.png',
  bio: 'Passionate about building the future, one idea at a time. Full-stack developer with a love for serverless tech.',
  skills: ['React', 'TypeScript', 'Node.js', 'Cloudflare Workers', 'Go'],
  interests: ['AI/ML', 'Decentralized Systems', 'UX Design'],
  githubUsername: 'alex-innovator',
  githubStats: {
    repos: 42,
    followers: 1200,
    following: 150,
  },
};
export const useAuthStore = create<AuthStore>((set, get) => ({
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
  updateUser: async (data) => {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    // Optimistic update
    const previousUser = currentUser;
    set({ user: { ...currentUser, ...data } });
    try {
      // Persist changes to the backend
      const updatedUser = await updateCurrentUser(currentUser.id, data);
      // Sync with the backend response
      set({ user: updatedUser });
    } catch (error) {
      console.error("Failed to update user profile:", error);
      // Rollback on failure
      set({ user: previousUser });
      throw error; // Re-throw to be caught by the form handler
    }
  },
  connectGitHub: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        set((state) => {
          if (state.user) {
            return {
              user: {
                ...state.user,
                githubUsername: 'alex-innovator',
                githubStats: { repos: 42, followers: 1200, following: 150 },
              },
            };
          }
          return {};
        });
        resolve();
      }, 1000);
    });
  },
  disconnectGitHub: () => {
    set((state) => {
      if (state.user) {
        const { githubUsername, githubStats, ...rest } = state.user;
        return { user: rest };
      }
      return {};
    });
  },
}));