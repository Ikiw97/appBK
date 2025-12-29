import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export type UserRole = 'admin' | 'teacher' | 'student' | null;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  session: any;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  loginAsStudent: (studentName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state dari Supabase session
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');

        // Retrieve session with a timeout safety to prevent infinite loading (reduced to 5s)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth initialization timeout')), 5000)
        );

        const result: any = await Promise.race([sessionPromise, timeoutPromise]);
        const { data: { session }, error: sessionError } = result;

        if (sessionError) throw sessionError;

        if (session?.user) {
          console.log('✅ Session found, loading profile...');
          // Also wrap profile loading in a timeout race (separate 5s)
          try {
            await Promise.race([
              loadUserProfile(session.user.id, session.user.email || ''),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile load timeout')), 5000))
            ]);
          } catch (profileError) {
            console.error('Profile load warning:', profileError);
            // Fallback: create basic user object from session if profile fails
            if (!user) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.email?.split('@')[0] || 'User',
                role: 'student', // default safe role
              });
            }
          }
          setSession(session);
        } else {
          console.log('ℹ️ No active session found');
        }
      } catch (error: any) {
        console.error('❌ Error initializing auth:', error);

        // Critical Fix: If timeout or error occurs, force clear everything to prevent infinite loading
        if (error.message === 'Auth initialization timeout' || error.message?.includes('timeout')) {
          console.warn('⚠️ Auth timeout detected. Performing aggressive recovery.');

          // 1. Force state to loaded (stops spinner)
          setUser(null);
          setSession(null);

          // 2. Nuclear Option: Clear ALL storage to remove any corrupted state/caches
          try {
            console.log('☢️ CLEARING ALL LOCAL STORAGE');
            localStorage.clear();
          } catch (e) {
            console.error('Error clearing storage:', e);
          }

          // 3. Attempt forced sign out
          try {
            await supabase.auth.signOut();
          } catch (e) {
            // Ignore signout errors
          }

          // 4. Force Reload to ensure a clean slate
          // Use a short timeout to allow the console logs to be seen if debugging
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows, which is okay for first login
        throw error;
      }

      // Check if user is a super admin
      let isSuperAdmin = false;
      try {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('is_super_admin')
          .eq('id', userId)
          .single();

        isSuperAdmin = adminData?.is_super_admin || false;
      } catch (adminError) {
        // User is not an admin, that's okay
        isSuperAdmin = false;
      }

      if (data) {
        setUser({
          id: userId,
          email: data.email,
          name: data.full_name || email,
          role: (data.role as UserRole) || 'student',
          isActive: data.is_active,
          isSuperAdmin,
        });
      } else {
        // Profile doesn't exist yet (first login)
        setUser({
          id: userId,
          email: email,
          name: email.split('@')[0],
          role: 'student',
          isSuperAdmin,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      // Sign up dengan Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Tunggu user_profile dibuat via trigger
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadUserProfile(data.user.id, email);
      }

      console.log('✅ Sign up successful');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        await loadUserProfile(data.user.id, data.user.email || email);
      }

      console.log('✅ Sign in successful');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAsStudent = async (studentName: string) => {
    setLoading(true);
    try {
      if (!studentName.trim()) {
        throw new Error('Nama siswa tidak boleh kosong');
      }

      // Create a simple student session without Supabase authentication
      const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const student: AuthUser = {
        id: studentId,
        email: `${studentId}@student.local`,
        name: studentName.trim(),
        role: 'student',
        isActive: true,
      };

      setUser(student);
      console.log('✅ Student login successful');
    } catch (error) {
      console.error('Student login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    session,
    signUpWithEmail,
    signInWithEmail,
    loginAsStudent,
    signOut,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Helper hooks
export function useIsAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin;
}

export function useIsTeacher() {
  const { isTeacher } = useAuth();
  return isTeacher;
}

export function useIsStudent() {
  const { isStudent } = useAuth();
  return isStudent;
}
