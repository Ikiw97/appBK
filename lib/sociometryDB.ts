import { supabase } from './supabaseClient';

// Types for Sociometry
export interface SociometrySession {
  id: string;
  title: string;
  class_id: string; // Target class
  questions: string[]; // List of questions
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  created_by?: string;
}

export interface SociometryResponse {
  id: string;
  session_id: string;
  student_id: string; // The student answering
  student_name: string;
  student_gender?: string; // Helpful for analysis
  answers: {
    question_index: number;
    selected_students: string[]; // List of student names or IDs chosen
  }[];
  submitted_at: string;
}

// Local storage keys (fallback if no DB table yet)
const SOC_SESSIONS_KEY = 'sociometry_sessions';
const SOC_RESPONSES_KEY = 'sociometry_responses';

// In-memory cache for sessions
let sessionsCache: SociometrySession[] | null = null;
let sessionsCacheTime: number = 0;
const SESSION_CACHE_DURATION = 30000; // 30 seconds

// Force cache invalidation
export function invalidateSessionsCache(): void {
  sessionsCache = null;
  sessionsCacheTime = 0;
}

// Helper to get sessions (with caching)
export const getSociometrySessions = async (forceRefresh = false): Promise<SociometrySession[]> => {
  // Return cached if valid
  const now = Date.now();
  if (!forceRefresh && sessionsCache && (now - sessionsCacheTime) < SESSION_CACHE_DURATION) {
    return sessionsCache;
  }

  // Use server-side API to bypass CORS issues for students (anon role)
  try {
    const response = await fetch('/api/sociometry/get-sessions');
    const result = await response.json();

    if (!result.success) {
      console.error('API FETCH Error:', result.error);
      throw new Error(result.error);
    }

    if (result.data) {
      sessionsCache = result.data as SociometrySession[];
      sessionsCacheTime = Date.now();
      return sessionsCache;
    }
  } catch (err) {
    console.warn('API fetch failed, falling back to local storage', err);
  }

  // Fallback to local storage
  if (typeof window === 'undefined') return [];
  const localData = localStorage.getItem(SOC_SESSIONS_KEY);
  return localData ? JSON.parse(localData) : [];
};

// Update return type to include error info
export const saveSociometrySession = async (session: SociometrySession): Promise<{ success: boolean; error?: string }> => {
  // Try saving to Supabase
  try {
    const { error } = await supabase
      .from('sociometry_sessions')
      .upsert(session);

    if (error) {
      console.error('Supabase save error:', error);
      return { success: false, error: error.message || 'Gagal menyimpan ke database database.' };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Supabase not available or unexpected error:', err);
    // Only fall back to local storage if it's a connection/client error, not a database error
    // check if it's really offline? 
    // For now, let's treat it as an error to force user to see the issue.
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
};

export const deleteSociometrySession = async (id: string): Promise<boolean> => {
  const sessions = await getSociometrySessions();
  const newSessions = sessions.filter(s => s.id !== id);
  localStorage.setItem(SOC_SESSIONS_KEY, JSON.stringify(newSessions));
  return true;
};

// Helper to get responses (with caching per session)
const responsesCache: Record<string, { data: SociometryResponse[], time: number }> = {};

export const getSociometryResponses = async (sessionId: string, forceRefresh = false): Promise<SociometryResponse[]> => {
  // Return cached if valid
  const now = Date.now();
  const cached = responsesCache[sessionId];
  if (!forceRefresh && cached && (now - cached.time) < SESSION_CACHE_DURATION) {
    return cached.data;
  }

  // Use server-side API to bypass CORS issues
  try {
    const response = await fetch(`/api/sociometry/get-responses?session_id=${sessionId}`);
    const result = await response.json();

    if (!result.success) {
      console.error('API fetch error:', result.error);
      throw new Error(result.error);
    }

    const data = result.data as SociometryResponse[];
    responsesCache[sessionId] = { data, time: Date.now() };
    return data;
  } catch (err) {
    console.warn('API fetch failed, falling back to local storage', err);
  }

  // Fallback to local storage
  if (typeof window === 'undefined') return [];

  const localData = localStorage.getItem(SOC_RESPONSES_KEY);
  const allResponses: SociometryResponse[] = localData ? JSON.parse(localData) : [];
  return allResponses.filter(r => r.session_id === sessionId);
};

export const saveSociometryResponse = async (response: SociometryResponse): Promise<boolean> => {
  // Use server-side API to bypass CORS issues
  try {
    console.log('Saving response via API:', response.student_name);

    const apiResponse = await fetch('/api/sociometry/save-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    });

    const result = await apiResponse.json();

    if (!result.success) {
      console.error('API save error:', result.error);
      throw new Error(result.error);
    }

    console.log('Response saved successfully via API');
    return true;
  } catch (err) {
    console.error('Failed to save response via API:', err);
    alert('Gagal menyimpan jawaban ke server. Error: ' + (err as Error).message);
    return false;
  }
};

// Analytics Helper
export const analyzeSociometry = (responses: SociometryResponse[], allStudents: any[]) => {
  // Create a map of student ID to student name
  const studentIdToName: Record<string, string> = {};

  // First, map from allStudents (master data)
  allStudents.forEach(student => {
    studentIdToName[student.id] = student.nama;
  });

  // Then, override with names from responses (in case master data is outdated)
  responses.forEach(res => {
    studentIdToName[res.student_id] = res.student_name;
  });

  // Calculate "Popularity" (Star) - count how many times each student was chosen
  const incomingChoices: Record<string, number> = {};

  responses.forEach(res => {
    res.answers.forEach(ans => {
      ans.selected_students.forEach(chosenId => {
        incomingChoices[chosenId] = (incomingChoices[chosenId] || 0) + 1;
      });
    });
  });

  // Convert to ranked list with names
  const rankedStudents = Object.entries(incomingChoices)
    .sort(([, a], [, b]) => b - a)
    .map(([studentId, count]) => ({
      id: studentId,
      name: studentIdToName[studentId] || `Unknown Student (${studentId.substring(0, 8)}...)`,
      count
    }));

  return {
    rankedStudents,
    totalResponses: responses.length
  };
};
