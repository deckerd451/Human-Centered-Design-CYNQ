import { User, Idea, Team } from './types';
// Mock Data
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Innovator',
    username: 'alex_innovator',
    avatarUrl: 'https://github.com/shadcn.png',
    bio: 'Building the future.',
    skills: ['React', 'TypeScript', 'Go'],
    interests: ['AI', 'Serverless'],
  },
  {
    id: 'user-2',
    name: 'Bella Builder',
    username: 'bella_builder',
    avatarUrl: 'https://uifaces.co/our-content/donated/xP_Yp-HO.jpg',
    bio: 'Designer and frontend expert.',
    skills: ['Figma', 'UI/UX', 'React'],
    interests: ['Design Systems', 'Accessibility'],
  },
  {
    id: 'user-3',
    name: 'Charlie Coder',
    username: 'charlie_coder',
    avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    bio: 'Backend and infrastructure guru.',
    skills: ['Go', 'Python', 'Kubernetes'],
    interests: ['Distributed Systems', 'DevOps'],
  },
];
const mockIdeas: Idea[] = [
  {
    id: 'idea-1',
    title: 'AI-Powered Code Review Assistant',
    description: 'An intelligent assistant that automatically reviews pull requests, suggests improvements, and identifies potential bugs.',
    tags: ['AI', 'Developer Tools', 'Productivity'],
    authorId: 'user-1',
    upvotes: 128,
    createdAt: '2 days ago',
  },
  {
    id: 'idea-2',
    title: 'Decentralized Social Media Platform',
    description: 'A social network where users own their data and content, built on a peer-to-peer network.',
    tags: ['Web3', 'Social Media', 'Decentralization'],
    authorId: 'user-2',
    upvotes: 95,
    createdAt: '5 days ago',
  },
  {
    id: 'idea-3',
    title: 'Real-time Collaborative Design Tool',
    description: 'A web-based design tool like Figma, but with a focus on real-time collaboration and version control for design systems.',
    tags: ['Design', 'SaaS', 'Collaboration'],
    authorId: 'user-2',
    upvotes: 210,
    createdAt: '1 week ago',
  },
  {
    id: 'idea-4',
    title: 'Gamified Language Learning App',
    description: 'An app that uses game mechanics and storytelling to make learning a new language more engaging and effective.',
    tags: ['Education', 'Mobile', 'Gamification'],
    authorId: 'user-3',
    upvotes: 72,
    createdAt: '1 week ago',
  },
];
const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Code-AI',
    mission: 'To revolutionize code reviews with artificial intelligence.',
    ideaId: 'idea-1',
    members: ['user-1', 'user-3'],
  },
  {
    id: 'team-2',
    name: 'DesignVerse',
    mission: 'Building the next generation of collaborative design tools.',
    ideaId: 'idea-3',
    members: ['user-2'],
  },
];
// Mock API Functions
const simulateDelay = <T>(data: T, delay = 500): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));
export const getIdeas = (): Promise<Idea[]> => simulateDelay(mockIdeas);
export const getTeams = (): Promise<Team[]> => simulateDelay(mockTeams);
export const getUsers = (): Promise<User[]> => simulateDelay(mockUsers);
export const getLeaderboardData = (): Promise<{ users: User[], ideas: Idea[] }> =>
  simulateDelay({
    users: mockUsers.sort((a, b) => b.skills.length - a.skills.length),
    ideas: mockIdeas.sort((a, b) => b.upvotes - a.upvotes),
  });