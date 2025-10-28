import { User, Idea, Team, ApiResponse, Comment, Notification } from '@shared/types';
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T; // Handle No Content response
  }
  const json: ApiResponse<T> = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'API request failed');
  }
  if (json.data === undefined && response.status !== 204) {
    // Allow no data for success responses that don't return data, like mark as read
    if (json.success) return undefined as T;
    throw new Error('API response missing data');
  }
  return json.data as T;
};
export const getIdeas = (): Promise<Idea[]> =>
  fetch('/api/ideas').then(res => handleResponse<Idea[]>(res));
export const getTeams = (): Promise<Team[]> =>
  fetch('/api/teams').then(res => handleResponse<Team[]>(res));
export const getUsers = (): Promise<User[]> =>
  fetch('/api/users').then(res => handleResponse<User[]>(res));
export const getLeaderboardData = (): Promise<{ users: User[], ideas: Idea[] }> =>
  fetch('/api/leaderboard').then(res => handleResponse<{ users: User[], ideas: Idea[] }>(res));
export const getIdeaById = (id: string): Promise<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] }> =>
  fetch(`/api/ideas/${id}`).then(res => handleResponse<{ idea: Idea; author: User; team: Team | undefined; teamMembers: User[]; joinRequesters: User[] }>(res));
export const addIdea = (ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes'>): Promise<Idea> =>
  fetch('/api/ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ideaData),
  }).then(res => handleResponse<Idea>(res));
export const updateCurrentUser = (userId: string, updates: Partial<User>): Promise<User> =>
  fetch(`/api/users/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, updates }),
  }).then(res => handleResponse<User>(res));
export const upvoteIdea = (ideaId: string): Promise<Idea> =>
  fetch(`/api/ideas/${ideaId}/upvote`, {
    method: 'PUT',
  }).then(res => handleResponse<Idea>(res));
export const requestToJoinIdea = (ideaId: string, userId: string): Promise<Team> =>
  fetch(`/api/ideas/${ideaId}/join`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }).then(res => handleResponse<Team>(res));
export const getComments = (ideaId: string): Promise<Comment[]> =>
  fetch(`/api/ideas/${ideaId}/comments`).then(res => handleResponse<Comment[]>(res));
export const postComment = (ideaId: string, commentData: { authorId: string; content: string }): Promise<Comment> =>
  fetch(`/api/ideas/${ideaId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentData),
  }).then(res => handleResponse<Comment>(res));
export const getNotifications = (userId: string): Promise<Notification[]> =>
  fetch(`/api/notifications/${userId}`).then(res => handleResponse<Notification[]>(res));
export const markNotificationsAsRead = (userId: string, notificationIds: string[]): Promise<void> =>
  fetch('/api/notifications/read', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, notificationIds }),
  }).then(res => handleResponse<void>(res));
export const acceptJoinRequest = (ideaId: string, userId: string): Promise<Team> =>
  fetch(`/api/ideas/${ideaId}/requests/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }).then(res => handleResponse<Team>(res));
export const declineJoinRequest = (ideaId: string, userId: string): Promise<Team> =>
  fetch(`/api/ideas/${ideaId}/requests/decline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }).then(res => handleResponse<Team>(res));