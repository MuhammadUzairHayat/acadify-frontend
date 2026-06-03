import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./auth";

const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export async function serverApiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Cookie", `${AUTH_COOKIE_NAME}=${token}`);
  }

  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function serverApiJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await serverApiFetch(path, init);
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : Array.isArray(data?.message)
          ? data.message.join(", ")
          : "Request failed";
    throw new Error(message);
  }

  return data as T;
}
