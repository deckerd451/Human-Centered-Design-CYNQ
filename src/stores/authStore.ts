import { create } from 'zustand';
import { User } from '@shared/types';
import { updateCurrentUser } from '@/lib/apiClient';
type AuthState = 'disconnected' | 'awaitingMagicLink' | 'authenticating' | 'connected';
interface AuthStore {
  authState: AuthState;
  user: User | null;
  magicLinkToken: string | null;
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
  magicLinkToken: null,
  sendMagicLink: async (email: string) => {
    set({ authState: 'awaitingMagicLink' });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const token = `demo-token-for-${email}`;
    set({ magicLinkToken: token });
  },
  verifyTokenAndLogin: async (token: string) => {
    set({ authState: 'authenticating' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (token.startsWith('demo-token-for-')) {
      const email = token.replace('demo-token-for-', '');
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      const mockUser: User = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        username: username,
        email: email,
        avatarUrl: `https://api.dicebear.com/8.x/lorelei/svg?seed=${username}`,
        bio: 'A passionate innovator exploring new ideas and technologies.',
        skills: ['React', 'TypeScript', 'Node.js'],
        interests: ['AI', 'Web Development', 'Design'],
      };
      set({ authState: 'connected', user: mockUser, magicLinkToken: null });
    } else {
      console.error("Magic link verification failed: Invalid token");
      set({ authState: 'disconnected', user: null, magicLinkToken: null });
      throw new Error("Invalid or expired token");
    }
  },
  logout: () => {
    set({ authState: 'disconnected', user: null, magicLinkToken: null });
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
      set(state => ({ user: state.user ? { ...state.user, ...updatedUser } : null }));
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