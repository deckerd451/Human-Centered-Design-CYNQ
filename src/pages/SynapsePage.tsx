import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getIdeas, getUsers, getTeams } from "@/lib/apiClient";
import { Idea, User, Team } from "@shared/types";
import { useTheme } from "@/hooks/use-theme";
const nodeTypes = {
  idea: (props: any) => (
    <div className="p-3 rounded-lg shadow-md bg-blue-500/10 border-2 border-blue-500 text-foreground w-48 text-center">
      <p className="text-sm font-bold truncate">{props.data.label}</p>
    </div>
  ),
  user: (props: any) => (
    <div className="p-2 rounded-full shadow-md bg-green-500/10 border-2 border-green-500 text-foreground flex items-center gap-2 w-48">
      <img src={props.data.avatarUrl} alt={props.data.label} className="w-6 h-6 rounded-full" />
      <p className="text-xs font-semibold truncate">{props.data.label}</p>
    </div>
  ),
  skill: (props: any) => (
    <div className="px-3 py-1 rounded-full shadow-sm bg-yellow-500/10 border-2 border-yellow-500 text-foreground text-xs font-medium">
      {props.data.label}
    </div>
  ),
};
const transformDataToGraph = (ideas: Idea[], users: User[], teams: Team[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const skillNodes = new Map<string, Node>();
  ideas.forEach((idea, index) => {
    const ideaNodeId = `idea-${idea.id}`;
    nodes.push({
      id: ideaNodeId,
      type: 'idea',
      data: { label: idea.title },
      position: { x: index * 250, y: 100 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
    const author = users.find(u => u.id === idea.authorId);
    if (author) {
      const authorNodeId = `user-${author.id}`;
      if (!nodes.some(n => n.id === authorNodeId)) {
        nodes.push({
          id: authorNodeId,
          type: 'user',
          data: { label: author.name, avatarUrl: author.avatarUrl },
          position: { x: index * 250 - 50, y: 300 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });
      }
      edges.push({ id: `e-${ideaNodeId}-${authorNodeId}`, source: ideaNodeId, target: authorNodeId, label: 'authored by' });
    }
    idea.skillsNeeded.forEach((skill, skillIndex) => {
      let skillNode = skillNodes.get(skill);
      if (!skillNode) {
        const skillNodeId = `skill-${skill.replace(/\s+/g, '-')}`;
        skillNode = {
          id: skillNodeId,
          type: 'skill',
          data: { label: skill },
          position: { x: index * 250 + skillIndex * 60 - 100, y: 0 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        };
        skillNodes.set(skill, skillNode);
        nodes.push(skillNode);
      }
      edges.push({ id: `e-${ideaNodeId}-${skillNode.id}`, source: skillNode.id, target: ideaNodeId, label: 'needs' });
    });
  });
  teams.forEach((team) => {
    const ideaNodeId = `idea-${team.ideaId}`;
    team.members.forEach((memberId) => {
      const user = users.find(u => u.id === memberId);
      if (user) {
        const userNodeId = `user-${user.id}`;
        if (!nodes.some(n => n.id === userNodeId)) {
          nodes.push({
            id: userNodeId,
            type: 'user',
            data: { label: user.name, avatarUrl: user.avatarUrl },
            position: { x: Math.random() * 800, y: 500 + Math.random() * 100 },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
          });
        }
        edges.push({ id: `e-${userNodeId}-${ideaNodeId}`, source: userNodeId, target: ideaNodeId, label: 'member of' });
      }
    });
  });
  return { nodes, edges };
};
export function SynapsePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  useEffect(() => {
    setLoading(true);
    Promise.all([getIdeas(), getUsers(), getTeams()])
      .then(([ideas, users, teams]) => {
        const { nodes: initialNodes, edges: initialEdges } = transformDataToGraph(ideas, users, teams);
        setNodes(initialNodes);
        setEdges(initialEdges);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to load data for graph:", error);
        setLoading(false);
      });
  }, [setNodes, setEdges]);
  const onConnect = useCallback((params: any) => setEdges((eds) => [...eds, params]), [setEdges]);
  return (
    <AppLayout>
      <div className="h-screen w-full flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-primary" />
            Synapse: The Idea Graph
          </h1>
          <p className="text-muted-foreground">
            Visualize the connections between ideas, people, and skills.
          </p>
        </div>
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className={isDark ? "dark" : ""}
            >
              <Controls />
              <MiniMap />
              <Background gap={12} size={1} />
            </ReactFlow>
          )}
        </div>
      </div>
    </AppLayout>
  );
}