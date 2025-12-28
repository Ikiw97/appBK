import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { FeatureSettings, DEFAULT_SETTINGS } from '@/lib/featureSettings';

type ResponseData = {
  success: boolean;
  data?: FeatureSettings;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('📥 [get-feature-settings] Fetching feature settings');

    // **IMPORTANT: By default, return DEFAULT_SETTINGS with all games ENABLED**
    // This ensures admin/super_admin users can always access games
    // Individual students can have restrictions applied via user_profiles

    const { data, error } = await supabase
      .from('feature_settings')
      .select('settings')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('❌ [get-feature-settings] Error fetching settings:', error);
      // Even on error, return defaults to ensure accessibility
      console.log('⚠️ [get-feature-settings] Error, returning DEFAULT_SETTINGS');
      return res.status(200).json({ success: true, data: DEFAULT_SETTINGS });
    }

    if (data && data.settings) {
      // Merge fetched settings with defaults to ensure all fields exist
      const mergedSettings: FeatureSettings = {
        assessments: {
          akpd: data.settings.assessments?.akpd ?? DEFAULT_SETTINGS.assessments.akpd,
          aum: data.settings.assessments?.aum ?? DEFAULT_SETTINGS.assessments.aum,
          personality: data.settings.assessments?.personality ?? DEFAULT_SETTINGS.assessments.personality,
          emotional_intelligence: data.settings.assessments?.emotional_intelligence ?? DEFAULT_SETTINGS.assessments.emotional_intelligence,
          sdq: data.settings.assessments?.sdq ?? DEFAULT_SETTINGS.assessments.sdq,
          mbti: data.settings.assessments?.mbti ?? DEFAULT_SETTINGS.assessments.mbti,
          big_five: data.settings.assessments?.big_five ?? DEFAULT_SETTINGS.assessments.big_five,
          grit: data.settings.assessments?.grit ?? DEFAULT_SETTINGS.assessments.grit,
          holland_code: data.settings.assessments?.holland_code ?? DEFAULT_SETTINGS.assessments.holland_code,
        },
        exercises: {
          basic: data.settings.exercises?.basic ?? DEFAULT_SETTINGS.exercises.basic,
          advanced: data.settings.exercises?.advanced ?? DEFAULT_SETTINGS.exercises.advanced,
        },
        games: {
          vocabulary: data.settings.games?.vocabulary ?? DEFAULT_SETTINGS.games.vocabulary,
          puzzle: data.settings.games?.puzzle ?? DEFAULT_SETTINGS.games.puzzle,
          kahoot: data.settings.games?.kahoot ?? DEFAULT_SETTINGS.games.kahoot,
        },
        system: {
          maintenanceMode: data.settings.system?.maintenanceMode ?? DEFAULT_SETTINGS.system.maintenanceMode,
          emailNotifications: data.settings.system?.emailNotifications ?? DEFAULT_SETTINGS.system.emailNotifications,
          systemAnnouncements: data.settings.system?.systemAnnouncements ?? DEFAULT_SETTINGS.system.systemAnnouncements,
        },
        studentManagement: {
          studentEnrollment: data.settings.studentManagement?.studentEnrollment ?? DEFAULT_SETTINGS.studentManagement.studentEnrollment,
          classTracking: data.settings.studentManagement?.classTracking ?? DEFAULT_SETTINGS.studentManagement.classTracking,
          dataExport: data.settings.studentManagement?.dataExport ?? DEFAULT_SETTINGS.studentManagement.dataExport,
        },
        reporting: {
          progressTracking: data.settings.reporting?.progressTracking ?? DEFAULT_SETTINGS.reporting.progressTracking,
          assessmentReports: data.settings.reporting?.assessmentReports ?? DEFAULT_SETTINGS.reporting.assessmentReports,
          analyticsBoard: data.settings.reporting?.analyticsBoard ?? DEFAULT_SETTINGS.reporting.analyticsBoard,
        },
        dataManagement: {
          autoBackup: data.settings.dataManagement?.autoBackup ?? DEFAULT_SETTINGS.dataManagement.autoBackup,
          dataRetention: data.settings.dataManagement?.dataRetention ?? DEFAULT_SETTINGS.dataManagement.dataRetention,
          privacySettings: data.settings.dataManagement?.privacySettings ?? DEFAULT_SETTINGS.dataManagement.privacySettings,
        },
      };
      console.log('✅ [get-feature-settings] Settings fetched successfully:', mergedSettings);
      return res.status(200).json({ success: true, data: mergedSettings });
    }

    // If no settings found, return default (ALL GAMES ENABLED)
    // This is the failsafe to ensure admin/super_admin can always play games
    console.log('✅ [get-feature-settings] No custom settings, returning DEFAULT_SETTINGS with ALL features ENABLED');
    return res.status(200).json({ success: true, data: DEFAULT_SETTINGS });
  } catch (error) {
    console.error('❌ [get-feature-settings] Exception:', error);
    // Even on exception, return defaults
    console.log('⚠️ [get-feature-settings] Exception occurred, returning DEFAULT_SETTINGS as failsafe');
    return res.status(200).json({ success: true, data: DEFAULT_SETTINGS });
  }
}
