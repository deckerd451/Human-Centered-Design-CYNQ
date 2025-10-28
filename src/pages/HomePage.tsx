import { AppLayout } from '@/components/layout/AppLayout';
import NeuralBackground from '@/components/NeuralBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lightbulb, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Toaster, toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { getIdeas, addIdea } from '@/lib/apiClient';
import { Idea } from '@shared/types';
import { useData } from '@/hooks/useData';
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const ideaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().min(20, 'Description must be at least 20 characters long.'),
  tags: z.string().min(1, 'Please add at least one tag.'),
  skillsNeeded: z.string().min(1, 'Please list at least one skill.'),
});
type IdeaFormData = z.infer<typeof ideaSchema>;
const RecentIdeas = ({ ideas, isLoading }: { ideas?: Idea[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {ideas?.slice(0, 3).map(idea => (
        <Link to={`/idea/${idea.id}`} key={idea.id} className="block p-4 border rounded-lg bg-background/50 hover:border-primary/50 transition-colors">
          <h4 className="font-semibold">{idea.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{idea.description}</p>
        </Link>
      ))}
    </div>
  );
};
export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { data: ideas, isLoading: isLoadingIdeas, refetch: refetchIdeas } = useData(['ideas'], getIdeas);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
  });
  const onSubmit: SubmitHandler<IdeaFormData> = async (data) => {
    if (!user) {
      toast.error("You must be logged in to submit an idea.");
      return;
    }
    try {
      const newIdeaData = {
        title: data.title,
        description: data.description,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        skillsNeeded: data.skillsNeeded.split(',').map(skill => skill.trim()).filter(Boolean),
        authorId: user.id,
      };
      await addIdea(newIdeaData);
      toast.success("Your idea has been submitted successfully!");
      reset();
      refetchIdeas();
    } catch (error) {
      toast.error("Failed to submit idea. Please try again.");
    }
  };
  return (
    <AppLayout>
      <Toaster />
      <main className="relative flex items-center justify-center min-h-screen bg-background overflow-hidden p-4">
        <NeuralBackground />
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card className="h-full shadow-xl rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Lightbulb className="text-yellow-400" />
                    Submit an Idea
                  </CardTitle>
                  <CardDescription>Have a brilliant idea? Share it with the community.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="idea-title">Idea Title</Label>
                      <Input id="idea-title" placeholder="e.g., AI-Powered Code Reviewer" {...register('title')} />
                      {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="idea-description">Description</Label>
                      <Textarea id="idea-description" placeholder="Describe your idea in a few sentences." {...register('description')} />
                      {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="idea-tags">Tags (comma-separated)</Label>
                      <Input id="idea-tags" placeholder="e.g., AI, Developer Tools, SaaS" {...register('tags')} />
                      {errors.tags && <p className="text-sm text-red-500 mt-1">{errors.tags.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="idea-skills">Skills Needed (comma-separated)</Label>
                      <Input id="idea-skills" placeholder="e.g., React, Python, UI/UX" {...register('skillsNeeded')} />
                      {errors.skillsNeeded && <p className="text-sm text-red-500 mt-1">{errors.skillsNeeded.message}</p>}
                    </div>
                    <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Idea
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card className="h-full shadow-xl rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Search />
                    Explore Ideas
                  </CardTitle>
                  <CardDescription>Discover inspiring projects and find teams to join.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Recently Added</h3>
                    <RecentIdeas ideas={ideas} isLoading={isLoadingIdeas} />
                  </div>
                  <Button asChild className="w-full font-semibold" variant="outline">
                    <Link to="/search">
                      Explore All Ideas <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}