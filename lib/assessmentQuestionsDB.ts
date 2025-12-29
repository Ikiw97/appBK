// Assessment Questions Storage Helper with Supabase Integration
// Allows super admins and teachers to edit assessment questions via API

import { supabase } from './supabaseClient';
import { Question, getAUMQuestions } from './assessmentQuestions';
import { AKPDQuestion, AKPD_QUESTIONS } from './akpdQuestions';

// Load AUM Questions from Supabase (with fallback to localStorage and defaults)
export async function getAUMQuestionsWithSupabase(): Promise<Question[]> {
  try {
    // Try to load from Supabase
    const { data, error } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('assessment_type', 'aum')
      .order('question_id', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.question_id,
        ...row.question_data
      }));
    }
  } catch (error) {
    console.warn('Error loading AUM questions from Supabase:', error);
  }

  // Fallback to localStorage for migration
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('customAUMQuestions');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Error loading AUM questions from localStorage:', error);
    }
  }

  const defaultQuestions = getAUMQuestions();
  return Array.isArray(defaultQuestions) ? defaultQuestions : [];
}

// Load AKPD Questions from Supabase (with fallback to localStorage and defaults)
export async function getAKPDQuestionsWithSupabase(): Promise<AKPDQuestion[]> {
  try {
    // Try to load from Supabase
    const { data, error } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('assessment_type', 'akpd')
      .order('question_id', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.question_id,
        ...row.question_data
      }));
    }
  } catch (error) {
    console.warn('Error loading AKPD questions from Supabase:', error);
  }

  // Fallback to localStorage for migration
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('customAKPDQuestions');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed)) {
          // Merge custom text with original questions to preserve structure
          return AKPD_QUESTIONS.map((original) => {
            const customQuestion = parsed.find((q: any) => q.id === original.id);
            if (customQuestion) {
              return {
                ...original,
                text: customQuestion.text,
              };
            }
            return original;
          });
        }
      }
    } catch (error) {
      console.warn('Error loading AKPD questions from localStorage:', error);
    }
  }

  return Array.isArray(AKPD_QUESTIONS) ? AKPD_QUESTIONS : [];
}

// Save assessment questions via API (Supabase)
export async function saveAssessmentQuestions(
  assessmentType: 'aum' | 'akpd',
  questions: Question[] | AKPDQuestion[],
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/assessment-questions/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessmentType,
        questions,
        currentUserId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to save questions' };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving assessment questions:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Save individual assessment questions
export async function saveAUMQuestions(
  questions: Question[],
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  return saveAssessmentQuestions('aum', questions, currentUserId);
}

export async function saveAKPDQuestions(
  questions: AKPDQuestion[],
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  return saveAssessmentQuestions('akpd', questions, currentUserId);
}
