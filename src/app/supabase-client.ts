import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wqnysfojpvazkgspavx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbnlzZm9qcHZhenprZ3NwYXZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODc0NTAzNywiZXhwIjoyMDY0MzIxMDM3fQ.TDXlW3dIvvmYv5QKUsAy_vpU3U_x7BMQ1IdfEWmWtJQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
