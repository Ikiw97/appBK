import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

type ResponseData = {
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { schoolMode } = req.body;

    if (!schoolMode || !['sd', 'smp', 'sma_smk'].includes(schoolMode)) {
      return res.status(400).json({ success: false, error: 'Invalid schoolMode value' });
    }

    console.log(`💾 [save-school-mode] Saving schoolMode: ${schoolMode}`);

    // Fetch existing row
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('feature_settings')
      .select('id, settings')
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ [save-school-mode] Fetch error:', fetchError);
      return res.status(500).json({ success: false, error: fetchError.message });
    }

    if (existing) {
      // Update the schoolMode inside settings.system JSON
      const updatedSettings = {
        ...existing.settings,
        system: {
          ...(existing.settings?.system || {}),
          schoolMode: schoolMode,
        },
      };

      const { error: updateError } = await supabaseAdmin
        .from('feature_settings')
        .update({ settings: updatedSettings, updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (updateError) {
        console.error('❌ [save-school-mode] Update error:', updateError);
        return res.status(500).json({ success: false, error: updateError.message });
      }
    } else {
      // Insert new row with just system.schoolMode
      const { error: insertError } = await supabaseAdmin
        .from('feature_settings')
        .insert([{
          settings: { system: { schoolMode } },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (insertError) {
        console.error('❌ [save-school-mode] Insert error:', insertError);
        return res.status(500).json({ success: false, error: insertError.message });
      }
    }

    console.log(`✅ [save-school-mode] Saved schoolMode: ${schoolMode}`);
    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('❌ [save-school-mode] Exception:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
