const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const PROFILE_KEY = "auth_profile";

export interface AuthUser {
  sub?: number;
  id?: number;
  name: string;
  email: string;
}

export interface UserProfile {
  id?: number;
  userId: number;
  fullName: string;
  birthDate?: string | null;
  avatarUrl?: string | null;
}

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-change"));
  }
}

export function saveToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    notifyAuthChange();
  }
}

export function getToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem(TOKEN_KEY)
    : null;
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
    notifyAuthChange();
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function saveUser(user: AuthUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    notifyAuthChange();
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile | null) {
  if (typeof window !== "undefined") {
    if (profile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
    notifyAuthChange();
  }
}

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export async function fetchAndSaveProfileByUserId(
  userId: number | string,
  apiBase = "http://localhost:3000"
): Promise<UserProfile | null> {
  const urls = [
    `${apiBase}/api/profiles?userId=${userId}`,
    `/api/profiles?userId=${userId}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const profile: UserProfile | null = Array.isArray(data)
        ? data.find((p: UserProfile) => Number(p.userId) === Number(userId)) ?? data[0] ?? null
        : data?.data
        ? data.data
        : data?.id || data?.userId
        ? data
        : null;

      if (profile && (profile.id || profile.fullName || profile.avatarUrl)) {
        saveProfile(profile);
        return profile;
      }
    } catch {
      // Try next URL
    }
  }
  return null;
}
