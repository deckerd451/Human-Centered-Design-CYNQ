import { DurableObject } from "cloudflare:workers";
import type { User, Idea, Team, Comment, Notification } from '@shared/types';
import * as supabase from './supabase';
export class GlobalDurableObject extends DurableObject {
    constructor(state: DurableObjectState, env: unknown) {
        super(state, env as any);
    }
    // Auth methods
    async sendMagicLink(email: string): Promise<{ success: boolean; token?: string }> {
        return supabase.sendMagicLink(email);
    }
    async verifyMagicToken(token: string): Promise<User | null> {
        return supabase.verifyMagicToken(token);
    }
    // Data retrieval methods
    async getUsers(): Promise<User[]> {
        return supabase.getUsers();
    }
    async getIdeas(): Promise<Idea[]> {
        return supabase.getIdeas();
    }
    async getTeams(): Promise<Team[]> {
        return supabase.getTeams();
    }
    async getCommentsForIdea(ideaId: string): Promise<Comment[]> {
        return supabase.getCommentsForIdea(ideaId);
    }
    async getIdeaById(id: string): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null> {
        return supabase.getIdeaById(id);
    }
    async getLeaderboardData(): Promise<{ users: User[], ideas: Idea[] }> {
        return supabase.getLeaderboardData();
    }
    async getNotificationsForUser(userId: string): Promise<Notification[]> {
        return supabase.getNotificationsForUser(userId);
    }
    // Data mutation methods
    async addComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
        return supabase.addComment(commentData);
    }
    async addIdea(ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes'>): Promise<Idea> {
        return supabase.addIdea(ideaData);
    }
    async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
        return supabase.updateUser(userId, updates);
    }
    async upvoteIdea(ideaId: string): Promise<Idea | null> {
        return supabase.upvoteIdea(ideaId);
    }
    async requestToJoinIdea(ideaId: string, userId: string): Promise<Team> {
        return supabase.requestToJoinIdea(ideaId, userId);
    }
    async acceptJoinRequest(ideaId: string, userId: string): Promise<Team | null> {
        return supabase.acceptJoinRequest(ideaId, userId);
    }
    async declineJoinRequest(ideaId: string, userId: string): Promise<Team | null> {
        return supabase.declineJoinRequest(ideaId, userId);
    }
    async markNotificationsAsRead(userId: string, notificationIds: string[]): Promise<void> {
        return supabase.markNotificationsAsRead(userId, notificationIds);
    }
    async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea | null> {
        return supabase.updateIdea(id, updates);
    }
    async deleteIdea(id: string): Promise<void> {
        return supabase.deleteIdea(id);
    }
}