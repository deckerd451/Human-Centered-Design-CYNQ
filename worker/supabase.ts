import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Idea, Team, Comment, Notification } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
let supabase: SupabaseClient;

export const initSupabase = (env: { SUPABASE_URL: string; SUPABASE_KEY: string; }) => {
  if (!supabase) {
    // The `fetch` option is required for Supabase to work in a Cloudflare Worker.
    // `persistSession: false` is recommended for serverless environments.
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
      auth: {
        persistSession: false,
      },
      global: {
        fetch: fetch,
      },
    });
  }
};

const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client has not been initialized. Call initSupabase() first.');
  }
  return supabase;
};
// NOTE: This is a conceptual implementation. Without a real database schema,
// these functions assume table names and columns match our shared types.
// Error handling is included but might need to be more robust in production.
const handleError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error);
  throw new Error(`Database operation failed: ${context}`);
};
// User Functions
export const sendMagicLink = async (email: string): Promise<{ success: boolean; token?: string }> => {
  // This simulates the magic link flow since we can't send emails.
  // In a real app: await supabase.auth.signInWithOtp({ email });
  console.log(`Simulating magic link for ${email}`);
  const token = `demo-token-for-${email}`;
  return { success: true, token };
};
export const verifyMagicToken = async (token: string): Promise<User | null> => {
  // This simulates token verification.
  // In a real app, you'd handle the session from the callback URL.
  if (token.startsWith('demo-token-for-')) {
    const email = token.replace('demo-token-for-', '');
    const { data: users, error } = await getSupabaseClient().from('users').select('*').eq('email', email).limit(1);
    if (error) handleError(error, 'verifyMagicToken');
    return users?.[0] || null;
  }
  return null;
};
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await getSupabaseClient().from('users').select('*');
  if (error) handleError(error, 'getUsers');
  return data || [];
};
export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  const { data, error } = await getSupabaseClient().from('users').update(updates).eq('id', userId).select();
  if (error) handleError(error, 'updateUser');
  return data?.[0] || null;
};
// Idea Functions
export const getIdeas = async (): Promise<Idea[]> => {
  const { data, error } = await getSupabaseClient().from('ideas').select('*').order('created_at', { ascending: false });
  if (error) handleError(error, 'getIdeas');
  return (data || []).map(idea => ({ ...idea, createdAt: idea.created_at }));
};
export const getIdeaById = async (id: string): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null> => {
  const { data: ideaData, error: ideaError } = await getSupabaseClient().from('ideas').select('*').eq('id', id).single();
  if (ideaError || !ideaData) {
    if (ideaError && ideaError.code !== 'PGRST116') handleError(ideaError, `getIdeaById (idea ${id})`);
    return null;
  }
  const idea = { ...ideaData, createdAt: ideaData.created_at };
  const { data: author, error: authorError } = await getSupabaseClient().from('users').select('*').eq('id', idea.authorId).single();
  if (authorError) handleError(authorError, `getIdeaById (author ${idea.authorId})`);
  const { data: team, error: teamError } = await getSupabaseClient().from('teams').select('*').eq('ideaId', id).single();
  if (teamError && teamError.code !== 'PGRST116') handleError(teamError, `getIdeaById (team for idea ${id})`);
  const memberIds = team?.members || [];
  const requesterIds = team?.joinRequests || [];
  const allUserIds = [...new Set([...memberIds, ...requesterIds])];
  let teamMembers: User[] = [];
  let joinRequesters: User[] = [];
  if (allUserIds.length > 0) {
    const { data: users, error: usersError } = await getSupabaseClient().from('users').select('*').in('id', allUserIds);
    if (usersError) handleError(usersError, `getIdeaById (fetching team users)`);
    teamMembers = users?.filter(u => memberIds.includes(u.id)) || [];
    joinRequesters = users?.filter(u => requesterIds.includes(u.id)) || [];
  }
  return { idea, author, team, teamMembers, joinRequesters };
};
export const addIdea = async (ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes'>): Promise<Idea> => {
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
  const { data, error } = await getSupabaseClient().from('ideas').insert(newIdea).select();
  if (error) handleError(error, 'addIdea');
  const result = data?.[0];
  return { ...result, createdAt: result.created_at };
};
export const updateIdea = async (id: string, updates: Partial<Idea>): Promise<Idea | null> => {
  const { data, error } = await getSupabaseClient().from('ideas').update(updates).eq('id', id).select();
  if (error) handleError(error, 'updateIdea');
  const result = data?.[0];
  return result ? { ...result, createdAt: result.created_at } : null;
};
export const deleteIdea = async (id: string): Promise<void> => {
  // In a real DB, you'd use transactions or cascading deletes.
  await getSupabaseClient().from('comments').delete().eq('ideaId', id);
  await getSupabaseClient().from('teams').delete().eq('ideaId', id);
  await getSupabaseClient().from('notifications').delete().like('link', `%${id}%`);
  const { error } = await getSupabaseClient().from('ideas').delete().eq('id', id);
  if (error) handleError(error, 'deleteIdea');
};
export const upvoteIdea = async (ideaId: string): Promise<Idea | null> => {
    const { data, error } = await getSupabaseClient().rpc('increment_upvotes', { idea_id: ideaId });
    if (error) handleError(error, 'upvoteIdea');
    const result = data?.[0];
    return result ? { ...result, createdAt: result.created_at } : null;
};
// Team Functions
export const getTeams = async (): Promise<Team[]> => {
  const { data, error } = await getSupabaseClient().from('teams').select('*');
  if (error) handleError(error, 'getTeams');
  return data || [];
};
export const requestToJoinIdea = async (ideaId: string, userId: string): Promise<Team> => {
    const { data, error } = await getSupabaseClient().rpc('request_to_join', { p_idea_id: ideaId, p_user_id: userId });
    if (error) handleError(error, 'requestToJoinIdea');
    return data?.[0] || null;
};
export const acceptJoinRequest = async (ideaId: string, userId: string): Promise<Team | null> => {
    const { data, error } = await getSupabaseClient().rpc('accept_join_request', { p_idea_id: ideaId, p_user_id: userId });
    if (error) handleError(error, 'acceptJoinRequest');
    return data?.[0] || null;
};
export const declineJoinRequest = async (ideaId: string, userId: string): Promise<Team | null> => {
    const { data, error } = await getSupabaseClient().rpc('decline_join_request', { p_idea_id: ideaId, p_user_id: userId });
    if (error) handleError(error, 'declineJoinRequest');
    return data?.[0] || null;
};
// Comment Functions
export const getCommentsForIdea = async (ideaId: string): Promise<Comment[]> => {
  const { data, error } = await getSupabaseClient().from('comments').select('*').eq('ideaId', ideaId).order('created_at', { ascending: true });
  if (error) handleError(error, 'getCommentsForIdea');
  return (data || []).map(c => ({ ...c, createdAt: c.created_at }));
};
export const addComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
  const newComment = { ...commentData, id: uuidv4(), created_at: new Date().toISOString() };
  const { data, error } = await getSupabaseClient().from('comments').insert(newComment).select();
  if (error) handleError(error, 'addComment');
  const result = data?.[0];
  return { ...result, createdAt: result.created_at };
};
// Notification Functions
export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await getSupabaseClient().from('notifications').select('*').eq('userId', userId).order('created_at', { ascending: false });
  if (error) handleError(error, 'getNotificationsForUser');
  return (data || []).map(n => ({ ...n, createdAt: n.created_at }));
};
export const markNotificationsAsRead = async (userId: string, notificationIds: string[]): Promise<void> => {
  const { error } = await getSupabaseClient().from('notifications').update({ read: true }).eq('userId', userId).in('id', notificationIds);
  if (error) handleError(error, 'markNotificationsAsRead');
};
// Leaderboard Function
export const getLeaderboardData = async (): Promise<{ users: User[], ideas: Idea[] }> => {
  const { data: users, error: usersError } = await getSupabaseClient().from('users').select('*').limit(5); // Simplified logic
  if (usersError) handleError(usersError, 'getLeaderboardData (users)');
  const { data: ideas, error: ideasError } = await getSupabaseClient().from('ideas').select('*').order('upvotes', { ascending: false }).limit(5);
  if (ideasError) handleError(ideasError, 'getLeaderboardData (ideas)');
  return {
    users: users || [],
    ideas: (ideas || []).map(idea => ({ ...idea, createdAt: idea.created_at })),
  };
};