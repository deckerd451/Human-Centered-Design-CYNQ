import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
export function SynapsePage() {
  return (
    <AppLayout container>
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl">Synapse: The Idea Graph</CardTitle>
            <CardDescription className="text-lg">Visualize the future of innovation.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We're developing a powerful visualization tool to map the connections between ideas, people, and technologies. Coming soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}