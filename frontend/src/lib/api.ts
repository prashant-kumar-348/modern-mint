/**
 * Centralised API client for all backend calls.
 * Base URL is read from NEXT_PUBLIC_API_URL (set in .env.local).
 */

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_URL
    : ""
).replace(/\/$/, "");

/** Public API base, e.g. for building absolute <img> URLs to served avatars. */
export const API_BASE_URL = BASE_URL;

// ── Generic fetch wrapper ──────────────────────────────────────────────────

interface ApiOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const json = await res.json() as { success: boolean; message?: string; data?: T };

  if (!res.ok || !json.success) {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mm_token");
        localStorage.removeItem("mm_user");
        window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }
    }
    throw new ApiError(res.status, json.message ?? "Request failed.");
  }

  return json.data as T;
}

// ── Auth endpoints ─────────────────────────────────────────────────────────

export interface AuthPayload {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    // Versioned serve URL (or null) — built by the backend, not raw base64.
    profile_image_url: string | null;
  };
}

export const authApi = {
  signup(body: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthPayload> {
    return request<AuthPayload>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  login(body: {
    email: string;
    password: string;
  }): Promise<AuthPayload> {
    return request<AuthPayload>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

// ── User endpoints ─────────────────────────────────────────────────────────

export const usersApi = {
  /** Upload/replace the signed-in user's profile image (base64 data URL). */
  updateProfileImage(image: string, token: string): Promise<{ profileImageUrl: string }> {
    return request<{ profileImageUrl: string }>("/api/users/me/profile-image", {
      method: "PUT",
      body: JSON.stringify({ image }),
      token,
    });
  },
};
