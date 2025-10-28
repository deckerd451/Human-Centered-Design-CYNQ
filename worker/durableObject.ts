import { DurableObject } from "cloudflare:workers";
import type { User, Idea, Team, Comment, Notification } from '@shared/types';
import * as supabase from './supabase';
import { Env } from "./core-utils";
export class GlobalDurableObject extends DurableObject {
    protected env: Env;
    constructor(state: DurableObjectState, env: unknown) {
        super(state, env as any);
        this.env = env as Env;
    }
    // Auth methods
    async sendMagicLink(email: string, env: Env): Promise<{ success: boolean; token?: string }> {
        return supabase.sendMagicLink(env, email);
    }
    async verifyMagicToken(token: string, env: Env): Promise<User | null> {
        return supabase.verifyMagicToken(env, token);
    }
    // Data retrieval methods
    async getUsers(env: Env): Promise<User[]> {
        return supabase.getUsers(env);
    }
    async getIdeas(env: Env): Promise<Idea[]> {
        return supabase.getIdeas(env);
    }
    async getTeams(env: Env): Promise<Team[]> {
        return supabase.getTeams(env);
    }
    async getCommentsForIdea(ideaId: string, env: Env): Promise<Comment[]> {
        return supabase.getCommentsForIdea(env, ideaId);
    }
    async getIdeaById(id: string, env: Env): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null> {
        return supabase.getIdeaById(env, id);
    }
    async getLeaderboardData(env: Env): Promise<{ users: User[], ideas: Idea[] }> {
        return supabase.getLeaderboardData(env);
    }
    async getNotificationsForUser(userId: string, env: Env): Promise<Notification[]> {
        return supabase.getNotificationsForUser(env, userId);
    }
    // Data mutation methods
    async addComment(commentData: Omit<Comment, 'id' | 'createdAt'>, env: Env): Promise<Comment> {
        return supabase.addComment(env, commentData);
    }
    async addIdea(ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes'>, env: Env): Promise<Idea> {
        return supabase.addIdea(env, ideaData);
    }
    async updateUser(userId: string, updates: Partial<User>, env: Env): Promise<User | null> {
        return supabase.updateUser(env, userId, updates);
    }
    async upvoteIdea(ideaId: string, env: Env): Promise<Idea | null> {
        return supabase.upvoteIdea(env, ideaId);
    }
    async requestToJoinIdea(ideaId: string, userId: string, env: Env): Promise<Team> {
        return supabase.requestToJoinIdea(env, ideaId, userId);
    }
    async acceptJoinRequest(ideaId: string, userId: string, env: Env): Promise<Team | null> {
        return supabase.acceptJoinRequest(env, ideaId, userId);
    }
    async declineJoinRequest(ideaId: string, userId: string, env: Env): Promise<Team | null> {
        return supabase.declineJoinRequest(env, ideaId, userId);
    }
    async markNotificationsAsRead(userId: string, notificationIds: string[], env: Env): Promise<void> {
        return supabase.markNotificationsAsRead(env, userId, notificationIds);
    }
    async updateIdea(id: string, updates: Partial<Idea>, env: Env): Promise<Idea | null> {
        return supabase.updateIdea(env, id, updates);
    }
    async deleteIdea(id: string, env: Env): Promise<void> {
        return supabase.deleteIdea(env, id);
    }
}