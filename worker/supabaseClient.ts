import type { User, Idea, Team, Comment, Notification } from '@shared/types';
// SEED DATA (moved from durableObject.ts)
const SEED_USERS: User[] = [
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
const SEED_IDEAS: Idea[] = [
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
const SEED_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Code-AI',
    mission: 'To revolutionize code reviews with artificial intelligence.',
    ideaId: 'idea-1',
    members: ['user-1', 'user-3', 'user-5'],
    joinRequests: [],
  },
  {
    id: 'team-2',
    name: 'DesignVerse',
    mission: 'Building the next generation of collaborative design tools.',
    ideaId: 'idea-3',
    members: ['user-2', 'user-4'],
    joinRequests: [],
  },
  {
    id: 'team-3',
    name: 'DecentraNet',
    mission: 'Building the future of the decentralized web.',
    ideaId: 'idea-2',
    members: ['user-2', 'user-3'],
    joinRequests: [],
  },
];
const SEED_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    ideaId: 'idea-1',
    authorId: 'user-2',
    content: 'This is a fantastic idea! I have some experience with ML models and would love to contribute.',
    createdAt: '1 day ago',
  },
  {
    id: 'comment-2',
    ideaId: 'idea-1',
    authorId: 'user-3',
    content: 'How are you planning to handle the infrastructure for model training? Could be quite resource-intensive.',
    createdAt: '22 hours ago',
  },
  {
    id: 'comment-3',
    ideaId: 'idea-2',
    authorId: 'user-1',
    content: 'Interesting concept. Have you thought about the moderation challenges in a decentralized system?',
    createdAt: '3 days ago',
  },
];
const SEED_NOTIFICATIONS: Notification[] = [
    {
      id: 'notif-1',
      userId: 'user-1',
      type: 'new_comment',
      message: 'Bella Builder commented on your idea "AI-Powered Code Review Assistant".',
      link: '/idea/idea-1',
      createdAt: '1 day ago',
      read: false,
    },
    {
      id: 'notif-2',
      userId: 'user-2',
      type: 'join_request',
      message: 'Charlie Coder wants to join your team for "Decentralized Social Media Platform".',
      link: '/idea/idea-2',
      createdAt: '3 days ago',
      read: true,
    },
];
export class SupabaseClient {
  private users: User[];
  private ideas: Idea[];
  private teams: Team[];
  private comments: Comment[];
  private notifications: Notification[];
  constructor() {
    // Deep copy to prevent mutations across sessions in a local dev environment
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.ideas = JSON.parse(JSON.stringify(SEED_IDEAS));
    this.teams = JSON.parse(JSON.stringify(SEED_TEAMS));
    this.comments = JSON.parse(JSON.stringify(SEED_COMMENTS));
    this.notifications = JSON.parse(JSON.stringify(SEED_NOTIFICATIONS));
  }
  async getUsers(): Promise<User[]> {
    return this.users;
  }
  async getIdeas(): Promise<Idea[]> {
    return this.ideas;
  }
  async getTeams(): Promise<Team[]> {
    return this.teams;
  }
  async getCommentsForIdea(ideaId: string): Promise<Comment[]> {
    return this.comments.filter(c => c.ideaId === ideaId).sort((a, b) => a.id.localeCompare(b.id));
  }
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      createdAt: 'Just now',
      read: false,
    };
    this.notifications.push(newNotification);
  }
  async addComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const newComment: Comment = {
      ...commentData,
      id: `comment-${Date.now()}`,
      createdAt: 'Just now',
    };
    this.comments.push(newComment);
    const idea = this.ideas.find(i => i.id === commentData.ideaId);
    const author = this.users.find(u => u.id === commentData.authorId);
    if (idea && author && idea.authorId !== author.id) {
      await this.createNotification({
        userId: idea.authorId,
        type: 'new_comment',
        message: `${author.name} commented on your idea "${idea.title}".`,
        link: `/idea/${idea.id}`,
      });
    }
    return newComment;
  }
  async getIdeaById(id: string): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null> {
    const idea = this.ideas.find(i => i.id === id);
    if (!idea) return null;
    const author = this.users.find(u => u.id === idea.authorId);
    if (!author) return null;
    const team = this.teams.find(t => t.ideaId === id);
    const teamMembers = team ? team.members.map(memberId => this.users.find(u => u.id === memberId)).filter((u): u is User => !!u) : [];
    const joinRequesters = team ? (team.joinRequests || []).map(userId => this.users.find(u => u.id === userId)).filter((u): u is User => !!u) : [];
    return { idea, author, team, teamMembers, joinRequesters };
  }
  async getLeaderboardData(): Promise<{ users: User[], ideas: Idea[] }> {
    return {
      users: [...this.users].sort((a, b) => b.skills.length - a.skills.length),
      ideas: [...this.ideas].sort((a, b) => b.upvotes - a.upvotes),
    };
  }
  async addIdea(ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes'>): Promise<Idea> {
    const newIdea: Idea = {
      ...ideaData,
      id: `idea-${Date.now()}`,
      createdAt: 'Just now',
      upvotes: 0,
    };
    this.ideas.push(newIdea);
    return newIdea;
  }
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;
    this.users[userIndex] = { ...this.users[userIndex], ...updates, id: userId };
    return this.users[userIndex];
  }
  async upvoteIdea(ideaId: string): Promise<Idea | null> {
    const idea = this.ideas.find(i => i.id === ideaId);
    if (idea) {
      idea.upvotes += 1;
      const upvoter = this.users[0]; // Mock: assume first user upvoted
      if (idea.authorId !== upvoter.id) {
        await this.createNotification({
          userId: idea.authorId,
          type: 'idea_upvote',
          message: `${upvoter.name} upvoted your idea "${idea.title}".`,
          link: `/idea/${idea.id}`,
        });
      }
      return idea;
    }
    return null;
  }
  async requestToJoinIdea(ideaId: string, userId: string): Promise<Team> {
    let team = this.teams.find(t => t.ideaId === ideaId);
    if (team) {
      if (!team.members.includes(userId) && !(team.joinRequests || []).includes(userId)) {
        team.joinRequests = [...(team.joinRequests || []), userId];
      }
    } else {
      const idea = this.ideas.find(i => i.id === ideaId);
      team = {
        id: `team-${Date.now()}`,
        name: `${idea?.title} Team`,
        mission: `To build ${idea?.title}`,
        ideaId: ideaId,
        members: [],
        joinRequests: [userId],
      };
      this.teams.push(team);
    }
    const idea = this.ideas.find(i => i.id === ideaId);
    const requester = this.users.find(u => u.id === userId);
    if (idea && requester && idea.authorId !== requester.id) {
      await this.createNotification({
        userId: idea.authorId,
        type: 'join_request',
        message: `${requester.name} requested to join your team for "${idea.title}".`,
        link: `/idea/${idea.id}`,
      });
    }
    return team;
  }
  async acceptJoinRequest(ideaId: string, userId: string): Promise<Team | null> {
    const team = this.teams.find(t => t.ideaId === ideaId);
    if (!team || !(team.joinRequests || []).includes(userId)) {
      return null;
    }
    team.joinRequests = team.joinRequests.filter(id => id !== userId);
    if (!team.members.includes(userId)) {
      team.members.push(userId);
    }
    const idea = this.ideas.find(i => i.id === ideaId);
    if (idea) {
      await this.createNotification({
        userId: userId,
        type: 'join_request_accepted',
        message: `Your request to join the team for "${idea.title}" has been accepted!`,
        link: `/idea/${idea.id}`,
      });
    }
    return team;
  }
  async declineJoinRequest(ideaId: string, userId: string): Promise<Team | null> {
    const team = this.teams.find(t => t.ideaId === ideaId);
    if (!team || !(team.joinRequests || []).includes(userId)) {
      return null;
    }
    team.joinRequests = team.joinRequests.filter(id => id !== userId);
    const idea = this.ideas.find(i => i.id === ideaId);
    if (idea) {
      await this.createNotification({
        userId: userId,
        type: 'join_request_declined',
        message: `Your request to join the team for "${idea.title}" has been declined.`,
        link: `/idea/${idea.id}`,
      });
    }
    return team;
  }
  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    return this.notifications.filter(n => n.userId === userId).sort((a, b) => b.id.localeCompare(a.id));
  }
  async markNotificationsAsRead(userId: string, notificationIds: string[]): Promise<void> {
    const idSet = new Set(notificationIds);
    this.notifications.forEach(n => {
      if (n.userId === userId && idSet.has(n.id)) {
        n.read = true;
      }
    });
  }
}