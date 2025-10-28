export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
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
export interface Task {
  id: string;
  content: string;
}
export interface BoardColumn {
  id: string;
  title: string;
  tasks: Task[];
}
export interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  authorId: string;
  upvotes: number;
  createdAt: string; // ISO 8601 date string
  skillsNeeded: string[];
  repoUrl?: string;
  projectBoard?: {
    columns: BoardColumn[];
  };
}
export interface Team {
  id: string;
  name: string;
  mission: string;
  ideaId: string;
  members: string[]; // array of user IDs
  joinRequests: string[]; // array of user IDs
}
export interface Comment {
  id: string;
  ideaId: string;
  authorId: string;
  content: string;
  createdAt: string; // ISO 8601 date string
}
export interface Notification {
  id: string;
  userId: string; // The user who receives the notification
  type: 'new_comment' | 'idea_upvote' | 'join_request' | 'join_request_accepted' | 'join_request_declined';
  message: string;
  link: string; // e.g., /idea/idea-1
  createdAt: string; // ISO 8601 date string
  read: boolean;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}