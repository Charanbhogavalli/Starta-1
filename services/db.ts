
import { StartupIdea, ConnectionRequest, ChatMessage, User } from '../types';

// Replace these with your actual Supabase Project URL and Anon Key
const URL = "https://pnqjppdjreadlcsllrrd.supabase.co";
const KEY = "sb_publishable_InZDoorwnWUyDyF0ynX80w_eTFNQYrx";

const headers = {
  "apikey": KEY,
  "Authorization": `Bearer ${KEY}`,
  "Content-Type": "application/json"
};

const L_KEYS = {
  USERS: 'starta_ls_users',
  IDEAS: 'starta_ls_ideas',
  REQUESTS: 'starta_ls_requests',
  CHATS: 'starta_ls_chats'
};

export type DBStatus = 'connecting' | 'cloud' | 'local';
let currentStatus: DBStatus = 'connecting';

const getLocal = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveLocal = <T extends { id: string }>(key: string, item: T) => {
  const items = getLocal<T>(key);
  const idx = items.findIndex(i => i.id === item.id);
  if (idx > -1) items[idx] = item;
  else items.push(item);
  localStorage.setItem(key, JSON.stringify(items));
};

async function safeFetch(path: string, options: RequestInit = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${URL}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      currentStatus = 'local';
      return null;
    }
    
    currentStatus = 'cloud';
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    currentStatus = 'local';
    return null;
  }
}

export const db = {
  getStatus: () => currentStatus,

  // Users
  getUser: async (id: string): Promise<User | null> => {
    const cloudData = await safeFetch(`/rest/v1/users?id=eq.${id}`);
    if (cloudData && cloudData.length > 0) return cloudData[0];
    const local = getLocal<User>(L_KEYS.USERS);
    return local.find(u => u.id === id) || null;
  },

  saveUser: async (user: User): Promise<void> => {
    saveLocal(L_KEYS.USERS, user);
    await safeFetch(`/rest/v1/users`, {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify(user)
    });
  },

  // Ideas
  getIdeas: async (): Promise<StartupIdea[]> => {
    const cloudData = await safeFetch(`/rest/v1/ideas?order=createdAt.desc`);
    if (cloudData) return cloudData;
    return getLocal<StartupIdea>(L_KEYS.IDEAS).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  getIdeaById: async (id: string): Promise<StartupIdea | undefined> => {
    const cloudData = await safeFetch(`/rest/v1/ideas?id=eq.${id}`);
    if (cloudData && cloudData.length > 0) return cloudData[0];
    const local = getLocal<StartupIdea>(L_KEYS.IDEAS);
    return local.find(i => i.id === id);
  },

  saveIdea: async (idea: StartupIdea): Promise<void> => {
    saveLocal(L_KEYS.IDEAS, idea);
    await safeFetch(`/rest/v1/ideas`, {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify(idea)
    });
  },

  // Connection Requests
  getRequests: async (): Promise<ConnectionRequest[]> => {
    const cloudData = await safeFetch(`/rest/v1/requests`);
    if (cloudData) return cloudData;
    return getLocal<ConnectionRequest>(L_KEYS.REQUESTS);
  },

  getRequest: async (ideaId: string, funderId: string): Promise<ConnectionRequest | undefined> => {
    // Try cloud first with double filter
    const cloudData = await safeFetch(`/rest/v1/requests?ideaId=eq.${ideaId}&funderId=eq.${funderId}`);
    if (cloudData && cloudData.length > 0) return cloudData[0];
    const local = getLocal<ConnectionRequest>(L_KEYS.REQUESTS);
    return local.find(r => r.ideaId === ideaId && r.funderId === funderId);
  },

  getRequestById: async (id: string): Promise<ConnectionRequest | undefined> => {
    const cloudData = await safeFetch(`/rest/v1/requests?id=eq.${id}`);
    if (cloudData && cloudData.length > 0) return cloudData[0];
    const local = getLocal<ConnectionRequest>(L_KEYS.REQUESTS);
    return local.find(r => r.id === id);
  },

  saveRequest: async (req: ConnectionRequest): Promise<void> => {
    saveLocal(L_KEYS.REQUESTS, req);
    await safeFetch(`/rest/v1/requests`, {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify(req)
    });
  },

  getRequestsForFounder: async (founderId: string): Promise<ConnectionRequest[]> => {
    const cloudData = await safeFetch(`/rest/v1/requests?founderId=eq.${founderId}`);
    if (cloudData) return cloudData;
    const local = getLocal<ConnectionRequest>(L_KEYS.REQUESTS);
    return local.filter(r => r.founderId === founderId);
  },

  // Chat
  getMessages: async (connectionId: string): Promise<ChatMessage[]> => {
    const cloudData = await safeFetch(`/rest/v1/chats?connectionId=eq.${connectionId}&order=timestamp.asc`);
    if (cloudData) return cloudData;
    const local = getLocal<ChatMessage>(L_KEYS.CHATS);
    return local.filter(m => m.connectionId === connectionId).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
  },

  sendMessage: async (msg: ChatMessage): Promise<void> => {
    const chats = getLocal<ChatMessage>(L_KEYS.CHATS);
    chats.push(msg);
    localStorage.setItem(L_KEYS.CHATS, JSON.stringify(chats));
    await safeFetch(`/rest/v1/chats`, {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify(msg)
    });
  }
};
