import { api } from "encore.dev/api";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  username: string;
}

// Simple demo users - in production use proper password hashing
const DEMO_USERS = {
  "admin": "admin123",
  "user": "password", 
  "demo": "demo123"
};

// Handles user login and returns a basic auth token.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const { username, password } = req;

    // Check credentials
    if (DEMO_USERS[username as keyof typeof DEMO_USERS] !== password) {
      throw new Error("Invalid username or password");
    }

    // Create basic auth token
    const token = Buffer.from(`${username}:${password}`).toString('base64');

    return {
      success: true,
      token,
      username,
    };
  }
);
