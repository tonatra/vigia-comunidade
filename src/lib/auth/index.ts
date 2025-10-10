/**
 * Authentication Module - Adapter layer for future Supabase Auth integration
 * 
 * This module provides a consistent authentication interface that currently uses
 * localStorage but is designed to be easily replaced with Supabase Auth.
 * 
 * To migrate to Supabase Auth:
 * 1. Replace localStorage operations with Supabase Auth API calls
 * 2. Update the User interface to match Supabase user metadata
 * 3. Implement real email verification and password reset flows
 * 4. Add proper session management with refresh tokens
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'moderator' | 'admin';
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  expiresAt: number;
}

// Simulated rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(key);
  
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 }); // Reset after 1 minute
    return true;
  }
  
  if (limit.count >= 5) {
    return false;
  }
  
  limit.count++;
  return true;
}

export const auth = {
  async signUp(email: string, password: string, name: string): Promise<{ user: User | null; error: string | null }> {
    if (!checkRateLimit(`signup_${email}`)) {
      return { user: null, error: 'Muitas tentativas. Tente novamente em 1 minuto.' };
    }

    // Validate input
    if (!email || !email.includes('@')) {
      return { user: null, error: 'Email inválido' };
    }
    
    if (!password || password.length < 6) {
      return { user: null, error: 'Senha deve ter pelo menos 6 caracteres' };
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('vigia_users') || '[]');
    if (users.find((u: User) => u.email === email)) {
      return { user: null, error: 'Email já cadastrado' };
    }

    const user: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role: 'user',
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    users.push({ ...user, password }); // In production, never store plain passwords!
    localStorage.setItem('vigia_users', JSON.stringify(users));

    // Simulate sending verification email
    console.log('[Auth] Verification email sent to:', email);

    return { user, error: null };
  },

  async signIn(email: string, password: string): Promise<{ session: AuthSession | null; error: string | null }> {
    if (!checkRateLimit(`signin_${email}`)) {
      return { session: null, error: 'Muitas tentativas. Tente novamente em 1 minuto.' };
    }

    const users = JSON.parse(localStorage.getItem('vigia_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return { session: null, error: 'Email ou senha incorretos' };
    }

    const { password: _, ...userWithoutPassword } = user;
    
    const session: AuthSession = {
      user: userWithoutPassword,
      accessToken: crypto.randomUUID(),
      expiresAt: Date.now() + 3600000, // 1 hour
    };

    localStorage.setItem('vigia_session', JSON.stringify(session));

    return { session, error: null };
  },

  async signOut(): Promise<{ error: string | null }> {
    localStorage.removeItem('vigia_session');
    return { error: null };
  },

  async getSession(): Promise<AuthSession | null> {
    const sessionData = localStorage.getItem('vigia_session');
    if (!sessionData) return null;

    const session: AuthSession = JSON.parse(sessionData);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem('vigia_session');
      return null;
    }

    return session;
  },

  async sendPasswordResetEmail(email: string): Promise<{ error: string | null }> {
    if (!checkRateLimit(`reset_${email}`)) {
      return { error: 'Muitas tentativas. Tente novamente em 1 minuto.' };
    }

    const users = JSON.parse(localStorage.getItem('vigia_users') || '[]');
    const user = users.find((u: User) => u.email === email);

    if (!user) {
      // Don't reveal if user exists for security
      return { error: null };
    }

    // Simulate sending reset email
    const resetToken = crypto.randomUUID();
    localStorage.setItem(`reset_token_${email}`, JSON.stringify({
      token: resetToken,
      expiresAt: Date.now() + 3600000, // 1 hour
    }));

    console.log('[Auth] Password reset email sent to:', email);
    console.log('[Auth] Reset token:', resetToken);

    return { error: null };
  },

  async resetPassword(email: string, token: string, newPassword: string): Promise<{ error: string | null }> {
    const resetData = localStorage.getItem(`reset_token_${email}`);
    if (!resetData) {
      return { error: 'Token inválido ou expirado' };
    }

    const { token: validToken, expiresAt } = JSON.parse(resetData);
    
    if (token !== validToken || Date.now() > expiresAt) {
      return { error: 'Token inválido ou expirado' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { error: 'Senha deve ter pelo menos 6 caracteres' };
    }

    const users = JSON.parse(localStorage.getItem('vigia_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.email === email);

    if (userIndex === -1) {
      return { error: 'Usuário não encontrado' };
    }

    users[userIndex].password = newPassword;
    localStorage.setItem('vigia_users', JSON.stringify(users));
    localStorage.removeItem(`reset_token_${email}`);

    return { error: null };
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<{ user: User | null; error: string | null }> {
    const users = JSON.parse(localStorage.getItem('vigia_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === userId);

    if (userIndex === -1) {
      return { user: null, error: 'Usuário não encontrado' };
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem('vigia_users', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = users[userIndex];
    return { user: userWithoutPassword, error: null };
  },

  async verifyEmail(email: string, token: string): Promise<{ error: string | null }> {
    // Simulate email verification
    const users = JSON.parse(localStorage.getItem('vigia_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.email === email);

    if (userIndex === -1) {
      return { error: 'Usuário não encontrado' };
    }

    users[userIndex].emailVerified = true;
    localStorage.setItem('vigia_users', JSON.stringify(users));

    return { error: null };
  },
};
