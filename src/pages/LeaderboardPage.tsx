import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Lightbulb, Star, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { getLeaderboardData } from "@/lib/apiClient";
import { User, Idea } from "@shared/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
const LeaderboardSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
const EmptyLeaderboard = ({ message }: { message: string }) => (
  <div className="text-center py-10">
    <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
    <p className="mt-4 text-sm text-muted-foreground">{message}</p>
  </div>
);
export function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<{ users: User[]; ideas: Idea[] } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getLeaderboardData().then(data => {
      setLeaderboard(data);
      setLoading(false);
    }).catch(err => {
        console.error("Failed to load leaderboard data:", err);
        setLoading(false);
    });
  }, []);
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-lg text-muted-foreground">Recognizing top contributors and trending ideas.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                Top Innovators
              </CardTitle>
              <CardDescription>The most active and skilled members of the community.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <LeaderboardSkeleton /> : (
                leaderboard?.users && leaderboard.users.length > 0 ? (
                  <ul className="space-y-4">
                    {leaderboard.users.map((user, index) => (
                      <li key={user.id} className="flex items-center gap-4">
                        <span className="text-lg font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                        <Avatar className="h-12 w-12 border-2 border-muted">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                        <Badge variant="secondary">{user.skills.length} Skills</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyLeaderboard message="No innovators to show yet. Be the first to contribute!" />
                )
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-blue-500" />
                Trending Ideas
              </CardTitle>
              <CardDescription>The most popular and upvoted ideas right now.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <LeaderboardSkeleton /> : (
                leaderboard?.ideas && leaderboard.ideas.length > 0 ? (
                  <ul className="space-y-1">
                    {leaderboard.ideas.map((idea, index) => (
                      <li key={idea.id}>
                        <Link to={`/idea/${idea.id}`} className="block p-3 -mx-3 rounded-lg hover:bg-muted transition-colors">
                          <div className="flex items-start gap-4">
                            <span className="text-lg font-bold text-muted-foreground w-6 text-center pt-1">{index + 1}</span>
                            <div className="flex-1">
                              <p className="font-semibold">{idea.title}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span>{idea.upvotes} upvotes</span>
                                </div>
                                <span>•</span>
                                <span>{idea.createdAt}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyLeaderboard message="No trending ideas yet. Submit an idea to get things started!" />
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}