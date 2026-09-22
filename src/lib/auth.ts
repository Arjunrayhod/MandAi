export interface AuthUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  phone?: string;
  companyName: string;
  isDemo?: boolean;
  createdAt: string;
}

export const DEMO_USER: AuthUser = {
  id: 'user-demo',
  username: 'demo',
  password: 'demo',
  name: 'Kundan Rathore (Demo)',
  phone: '9993782187',
  companyName: 'Rathore Trading Company (Demo)',
  isDemo: true,
  createdAt: '2026-09-01T00:00:00.000Z',
};

const USERS_STORAGE_KEY = 'mandai_users_registry_v1';
const ACTIVE_SESSION_KEY = 'mandai_active_session_user_id';

export const getRegisteredUsers = (): AuthUser[] => {
  if (typeof window === 'undefined') return [DEMO_USER];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      // Seed default demo user
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEMO_USER]));
      return [DEMO_USER];
    }
    const parsed: AuthUser[] = JSON.parse(raw);
    if (!parsed.some((u) => u.username.toLowerCase() === 'demo')) {
      parsed.unshift(DEMO_USER);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.error('Failed to read registered users', e);
    return [DEMO_USER];
  }
};

export const saveRegisteredUser = (user: AuthUser): void => {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers().filter((u) => u.id !== user.id && u.username.toLowerCase() !== user.username.toLowerCase());
    users.push(user);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save registered user', e);
  }
};

export const findUserByUsername = (username: string): AuthUser | null => {
  const users = getRegisteredUsers();
  return users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase()) || null;
};

export const getActiveSessionUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_SESSION_KEY);
};

export const setActiveSessionUserId = (userId: string | null): void => {
  if (typeof window === 'undefined') return;
  if (!userId) {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } else {
    localStorage.setItem(ACTIVE_SESSION_KEY, userId);
  }
};
