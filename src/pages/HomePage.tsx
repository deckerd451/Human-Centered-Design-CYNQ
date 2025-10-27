import { AppLayout } from '@/components/layout/AppLayout';
import NeuralBackground from '@/components/NeuralBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Lightbulb, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getIdeas } from '@/lib/apiClient';
import { Idea } from '@/lib/types';
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const RecentIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getIdeas().then(data => {
      setIdeas(data.slice(0, 3)); // Show top 3 recent ideas
      setLoading(false);
    });
  }, []);
  if (loading) {
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
      {ideas.map(idea => (
        <div key={idea.id} className="p-4 border rounded-lg bg-background/50">
          <h4 className="font-semibold">{idea.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{idea.description}</p>
        </div>
      ))}
    </div>
  );
};
export function HomePage() {
  return (
    <AppLayout>
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
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="idea-title">Idea Title</Label>
                    <Input id="idea-title" placeholder="e.g., AI-Powered Code Reviewer" />
                  </div>
                  <div>
                    <Label htmlFor="idea-description">Description</Label>
                    <Textarea id="idea-description" placeholder="Describe your idea in a few sentences." />
                  </div>
                  <div>
                    <Label htmlFor="idea-tags">Tags (comma-separated)</Label>
                    <Input id="idea-tags" placeholder="e.g., AI, Developer Tools, SaaS" />
                  </div>
                  <Button className="w-full font-semibold">Submit Idea</Button>
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
                    <RecentIdeas />
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