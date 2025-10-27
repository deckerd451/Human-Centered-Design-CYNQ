import React from "react";
import { Home, User, Search, Users, Trophy, BrainCircuit, LifeBuoy, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/authStore";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const authState = useAuthStore((s) => s.authState);
  const isConnected = authState === 'connected';
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <BrainCircuit className="size-6 text-primary" />
          <span className="text-lg font-semibold">Innovation Engine</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                <Link to="/"><Home /> <span>Home</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isConnected && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/dashboard'}>
                    <Link to="/dashboard"><User /> <span>Profile</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/search'}>
                    <Link to="/search"><Search /> <span>Search</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/team-builder'}>
                    <Link to="/team-builder"><Users /> <span>Team Builder</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/leaderboard'}>
                    <Link to="/leaderboard"><Trophy /> <span>Leaderboard</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/synapse'}>
                    <Link to="/synapse"><BrainCircuit /> <span>Idea Graph</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="https://www.cloudflare.com/" target="_blank" rel="noopener noreferrer"><LifeBuoy /> <span>Support</span></a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/settings'}>
                <Link to="/settings"><Settings /> <span>Settings</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 text-xs text-muted-foreground">Built with ��️ at Cloudflare</div>
      </SidebarFooter>
    </Sidebar>
  );
}