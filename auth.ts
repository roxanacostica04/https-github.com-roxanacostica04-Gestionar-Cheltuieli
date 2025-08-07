import { authHandler } from "encore.dev/auth";
import { APIError } from "encore.dev/api";
import { Header } from "encore.dev/api";

interface AuthParams {
  authorization?: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  username: string;
}

// Simple authentication handler for demo purposes
// In production, use proper password hashing and secure storage
const DEMO_USERS = {
  "admin": "admin123",
  "user": "password",
  "demo": "demo123"
};

const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    const authHeader = params.authorization;
    if (!authHeader) {
      throw APIError.unauthenticated("missing authorization header");
    }

    // Extract Basic auth credentials
    const base64Credentials = authHeader.replace('Basic ', '');
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      throw APIError.unauthenticated("invalid credentials format");
    }

    // Check credentials
    if (DEMO_USERS[username as keyof typeof DEMO_USERS] !== password) {
      throw APIError.unauthenticated("invalid username or password");
    }

    return {
      userID: username,
      username: username,
    };
  }
);

export default auth;
