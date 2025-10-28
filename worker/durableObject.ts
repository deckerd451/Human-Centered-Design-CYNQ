import { DurableObject } from "cloudflare:workers";
import type { User, Idea, Team, Comment, Notification } from '@shared/types';
import * as supabase from './supabase';
import { SanitizedEnv, Env } from "./core-utils";
export class GlobalDurableObject extends DurableObject {
    protected env: SanitizedEnv;
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        // It's safe to store the env object here, as it's part of the DO's context
        const { GlobalDurableObject, ...sanitizedEnv } = env;
        this.env = sanitizedEnv;
    }
    // Data retrieval methods
    async getUsers(): Promise<User[]> {
        return supabase.getUsers(this.env);
    }
    async getIdeas(): Promise<Idea[]> {
        return supabase.getIdeas(this.env);
    }
    async getTeams(): Promise<Team[]> {
        return supabase.getTeams(this.env);
    }
    async getCommentsForIdea(ideaId: string): Promise<Comment[]> {
        return supabase.getCommentsForIdea(this.env, ideaId);
    }
    async getIdeaById(id: string): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null> {
        return supabase.getIdeaById(this.env, id);
    }
    async getLeaderboardData(): Promise<{ users: User[], ideas: Idea[] }> {
        return supabase.getLeaderboardData(this.env);
    }
    async getNotificationsForUser(userId: string): Promise<Notification[]> {
        return supabase.getNotificationsForUser(this.env, userId);
    }
    // Data mutation methods
    async addComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
        return supabase.addComment(this.env, commentData);
    }
    async addIdea(ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes'>): Promise<Idea> {
        return supabase.addIdea(this.env, ideaData);
    }
    async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
        return supabase.updateUser(this.env, userId, updates);
    }
    async upvoteIdea(ideaId: string): Promise<Idea | null> {
        return supabase.upvoteIdea(this.env, ideaId);
    }
    async requestToJoinIdea(ideaId: string, userId: string): Promise<Team> {
        return supabase.requestToJoinIdea(this.env, ideaId, userId);
    }
    async acceptJoinRequest(ideaId: string, userId: string): Promise<Team | null> {
        return supabase.acceptJoinRequest(this.env, ideaId, userId);
    }
    async declineJoinRequest(ideaId: string, userId: string): Promise<Team | null> {
        return supabase.declineJoinRequest(this.env, ideaId, userId);
    }
    async markNotificationsAsRead(userId: string, notificationIds: string[]): Promise<void> {
        return supabase.markNotificationsAsRead(this.env, userId, notificationIds);
    }
    async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea | null> {
        return supabase.updateIdea(this.env, id, updates);
    }
    async deleteIdea(id: string): Promise<void> {
        return supabase.deleteIdea(this.env, id);
    }
}