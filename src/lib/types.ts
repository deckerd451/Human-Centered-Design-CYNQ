export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  interests: string[];
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
  members: string[]; // Array of user IDs
}