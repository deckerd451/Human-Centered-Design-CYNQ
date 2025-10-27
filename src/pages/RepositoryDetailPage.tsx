import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Repository, Commit } from "@/lib/github";
import { getRepositoryByName } from "@/lib/apiClient";
import { GitFork, Star, Lock, ArrowLeft, GitCommit, FileText, AlertTriangle, BookCopy, Clipboard, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
const MarkdownRenderer = ({ content }: { content: string }) => {
  const blocks = content.split(/(```[\s\S]*?```)/g);
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {blocks.map((block, index) => {
        if (block.startsWith('```')) {
          const code = block.replace(/```/g, '').trim();
          return (
            <pre key={index} className="bg-muted p-4 rounded-md overflow-x-auto">
              <code className="font-mono">{code}</code>
            </pre>
          );
        } else {
          return block.split('\n').map((line, lineIndex) => {
            if (line.startsWith('## ')) {
              return <h3 key={`${index}-${lineIndex}`} className="text-xl font-semibold mt-4 mb-2">{line.substring(3)}</h3>;
            }
            if (line.startsWith('# ')) {
              return <h2 key={`${index}-${lineIndex}`} className="text-2xl font-bold mt-6 mb-3 border-b pb-2">{line.substring(2)}</h2>;
            }
            if (line.trim() === '') {
              return null;
            }
            return <p key={`${index}-${lineIndex}`} className="my-2 leading-relaxed">{line}</p>;
          });
        }
      })}
    </div>
  );
};
const LoadingSkeleton = () => (
  <div className="space-y-8">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-24" />
    </div>
    <header className="space-y-2">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-5 w-3/4" />
    </header>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  </div>
);
export function RepositoryDetailPage() {
  const { repoName } = useParams<{ repoName: string }>();
  const [repo, setRepo] = useState<(Repository & { readme: string; recentCommits: Commit[] }) | null | undefined>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const fetchRepo = async () => {
      if (!repoName) return;
      setLoading(true);
      const data = await getRepositoryByName(repoName);
      setRepo(data);
      setLoading(false);
    };
    fetchRepo();
  }, [repoName]);
  const handleCopy = () => {
    if (!repo) return;
    const cloneUrl = `https://github.com/janedoe/${repo.name}.git`;
    navigator.clipboard.writeText(cloneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (loading) {
    return (
      <AppLayout container>
        <LoadingSkeleton />
      </AppLayout>
    );
  }
  if (repo === undefined) {
    return (
      <AppLayout container>
        <div className="text-center py-16">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-2xl font-semibold">Repository Not Found</h3>
          <p className="mt-2 text-muted-foreground">
            The repository "{repoName}" could not be found.
          </p>
          <Button asChild className="mt-6">
            <Link to="/repositories">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Repositories
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-4">
            <Link to="/repositories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Repositories
            </Link>
          </Button>
        </div>
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
                <BookCopy className="size-8 text-muted-foreground" />
                {repo.name}
              </h1>
              {repo.isPrivate && <Badge variant="secondary">Private</Badge>}
            </div>
            <TooltipProvider>
              <Tooltip open={copied}>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Clipboard className="mr-2 h-4 w-4" />}
                    {copied ? 'Copied!' : 'Clone'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copied to clipboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-lg text-muted-foreground">{repo.description}</p>
          <div className="flex items-center gap-4 pt-2 text-muted-foreground text-sm">
            <LanguageBadge language={repo.language} />
            <div className="flex items-center gap-1">
              <Star className="size-4 text-yellow-500" />
              <span>{repo.stars} stars</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="size-4" />
              <span>{repo.forks} forks</span>
            </div>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="size-5" /> README.md</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={repo.readme} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GitCommit className="size-5" /> Recent Commits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {repo.recentCommits.map(commit => (
                  <li key={commit.sha} className="flex items-start gap-3">
                    <GitCommit className="size-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium leading-none line-clamp-2">{commit.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{commit.author} committed {commit.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
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