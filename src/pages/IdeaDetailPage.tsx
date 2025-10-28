import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "@/components/ui/sonner";
import { ArrowUp, UserPlus, Tag, Users, Calendar, Frown, ArrowLeft, MessageSquare, Send, Loader2, Check, X, UserCheck } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getIdeaById, upvoteIdea, requestToJoinIdea, getComments, postComment, getUsers, acceptJoinRequest, declineJoinRequest } from "@/lib/apiClient";
import { Idea, Team, User, Comment } from "@shared/types";
import { useAuthStore } from "@/stores/authStore";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useData } from "@/hooks/useData";
const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty.").max(500, "Comment is too long."),
});
type CommentFormData = z.infer<typeof commentSchema>;
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
                      <p className="text-xs text-muted-foreground">{comment.createdAt}</p>
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
  const currentUser = useAuthStore((s) => s.user);
  const [data, setData] = useState<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);
  useEffect(() => {
    if (ideaId) {
      setLoading(true);
      getIdeaById(ideaId).then(result => {
        if (result) {
          setData(result);
          setNotFound(false);
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
  }, [ideaId]);
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
  return (
    <AppLayout container>
      <Toaster />
      <div className="space-y-8">
        <header className="space-y-2">
          <Link to="/search" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to ideas
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">{idea.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Posted {idea.createdAt}</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none text-foreground/90">
                <p>{idea.description}</p>
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
    </AppLayout>
  );
}