import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        console.log('📊 Fetching aggregated assessment stats...');

        // 1. Fetch count from main assessment_results table
        // We group by assessment_id and class on the client or server?
        // Supabase basic client doesn't support complex GROUP BY easily without RPC.
        // We will fetch lightweight csv format (id, assessment_id, class) to minimize bandwidth
        // OR better: use .select('assessment_id, class', { count: 'exact' }) but that still fetches rows? 
        // Best approach without RPC: Fetch minimal columns.

        const { data: mainData, error: mainError } = await supabase
            .from('assessment_results')
            .select('assessment_id, class');

        if (mainError) throw mainError;

        // 2. Fetch count from sma_smk_career_path_results (special table)
        const { data: smaData, error: smaError } = await supabase
            .from('sma_smk_career_path_results')
            .select('kelas'); // This one has 'kelas' instead of 'class'

        if (smaError) throw smaError;

        // 3. Aggregate data in memory (Server-side is fast enough for <10k rows)
        const stats: Record<string, { total: number, byClass: Record<string, number> }> = {};

        // Process main results
        mainData?.forEach((row: any) => {
            const id = row.assessment_id || 'unknown';
            const cls = row.class || 'Unknown';

            if (!stats[id]) stats[id] = { total: 0, byClass: {} };

            stats[id].total++;
            stats[id].byClass[cls] = (stats[id].byClass[cls] || 0) + 1;
        });

        // Process SMA results
        const smaId = 'sma_smk';
        if (!stats[smaId]) stats[smaId] = { total: 0, byClass: {} };

        smaData?.forEach((row: any) => {
            const cls = row.kelas || 'Unknown';
            stats[smaId].total++;
            stats[smaId].byClass[cls] = (stats[smaId].byClass[cls] || 0) + 1;
        });

        console.log(`✅ Aggregated stats for ${Object.keys(stats).length} assessments`);
        return res.status(200).json({ success: true, data: stats });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
