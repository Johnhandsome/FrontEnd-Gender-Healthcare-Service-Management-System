export interface PeriodTracking {
  period_id: string;
  patient_id: string;
  start_date: string;
  end_date?: string;
  estimated_next_date?: string;
  cycle_length?: number;
  flow_intensity?: FlowIntensity;
  symptoms?: any;
  period_description?: string;
  predictions?: any;
  created_at?: string;
  updated_at?: string;
  // Additional fields for display
  patient_name?: string;
}

export enum FlowIntensity {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy'
}

export interface PeriodSymptom {
  id: string;
  name: string;
  severity: SymptomSeverity;
}

export enum SymptomSeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe'
}

export interface CreatePeriodTrackingRequest {
  patient_id: string;
  start_date: string;
  end_date?: string;
  cycle_length?: number;
  flow_intensity?: FlowIntensity;
  symptoms?: any;
  period_description?: string;
}

export interface UpdatePeriodTrackingRequest extends CreatePeriodTrackingRequest {
  period_id: string;
}
