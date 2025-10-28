import { DurableObject } from "cloudflare:workers";
import type { User, Idea, Team, Comment, Notification } from '@shared/types';
import * as supabase from './supabase';
import { SanitizedEnv } from "./core-utils";
export class GlobalDurableObject extends DurableObject {
    constructor(state: DurableObjectState, env: unknown) {
        super(state, env as any);
    }
    // Data retrieval methods
    async getUsers(env: SanitizedEnv): Promise<User[]> {
        return supabase.getUsers(env);
    }
    async getIdeas(env: SanitizedEnv): Promise<Idea[]> {
        return supabase.getIdeas(env);
    }
    async getTeams(env: SanitizedEnv): Promise<Team[]> {
        return supabase.getTeams(env);
    }
    async getCommentsForIdea(env: SanitizedEnv, ideaId: string): Promise<Comment[]> {
        return supabase.getCommentsForIdea(env, ideaId);
    }
    async getIdeaById(env: SanitizedEnv, id: string): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null> {
        return supabase.getIdeaById(env, id);
    }
    async getLeaderboardData(env: SanitizedEnv): Promise<{ users: User[], ideas: Idea[] }> {
        return supabase.getLeaderboardData(env);
    }
    async getNotificationsForUser(env: SanitizedEnv, userId: string): Promise<Notification[]> {
        return supabase.getNotificationsForUser(env, userId);
    }
    // Data mutation methods
    async addComment(env: SanitizedEnv, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
        return supabase.addComment(env, commentData);
    }
    async addIdea(env: SanitizedEnv, ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes'>): Promise<Idea> {
        return supabase.addIdea(env, ideaData);
    }
    async updateUser(env: SanitizedEnv, userId: string, updates: Partial<User>): Promise<User | null> {
        return supabase.updateUser(env, userId, updates);
    }
    async upvoteIdea(env: SanitizedEnv, ideaId: string): Promise<Idea | null> {
        return supabase.upvoteIdea(env, ideaId);
    }
    async requestToJoinIdea(env: SanitizedEnv, ideaId: string, userId: string): Promise<Team> {
        return supabase.requestToJoinIdea(env, ideaId, userId);
    }
    async acceptJoinRequest(env: SanitizedEnv, ideaId: string, userId: string): Promise<Team | null> {
        return supabase.acceptJoinRequest(env, ideaId, userId);
    }
    async declineJoinRequest(env: SanitizedEnv, ideaId: string, userId: string): Promise<Team | null> {
        return supabase.declineJoinRequest(env, ideaId, userId);
    }
    async markNotificationsAsRead(env: SanitizedEnv, userId: string, notificationIds: string[]): Promise<void> {
        return supabase.markNotificationsAsRead(env, userId, notificationIds);
    }
    async updateIdea(env: SanitizedEnv, id: string, updates: Partial<Idea>): Promise<Idea | null> {
        return supabase.updateIdea(env, id, updates);
    }
    async deleteIdea(env: SanitizedEnv, id: string): Promise<void> {
        return supabase.deleteIdea(env, id);
    }
}