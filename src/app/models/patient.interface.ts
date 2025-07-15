export interface Patient {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other';
  allergies: any | null; // JSON field
  chronic_conditions: any | null; // JSON field
  past_surgeries: any | null; // JSON field
  vaccination_status: 'not_vaccinated' | 'partially_vaccinated' | 'fully_vaccinated';
  patient_status: 'active' | 'inactive' | 'deleted';
  created_at: string | null;
  updated_at: string | null;
  image_link: string | null;
  bio: string | null;
  // Additional fields for compatibility
  address?: string;
  emergency_contact?: string;
}
