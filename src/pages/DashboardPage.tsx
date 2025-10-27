import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GitCommit, GitPullRequest, Star, GitFork, BookCopy, Activity } from "lucide-react";
const mockRepositories = [
  {
    name: 'codestream',
    language: 'TypeScript',
    stars: 123,
    forks: 45,
    lastUpdate: '3 hours ago',
  },
  {
    name: 'react-patterns',
    language: 'JavaScript',
    stars: 456,
    forks: 102,
    lastUpdate: '1 day ago',
  },
  {
    name: 'serverless-api',
    language: 'Go',
    stars: 78,
    forks: 12,
    lastUpdate: '2 days ago',
  },
  {
    name: 'design-system',
    language: 'CSS',
    stars: 310,
    forks: 88,
    lastUpdate: '5 days ago',
  },
];
const mockActivity = [
    {
        icon: GitCommit,
        text: 'Pushed 2 commits to',
        repo: 'codestream',
        branch: 'main',
        time: '15 minutes ago',
        user: { name: 'Jane Doe', avatar: 'https://github.com/shadcn.png' }
    },
    {
        icon: GitPullRequest,
        text: 'Opened a pull request in',
        repo: 'react-patterns',
        branch: '#18: Add new hooks examples',
        time: '2 hours ago',
        user: { name: 'Jane Doe', avatar: 'https://github.com/shadcn.png' }
    },
    {
        icon: Star,
        text: 'Starred a repository',
        repo: 'honojs/hono',
        branch: '',
        time: '1 day ago',
        user: { name: 'Jane Doe', avatar: 'https://github.com/shadcn.png' }
    },
    {
        icon: GitFork,
        text: 'Forked a repository',
        repo: 'facebook/react',
        branch: '',
        time: '3 days ago',
        user: { name: 'Jane Doe', avatar: 'https://github.com/shadcn.png' }
    }
]
const LanguageBadge = ({ language }: { language: string }) => {
    const colors: { [key: string]: string } = {
        TypeScript: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
        JavaScript: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
        Go: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
        CSS: 'bg-pink-500/20 text-pink-500 border-pink-500/30',
    };
    return <Badge variant="outline" className={`font-mono ${colors[language] || 'border-border'}`}>{language}</Badge>;
}
export function DashboardPage() {
  return (
    <AppLayout container>
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-lg text-muted-foreground">A summary of your GitHub activity.</p>
            </header>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookCopy className="size-5" /> Your Repositories</CardTitle>
                        <CardDescription>An overview of your most popular repositories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden sm:table-cell">Language</TableHead>
                                    <TableHead className="text-right">Stars</TableHead>
                                    <TableHead className="text-right hidden sm:table-cell">Last Update</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockRepositories.map((repo) => (
                                    <TableRow key={repo.name}>
                                        <TableCell className="font-medium">{repo.name}</TableCell>
                                        <TableCell className="hidden sm:table-cell"><LanguageBadge language={repo.language} /></TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-1">
                                            <Star className="size-4 text-yellow-500" />
                                            {repo.stars}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground hidden sm:table-cell">{repo.lastUpdate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Activity className="size-5" /> Recent Activity</CardTitle>
                        <CardDescription>Your latest actions on GitHub.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {mockActivity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                                        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                        <p className="text-foreground">
                                            {activity.text}{' '}
                                            <span className="font-semibold text-primary">{activity.repo}</span>
                                            {activity.branch && <span className="text-muted-foreground"> ({activity.branch})</span>}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <footer className="text-center text-sm text-muted-foreground pt-8">
                Built with ���️ at Cloudflare
            </footer>
        </div>
    </AppLayout>
  );
}