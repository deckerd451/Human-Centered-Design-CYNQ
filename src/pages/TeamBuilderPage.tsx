import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "@/components/ui/sonner";
import { Users, UserPlus, Tag, Frown, FilterX } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getIdeas, getTeams, getUsers, requestToJoinIdea } from "@/lib/apiClient";
import { Idea, Team, User } from "@shared/types";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
const TeamBuilderCard = ({ idea, team, users, onJoinRequest }: { idea: Idea; team?: Team; users: User[]; onJoinRequest: (ideaId: string) => void }) => {
  const currentUser = useAuthStore((s) => s.user);
  const teamMembers = useMemo(() => {
    if (!team) return [];
    return team.members.map(memberId => users.find(u => u.id === memberId)).filter(Boolean) as User[];
  }, [team, users]);
  const isUserInTeam = currentUser && team?.members.includes(currentUser.id);
  const hasPendingRequest = currentUser && team?.joinRequests?.includes(currentUser.id);
  const handleJoinRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUserInTeam && !hasPendingRequest) {
      onJoinRequest(idea.id);
    }
  };
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
      <Link to={`/idea/${idea.id}`} className="block h-full">
        <Card className="h-full flex flex-col hover:border-primary/50 transition-colors duration-300">
          <CardHeader>
            <CardTitle>{idea.title}</CardTitle>
            <CardDescription className="line-clamp-2">{team?.mission || idea.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Skills Needed</h4>
              <div className="flex flex-wrap gap-2">
                {idea.skillsNeeded.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Current Team</h4>
              {teamMembers.length > 0 ? (
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    {teamMembers.map(member => (
                      <Tooltip key={member.id}>
                        <TooltipTrigger asChild>
                          <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>{member.name}</TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No members yet. Be the first!</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleJoinRequest} disabled={!!isUserInTeam || !!hasPendingRequest}>
              <UserPlus className="mr-2 h-4 w-4" />
              {isUserInTeam ? "Joined" : hasPendingRequest ? "Request Sent" : "Request to Join"}
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};
const TeamBuilderSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-1/4 mb-2" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-1/3 mb-2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    ))}
  </div>
);
export function TeamBuilderPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSkills, setActiveSkills] = useState<Set<string>>(new Set());
  useEffect(() => {
    setLoading(true);
    Promise.all([getIdeas(), getTeams(), getUsers()]).then(([ideaData, teamData, userData]) => {
      setIdeas(ideaData);
      setTeams(teamData);
      setUsers(userData);
      setLoading(false);
    }).catch(err => {
        console.error("Failed to load team builder data:", err);
        setLoading(false);
    });
  }, []);
  const handleJoinRequest = async (ideaId: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to join a team.");
      return;
    }
    try {
      const updatedTeam = await requestToJoinIdea(ideaId, currentUser.id);
      setTeams(prevTeams => {
        const otherTeams = prevTeams.filter(t => t.id !== updatedTeam.id);
        return [...otherTeams, updatedTeam];
      });
      const idea = ideas.find(i => i.id === ideaId);
      toast.success(`Request sent to join team for "${idea?.title}"!`);
    } catch (error) {
      toast.error("Failed to send join request.");
    }
  };
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    ideas.forEach(idea => idea.skillsNeeded.forEach(skill => skills.add(skill)));
    return Array.from(skills).sort();
  }, [ideas]);
  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
      // Exclude user's own ideas
      if (currentUser && idea.authorId === currentUser.id) {
        return false;
      }
      // Filter by active skills
      if (activeSkills.size === 0) {
        return true;
      }
      return Array.from(activeSkills).every(skill => idea.skillsNeeded.includes(skill));
    });
  }, [ideas, activeSkills, currentUser]);
  const handleSkillToggle = (skill: string) => {
    setActiveSkills(prev => {
      const newSkills = new Set(prev);
      if (newSkills.has(skill)) newSkills.delete(skill);
      else newSkills.add(skill);
      return newSkills;
    });
  };
  return (
    <AppLayout container>
      <Toaster />
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-10 w-10 text-primary" />
            Team Builder
          </h1>
          <p className="text-lg text-muted-foreground">Find your next project and the team to build it with.</p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Tag className="h-5 w-5" />Filter by Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-7 w-24" />)}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allSkills.map(skill => (
                  <Badge key={skill} variant={activeSkills.has(skill) ? "default" : "secondary"} onClick={() => handleSkillToggle(skill)} className="cursor-pointer text-sm px-3 py-1 transition-all hover:scale-105">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <div>
          {loading ? <TeamBuilderSkeleton /> : filteredIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredIdeas.map(idea => (
                  <TeamBuilderCard key={idea.id} idea={idea} team={teams.find(t => t.ideaId === idea.id)} users={users} onJoinRequest={handleJoinRequest} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-16">
              {ideas.length > 0 ? (
                <>
                  <FilterX className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-4 text-2xl font-semibold">No Matching Ideas</h3>
                  <p className="mt-2 text-muted-foreground">
                    Try adjusting your skill filters to find what you're looking for.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveSkills(new Set())}>
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <Frown className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-4 text-2xl font-semibold">No Ideas Found</h3>
                  <p className="mt-2 text-muted-foreground">
                    There are no projects seeking team members right now. Why not start one?
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}