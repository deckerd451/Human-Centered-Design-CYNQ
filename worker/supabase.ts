import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Idea, Team, Comment, Notification } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
import { Env } from './core-utils';
const getSupabaseClient = (env: Env): SupabaseClient => {
  if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
    throw new Error('Supabase URL and Key must be provided in environment variables.');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
    auth: {
      persistSession: false,
    },
    global: {
      fetch: fetch,
    },
  });
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
    const { data: users, error } = await getSupabaseClient(env).from('users').select('*').eq('email', email).limit(1);
    if (error) handleError(error, 'verifyMagicToken');
    return users?.[0] || null;
  }
  return null;
};
export const getUsers = async (env: Env): Promise<User[]> => {
  const { data, error } = await getSupabaseClient(env).from('users').select('*');
  if (error) handleError(error, 'getUsers');
  return data || [];
};
export const updateUser = async (env: Env, userId: string, updates: Partial<User>): Promise<User | null> => {
  const { data, error } = await getSupabaseClient(env).from('users').update(updates).eq('id', userId).select();
  if (error) handleError(error, 'updateUser');
  return data?.[0] || null;
};
// Idea Functions
export const getIdeas = async (env: Env): Promise<Idea[]> => {
  const { data, error } = await getSupabaseClient(env).from('ideas').select('*').order('created_at', { ascending: false });
  if (error) handleError(error, 'getIdeas');
  return (data || []).map(idea => ({ ...idea, createdAt: idea.created_at }));
};
export const getIdeaById = async (env: Env, id: string): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null> => {
  const { data: ideaData, error: ideaError } = await getSupabaseClient(env).from('ideas').select('*').eq('id', id).single();
  if (ideaError || !ideaData) {
    if (ideaError && ideaError.code !== 'PGRST116') handleError(ideaError, `getIdeaById (idea ${id})`);
    return null;
  }
  const idea = { ...ideaData, createdAt: ideaData.created_at };
  const { data: author, error: authorError } = await getSupabaseClient(env).from('users').select('*').eq('id', idea.authorId).single();
  if (authorError) handleError(authorError, `getIdeaById (author ${idea.authorId})`);
  const { data: team, error: teamError } = await getSupabaseClient(env).from('teams').select('*').eq('ideaId', id).single();
  if (teamError && teamError.code !== 'PGRST116') handleError(teamError, `getIdeaById (team for idea ${id})`);
  const memberIds = team?.members || [];
  const requesterIds = team?.joinRequests || [];
  const allUserIds = [...new Set([...memberIds, ...requesterIds])];
  let teamMembers: User[] = [];
  let joinRequesters: User[] = [];
  if (allUserIds.length > 0) {
    const { data: users, error: usersError } = await getSupabaseClient(env).from('users').select('*').in('id', allUserIds);
    if (usersError) handleError(usersError, `getIdeaById (fetching team users)`);
    teamMembers = users?.filter(u => memberIds.includes(u.id)) || [];
    joinRequesters = users?.filter(u => requesterIds.includes(u.id)) || [];
  }
  return { idea, author, team, teamMembers, joinRequesters };
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
  const { data, error } = await getSupabaseClient(env).from('ideas').insert(newIdea).select();
  if (error) handleError(error, 'addIdea');
  const result = data?.[0];
  return { ...result, createdAt: result.created_at };
};
export const updateIdea = async (env: Env, id: string, updates: Partial<Idea>): Promise<Idea | null> => {
  const { data, error } = await getSupabaseClient(env).from('ideas').update(updates).eq('id', id).select();
  if (error) handleError(error, 'updateIdea');
  const result = data?.[0];
  return result ? { ...result, createdAt: result.created_at } : null;
};
export const deleteIdea = async (env: Env, id: string): Promise<void> => {
  await getSupabaseClient(env).from('comments').delete().eq('ideaId', id);
  await getSupabaseClient(env).from('teams').delete().eq('ideaId', id);
  await getSupabaseClient(env).from('notifications').delete().like('link', `%${id}%`);
  const { error } = await getSupabaseClient(env).from('ideas').delete().eq('id', id);
  if (error) handleError(error, 'deleteIdea');
};
export const upvoteIdea = async (env: Env, ideaId: string): Promise<Idea | null> => {
    const { data, error } = await getSupabaseClient(env).rpc('increment_upvotes', { idea_id: ideaId });
    if (error) handleError(error, 'upvoteIdea');
    const result = data?.[0];
    return result ? { ...result, createdAt: result.created_at } : null;
};
// Team Functions
export const getTeams = async (env: Env): Promise<Team[]> => {
  const { data, error } = await getSupabaseClient(env).from('teams').select('*');
  if (error) handleError(error, 'getTeams');
  return data || [];
};
export const requestToJoinIdea = async (env: Env, ideaId: string, userId: string): Promise<Team> => {
    const { data, error } = await getSupabaseClient(env).rpc('request_to_join', { p_idea_id: ideaId, p_user_id: userId });
    if (error) handleError(error, 'requestToJoinIdea');
    return data?.[0] || null;
};
export const acceptJoinRequest = async (env: Env, ideaId: string, userId: string): Promise<Team | null> => {
    const { data, error } = await getSupabaseClient(env).rpc('accept_join_request', { p_idea_id: ideaId, p_user_id: userId });
    if (error) handleError(error, 'acceptJoinRequest');
    return data?.[0] || null;
};
export const declineJoinRequest = async (env: Env, ideaId: string, userId: string): Promise<Team | null> => {
    const { data, error } = await getSupabaseClient(env).rpc('decline_join_request', { p_idea_id: ideaId, p_user_id: userId });
    if (error) handleError(error, 'declineJoinRequest');
    return data?.[0] || null;
};
// Comment Functions
export const getCommentsForIdea = async (env: Env, ideaId: string): Promise<Comment[]> => {
  const { data, error } = await getSupabaseClient(env).from('comments').select('*').eq('ideaId', ideaId).order('created_at', { ascending: true });
  if (error) handleError(error, 'getCommentsForIdea');
  return (data || []).map(c => ({ ...c, createdAt: c.created_at }));
};
export const addComment = async (env: Env, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  const newComment = { ...commentData, id: uuidv4(), created_at: new Date().toISOString() };
  const { data, error } = await getSupabaseClient(env).from('comments').insert(newComment).select();
  if (error) handleError(error, 'addComment');
  const result = data?.[0];
  return { ...result, createdAt: result.created_at };
};
// Notification Functions
export const getNotificationsForUser = async (env: Env, userId: string): Promise<Notification[]> => {
  const { data, error } = await getSupabaseClient(env).from('notifications').select('*').eq('userId', userId).order('created_at', { ascending: false });
  if (error) handleError(error, 'getNotificationsForUser');
  return (data || []).map(n => ({ ...n, createdAt: n.created_at }));
};
export const markNotificationsAsRead = async (env: Env, userId: string, notificationIds: string[]): Promise<void> => {
  const { error } = await getSupabaseClient(env).from('notifications').update({ read: true }).eq('userId', userId).in('id', notificationIds);
  if (error) handleError(error, 'markNotificationsAsRead');
};
// Leaderboard Function
export const getLeaderboardData = async (env: Env): Promise<{ users: User[], ideas: Idea[] }> => {
  const { data: users, error: usersError } = await getSupabaseClient(env).from('users').select('*').limit(5); // Simplified logic
  if (usersError) handleError(usersError, 'getLeaderboardData (users)');
  const { data: ideas, error: ideasError } = await getSupabaseClient(env).from('ideas').select('*').order('upvotes', { ascending: false }).limit(5);
  if (ideasError) handleError(ideasError, 'getLeaderboardData (ideas)');
  return {
    users: users || [],
    ideas: (ideas || []).map(idea => ({ ...idea, createdAt: idea.created_at })),
  };
};