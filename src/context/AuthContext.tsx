import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { supabase, supabaseConfig } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    role?: UserRole;
    error?: string;
    profile?: UserProfile;
    profileData?: any;
    profileError?: any;
  }>;
  adminLogin?: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  allUsers: UserProfile[];
  toggleUserStatus: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hash password with SHA-256 using native Web Crypto API so plaintext password is NEVER stored
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const STORAGE_USERS_KEY = 'eventkalam_users_v2';
const STORAGE_CREDENTIALS_KEY = 'eventkalam_credentials_v2';
const STORAGE_SESSION_KEY = 'eventkalam_session_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [credentialsStore, setCredentialsStore] = useState<Record<string, { hash: string; role: UserRole }>>({});
  const isAuthenticatingRef = React.useRef(false);

  const saveUsers = (users: UserProfile[]) => {
    setAllUsers(users);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  };

  /**
   * Fetches and applies the role for an authenticated user from public.profiles
   * Requirement 2: Get authenticated user's ID from supabase.auth.getUser()
   * Requirement 3: Query public.profiles using authenticated user's ID:
   *                SELECT role FROM public.profiles WHERE id = authUser.id
   * Requirement 4: If role === 'admin', treat session as an admin
   * Requirement 5: If role === 'user', treat session as a normal user
   */
  const fetchAndApplyRoleForUser = async (
    user: {
      id: string;
      email?: string;
      user_metadata?: any;
      app_metadata?: any;
      created_at?: string;
    },
    authSession?: any
  ): Promise<{
    success: boolean;
    role: UserRole;
    profile?: UserProfile;
    profileData?: any;
    profileError?: any;
  }> => {
    if (!supabase || !user?.id) {
      return { success: false, role: 'user' };
    }

    try {
      // 1. Ensure we query with the user's active JWT bearer token to satisfy Row Level Security (RLS)
      let accessToken = authSession?.access_token;
      if (!accessToken) {
        try {
          const { data: sessData } = await supabase.auth.getSession();
          accessToken = sessData?.session?.access_token;
        } catch (e) {
          // ignore
        }
      }

      let profileData: any = null;
      let profileError: any = null;

      // 3. Query public.profiles using authenticated user's ID:
      //    SELECT id, role, full_name, phone_number FROM public.profiles WHERE id = authUser.id
      // First attempt: query using main authenticated supabase client (has active session)
      const res1 = await supabase
        .from('profiles')
        .select('id, role, full_name, phone_number')
        .eq('id', user.id)
        .maybeSingle();

      if (res1.data) {
        profileData = res1.data;
        profileError = res1.error;
      } else {
        // Second attempt: query strictly for role
        const res2 = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (res2.data) {
          profileData = res2.data;
          profileError = res2.error;
        } else if (accessToken && supabaseConfig.url && supabaseConfig.key) {
          // Third attempt: explicit client with both apikey and Bearer token headers
          try {
            const authClient = createClient(supabaseConfig.url, supabaseConfig.key, {
              global: {
                headers: {
                  apikey: supabaseConfig.key,
                  Authorization: `Bearer ${accessToken}`,
                },
              },
              auth: {
                persistSession: false,
                autoRefreshToken: false,
              },
            });

            const res3 = await authClient
              .from('profiles')
              .select('id, role, full_name, phone_number')
              .eq('id', user.id)
              .maybeSingle();

            if (res3.data) {
              profileData = res3.data;
              profileError = res3.error;
            }
          } catch (e) {
            // ignore
          }

          // Fourth attempt: direct authenticated REST fetch to PostgREST
          if (!profileData) {
            try {
              const rawRes = await fetch(
                `${supabaseConfig.url}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=*`,
                {
                  method: 'GET',
                  headers: {
                    apikey: supabaseConfig.key,
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );
              if (rawRes.ok) {
                const rows = await rawRes.json();
                if (Array.isArray(rows) && rows.length > 0) {
                  profileData = rows[0];
                  profileError = null;
                }
              } else {
                const errData = await rawRes.json().catch(() => null);
                if (!profileError) profileError = errData || { message: `HTTP ${rawRes.status}` };
              }
            } catch (e: any) {
              if (!profileError) profileError = e?.message || e;
            }
          }
        }
      }

      let roleFromDb: string | null = profileData?.role || null;
      let fullNameFromDb: string | null = profileData?.full_name || null;
      let phoneFromDb: string | null = profileData?.phone_number || null;
      let profileStatus: 'active' | 'suspended' = profileData?.status || 'active';

      // Fallback check on user metadata if DB query returned no row (e.g., if RLS policy hasn't been created yet)
      if (!roleFromDb) {
        const metaRole = user.app_metadata?.role || user.user_metadata?.role;
        if (metaRole) {
          roleFromDb = metaRole;
        }
      }

      // 4. If role === 'admin', treat session as admin
      // 5. If role === 'user', treat session as normal user
      const rawRole = String(roleFromDb || '').trim().toLowerCase();
      const resolvedRole: UserRole = rawRole === 'admin' ? 'admin' : 'user';

      // === DEBUGGING REQUIREMENT LOGS IMMEDIATELY AFTER PROFILE QUERY ===
      console.log('AUTH USER ID:', user.id);
      console.log('AUTH USER EMAIL:', user.email);
      console.log('PROFILE QUERY DATA:', profileData);
      console.log('PROFILE QUERY ERROR:', profileError);
      console.log('PROFILE ROLE:', resolvedRole);
      console.log('FINAL ROUTE:', resolvedRole === 'admin' ? 'Admin Dashboard' : 'User Dashboard');
      // =================================================================

      const cleanEmail = (user.email || '').trim().toLowerCase();
      const displayName =
        fullNameFromDb ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        cleanEmail.split('@')[0] ||
        'User';

      const displayPhone =
        phoneFromDb ||
        user.user_metadata?.phone_number ||
        user.user_metadata?.phone ||
        undefined;

      const userProfile: UserProfile = {
        id: user.id,
        name: displayName,
        email: cleanEmail,
        role: resolvedRole,
        phone: displayPhone,
        status: profileStatus,
        createdAt: user.created_at || new Date().toISOString(),
      };

      setCurrentUser(userProfile);
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userProfile));

      setAllUsers((prev) => {
        const exists = prev.some((u) => u.id === userProfile.id);
        const updated = exists
          ? prev.map((u) => (u.id === userProfile.id ? userProfile : u))
          : [userProfile, ...prev];
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
        return updated;
      });

      return {
        success: true,
        role: resolvedRole,
        profile: userProfile,
        profileData,
        profileError,
      };
    } catch (err) {
      console.warn('Error querying public.profiles for role:', err);
      return { success: false, role: 'user' };
    }
  };

  // Initialize users and credentials store, and restore existing session
  useEffect(() => {
    const initAuth = async () => {
      let storedUsers: UserProfile[] = [];
      const usersRaw = localStorage.getItem(STORAGE_USERS_KEY);
      if (usersRaw) {
        try {
          storedUsers = JSON.parse(usersRaw);
        } catch (e) {
          console.error(e);
        }
      }
      if (storedUsers.length === 0) {
        storedUsers = INITIAL_USERS;
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(storedUsers));
      }
      setAllUsers(storedUsers);

      // Initialize credentials map with hashed passwords for local testing fallback
      let creds: Record<string, { hash: string; role: UserRole }> = {};
      const credsRaw = localStorage.getItem(STORAGE_CREDENTIALS_KEY);
      if (credsRaw) {
        try {
          creds = JSON.parse(credsRaw);
        } catch (e) {
          console.error(e);
        }
      } else {
        const adminHash = await hashPassword('admin123');
        const userHash = await hashPassword('password123');
        creds = {
          'admin@eventkalam.com': { hash: adminHash, role: 'admin' },
          'rahul.verma@gmail.com': { hash: userHash, role: 'user' },
          'priyanka.r@gmail.com': { hash: userHash, role: 'user' },
          'karthik.rao@gmail.com': { hash: userHash, role: 'user' },
        };
        localStorage.setItem(STORAGE_CREDENTIALS_KEY, JSON.stringify(creds));
      }
      setCredentialsStore(creds);

      // 1. Immediately restore cached session so page does not flicker
      const sessionRaw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (sessionRaw) {
        try {
          const sessionUser: UserProfile = JSON.parse(sessionRaw);
          if (sessionUser && sessionUser.id) {
            setCurrentUser(sessionUser);
          }
        } catch (e) {
          localStorage.removeItem(STORAGE_SESSION_KEY);
        }
      }

      // 2. Requirement 10: Make the role check happen whenever the existing
      //    authentication session is restored/refreshed
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await fetchAndApplyRoleForUser(session.user, session);
          } else {
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user) {
              await fetchAndApplyRoleForUser(userData.user);
            }
          }
        } catch (err) {
          console.warn('Supabase auth session sync notice:', err);
        }
      }
    };

    initAuth();

    // Requirement 10: Listen for auth changes and refresh role check from public.profiles
    const client = supabase;
    if (client) {
      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // If login() is currently executing, let login() complete role detection without race condition
          if (isAuthenticatingRef.current) {
            return;
          }
          if (session?.user) {
            await fetchAndApplyRoleForUser(session.user, session);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem(STORAGE_SESSION_KEY);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  /**
   * Single Unified Login for both normal users and administrators.
   * Requirement 1: User logs in using Supabase Auth.
   * Requirement 2: Get authenticated user's ID from: supabase.auth.getUser()
   * Requirement 3: Query public.profiles using authenticated user's ID:
   *                SELECT role FROM public.profiles WHERE id = authUser.id
   * Requirement 4: If role === 'admin', treat the session as an admin.
   * Requirement 5: If role === 'user', treat the session as a normal user.
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    role?: UserRole;
    error?: string;
    profile?: UserProfile;
    profileData?: any;
    profileError?: any;
  }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. User logs in using Supabase Auth if configured
    if (supabase) {
      isAuthenticatingRef.current = true;
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authError) {
          return { success: false, error: authError.message };
        }

        // 2. Get the authenticated user's ID from: supabase.auth.getUser()
        const { data: userData, error: getUserError } = await supabase.auth.getUser();
        const authUser = userData?.user || authData?.user;

        if (!authUser || !authUser.id) {
          return {
            success: false,
            error: getUserError?.message || 'Could not verify authenticated user ID.',
          };
        }

        // 3. Query public.profiles using that authenticated user's ID:
        //    SELECT role FROM public.profiles WHERE id = authUser.id
        // 4. If role === 'admin', treat the session as an admin.
        // 5. If role === 'user', treat the session as a normal user.
        const roleResult = await fetchAndApplyRoleForUser(authUser, authData.session);

        if (roleResult.profile?.status === 'suspended') {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'This account has been suspended. Please contact robokalam@gmail.com.',
          };
        }

        return {
          success: true,
          role: roleResult.role,
          profile: roleResult.profile,
          profileData: roleResult.profileData,
          profileError: roleResult.profileError,
        };
      } catch (err: any) {
        console.warn('Supabase auth sign-in error:', err?.message || err);
        return {
          success: false,
          error: err?.message || 'Authentication failed. Please check your credentials.',
        };
      } finally {
        setTimeout(() => {
          isAuthenticatingRef.current = false;
        }, 1200);
      }
    }

    // 2. Local Fallback Verification (Zero-failure demo/offline environment)
    const user = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        error: 'No account found with this email. Please check your credentials or register.',
      };
    }

    if (user.status === 'suspended') {
      return {
        success: false,
        error: 'This account has been suspended. Please contact robokalam@gmail.com.',
      };
    }

    const hashedInput = await hashPassword(password);
    const storedCred = credentialsStore[cleanEmail];

    if (!storedCred || storedCred.hash !== hashedInput) {
      return { success: false, error: 'Incorrect email or password. Please try again.' };
    }

    // Determine role directly from verified user record (never client-selected)
    const verifiedRole: UserRole = user.role === 'admin' ? 'admin' : 'user';

    setCurrentUser(user);
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    return { success: true, role: verifiedRole };
  };

  /**
   * Single Unified Registration.
   * Requirement 6: Do NOT add an admin option to the registration form.
   * Requirement 8: Do NOT store passwords anywhere in public.profiles.
   * All registrations strictly default to role = 'user'.
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'An account with this email already exists. Please log in instead.',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long for security.',
      };
    }

    // 1. Register via Supabase Auth if configured
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              phone_number: phone ? phone.trim() : null,
            },
          },
        });

        if (authError) {
          return { success: false, error: authError.message };
        }

        if (authData?.user) {
          // Strictly insert into profiles with role = 'user'
          // Do NOT store passwords anywhere in public.profiles
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            full_name: name.trim(),
            phone_number: phone ? phone.trim() : null,
            role: 'user', // Strictly enforced default role!
          });

          if (profileError) {
            console.warn('Profiles upsert note:', profileError.message);
          }

          const newUser: UserProfile = {
            id: authData.user.id,
            name: name.trim(),
            email: cleanEmail,
            role: 'user',
            phone: phone ? phone.trim() : undefined,
            status: 'active',
            createdAt: new Date().toISOString(),
          };

          setCurrentUser(newUser);
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newUser));
          return { success: true, role: 'user' };
        }
      } catch (err: any) {
        console.warn('Supabase signup error:', err?.message || err);
      }
    }

    // 2. Local Fallback Registration
    const newUser: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'user', // Enforce role = 'user'
      phone: phone ? phone.trim() : undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const hashedInput = await hashPassword(password);
    const updatedCreds = {
      ...credentialsStore,
      [cleanEmail]: { hash: hashedInput, role: 'user' as UserRole },
    };
    setCredentialsStore(updatedCreds);
    localStorage.setItem(STORAGE_CREDENTIALS_KEY, JSON.stringify(updatedCreds));

    const updatedUsers = [newUser, ...allUsers];
    saveUsers(updatedUsers);

    // Auto-login newly registered user
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newUser));

    return { success: true, role: 'user' };
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_SESSION_KEY);
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // ignore
      }
    }
  };

  // Safe profile update: Strips out role modification attempts
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;

    // Security: Do NOT allow user to modify their own role
    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates.role;
    delete (sanitizedUpdates as any).status;

    const updated: UserProfile = {
      ...currentUser,
      ...sanitizedUpdates,
      role: currentUser.role // Preserved intact
    };

    setCurrentUser(updated);
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated));

    const updatedList = allUsers.map(u => u.id === currentUser.id ? updated : u);
    saveUsers(updatedList);

    if (supabase) {
      try {
        const { error: err1 } = await supabase
          .from('profiles')
          .update({
            full_name: updated.name,
            phone_number: updated.phone,
          })
          .eq('id', currentUser.id);

        if (err1) {
          await supabase
            .from('profiles')
            .update({
              name: updated.name,
              phone: updated.phone,
            })
            .eq('id', currentUser.id);
        }
      } catch (err) {
        console.warn('Supabase profile update notice:', err);
      }
    }
  };

  const toggleUserStatus = async (userId: string) => {
    // Only administrators can toggle account status
    if (currentUser?.role !== 'admin') {
      console.warn('Unauthorized status toggle attempt');
      return;
    }

    const updatedList = allUsers.map(u => {
      if (u.id === userId && u.role !== 'admin') {
        const nextStatus = u.status === 'active' ? ('suspended' as const) : ('active' as const);
        if (supabase) {
          supabase
            .from('profiles')
            .update({ status: nextStatus })
            .eq('id', userId)
            .then();
        }
        return {
          ...u,
          status: nextStatus
        };
      }
      return u;
    });
    saveUsers(updatedList);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        login,
        adminLogin: login, // alias for backwards compatibility
        register,
        logout,
        updateProfile,
        allUsers,
        toggleUserStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
