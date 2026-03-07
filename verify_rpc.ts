
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyRPC() {
    console.log('Testing RPC call...');

    // 1. Sign in or Sign up
    const email = `rpc_test_${Date.now()}@example.com`;
    const password = 'Password123!';

    let { data: { user }, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
        console.log('Signup failed, trying login...');
        const { data: { user: loginUser }, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
            console.error('Auth failed completely', loginError);
            return;
        }
        user = loginUser;
    }

    if (!user) {
        console.error('No user avail');
        return;
    }

    console.log('User:', user.id);

    // 1.5 Check if function exists
    const { data: funcData, error: funcError } = await supabase
        .rpc('register_battery_with_image', {
            p_battery_id: 'RPC-TEST-CHECK',
            p_type: 'Li-ion',
            p_voltage: 0,
            p_temperature: 0,
            p_charge_cycles: 0,
            p_capacity: 0,
            p_location: 'Check',
            p_soh: 0,
            p_status: 'healthy'
        });
    // This will likely fail if parameters are wrong, but we just want to see if it says "function not found" vs "schema cache"

    // 2. Call RPC
    console.log('Calling RPC...');
    const { data, error } = await supabase.rpc('register_battery_with_image', {
        p_battery_id: 'RPC-TEST-01',
        p_type: 'Li-ion',
        p_voltage: 3.8,
        p_temperature: 20,
        p_charge_cycles: 5,
        p_capacity: 98,
        p_location: 'Lab',
        p_soh: 99,
        p_status: 'healthy',
        p_image: 'data:image/png;base64,TEST_IMAGE_DATA'
    });

    if (error) {
        console.error('RPC Failed:', error);
        const fs = await import('fs');
        fs.writeFileSync('verify_output.log', JSON.stringify({ error, data, step: 'RPC Call' }, null, 2));
    } else {
        console.log('RPC Success! Result:', data);
        const fs = await import('fs');
        fs.writeFileSync('verify_output.log', JSON.stringify({ success: true, data }, null, 2));
    }
}

verifyRPC();
