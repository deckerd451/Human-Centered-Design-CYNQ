import { create } from 'zustand';
import { User } from '@shared/types';
import { updateCurrentUser, sendMagicLink as apiSendMagicLink, verifyMagicToken } from '@/lib/apiClient';
type AuthState = 'disconnected' | 'awaitingMagicLink' | 'authenticating' | 'connected';
interface AuthStore {
  authState: AuthState;
  user: User | null;
  sendMagicLink: (email: string) => Promise<void>;
  verifyTokenAndLogin: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  connectGitHub: () => Promise<void>;
  disconnectGitHub: () => void;
}
export const useAuthStore = create<AuthStore>((set, get) => ({
  authState: 'disconnected',
  user: null,
  sendMagicLink: async (email: string) => {
    await apiSendMagicLink(email);
    set({ authState: 'awaitingMagicLink' });
  },
  verifyTokenAndLogin: async (token: string) => {
    set({ authState: 'authenticating' });
    try {
      const user = await verifyMagicToken(token);
      set({ authState: 'connected', user });
    } catch (error) {
      console.error("Magic link verification failed:", error);
      set({ authState: 'disconnected', user: null });
      throw error;
    }
  },
  logout: () => {
    set({ authState: 'disconnected', user: null });
  },
  updateUser: async (data) => {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    const previousUser = currentUser;
    set({ user: { ...currentUser, ...data } });
    try {
      const updatedUser = await updateCurrentUser(currentUser.id, data);
      set({ user: updatedUser });
    } catch (error) {
      console.error("Failed to update user profile:", error);
      set({ user: previousUser });
      throw error;
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