import React from "react";
import { Home, LayoutDashboard, Settings, LifeBuoy, Github } from "lucide-react";
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
          <Github className="size-6 text-primary" />
          <span className="text-lg font-semibold">CodeStream</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                <Link to="/"><Home /> <span>Profile</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isConnected && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/dashboard'}>
                  <Link to="/dashboard"><LayoutDashboard /> <span>Dashboard</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="https://github.com/features/codespaces" target="_blank" rel="noopener noreferrer"><LifeBuoy /> <span>Support</span></a>
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
        <div className="px-2 text-xs text-muted-foreground">Built with ❤️ at Cloudflare</div>
      </SidebarFooter>
    </Sidebar>
  );
}