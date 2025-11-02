import { User, Idea, Team, Comment, Notification } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
import { SanitizedEnv } from './core-utils';
import { getMockData } from './mock-data';
interface SupabaseFetchOptions {
  table: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: object | null;
  query?: string;
  rpc?: boolean;
}
const shouldUseMockData = (env: SanitizedEnv) => !env.SUPABASE_URL || !env.SUPABASE_KEY;
const supabaseFetch = async <T>(env: SanitizedEnv, { table, method = 'GET', body = null, query = '', rpc = false }: SupabaseFetchOptions): Promise<T> => {
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
export const getUsers = async (env: SanitizedEnv): Promise<User[]> => {
  if (shouldUseMockData(env)) return Promise.resolve(getMockData().MOCK_USERS);
  try {
    return await supabaseFetch<User[]>(env, { table: 'users', query: '?select=*' });
  } catch (error) {
    handleError(error, 'getUsers');
    return [];
  }
};
export const updateUser = async (env: SanitizedEnv, userId: string, updates: Partial<User>): Promise<User | null> => {
  if (shouldUseMockData(env)) {
    const mockData = getMockData();
    const userIndex = mockData.MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;
    mockData.MOCK_USERS[userIndex] = { ...mockData.MOCK_USERS[userIndex], ...updates };
    return Promise.resolve(mockData.MOCK_USERS[userIndex]);
  }
  try {
    const data = await supabaseFetch<User[]>(env, { table: 'users', method: 'PATCH', body: updates, query: `?id=eq.${userId}` });
    return data?.[0] || null;
  } catch (error) {
    handleError(error, 'updateUser');
    return null;
  }
};
// Idea Functions
export const getIdeas = async (env: SanitizedEnv): Promise<Idea[]> => {
  if (shouldUseMockData(env)) return Promise.resolve(getMockData().MOCK_IDEAS);
  try {
    const data = await supabaseFetch<any[]>(env, { table: 'ideas', query: '?select=*&order=created_at.desc' });
    return (data || []).map(idea => ({ ...idea, createdAt: idea.created_at }));
  } catch (error) {
    handleError(error, 'getIdeas');
    return [];
  }
};
export const getIdeaById = async (env: SanitizedEnv, id: string): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] } | null> => {
  if (shouldUseMockData(env)) {
    const mockData = getMockData();
    const idea = mockData.MOCK_IDEAS.find(i => i.id === id);
    if (!idea) return null;
    const author = mockData.MOCK_USERS.find(u => u.id === idea.authorId)!;
    const team = mockData.MOCK_TEAMS.find(t => t.ideaId === id);
    const teamMembers = team ? mockData.MOCK_USERS.filter(u => team.members.includes(u.id)) : [];
    const joinRequesters = team ? mockData.MOCK_USERS.filter(u => team.joinRequests.includes(u.id)) : [];
    return { idea, author, team, teamMembers, joinRequesters };
  }
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
export const addIdea = async (env: SanitizedEnv, ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes'>): Promise<Idea> => {
  if (shouldUseMockData(env)) {
    const newIdea: Idea = {
      ...ideaData,
      id: uuidv4(),
      upvotes: 0,
      createdAt: new Date().toISOString(),
      projectBoard: { columns: [{ id: 'todo', title: 'To Do', tasks: [] }, { id: 'inProgress', title: 'In Progress', tasks: [] }, { id: 'done', title: 'Done', tasks: [] }] },
    };
    getMockData().MOCK_IDEAS.unshift(newIdea);
    return Promise.resolve(newIdea);
  }
  const newIdea = {
    ...ideaData,
    id: uuidv4(),
    upvotes: 0,
    created_at: new Date().toISOString(),
    projectBoard: { columns: [{ id: 'todo', title: 'To Do', tasks: [] }, { id: 'inProgress', title: 'In Progress', tasks: [] }, { id: 'done', title: 'Done', tasks: [] }] },
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
export const updateIdea = async (env: SanitizedEnv, id: string, updates: Partial<Idea>): Promise<Idea | null> => {
    if (shouldUseMockData(env)) {
        const mockData = getMockData();
        const ideaIndex = mockData.MOCK_IDEAS.findIndex(i => i.id === id);
        if (ideaIndex === -1) return null;
        mockData.MOCK_IDEAS[ideaIndex] = { ...mockData.MOCK_IDEAS[ideaIndex], ...updates };
        return Promise.resolve(mockData.MOCK_IDEAS[ideaIndex]);
    }
  try {
    const data = await supabaseFetch<any[]>(env, { table: 'ideas', method: 'PATCH', body: updates, query: `?id=eq.${id}` });
    const result = data?.[0];
    return result ? { ...result, createdAt: result.created_at } : null;
  } catch (error) {
    handleError(error, 'updateIdea');
    return null;
  }
};
export const deleteIdea = async (env: SanitizedEnv, id: string): Promise<void> => {
    if (shouldUseMockData(env)) {
        const mockData = getMockData();
        mockData.MOCK_IDEAS = mockData.MOCK_IDEAS.filter(i => i.id !== id);
        mockData.MOCK_TEAMS = mockData.MOCK_TEAMS.filter(t => t.ideaId !== id);
        mockData.MOCK_COMMENTS = mockData.MOCK_COMMENTS.filter(c => c.ideaId !== id);
        return Promise.resolve();
    }
  try {
    await supabaseFetch(env, { table: 'comments', method: 'DELETE', query: `?ideaId=eq.${id}` });
    await supabaseFetch(env, { table: 'teams', method: 'DELETE', query: `?ideaId=eq.${id}` });
    await supabaseFetch(env, { table: 'notifications', method: 'DELETE', query: `?link=like.*${id}*` });
    await supabaseFetch(env, { table: 'ideas', method: 'DELETE', query: `?id=eq.${id}` });
  } catch (error) {
    handleError(error, 'deleteIdea');
  }
};
export const upvoteIdea = async (env: SanitizedEnv, ideaId: string): Promise<Idea | null> => {
    if (shouldUseMockData(env)) {
        const idea = getMockData().MOCK_IDEAS.find(i => i.id === ideaId);
        if (!idea) return null;
        idea.upvotes += 1;
        return Promise.resolve(idea);
    }
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
export const getTeams = async (env: SanitizedEnv): Promise<Team[]> => {
  if (shouldUseMockData(env)) return Promise.resolve(getMockData().MOCK_TEAMS);
  try {
    return await supabaseFetch<Team[]>(env, { table: 'teams', query: '?select=*' });
  } catch (error) {
    handleError(error, 'getTeams');
    return [];
  }
};
export const requestToJoinIdea = async (env: SanitizedEnv, ideaId: string, userId: string): Promise<Team> => {
    if (shouldUseMockData(env)) {
        const mockData = getMockData();
        let team = mockData.MOCK_TEAMS.find(t => t.ideaId === ideaId);
        if (!team) {
            const idea = mockData.MOCK_IDEAS.find(i => i.id === ideaId)!;
            team = { id: uuidv4(), name: `Team for ${idea.title}`, mission: '', ideaId, members: [idea.authorId], joinRequests: [] };
            mockData.MOCK_TEAMS.push(team);
        }
        if (!team.joinRequests.includes(userId)) {
            team.joinRequests.push(userId);
        }
        return Promise.resolve(team);
    }
  try {
    const data = await supabaseFetch<Team[]>(env, { table: 'request_to_join', method: 'POST', body: { p_idea_id: ideaId, p_user_id: userId }, rpc: true });
    return data?.[0];
  } catch (error) {
    handleError(error, 'requestToJoinIdea');
    throw error;
  }
};
export const acceptJoinRequest = async (env: SanitizedEnv, ideaId: string, userId: string): Promise<Team | null> => {
    if (shouldUseMockData(env)) {
        const team = getMockData().MOCK_TEAMS.find(t => t.ideaId === ideaId);
        if (!team || !team.joinRequests.includes(userId)) return null;
        team.joinRequests = team.joinRequests.filter(id => id !== userId);
        if (!team.members.includes(userId)) {
            team.members.push(userId);
        }
        return Promise.resolve(team);
    }
  try {
    const data = await supabaseFetch<Team[]>(env, { table: 'accept_join_request', method: 'POST', body: { p_idea_id: ideaId, p_user_id: userId }, rpc: true });
    return data?.[0];
  } catch (error) {
    handleError(error, 'acceptJoinRequest');
    return null;
  }
};
export const declineJoinRequest = async (env: SanitizedEnv, ideaId: string, userId: string): Promise<Team | null> => {
    if (shouldUseMockData(env)) {
        const team = getMockData().MOCK_TEAMS.find(t => t.ideaId === ideaId);
        if (!team) return null;
        team.joinRequests = team.joinRequests.filter(id => id !== userId);
        return Promise.resolve(team);
    }
  try {
    const data = await supabaseFetch<Team[]>(env, { table: 'decline_join_request', method: 'POST', body: { p_idea_id: ideaId, p_user_id: userId }, rpc: true });
    return data?.[0];
  } catch (error) {
    handleError(error, 'declineJoinRequest');
    return null;
  }
};
// Comment Functions
export const getCommentsForIdea = async (env: SanitizedEnv, ideaId: string): Promise<Comment[]> => {
  if (shouldUseMockData(env)) return Promise.resolve(getMockData().MOCK_COMMENTS.filter(c => c.ideaId === ideaId));
  try {
    const data = await supabaseFetch<any[]>(env, { table: 'comments', query: `?select=*&ideaId=eq.${ideaId}&order=created_at.asc` });
    return (data || []).map(c => ({ ...c, createdAt: c.created_at }));
  } catch (error) {
    handleError(error, 'getCommentsForIdea');
    return [];
  }
};
export const addComment = async (env: SanitizedEnv, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    if (shouldUseMockData(env)) {
        const newComment: Comment = { ...commentData, id: uuidv4(), createdAt: new Date().toISOString() };
        getMockData().MOCK_COMMENTS.push(newComment);
        return Promise.resolve(newComment);
    }
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
export const getNotificationsForUser = async (env: SanitizedEnv, userId: string): Promise<Notification[]> => {
  if (shouldUseMockData(env)) return Promise.resolve(getMockData().MOCK_NOTIFICATIONS.filter(n => n.userId === userId));
  try {
    const data = await supabaseFetch<any[]>(env, { table: 'notifications', query: `?select=*&userId=eq.${userId}&order=created_at.desc` });
    return (data || []).map(n => ({ ...n, createdAt: n.created_at }));
  } catch (error) {
    handleError(error, 'getNotificationsForUser');
    return [];
  }
};
export const markNotificationsAsRead = async (env: SanitizedEnv, userId: string, notificationIds: string[]): Promise<void> => {
    if (shouldUseMockData(env)) {
        getMockData().MOCK_NOTIFICATIONS.forEach(n => {
            if (n.userId === userId && notificationIds.includes(n.id)) {
                n.read = true;
            }
        });
        return Promise.resolve();
    }
  try {
    await supabaseFetch(env, { table: 'notifications', method: 'PATCH', body: { read: true }, query: `?userId=eq.${userId}&id=in.(${notificationIds.join(',')})` });
  } catch (error) {
    handleError(error, 'markNotificationsAsRead');
  }
};
// Leaderboard Function
export const getLeaderboardData = async (env: SanitizedEnv): Promise<{ users: User[], ideas: Idea[] }> => {
    if (shouldUseMockData(env)) {
        const mockData = getMockData();
        const users = [...mockData.MOCK_USERS].sort((a, b) => b.skills.length - a.skills.length).slice(0, 5);
        const ideas = [...mockData.MOCK_IDEAS].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);
        return Promise.resolve({ users, ideas });
    }
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