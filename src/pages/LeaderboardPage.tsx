import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
export function LeaderboardPage() {
  return (
    <AppLayout container>
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4">
              <Trophy className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl">Leaderboard</CardTitle>
            <CardDescription className="text-lg">See who's making an impact.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              A leaderboard showcasing the top innovators and most popular ideas is on its way. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}