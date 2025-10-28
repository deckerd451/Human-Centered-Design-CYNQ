import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { Lightbulb, Users, Edit, Loader2, GitBranch, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getIdeas, getTeams } from "@/lib/apiClient";
import { Idea, Team, User } from "@shared/types";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Toaster, toast } from "sonner";
import { Separator } from "@/components/ui/separator";
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().min(10, "Bio must be at least 10 characters.").max(160, "Bio must not exceed 160 characters."),
  skills: z.string().min(1, "Please list at least one skill."),
  interests: z.string().min(1, "Please list at least one interest."),
});
type ProfileFormData = z.infer<typeof profileSchema>;
const EditProfileDialog = ({ user, onUpdate }: { user: User; onUpdate: (data: Partial<User>) => Promise<void> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      bio: user.bio,
      skills: user.skills.join(', '),
      interests: user.interests.join(', '),
    },
  });
  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    const updatedData = {
      ...data,
      skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
      interests: data.interests.split(',').map(i => i.trim()).filter(Boolean),
    };
    try {
      await onUpdate(updatedData);
      toast.success("Profile updated successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };
  useEffect(() => {
    if (isOpen) {
      reset({
        name: user.name,
        bio: user.bio,
        skills: user.skills.join(', '),
        interests: user.interests.join(', '),
      });
    }
  }, [isOpen, user, reset]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" {...register('bio')} />
            {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>}
          </div>
          <div>
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input id="skills" {...register('skills')} />
            {errors.skills && <p className="text-sm text-red-500 mt-1">{errors.skills.message}</p>}
          </div>
          <div>
            <Label htmlFor="interests">Interests (comma-separated)</Label>
            <Input id="interests" {...register('interests')} />
            {errors.interests && <p className="text-sm text-red-500 mt-1">{errors.interests.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
const GithubStats = ({ stats, username }: { stats: NonNullable<User['githubStats']>; username: string }) => (
  <div>
    <h3 className="text-lg font-semibold mb-2">GitHub Stats</h3>
    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
      <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground">
        <GitBranch className="h-4 w-4" />
        <span>{stats.repos} Repos</span>
      </a>
      <a href={`https://github.com/${username}?tab=followers`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground">
        <Heart className="h-4 w-4" />
        <span>{stats.followers} Followers</span>
      </a>
      <a href={`https://github.com/${username}?tab=following`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground">
        <Star className="h-4 w-4" />
        <span>{stats.following} Following</span>
      </a>
    </div>
  </div>
);
export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([getIdeas(), getTeams()]).then(([allIdeasData, allTeams]) => {
        setAllIdeas(allIdeasData);
        setMyIdeas(allIdeasData.filter(idea => idea.authorId === user.id));
        setMyTeams(allTeams.filter(team => team.members.includes(user.id)));
        setLoading(false);
      }).catch(err => {
        console.error("Failed to load dashboard data:", err);
        toast.error("Could not load your data. Please refresh.");
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
  const getIdeaForTeam = (team: Team) => allIdeas.find(idea => idea.id === team.ideaId);
  return (
    <AppLayout container>
      <Toaster />
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
                <EditProfileDialog user={user} onUpdate={updateUser} />
              </div>
              <p className="mt-2 text-foreground/90 max-w-prose">{user.bio}</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 border-t space-y-6">
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
            {user.githubUsername && user.githubStats && (
              <>
                <Separator />
                <GithubStats stats={user.githubStats} username={user.githubUsername} />
              </>
            )}
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
                <ul className="space-y-2">
                  {myTeams.map(team => {
                    const idea = getIdeaForTeam(team);
                    if (!idea) return null;
                    return (
                      <li key={team.id}>
                        <Link to={`/idea/${idea.id}`} className="block p-3 -mx-3 border border-transparent rounded-md bg-muted/50 hover:bg-muted hover:border-border transition-colors font-medium">
                          {team.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="text-muted-foreground">You are not part of any teams yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}