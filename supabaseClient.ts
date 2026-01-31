import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dapeozaorwisggmrwjgg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhcGVvemFvcndpc2dnbXJ3amdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MTk0MjksImV4cCI6MjA4NTM5NTQyOX0.6r5FfgKoEJ2c06ap6QQJi9bjNM2PuinPfyzIMurw7Hw';

export const supabase = createClient(supabaseUrl, supabaseKey);