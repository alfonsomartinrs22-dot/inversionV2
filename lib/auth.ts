import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'folio-default-secret-change-me-in-production'
);

const COOKIE_NAME = 'folio_session';

export interface UserSession {
  userId: string;
  username: string;
}

/**
 * Users are defined in the USERS env var as:
 * USERS="usuario1:contraseña1,usuario2:contraseña2"
 */
function getUsers(): Map<string, string> {
  const raw = process.env.USERS || '';
  const map = new Map<string, string>();
  raw.split(',').forEach((pair) => {
    const [user, pass] = pair.trim().split(':');
    if (user && pass) {
      map.set(user.trim(), pass.trim());
    }
  });
  return map;
}

export function validateCredentials(username: string, password: string): boolean {
  const users = getUsers();
  const storedPass = users.get(username);
  return storedPass === password;
}

export async function createSession(username: string): Promise<string> {
  const token = await new SignJWT({ userId: username, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
  return token;
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const { payload } = await jwtVerify(cookie.value, JWT_SECRET);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}

export function getSessionFromToken(token: string): Promise<UserSession | null> {
  return jwtVerify(token, JWT_SECRET)
    .then(({ payload }) => ({
      userId: payload.userId as string,
      username: payload.username as string,
    }))
    .catch(() => null);
}

export { COOKIE_NAME };
