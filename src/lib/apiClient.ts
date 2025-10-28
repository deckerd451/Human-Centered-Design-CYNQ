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
  {
    id: 'user-4',
    name: 'Dana Designer',
    username: 'dana_designer',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Crafting beautiful and intuitive user experiences.',
    skills: ['UI/UX Design', 'Figma', 'Prototyping', 'CSS'],
    interests: ['Design Systems', 'Microinteractions'],
  },
  {
    id: 'user-5',
    name: 'Evan Engineer',
    username: 'evan_engineer',
    avatarUrl: 'https://randomuser.me/api/portraits/men/43.jpg',
    bio: 'DevOps and cloud infrastructure specialist.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    interests: ['Scalability', 'Site Reliability', 'Automation'],
  },
];
const mockIdeas: Idea[] = [
  {
    id: 'idea-1',
    title: 'AI-Powered Code Review Assistant',
    description: 'An intelligent assistant that automatically reviews pull requests, suggests improvements, and identifies potential bugs. It integrates with GitHub, GitLab, and Bitbucket to provide seamless feedback within the developer workflow. The AI model is trained on a massive dataset of open-source code to understand context, coding patterns, and best practices.',
    tags: ['AI', 'Developer Tools', 'Productivity'],
    authorId: 'user-1',
    upvotes: 128,
    createdAt: '2 days ago',
    skillsNeeded: ['Python', 'Machine Learning', 'Go'],
  },
  {
    id: 'idea-2',
    title: 'Decentralized Social Media Platform',
    description: 'A social network where users own their data and content, built on a peer-to-peer network. It aims to create a censorship-resistant environment where creators are directly rewarded for their contributions through a native token economy.',
    tags: ['Web3', 'Social Media', 'Decentralization'],
    authorId: 'user-2',
    upvotes: 95,
    createdAt: '5 days ago',
    skillsNeeded: ['TypeScript', 'Go', 'P2P Networking'],
  },
  {
    id: 'idea-3',
    title: 'Real-time Collaborative Design Tool',
    description: 'A web-based design tool like Figma, but with a focus on real-time collaboration and version control for design systems. It will feature component-based design, live multiplayer editing, and powerful developer handoff tools.',
    tags: ['Design', 'SaaS', 'Collaboration'],
    authorId: 'user-2',
    upvotes: 210,
    createdAt: '1 week ago',
    skillsNeeded: ['React', 'UI/UX Design', 'WebSockets'],
  },
  {
    id: 'idea-4',
    title: 'Gamified Language Learning App',
    description: 'An app that uses game mechanics and storytelling to make learning a new language more engaging and effective. Users embark on an epic quest where they learn vocabulary and grammar by completing challenges and interacting with characters.',
    tags: ['Education', 'Mobile', 'Gamification'],
    authorId: 'user-3',
    upvotes: 72,
    createdAt: '1 week ago',
    skillsNeeded: ['React Native', 'UI/UX Design', 'Gamification'],
  },
];
const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Code-AI',
    mission: 'To revolutionize code reviews with artificial intelligence.',
    ideaId: 'idea-1',
    members: ['user-1', 'user-3', 'user-5'],
  },
  {
    id: 'team-2',
    name: 'DesignVerse',
    mission: 'Building the next generation of collaborative design tools.',
    ideaId: 'idea-3',
    members: ['user-2', 'user-4'],
  },
  {
    id: 'team-3',
    name: 'DecentraNet',
    mission: 'Building the future of the decentralized web.',
    ideaId: 'idea-2',
    members: ['user-2', 'user-3'],
  },
];
// Mock API Functions
const simulateDelay = <T>(data: T, delay = 500): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));
export const getIdeas = (): Promise<Idea[]> => simulateDelay([...mockIdeas].reverse());
export const getTeams = (): Promise<Team[]> => simulateDelay(mockTeams);
export const getUsers = (): Promise<User[]> => simulateDelay(mockUsers);
export const getLeaderboardData = (): Promise<{ users: User[], ideas: Idea[] }> =>
  simulateDelay({
    users: mockUsers.sort((a, b) => b.skills.length - a.skills.length),
    ideas: mockIdeas.sort((a, b) => b.upvotes - a.upvotes),
  });
export const getIdeaById = (id: string): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[] } | null> => {
  const idea = mockIdeas.find(i => i.id === id);
  if (!idea) {
    return simulateDelay(null, 200);
  }
  const author = mockUsers.find(u => u.id === idea.authorId);
  if (!author) {
    // This case should ideally not happen with consistent mock data
    return simulateDelay(null, 200);
  }
  const team = mockTeams.find(t => t.ideaId === id);
  const teamMembers = team ? team.members.map(memberId => mockUsers.find(u => u.id === memberId)).filter(Boolean) as User[] : [];
  return simulateDelay({ idea, author, team, teamMembers }, 700);
};
export const addIdea = (ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes'>): Promise<Idea> => {
  const newIdea: Idea = {
    ...ideaData,
    id: `idea-${Date.now()}`,
    createdAt: 'Just now',
    upvotes: 0,
  };
  mockIdeas.push(newIdea);
  return simulateDelay(newIdea, 800);
};
export const upvoteIdea = (ideaId: string): Promise<Idea | null> => {
  const idea = mockIdeas.find(i => i.id === ideaId);
  if (idea) {
    idea.upvotes += 1;
    return simulateDelay({ ...idea }, 300);
  }
  return simulateDelay(null, 300);
};
export const requestToJoinIdea = (ideaId: string, userId: string): Promise<Team> => {
  let team = mockTeams.find(t => t.ideaId === ideaId);
  if (team) {
    if (!team.members.includes(userId)) {
      team.members.push(userId);
    }
  } else {
    const idea = mockIdeas.find(i => i.id === ideaId);
    team = {
      id: `team-${Date.now()}`,
      name: `${idea?.title} Team` || 'New Team',
      mission: `To build ${idea?.title}` || 'A new mission',
      ideaId: ideaId,
      members: [userId],
    };
    mockTeams.push(team);
  }
  return simulateDelay({ ...team }, 600);
};