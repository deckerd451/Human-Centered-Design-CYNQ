import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
export function TeamBuilderPage() {
  return (
    <AppLayout container>
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4">
              <Users className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl">Team Builder</CardTitle>
            <CardDescription className="text-lg">Assemble your dream team.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This space will help you find collaborators with the right skills and interests to bring your ideas to life. Stay tuned!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}