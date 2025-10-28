import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { Lightbulb, Users, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getIdeas, getTeams } from "@/lib/apiClient";
import { Idea, Team } from "@/lib/types";
import { Link } from "react-router-dom";
export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      Promise.all([getIdeas(), getTeams()]).then(([allIdeas, allTeams]) => {
        setMyIdeas(allIdeas.filter(idea => idea.authorId === user.id));
        setMyTeams(allTeams.filter(team => team.members.includes(user.id)));
        setLoading(false);
      });
    }
  }, [user]);
  if (!user) {
    return (
      <AppLayout container>
        <div className="text-center">Loading profile...</div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="space-y-8">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row gap-6 space-y-0 p-6 items-center">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                  <p className="text-lg text-muted-foreground">@{user.username}</p>
                </div>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit Profile</span>
                </Button>
              </div>
              <p className="mt-2 text-foreground/90 max-w-prose">{user.bio}</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map(interest => <Badge key={interest} variant="secondary">{interest}</Badge>)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb /> My Ideas</CardTitle>
              <CardDescription>Projects you've initiated.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <p>Loading ideas...</p> : myIdeas.length > 0 ? (
                <ul className="space-y-2">
                  {myIdeas.map(idea => (
                    <li key={idea.id}>
                      <Link to={`/idea/${idea.id}`} className="block p-3 -mx-3 border border-transparent rounded-md bg-muted/50 hover:bg-muted hover:border-border transition-colors font-medium">
                        {idea.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-muted-foreground">You haven't submitted any ideas yet.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users /> My Teams</CardTitle>
              <CardDescription>Teams you are a part of.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <p>Loading teams...</p> : myTeams.length > 0 ? (
                <ul className="space-y-3">
                  {myTeams.map(team => <li key={team.id} className="p-3 border rounded-md bg-muted/50">{team.name}</li>)}
                </ul>
              ) : <p className="text-muted-foreground">You are not part of any teams yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}