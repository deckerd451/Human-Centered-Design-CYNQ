import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Repository } from "@/lib/github";
import { getRepositories } from "@/lib/apiClient";
import { GitFork, Star, Lock, Search, BookCopy } from "lucide-react";
const languageColors: { [key: string]: string } = {
  TypeScript: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  JavaScript: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  Go: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  CSS: 'bg-pink-500/20 text-pink-500 border-pink-500/30',
  HTML: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  Python: 'bg-green-500/20 text-green-500 border-green-500/30',
};
const LanguageBadge = ({ language }: { language: string }) => (
  <Badge variant="outline" className={`font-mono ${languageColors[language] || 'border-border'}`}>{language}</Badge>
);
const RepositoryCard = ({ repo }: { repo: Repository }) => (
  <Link to={`/repository/${repo.name}`} className="block">
    <Card className="flex flex-col h-full hover:border-primary/50 transition-all duration-200 hover:shadow-md hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{repo.name}</span>
          {repo.isPrivate && <Lock className="size-4 text-muted-foreground" />}
        </CardTitle>
        <CardDescription className="line-clamp-2">{repo.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow" />
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <LanguageBadge language={repo.language} />
          <div className="flex items-center gap-1">
            <Star className="size-4 text-yellow-500" />
            <span>{repo.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="size-4" />
            <span>{repo.forks}</span>
          </div>
        </div>
        <span>{repo.lastUpdate}</span>
      </CardFooter>
    </Card>
  </Link>
);
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
          </div>
          <Skeleton className="h-4 w-24" />
        </CardFooter>
      </Card>
    ))}
  </div>
);
export function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      const data = await getRepositories();
      setRepos(data);
      setLoading(false);
    };
    fetchRepos();
  }, []);
  const filteredRepos = useMemo(() => {
    return repos.filter(repo =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [repos, searchTerm]);
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Repositories</h1>
          <p className="text-lg text-muted-foreground">
            Browse and search your GitHub repositories.
          </p>
        </header>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search repositories..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRepos.length > 0 ? (
              filteredRepos.map(repo => <RepositoryCard key={repo.id} repo={repo} />)
            ) : (
              <div className="md:col-span-2 text-center py-16">
                <BookCopy className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No repositories found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your search for "{searchTerm}" did not match any repositories.
                </p>
              </div>
            )}
          </div>
        )}
        <footer className="text-center text-sm text-muted-foreground pt-8">
            Built with ❤️ at Cloudflare
        </footer>
      </div>
    </AppLayout>
  );
}