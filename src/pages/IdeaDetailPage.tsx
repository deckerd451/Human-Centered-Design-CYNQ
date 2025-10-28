import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "@/components/ui/sonner";
import { ArrowUp, UserPlus, Tag, Users, Calendar, Frown, ArrowLeft, MessageSquare, Send, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getIdeaById, upvoteIdea, requestToJoinIdea, getComments, postComment, getUsers } from "@/lib/apiClient";
import { Idea, Team, User, Comment } from "@shared/types";
import { useAuthStore } from "@/stores/authStore";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty.").max(500, "Comment is too long."),
});
type CommentFormData = z.infer<typeof commentSchema>;
const CommentsSection = ({ ideaId }: { ideaId: string }) => {
  const currentUser = useAuthStore((s) => s.user);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });
  useEffect(() => {
    Promise.all([getComments(ideaId), getUsers()]).then(([commentsData, usersData]) => {
      setComments(commentsData);
      setUsers(usersData);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load comments:", err);
      toast.error("Could not load comments.");
      setLoading(false);
    });
  }, [ideaId]);
  const commentAuthors = useMemo(() => {
    return new Map(users.map(user => [user.id, user]));
  }, [users]);
  const onSubmit: SubmitHandler<CommentFormData> = async (data) => {
    if (!currentUser) {
      toast.error("You must be logged in to comment.");
      return;
    }
    try {
      const newComment = await postComment(ideaId, { authorId: currentUser.id, content: data.content });
      setComments(prev => [...prev, newComment]);
      reset();
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
          {loading ? (
            <p>Loading comments...</p>
          ) : comments.length > 0 ? (
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
              <Textarea placeholder="Add to the discussion..." {...register('content')} />
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
  const [data, setData] = useState<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[] } | null>(null);
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
      setData(prevData => {
        if (!prevData) return null;
        const existingMemberIds = new Set(prevData.teamMembers.map(m => m.id));
        const allPossibleMembers = [...prevData.teamMembers, prevData.author];
        if(!existingMemberIds.has(currentUser.id)) {
            allPossibleMembers.push(currentUser);
        }
        const newTeamMembers = updatedTeam.members
          .map(memberId => allPossibleMembers.find(u => u.id === memberId))
          .filter((u): u is User => !!u);
        return {
          ...prevData,
          team: updatedTeam,
          teamMembers: newTeamMembers,
        };
      });
      toast.success(`Successfully joined team for "${data?.idea.title}"!`);
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
  const { idea, author, team, teamMembers } = data;
  const isUserInTeam = currentUser && teamMembers.some(member => member.id === currentUser.id);
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
              <Button onClick={handleJoinRequest} disabled={!!isUserInTeam}>
                <UserPlus className="mr-2 h-4 w-4" />
                {isUserInTeam ? "Joined" : "Request to Join"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}