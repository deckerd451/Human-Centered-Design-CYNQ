import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "@/components/ui/sonner";
import { ArrowUp, UserPlus, Tag, Users, Calendar, Frown, ArrowLeft, MessageSquare, Send, Loader2, Check, X, UserCheck, GitBranch, Heart, Star, MoreHorizontal, Edit, Trash2, Link as LinkIcon } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getIdeaById, upvoteIdea, requestToJoinIdea, getComments, postComment, getUsers, acceptJoinRequest, declineJoinRequest, updateIdea, deleteIdea } from "@/lib/apiClient";
import { Idea, Team, User, Comment } from "@shared/types";
import { useAuthStore } from "@/stores/authStore";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/hooks/useData";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/helpers";
import ProjectBoard from "@/components/ProjectBoard";
const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty.").max(500, "Comment is too long."),
});
type CommentFormData = z.infer<typeof commentSchema>;
const ideaEditSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().min(20, 'Description must be at least 20 characters long.'),
  tags: z.string().min(1, 'Please add at least one tag.'),
  skillsNeeded: z.string().min(1, 'Please list at least one skill.'),
});
type IdeaEditFormData = z.infer<typeof ideaEditSchema>;
const repoLinkSchema = z.object({
  repoUrl: z.string().url("Please enter a valid GitHub repository URL.").startsWith("https://github.com/", "URL must be a GitHub repository."),
});
type RepoLinkFormData = z.infer<typeof repoLinkSchema>;
const CommentsSection = ({ ideaId }: { ideaId: string }) => {
  const currentUser = useAuthStore((s) => s.user);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { data: comments, isLoading: isLoadingComments, refetch: refetchComments } = useData(
    ['comments', ideaId],
    () => getComments(ideaId)
  );
  const { data: users, isLoading: isLoadingUsers } = useData(['users'], getUsers);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });
  const commentAuthors = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map(user => [user.id, user]));
  }, [users]);
  const onSubmit: SubmitHandler<CommentFormData> = async (data) => {
    if (!currentUser) {
      toast.error("You must be logged in to comment.");
      return;
    }
    try {
      await postComment(ideaId, { authorId: currentUser.id, content: data.content });
      reset();
      await refetchComments();
      commentInputRef.current?.focus();
    } catch (error) {
      toast.error("Failed to post comment. Please try again.");
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare /> Discussion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {isLoadingComments || isLoadingUsers ? (
            <p>Loading comments...</p>
          ) : comments && comments.length > 0 ? (
            comments.map(comment => {
              const author = commentAuthors.get(comment.authorId);
              return (
                <div key={comment.id} className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={author?.avatarUrl} />
                    <AvatarFallback>{author?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold">{author?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
                    </div>
                    <p className="text-foreground/90">{comment.content}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-sm">No comments yet. Be the first to start the discussion!</p>
          )}
        </div>
        {currentUser && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.avatarUrl} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                ref={commentInputRef}
                placeholder="Add to the discussion..."
                {...register('content')}
              />
              {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>}
            </div>
            <Button type="submit" size="icon" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
const TeamManagementCard = ({ ideaId, requesters, onUpdateRequest }: { ideaId: string; requesters: User[]; onUpdateRequest: (updatedTeam: Team) => void }) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const handleAccept = async (userId: string) => {
    setProcessingId(userId);
    try {
      const updatedTeam = await acceptJoinRequest(ideaId, userId);
      toast.success("Request accepted!");
      onUpdateRequest(updatedTeam);
    } catch (error) {
      toast.error("Failed to accept request.");
    } finally {
      setProcessingId(null);
    }
  };
  const handleDecline = async (userId: string) => {
    setProcessingId(userId);
    try {
      const updatedTeam = await declineJoinRequest(ideaId, userId);
      toast.info("Request declined.");
      onUpdateRequest(updatedTeam);
    } catch (error) {
      toast.error("Failed to decline request.");
    } finally {
      setProcessingId(null);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck /> Team Management
        </CardTitle>
        <CardDescription>Review and manage requests to join your team.</CardDescription>
      </CardHeader>
      <CardContent>
        {requesters.length > 0 ? (
          <ul className="space-y-3">
            {requesters.map(user => (
              <li key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleDecline(user.id)} disabled={processingId === user.id}>
                    {processingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" onClick={() => handleAccept(user.id)} disabled={processingId === user.id}>
                    {processingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No pending join requests.</p>
        )}
      </CardContent>
    </Card>
  );
};
const LinkRepoCard = ({ ideaId }: { ideaId: string }) => {
  const linkRepoToIdea = useAuthStore(s => s.linkRepoToIdea);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RepoLinkFormData>({
    resolver: zodResolver(repoLinkSchema),
  });
  const onSubmit: SubmitHandler<RepoLinkFormData> = (data) => {
    linkRepoToIdea(ideaId, data.repoUrl);
    toast.success("Repository linked successfully!");
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon /> Link GitHub Repository
        </CardTitle>
        <CardDescription>Connect a repository to track project progress.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2">
          <div className="flex-1">
            <Input id="repoUrl" placeholder="https://github.com/user/repo" {...register('repoUrl')} />
            {errors.repoUrl && <p className="text-sm text-red-500 mt-1">{errors.repoUrl.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
const IdeaDetailSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="h-10 w-3/4" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
);
export function IdeaDetailPage() {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const linkedRepos = useAuthStore(s => s.user?.linkedRepos);
  const [data, setData] = useState<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting: isSubmittingEdit }, reset } = useForm<IdeaEditFormData>({
    resolver: zodResolver(ideaEditSchema),
  });
  useEffect(() => {
    if (ideaId) {
      setLoading(true);
      getIdeaById(ideaId).then(result => {
        if (result) {
          setData(result);
          setNotFound(false);
          reset({
            title: result.idea.title,
            description: result.idea.description,
            tags: result.idea.tags.join(', '),
            skillsNeeded: result.idea.skillsNeeded.join(', '),
          });
        } else {
          setNotFound(true);
        }
        setLoading(false);
      }).catch(err => {
        console.error("Failed to load idea details:", err);
        setNotFound(true);
        setLoading(false);
      });
    }
  }, [ideaId, reset]);
  const handleJoinRequest = async () => {
    if (!ideaId || !currentUser) return;
    try {
      const updatedTeam = await requestToJoinIdea(ideaId, currentUser.id);
      setData(prevData => prevData ? { ...prevData, team: updatedTeam } : null);
      toast.success(`Your request to join has been sent!`);
    } catch (error) {
      toast.error("Failed to send join request.");
    }
  };
  const handleUpvote = async () => {
    if (!ideaId || isUpvoted) return;
    try {
      const updatedIdea = await upvoteIdea(ideaId);
      if (updatedIdea) {
        setData(prevData => prevData ? { ...prevData, idea: updatedIdea } : null);
        setIsUpvoted(true);
        toast.success(`Upvoted "${updatedIdea.title}"!`);
      }
    } catch (error) {
      toast.error("Failed to upvote idea.");
    }
  };
  const handleTeamUpdate = (updatedTeam: Team) => {
    setData(prevData => {
      if (!prevData) return null;
      const allUsers = [...prevData.teamMembers, ...prevData.joinRequesters, prevData.author];
      const uniqueUsers = Array.from(new Map(allUsers.map(u => [u.id, u])).values());
      const newTeamMembers = updatedTeam.members.map(id => uniqueUsers.find(u => u.id === id)).filter((u): u is User => !!u);
      const newJoinRequesters = (updatedTeam.joinRequests || []).map(id => uniqueUsers.find(u => u.id === id)).filter((u): u is User => !!u);
      return {
        ...prevData,
        team: updatedTeam,
        teamMembers: newTeamMembers,
        joinRequesters: newJoinRequesters,
      };
    });
  };
  const onEditSubmit: SubmitHandler<IdeaEditFormData> = async (formData) => {
    if (!ideaId) return;
    try {
      const updatedData = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        skillsNeeded: formData.skillsNeeded.split(',').map(skill => skill.trim()).filter(Boolean),
      };
      const updatedIdea = await updateIdea(ideaId, updatedData);
      setData(prevData => prevData ? { ...prevData, idea: updatedIdea } : null);
      toast.success("Idea updated successfully!");
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update idea.");
    }
  };
  const handleDelete = async () => {
    if (!ideaId) return;
    try {
      await deleteIdea(ideaId);
      toast.success("Idea deleted successfully.");
      navigate('/search');
    } catch (error) {
      toast.error("Failed to delete idea.");
      setIsDeleteDialogOpen(false);
    }
  };
  if (loading) {
    return <AppLayout container><IdeaDetailSkeleton /></AppLayout>;
  }
  if (notFound) {
    return (
      <AppLayout container>
        <div className="text-center py-16">
          <Frown className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-2xl font-semibold">Idea Not Found</h3>
          <p className="mt-2 text-muted-foreground">The idea you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-6">
            <Link to="/search">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  if (!data || !ideaId) return null;
  const { idea, author, team, teamMembers, joinRequesters } = data;
  const isUserInTeam = currentUser && teamMembers.some(member => member.id === currentUser.id);
  const hasPendingRequest = currentUser && (team?.joinRequests || []).includes(currentUser.id);
  const isAuthor = currentUser && currentUser.id === author.id;
  const repoUrl = linkedRepos?.get(ideaId);
  return (
    <AppLayout container>
      <Toaster />
      <div className="space-y-8">
        <header className="space-y-2">
          <div className="flex justify-between items-start">
            <Link to="/search" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to ideas
            </Link>
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Idea</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)} className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Idea</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{idea.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Posted {formatDate(idea.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <div className="flex flex-wrap gap-1.5">
                {idea.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
              </div>
            </div>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {isAuthor && <TeamManagementCard ideaId={ideaId} requesters={joinRequesters} onUpdateRequest={handleTeamUpdate} />}
            {isAuthor && <LinkRepoCard ideaId={ideaId} />}
            <ProjectBoard idea={idea} repoUrl={repoUrl} />
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer content={idea.description} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skills Needed</CardTitle>
                <CardDescription>The expertise required to bring this idea to life.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {idea.skillsNeeded.map(skill => <Badge key={skill}>{skill}</Badge>)}
                </div>
              </CardContent>
            </Card>
            <CommentsSection ideaId={ideaId} />
          </div>
          <div className="space-y-6 lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle>Author</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={author.avatarUrl} alt={author.name} />
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{author.name}</p>
                  <p className="text-sm text-muted-foreground">@{author.username}</p>
                </div>
              </CardContent>
            </Card>
            {author.githubUsername && author.githubStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Author Stats</CardTitle>
                  <CardDescription>
                    <a href={`https://github.com/${author.githubUsername}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                      @{author.githubUsername}
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GitBranch className="h-4 w-4" />
                    <span>{author.githubStats.repos} Repositories</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>{author.githubStats.followers} Followers</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span>{author.githubStats.following} Following</span>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Current Team
                  <Badge variant="outline">{teamMembers.length} member{teamMembers.length !== 1 && 's'}</Badge>
                </CardTitle>
                <CardDescription>{team?.mission || "A team is being formed for this idea."}</CardDescription>
              </CardHeader>
              <CardContent>
                {teamMembers.length > 0 ? (
                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      {teamMembers.map(member => (
                        <Tooltip key={member.id}>
                          <TooltipTrigger asChild>
                            <Avatar className="h-10 w-10 border-2 border-background">
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
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleUpvote} disabled={isUpvoted}>
                <ArrowUp className="mr-2 h-4 w-4" />
                Upvote ({idea.upvotes})
              </Button>
              <Button onClick={handleJoinRequest} disabled={isUserInTeam || hasPendingRequest || isAuthor}>
                <UserPlus className="mr-2 h-4 w-4" />
                {isUserInTeam ? "Joined" : hasPendingRequest ? "Request Sent" : "Request to Join"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Idea</DialogTitle>
            <DialogDescription>Make changes to your idea here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)} className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" {...register('tags')} />
              {errors.tags && <p className="text-sm text-red-500 mt-1">{errors.tags.message}</p>}
            </div>
            <div>
              <Label htmlFor="skillsNeeded">Skills Needed (comma-separated)</Label>
              <Input id="skillsNeeded" {...register('skillsNeeded')} />
              {errors.skillsNeeded && <p className="text-sm text-red-500 mt-1">{errors.skillsNeeded.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmittingEdit}>
                {isSubmittingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your idea and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, delete idea
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}