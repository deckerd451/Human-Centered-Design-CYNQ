import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Lightbulb, Star, Tag, Frown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getIdeas } from "@/lib/apiClient";
import { Idea } from "@shared/types";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
const IdeaCard = ({ idea }: { idea: Idea }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className="h-full"
  >
    <Card className="h-full flex flex-col hover:border-primary/50 transition-colors duration-300">
      <CardHeader>
        <CardTitle>{idea.title}</CardTitle>
        <CardDescription className="line-clamp-3">{idea.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {idea.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center text-sm text-muted-foreground">
          <Star className="h-4 w-4 mr-1 text-yellow-500" />
          <span>{idea.upvotes} upvotes</span>
        </div>
      </CardFooter>
    </Card>
  </motion.div>
);
const SearchSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-5/6 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-5 w-28" />
        </CardFooter>
      </Card>
    ))}
  </div>
);
export function SearchPage() {
  const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    getIdeas().then(data => {
      setAllIdeas(data);
      setFilteredIdeas(data);
      setLoading(false);
    }).catch(err => {
        console.error("Failed to load ideas:", err);
        setLoading(false);
    });
  }, []);
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allIdeas.forEach(idea => {
      idea.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allIdeas]);
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const ideas = allIdeas.filter(idea => {
      const matchesQuery = lowercasedQuery === '' ||
        idea.title.toLowerCase().includes(lowercasedQuery) ||
        idea.description.toLowerCase().includes(lowercasedQuery);
      const matchesTags = activeTags.size === 0 ||
        Array.from(activeTags).every(tag => idea.tags.includes(tag));
      return matchesQuery && matchesTags;
    });
    setFilteredIdeas(ideas);
  }, [searchQuery, activeTags, allIdeas]);
  const handleTagToggle = (tag: string) => {
    setActiveTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  };
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Lightbulb className="h-10 w-10 text-primary" />
            Explore Ideas
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover projects, find inspiration, and connect with innovators.
          </p>
        </header>
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for ideas by title or description..."
              className="pl-10 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5" />
                Filter by Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={activeTags.has(tag) ? "default" : "secondary"}
                    onClick={() => handleTagToggle(tag)}
                    className="cursor-pointer text-sm px-3 py-1 transition-all hover:scale-105"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          {loading ? (
            <SearchSkeleton />
          ) : filteredIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredIdeas.map(idea => (
                  <Link to={`/idea/${idea.id}`} key={idea.id} className="block">
                    <IdeaCard idea={idea} />
                  </Link>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-16">
              <Frown className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-2xl font-semibold">No Ideas Found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}