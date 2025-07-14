export interface Patient {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  date_of_birth: string | null;
  gender: string;
  address?: string;
  emergency_contact?: string;
  allergies: Record<string, string> | string[] | null;
  chronic_conditions: Record<string, string> | string[] | null;
  past_surgeries: Record<string, string> | string[] | null;
  vaccination_status: string;
  patient_status: string;
  created_at: string | null;
  updated_at: string | null;
  image_link: string | null;
  bio: string | null;
}
