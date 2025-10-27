import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GitCommit, GitPullRequest, Star, GitFork, BookCopy, Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from "@/components/ui/chart";
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
  {
    name: 'python-scripts',
    language: 'Python',
    stars: 215,
    forks: 60,
    lastUpdate: '2 weeks ago',
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
];
const languageColors: { [key: string]: string } = {
  TypeScript: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  JavaScript: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  Go: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  CSS: 'bg-pink-500/20 text-pink-500 border-pink-500/30',
  Python: 'bg-green-500/20 text-green-500 border-green-500/30',
};
const chartLanguageColors = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Go: "#00ADD8",
    CSS: "#563d7c",
    Python: "#3572A5",
};
const LanguageBadge = ({ language }: { language: string }) => (
    <Badge variant="outline" className={`font-mono ${languageColors[language] || 'border-border'}`}>{language}</Badge>
);
const StatsCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);
export function DashboardPage() {
    const stats = useMemo(() => {
        const totalStars = mockRepositories.reduce((acc, repo) => acc + repo.stars, 0);
        const totalForks = mockRepositories.reduce((acc, repo) => acc + repo.forks, 0);
        const languageDistribution = mockRepositories.reduce((acc, repo) => {
            acc[repo.language] = (acc[repo.language] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const pieChartData = Object.entries(languageDistribution).map(([name, value]) => ({ name, value }));
        return {
            totalRepos: mockRepositories.length,
            totalStars,
            totalForks,
            pieChartData,
        };
    }, []);
  return (
    <AppLayout container>
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-lg text-muted-foreground">A summary of your GitHub activity.</p>
            </header>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard title="Total Repositories" value={stats.totalRepos} icon={BookCopy} />
                <StatsCard title="Total Stars" value={stats.totalStars.toLocaleString()} icon={Star} />
                <StatsCard title="Total Forks" value={stats.totalForks.toLocaleString()} icon={GitFork} />
            </div>
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Stars per Repository</CardTitle>
                        <CardDescription>A look at your most popular projects.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mockRepositories}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    contentStyle={{
                                        background: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                    }}
                                />
                                <Bar dataKey="stars" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Language Distribution</CardTitle>
                        <CardDescription>The makeup of your codebase.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={stats.pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {stats.pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={chartLanguageColors[entry.name as keyof typeof chartLanguageColors] || '#8884d8'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookCopy className="size-5" /> Your Repositories</CardTitle>
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
                Built with ❤️ at Cloudflare
            </footer>
        </div>
    </AppLayout>
  );
}