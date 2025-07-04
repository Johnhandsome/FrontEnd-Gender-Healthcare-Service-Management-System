import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xzxxodxplyetecrsbxmc.supabase.co/functions/v1';
const EDGE_URL = 'https://xzxxodxplyetecrsbxmc.supabase.co/functions/v1';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbnlzZm9qcHZhenprZ3NwYXZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODc0NTAzNywiZXhwIjoyMDY0MzIxMDM3fQ.TDXlW3dIvvmYv5QKUsAy_vpU3U_x7BMQ1IdfEWmWtJQ';
const supabase = createClient(supabaseUrl, supabaseKey);

@Injectable({ providedIn: 'root' })
export class CustomerSupabaseService {
  private http = inject(HttpClient);
  async callRpc<T = any>(
    funcName: string,
    params: Record<string, any>
  ): Promise<T> {
    const { data, error } = await supabase.rpc(funcName, params);
    if (error) throw error;
    return data;
  }

  callEdgeFunction<T>(funcName: string, params: Record<string, any>) {
    const url = `${EDGE_URL}/${funcName}`;
    return this.http.get<T>(url, { params }); // gửi ?doctor_id=... ở đây
  }
}
