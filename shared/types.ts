export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  interests: string[];
  githubUsername?: string;
  githubStats?: {
    repos: number;
    followers: number;
    following: number;
  };
}
export interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  authorId: string;
  upvotes: number;
  createdAt: string;
  skillsNeeded: string[];
}
export interface Team {
  id: string;
  name: string;
  mission: string;
  ideaId: string;
  members: string[]; // array of user IDs
}
export interface Comment {
  id: string;
  ideaId: string;
  authorId: string;
  content: string;
  createdAt: string;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}