import { User, Idea, Team, Comment, Notification } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
import { Env } from './core-utils';
interface SupabaseFetchOptions {
  table: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: object | null;
  query?: string;
  rpc?: boolean;
}
const supabaseFetch = async <T>(env: Env, { table, method = 'GET', body = null, query = '', rpc = false }: SupabaseFetchOptions): Promise<T> => {
  const url = rpc
    ? `${env.SUPABASE_URL}/rpc/${table}`
    : `${env.SUPABASE_URL}/rest/v1/${table}${query}`;
  const options: RequestInit = {
    method,
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  if (method !== 'GET') {
    (options.headers as Record<string, string>)['Prefer'] = 'return=representation';
  }
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Supabase fetch error: ${response.status} ${response.statusText}`, { url, errorText });
    throw new Error(`Supabase request failed: ${errorText}`);
  }
  if (response.status === 204) { // No Content
    return null as T;
  }
  return response.json() as Promise<T>;
};
const handleError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error);
  throw new Error(`Database operation failed: ${context}`);
};
// User Functions
export const sendMagicLink = async (env: Env, email: string): Promise<{ success: boolean; token?: string }> => {
  console.log(`Simulating magic link for ${email}`);
  const token = `demo-token-for-${email}`;
  return { success: true, token };
};
export const verifyMagicToken = async (env: Env, token: string): Promise<User | null> => {
  if (token.startsWith('demo-token-for-')) {
    const email = token.replace('demo-token-for-', '');
    try {
      const users = await supabaseFetch<User[]>(env, { table: 'users', query: `?select=*&email=eq.${email}&limit=1` });
      return users?.[0] || null;
    } catch (error) {
      handleError(error, 'verifyMagicToken');
      return null;
    }
  }
  return null;
};
export const getUsers = async (env: Env): Promise<User[]> => {
  try {
    return await supabaseFetch<User[]>(env, { table: 'users', query: '?select=*' });
  } catch (error) {
    handleError(error, 'getUsers');
    return [];
  }
};
export const updateUser = async (env: Env, userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const data = await supabaseFetch<User[]>(env, {
      table: 'users',
      method: 'PATCH',
      body: updates,
      query: `?id=eq.${userId}`,
    });
    return data?.[0] || null;
  } catch (error) {
    handleError(error, 'updateUser');
    return null;
  }
};
// Idea Functions
export const getIdeas = async (env: Env): Promise<Idea[]> => {
  try {
    const data = await supabaseFetch<any[]>(env, { table: 'ideas', query: '?select=*&order=created_at.desc' });
    return (data || []).map(idea => ({ ...idea, createdAt: idea.created_at }));
  } catch (error) {
    handleError(error, 'getIdeas');
    return [];
  }
};
export const getIdeaById = async (env: Env, id: string): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null> => {
  try {
    const ideaData = await supabaseFetch<any[]>(env, { table: 'ideas', query: `?select=*&id=eq.${id}` });
    if (!ideaData || ideaData.length === 0) return null;
    const idea = { ...ideaData[0], createdAt: ideaData[0].created_at };
    const authorData = await supabaseFetch<User[]>(env, { table: 'users', query: `?select=*&id=eq.${idea.authorId}` });
    const author = authorData[0];
    const teamData = await supabaseFetch<Team[]>(env, { table: 'teams', query: `?select=*&ideaId=eq.${id}` });
    const team = teamData?.[0];
    const memberIds = team?.members || [];
    const requesterIds = team?.joinRequests || [];
    const allUserIds = [...new Set([...memberIds, ...requesterIds])];
    let teamMembers: User[] = [];
    let joinRequesters: User[] = [];
    if (allUserIds.length > 0) {
      const users = await supabaseFetch<User[]>(env, { table: 'users', query: `?select=*&id=in.(${allUserIds.join(',')})` });
      teamMembers = users?.filter(u => memberIds.includes(u.id)) || [];
      joinRequesters = users?.filter(u => requesterIds.includes(u.id)) || [];
    }
    return { idea, author, team, teamMembers, joinRequesters };
  } catch (error) {
    handleError(error, `getIdeaById (id: ${id})`);
    return null;
  }
};
export const addIdea = async (env: Env, ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes'>): Promise<Idea> => {
  const newIdea = {
    ...ideaData,
    id: uuidv4(),
    upvotes: 0,
    created_at: new Date().toISOString(),
    projectBoard: {
      columns: [
        { id: 'todo', title: 'To Do', tasks: [] },
        { id: 'inProgress', title: 'In Progress', tasks: [] },
        { id: 'done', title: 'Done', tasks: [] },
      ],
    },
  };
  try {
    const data = await supabaseFetch<any[]>(env, { table: 'ideas', method: 'POST', body: newIdea });
    const result = data?.[0];
    return { ...result, createdAt: result.created_at };
  } catch (error) {
    handleError(error, 'addIdea');
    throw error;
  }
};
export const updateIdea = async (env: Env, id: string, updates: Partial<Idea>): Promise<Idea | null> => {
  try {
    const data = await supabaseFetch<any[]>(env, { table: 'ideas', method: 'PATCH', body: updates, query: `?id=eq.${id}` });
    const result = data?.[0];
    return result ? { ...result, createdAt: result.created_at } : null;
  } catch (error) {
    handleError(error, 'updateIdea');
    return null;
  }
};
export const deleteIdea = async (env: Env, id: string): Promise<void> => {
  try {
    await supabaseFetch(env, { table: 'comments', method: 'DELETE', query: `?ideaId=eq.${id}` });
    await supabaseFetch(env, { table: 'teams', method: 'DELETE', query: `?ideaId=eq.${id}` });
    await supabaseFetch(env, { table: 'notifications', method: 'DELETE', query: `?link=like.*${id}*` });
    await supabaseFetch(env, { table: 'ideas', method: 'DELETE', query: `?id=eq.${id}` });
  } catch (error) {
    handleError(error, 'deleteIdea');
  }
};
export const upvoteIdea = async (env: Env, ideaId: string): Promise<Idea | null> => {
  try {
    const data = await supabaseFetch<any[]>(env, { table: 'increment_upvotes', method: 'POST', body: { idea_id: ideaId }, rpc: true });
    const result = data?.[0];
    return result ? { ...result, createdAt: result.created_at } : null;
  } catch (error) {
    handleError(error, 'upvoteIdea');
    return null;
  }
};
// Team Functions
export const getTeams = async (env: Env): Promise<Team[]> => {
  try {
    return await supabaseFetch<Team[]>(env, { table: 'teams', query: '?select=*' });
  } catch (error) {
    handleError(error, 'getTeams');
    return [];
  }
};
export const requestToJoinIdea = async (env: Env, ideaId: string, userId: string): Promise<Team> => {
  try {
    const data = await supabaseFetch<Team[]>(env, { table: 'request_to_join', method: 'POST', body: { p_idea_id: ideaId, p_user_id: userId }, rpc: true });
    return data?.[0];
  } catch (error) {
    handleError(error, 'requestToJoinIdea');
    throw error;
  }
};
export const acceptJoinRequest = async (env: Env, ideaId: string, userId: string): Promise<Team | null> => {
  try {
    const data = await supabaseFetch<Team[]>(env, { table: 'accept_join_request', method: 'POST', body: { p_idea_id: ideaId, p_user_id: userId }, rpc: true });
    return data?.[0];
  } catch (error) {
    handleError(error, 'acceptJoinRequest');
    return null;
  }
};
export const declineJoinRequest = async (env: Env, ideaId: string, userId: string): Promise<Team | null> => {
  try {
    const data = await supabaseFetch<Team[]>(env, { table: 'decline_join_request', method: 'POST', body: { p_idea_id: ideaId, p_user_id: userId }, rpc: true });
    return data?.[0];
  } catch (error) {
    handleError(error, 'declineJoinRequest');
    return null;
  }
};
// Comment Functions
export const getCommentsForIdea = async (env: Env, ideaId: string): Promise<Comment[]> => {
  try {
    const data = await supabaseFetch<any[]>(env, { table: 'comments', query: `?select=*&ideaId=eq.${ideaId}&order=created_at.asc` });
    return (data || []).map(c => ({ ...c, createdAt: c.created_at }));
  } catch (error) {
    handleError(error, 'getCommentsForIdea');
    return [];
  }
};
export const addComment = async (env: Env, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  const newComment = { ...commentData, id: uuidv4(), created_at: new Date().toISOString() };
  try {
    const data = await supabaseFetch<any[]>(env, { table: 'comments', method: 'POST', body: newComment });
    const result = data?.[0];
    return { ...result, createdAt: result.created_at };
  } catch (error) {
    handleError(error, 'addComment');
    throw error;
  }
};
// Notification Functions
export const getNotificationsForUser = async (env: Env, userId: string): Promise<Notification[]> => {
  try {
    const data = await supabaseFetch<any[]>(env, { table: 'notifications', query: `?select=*&userId=eq.${userId}&order=created_at.desc` });
    return (data || []).map(n => ({ ...n, createdAt: n.created_at }));
  } catch (error) {
    handleError(error, 'getNotificationsForUser');
    return [];
  }
};
export const markNotificationsAsRead = async (env: Env, userId: string, notificationIds: string[]): Promise<void> => {
  try {
    await supabaseFetch(env, { table: 'notifications', method: 'PATCH', body: { read: true }, query: `?userId=eq.${userId}&id=in.(${notificationIds.join(',')})` });
  } catch (error) {
    handleError(error, 'markNotificationsAsRead');
  }
};
// Leaderboard Function
export const getLeaderboardData = async (env: Env): Promise<{ users: User[], ideas: Idea[] }> => {
  try {
    const users = await supabaseFetch<User[]>(env, { table: 'users', query: '?select=*&limit=5' }); // Simplified logic
    const ideasData = await supabaseFetch<any[]>(env, { table: 'ideas', query: '?select=*&order=upvotes.desc&limit=5' });
    const ideas = (ideasData || []).map(idea => ({ ...idea, createdAt: idea.created_at }));
    return { users: users || [], ideas };
  } catch (error) {
    handleError(error, 'getLeaderboardData');
    return { users: [], ideas: [] };
  }
};