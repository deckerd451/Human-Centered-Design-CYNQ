import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, Idea, Team, User, Comment, Notification } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // GET all resources
    app.get('/api/ideas', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.getIdeas(sanitizedEnv);
        return c.json({ success: true, data: data.reverse() } satisfies ApiResponse<Idea[]>);
    });
    app.get('/api/teams', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.getTeams(sanitizedEnv);
        return c.json({ success: true, data } satisfies ApiResponse<Team[]>);
    });
    app.get('/api/users', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.getUsers(sanitizedEnv);
        return c.json({ success: true, data } satisfies ApiResponse<User[]>);
    });
    app.get('/api/leaderboard', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.getLeaderboardData(sanitizedEnv);
        return c.json({ success: true, data } satisfies ApiResponse<{ users: User[], ideas: Idea[] }>);
    });
    // GET single resource
    app.get('/api/ideas/:id', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.getIdeaById(id, sanitizedEnv);
        if (!data) {
            return c.json({ success: false, error: 'Idea not found' }, 404);
        }
        return c.json({ success: true, data });
    });
    // GET comments for an idea
    app.get('/api/ideas/:id/comments', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.getCommentsForIdea(id, sanitizedEnv);
        return c.json({ success: true, data } satisfies ApiResponse<Comment[]>);
    });
    // GET notifications for a user
    app.get('/api/notifications/:userId', async (c) => {
        const userId = c.req.param('userId');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.getNotificationsForUser(userId, sanitizedEnv);
        return c.json({ success: true, data } satisfies ApiResponse<Notification[]>);
    });
    // POST to create a resource
    app.post('/api/ideas', async (c) => {
        const body = await c.req.json<Omit<Idea, 'id' | 'createdAt' | 'upvotes'>>();
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.addIdea(body, sanitizedEnv);
        return c.json({ success: true, data } satisfies ApiResponse<Idea>, 201);
    });
    // POST a comment to an idea
    app.post('/api/ideas/:id/comments', async (c) => {
        const ideaId = c.req.param('id');
        const body = await c.req.json<{ authorId: string; content: string }>();
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.addComment({ ...body, ideaId }, sanitizedEnv);
        return c.json({ success: true, data } satisfies ApiResponse<Comment>, 201);
    });
    // POST to manage join requests
    app.post('/api/ideas/:ideaId/requests/accept', async (c) => {
        const ideaId = c.req.param('ideaId');
        const { userId } = await c.req.json<{ userId: string }>();
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.acceptJoinRequest(ideaId, userId, sanitizedEnv);
        if (!data) return c.json({ success: false, error: 'Request not found or failed to accept' }, 404);
        return c.json({ success: true, data } satisfies ApiResponse<Team>);
    });
    app.post('/api/ideas/:ideaId/requests/decline', async (c) => {
        const ideaId = c.req.param('ideaId');
        const { userId } = await c.req.json<{ userId: string }>();
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.declineJoinRequest(ideaId, userId, sanitizedEnv);
        if (!data) return c.json({ success: false, error: 'Request not found or failed to decline' }, 404);
        return c.json({ success: true, data } satisfies ApiResponse<Team>);
    });
    // PUT to update resources
    app.put('/api/users/me', async (c) => {
        const body = await c.req.json<{ userId: string; updates: Partial<User> }>();
        if (!body.userId || !body.updates) {
            return c.json({ success: false, error: 'User ID and updates are required' }, 400);
        }
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.updateUser(body.userId, body.updates, sanitizedEnv);
        if (!data) {
            return c.json({ success: false, error: 'User not found' }, 404);
        }
        return c.json({ success: true, data } satisfies ApiResponse<User>);
    });
    app.put('/api/ideas/:id', async (c) => {
        const id = c.req.param('id');
        const body = await c.req.json<Partial<Idea>>();
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.updateIdea(id, body, sanitizedEnv);
        if (!data) {
            return c.json({ success: false, error: 'Idea not found or update failed' }, 404);
        }
        return c.json({ success: true, data } satisfies ApiResponse<Idea>);
    });
    app.put('/api/ideas/:id/upvote', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.upvoteIdea(id, sanitizedEnv);
        if (!data) {
            return c.json({ success: false, error: 'Idea not found' }, 404);
        }
        return c.json({ success: true, data } satisfies ApiResponse<Idea>);
    });
    app.put('/api/ideas/:id/join', async (c) => {
        const id = c.req.param('id');
        const { userId } = await c.req.json<{ userId: string }>();
        if (!userId) {
            return c.json({ success: false, error: 'User ID is required' }, 400);
        }
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        const data = await stub.requestToJoinIdea(id, userId, sanitizedEnv);
        return c.json({ success: true, data } satisfies ApiResponse<Team>);
    });
    // PUT to mark notifications as read
    app.put('/api/notifications/read', async (c) => {
        const { userId, notificationIds } = await c.req.json<{ userId: string; notificationIds: string[] }>();
        if (!userId || !notificationIds) {
            return c.json({ success: false, error: 'User ID and notification IDs are required' }, 400);
        }
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        await stub.markNotificationsAsRead(userId, notificationIds, sanitizedEnv);
        return c.json({ success: true });
    });
    // DELETE a resource
    app.delete('/api/ideas/:id', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const { GlobalDurableObject, ...sanitizedEnv } = c.env;
        await stub.deleteIdea(id, sanitizedEnv);
        return c.json({ success: true }, 200);
    });
}