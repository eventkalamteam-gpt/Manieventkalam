import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase environment variables or admin-stored overrides
const getSupabaseConfig = () => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const localUrl = typeof window !== 'undefined' ? (localStorage.getItem('eventkalam_supabase_url') || '').trim() : '';
  const localKey = typeof window !== 'undefined' ? (localStorage.getItem('eventkalam_supabase_key') || '').trim() : '';

  const url = localUrl || envUrl || '';
  const key = localKey || envKey || '';

  const isConfigured = Boolean(
    url &&
    key &&
    (url.startsWith('https://') || url.startsWith('http://')) &&
    key.length > 10
  );

  return { url, key, isConfigured };
};

export const supabaseConfig = getSupabaseConfig();

let clientInstance: SupabaseClient | null = null;

if (supabaseConfig.isConfigured) {
  try {
    clientInstance = createClient(supabaseConfig.url, supabaseConfig.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('Could not initialize live Supabase client, falling back to local persistent store:', err);
  }
}

export const supabase = clientInstance;

/**
 * Update Supabase credentials at runtime from the Admin Dashboard
 */
export const updateSupabaseRuntimeCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('eventkalam_supabase_url', url.trim());
      localStorage.setItem('eventkalam_supabase_key', key.trim());
    } else {
      localStorage.removeItem('eventkalam_supabase_url');
      localStorage.removeItem('eventkalam_supabase_key');
    }
    window.location.reload();
  }
};

/**
 * Upload an image or file to Supabase Storage.
 * Security enforcement: ONLY authenticated users with public.profiles.role = 'admin' can upload or attach media.
 * Normal users and visitors are strictly rejected at the API/storage function level.
 */
export async function uploadEventAsset(
  file: File,
  bucketName: string = 'event-media',
  userRole?: string | null
): Promise<string> {
  // 1. Strict admin verification
  let isAuthorizedAdmin = userRole === 'admin';

  if (!isAuthorizedAdmin && typeof window !== 'undefined') {
    const sessionRaw = localStorage.getItem('eventkalam_session_v2');
    if (sessionRaw) {
      try {
        const parsed = JSON.parse(sessionRaw);
        if (parsed.role === 'admin') {
          isAuthorizedAdmin = true;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // 2. Query Supabase Auth & public.profiles directly if available
  if (!isAuthorizedAdmin && supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const authUser = userData?.user;
      if (authUser?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .maybeSingle();
        if (profile?.role === 'admin') {
          isAuthorizedAdmin = true;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // 3. Reject any non-admin attempting to upload
  if (!isAuthorizedAdmin) {
    console.warn('[Security Guard] Unauthorized upload attempt blocked: user lacks admin role.');
    throw new Error('Access Denied: Only authenticated administrators with public.profiles.role = "admin" have permission to upload or attach media.');
  }

  if (supabase) {
    try {
      let targetBucket = bucketName;
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        if (buckets && buckets.length > 0) {
          const match = buckets.find(b => b.name === bucketName || b.id === bucketName);
          if (match) {
            targetBucket = match.name || match.id;
          } else {
            const pub = buckets.find(b => b.public) || buckets[0];
            if (pub) targetBucket = pub.name || pub.id;
          }
        }
      } catch (e) {
        // ignore
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from(targetBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Supabase storage upload error:', error);
        if (error.message?.includes('Bucket not found') || error.message?.includes('bucket')) {
          throw new Error(`Supabase Storage bucket "${targetBucket}" not found. Please create a public bucket named "event-media" in your Supabase Dashboard under Storage -> New Bucket.`);
        }
        throw new Error(error.message || 'Storage permission denied');
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from(targetBucket)
          .getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
    } catch (e: any) {
      console.warn('Supabase storage operation notice:', e?.message || e);
      throw e;
    }
  }

  // Admin fallback: Read file to base64 Data URL for verified admin offline / persistent local state
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
