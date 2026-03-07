
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false // For Node.js script
    }
});

console.log('--- COMMAND & CONTROL DIAGNOSTICS ---');
console.log('Target Supabase URL:', SUPABASE_URL);
console.log('Project ID (from URL):', SUPABASE_URL.split('.')[0].split('//')[1]);
console.log('-------------------------------------');

async function verify() {
    console.log('1. Creating test user...');
    const email = `test_verification_${Date.now()}@example.com`;
    const password = 'Password123!';

    const { data: { user, session }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (signUpError) {
        console.error('Signup failed:', signUpError.message);
        return;
    }

    if (!user) {
        console.error('User creation failed (no user returned)');
        return;
    }

    console.log('User created:', user.id);

    // We might not have a session if email confirmation is required.
    // But usually RLS policies for INSERT depend on auth.uid(), which requires a session.
    // If we don't have a session, we can't test RLS tables.

    if (!session) {
        console.log('No session returned. Email confirmation might be required.');
        console.log('Attempting to sign in (sometimes works if auto-confirm is on)...');
        const { data: { session: signInSession }, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError || !signInSession) {
            console.error('Could not get a session. Cannot verify RLS table insert.');
            return;
        }
    }

    console.log('2. Inserting battery with image...');
    const { data: battery, error: insertError } = await supabase
        .from('batteries')
        .insert({
            user_id: user.id,
            battery_id: 'TEST-BAT-001',
            type: 'Li-ion',
            voltage: 3.7,
            temperature: 25,
            charge_cycles: 10,
            capacity: 95,
            soh: 100,
            status: 'healthy',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' // 1x1 pixel red dot
        })
        .select()
        .single();

    if (insertError) {
        console.error('Insert failed. This might indicate the "image" column is missing or schema cache is stale.');
        console.error('Error:', insertError);
    } else {
        console.log('Insert SUCCESS!');
        console.log('Returned Battery:', battery);
        if (battery.image) {
            console.log('VERIFICATION PASSED: "image" field was successfully saved and returned.');
        } else {
            console.error('VERIFICATION FAILED: "image" field is missing in the response.');
        }
    }

    // Cleanup (optional, but good practice)
    // We can't easily delete the user without service role key, but we can delete the battery.
    if (battery) {
        await supabase.from('batteries').delete().eq('id', battery.id);
    }
}

verify();
