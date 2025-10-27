import { Repository, Commit } from './github';
const mockRepositories: Repository[] = [
  {
    id: 1,
    name: 'codestream',
    description: 'Seamless GitHub Integration built with Cloudflare Workers and React.',
    language: 'TypeScript',
    stars: 123,
    forks: 45,
    url: 'https://github.com/janedoe/codestream',
    lastUpdate: '3 hours ago',
    isPrivate: false,
  },
  {
    id: 2,
    name: 'react-patterns',
    description: 'A collection of modern React patterns and best practices.',
    language: 'JavaScript',
    stars: 456,
    forks: 102,
    url: 'https://github.com/janedoe/react-patterns',
    lastUpdate: '1 day ago',
    isPrivate: false,
  },
  {
    id: 3,
    name: 'serverless-api',
    description: 'High-performance serverless API boilerplate with Go.',
    language: 'Go',
    stars: 78,
    forks: 12,
    url: 'https://github.com/janedoe/serverless-api',
    lastUpdate: '2 days ago',
    isPrivate: true,
  },
  {
    id: 4,
    name: 'design-system',
    description: 'A comprehensive design system built with Tailwind CSS and Storybook.',
    language: 'CSS',
    stars: 310,
    forks: 88,
    url: 'https://github.com/janedoe/design-system',
    lastUpdate: '5 days ago',
    isPrivate: false,
  },
  {
    id: 5,
    name: 'dotfiles',
    description: 'My personal development environment configuration.',
    language: 'JavaScript',
    stars: 92,
    forks: 15,
    url: 'https://github.com/janedoe/dotfiles',
    lastUpdate: '1 week ago',
    isPrivate: true,
  },
  {
    id: 6,
    name: 'python-data-scripts',
    description: 'A collection of useful Python scripts for data analysis and visualization.',
    language: 'Python',
    stars: 215,
    forks: 60,
    url: 'https://github.com/janedoe/python-data-scripts',
    lastUpdate: '2 weeks ago',
    isPrivate: false,
  },
];
export const getRepositories = (): Promise<Repository[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRepositories);
    }, 1000); // Simulate network delay
  });
};
export const getRepositoryByName = (name: string): Promise<(Repository & { readme: string; recentCommits: Commit[] }) | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const repo = mockRepositories.find(r => r.name === name);
      if (repo) {
        resolve({
          ...repo,
          readme: `# ${repo.name}\n\n${repo.description}\n\nThis is a mock README file. In a real application, this would be fetched from the GitHub API and rendered as Markdown.\n\n## Features\n\n- Feature A\n- Feature B\n- Feature C\n\n## Getting Started\n\nTo get started, clone the repository and install the dependencies.\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\``,
          recentCommits: [
            { sha: 'a1b2c3d', message: 'feat: Implement new dashboard layout', author: 'Jane Doe', date: '1 day ago' },
            { sha: 'e4f5g6h', message: 'fix: Correct alignment issue on mobile', author: 'Jane Doe', date: '2 days ago' },
            { sha: 'i7j8k9l', message: 'docs: Update README with setup instructions', author: 'Jane Doe', date: '3 days ago' },
            { sha: 'm0n1o2p', message: 'refactor: Simplify state management logic', author: 'Jane Doe', date: '4 days ago' },
            { sha: 'q3r4s5t', message: 'chore: Upgrade dependencies', author: 'Jane Doe', date: '5 days ago' },
          ]
        });
      } else {
        resolve(undefined);
      }
    }, 800); // Simulate network delay
  });
};