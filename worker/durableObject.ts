import { DurableObject } from "cloudflare:workers";
import type { User, Idea, Team, Comment, Notification } from '@shared/types';
import { SupabaseClient } from './supabaseClient';
export class GlobalDurableObject extends DurableObject {
    private supabase: SupabaseClient;
    constructor(state: DurableObjectState, env: unknown) {
        super(state, env as any);
        this.supabase = new SupabaseClient();
    }
    async getUsers(): Promise<User[]> {
        return this.supabase.getUsers();
    }
    async getIdeas(): Promise<Idea[]> {
        return this.supabase.getIdeas();
    }
    async getTeams(): Promise<Team[]> {
        return this.supabase.getTeams();
    }
    async getCommentsForIdea(ideaId: string): Promise<Comment[]> {
        return this.supabase.getCommentsForIdea(ideaId);
    }
    async addComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
        return this.supabase.addComment(commentData);
    }
    async getIdeaById(id: string): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null> {
        return this.supabase.getIdeaById(id);
    }
    async getLeaderboardData(): Promise<{ users: User[], ideas: Idea[] }> {
        return this.supabase.getLeaderboardData();
    }
    async addIdea(ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes'>): Promise<Idea> {
        return this.supabase.addIdea(ideaData);
    }
    async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
        return this.supabase.updateUser(userId, updates);
    }
    async upvoteIdea(ideaId: string): Promise<Idea | null> {
        return this.supabase.upvoteIdea(ideaId);
    }
    async requestToJoinIdea(ideaId: string, userId: string): Promise<Team> {
        return this.supabase.requestToJoinIdea(ideaId, userId);
    }
    async acceptJoinRequest(ideaId: string, userId: string): Promise<Team | null> {
        return this.supabase.acceptJoinRequest(ideaId, userId);
    }
    async declineJoinRequest(ideaId: string, userId: string): Promise<Team | null> {
        return this.supabase.declineJoinRequest(ideaId, userId);
    }
    async getNotificationsForUser(userId: string): Promise<Notification[]> {
        return this.supabase.getNotificationsForUser(userId);
    }
    async markNotificationsAsRead(userId: string, notificationIds: string[]): Promise<void> {
        return this.supabase.markNotificationsAsRead(userId, notificationIds);
    }
}