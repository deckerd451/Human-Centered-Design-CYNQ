import { User, Idea, Team, Comment, Notification, BoardColumn } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
interface MockData {
  users: User[];
  ideas: Idea[];
  teams: Team[];
  comments: Comment[];
  notifications: Notification[];
}
let mockDataInstance: MockData | null = null;
export const getMockData = (): MockData => {
  if (mockDataInstance) {
    return mockDataInstance;
  }
  // --- INITIALIZE DATA ---
  const user1Id = 'user-1';
  const user2Id = 'user-2';
  const user3Id = 'user-3';
  const user4Id = 'user-4';
  const users: User[] = [
    {
      id: user1Id,
      name: 'Elena Voyager',
      username: 'elenavoyager',
      email: 'elena@example.com',
      avatarUrl: 'https://api.dicebear.com/8.x/lorelei/svg?seed=elena',
      bio: 'AI enthusiast and full-stack developer, turning coffee into code and ideas into reality.',
      skills: ['TypeScript', 'React', 'Python', 'Machine Learning'],
      interests: ['Generative AI', 'Data Visualization', 'UX Design'],
      githubUsername: 'elenacodes',
      githubStats: { repos: 58, followers: 2300, following: 80 },
    },
    {
      id: user2Id,
      name: 'Marcus Rune',
      username: 'marcusrune',
      email: 'marcus@example.com',
      avatarUrl: 'https://api.dicebear.com/8.x/lorelei/svg?seed=marcus',
      bio: 'Backend architect specializing in scalable systems and cloud infrastructure. Loves clean code and a good challenge.',
      skills: ['Go', 'Kubernetes', 'PostgreSQL', 'System Design'],
      interests: ['Distributed Systems', 'DevOps', 'FinTech'],
    },
    {
      id: user3Id,
      name: 'Aisha Khan',
      username: 'aishakhan',
      email: 'aisha@example.com',
      avatarUrl: 'https://api.dicebear.com/8.x/lorelei/svg?seed=aisha',
      bio: 'Product designer with a passion for creating intuitive and beautiful user experiences. Believes in human-centered design.',
      skills: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research'],
      interests: ['Design Systems', 'Accessibility', 'Mobile Apps'],
    },
    {
      id: user4Id,
      name: 'Leo Petrov',
      username: 'leopetrov',
      email: 'leo@example.com',
      avatarUrl: 'https://api.dicebear.com/8.x/lorelei/svg?seed=leo',
      bio: 'Frontend developer who loves crafting smooth animations and interactive components.',
      skills: ['React', 'Vue', 'CSS Animations', 'Web Performance'],
      interests: ['Creative Coding', 'Web3', 'Gaming'],
    },
  ];
  const idea1Id = 'idea-1';
  const idea2Id = 'idea-2';
  const idea3Id = 'idea-3';
  const idea4Id = 'idea-4';
  const defaultProjectBoard = (): { columns: BoardColumn[] } => ({
    columns: [
      { id: 'todo', title: 'To Do', tasks: [{ id: uuidv4(), content: 'Initial project setup' }, { id: uuidv4(), content: 'Define MVP features' }] },
      { id: 'inProgress', title: 'In Progress', tasks: [{ id: uuidv4(), content: 'Design user interface mockups' }] },
      { id: 'done', title: 'Done', tasks: [{ id: uuidv4(), content: 'Market research' }] },
    ],
  });
  const ideas: Idea[] = [
    {
      id: idea1Id,
      title: 'Synapse: AI-Powered Learning Platform',
      description: 'An adaptive learning platform that uses AI to create personalized study plans for students. It analyzes learning patterns and suggests resources, quizzes, and projects to master any subject.\n\n## Key Features\n* Personalized learning paths\n* Real-time progress tracking\n* AI-powered content recommendations',
      tags: ['AI', 'EdTech', 'SaaS'],
      authorId: user1Id,
      upvotes: 128,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      skillsNeeded: ['React', 'Python', 'Machine Learning', 'UI/UX Design'],
      repoUrl: 'https://github.com/elenacodes/synapse-ai',
      projectBoard: defaultProjectBoard(),
    },
    {
      id: idea2Id,
      title: 'EcoTrack: Carbon Footprint Tracker',
      description: 'A mobile app that helps users track and reduce their carbon footprint. It connects with daily activities like travel, diet, and energy consumption to provide actionable insights and eco-friendly alternatives.',
      tags: ['Mobile', 'Sustainability', 'GreenTech'],
      authorId: user2Id,
      upvotes: 95,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      skillsNeeded: ['React Native', 'Node.js', 'PostgreSQL'],
      projectBoard: defaultProjectBoard(),
    },
    {
      id: idea3Id,
      title: 'FlowState: Minimalist Productivity App',
      description: 'A desktop app designed to help users enter a state of deep work. It combines a pomodoro timer, a distraction-free text editor, and ambient soundscapes to enhance focus and productivity.',
      tags: ['Productivity', 'Desktop App', 'Design'],
      authorId: user3Id,
      upvotes: 210,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      skillsNeeded: ['UI/UX Design', 'Electron', 'React'],
    },
    {
      id: idea4Id,
      title: 'PixelForge: Collaborative Pixel Art Editor',
      description: 'A real-time, web-based collaborative pixel art editor for game developers and artists. Features include layers, animation timelines, and a shared asset library.',
      tags: ['Creative Tools', 'Gaming', 'Web App'],
      authorId: user4Id,
      upvotes: 72,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      skillsNeeded: ['React', 'Canvas API', 'WebSockets'],
    },
  ];
  const team1Id = 'team-1';
  const team2Id = 'team-2';
  const teams: Team[] = [
    {
      id: team1Id,
      name: 'Team Synapse',
      mission: 'Building the future of personalized education with AI.',
      ideaId: idea1Id,
      members: [user1Id, user3Id],
      joinRequests: [user4Id],
    },
    {
      id: team2Id,
      name: 'Team EcoTrack',
      mission: 'Empowering individuals to make a positive impact on the planet.',
      ideaId: idea2Id,
      members: [user2Id],
      joinRequests: [],
    },
  ];
  const comments: Comment[] = [
    {
      id: uuidv4(),
      ideaId: idea1Id,
      authorId: user2Id,
      content: 'This is a fantastic idea! The potential for personalized learning is huge. How do you plan to handle data privacy?',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      ideaId: idea1Id,
      authorId: user1Id,
      content: "Great question, Marcus! We're planning to use federated learning to train models without centralizing sensitive student data. Privacy is a top priority.",
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    },
  ];
  const notifications: Notification[] = [
    {
      id: uuidv4(),
      userId: user1Id,
      type: 'join_request',
      message: 'Leo Petrov has requested to join Team Synapse.',
      link: `/idea/${idea1Id}`,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: uuidv4(),
      userId: user1Id,
      type: 'new_comment',
      message: 'Marcus Rune commented on your idea "Synapse: AI-Powered Learning Platform".',
      link: `/idea/${idea1Id}`,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ];
  mockDataInstance = {
    users,
    ideas,
    teams,
    comments,
    notifications,
  };
  return mockDataInstance;
};