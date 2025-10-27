export interface Repository {
  id: number;
  name: string;
  description: string;
  language: 'TypeScript' | 'JavaScript' | 'Go' | 'CSS' | 'HTML' | 'Python';
  stars: number;
  forks: number;
  url: string;
  lastUpdate: string;
  isPrivate: boolean;
}
export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}