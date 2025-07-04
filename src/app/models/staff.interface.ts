export interface Staff {
  staff_id: string;
  full_name: string;
  working_email: string;
  email?: string; // Alternative email field
  role: string; // Assuming staff_role_enum is a string-based enum
  years_experience?: number;
  hired_at: string; // Date will be handled as string from Supabase
  is_available: boolean;
  staff_status: string; // Assuming staff_status is a string-based enum
  created_at?: string;
  updated_at?: string;
  image_link?: string;
  gender?: string; // Assuming gender_enum is a string-based enum
  languages?: string[];
  password?: string; // For authentication (should be hashed in production)
}

export interface Role {
  value: string;
  label: string;
}

export type StaffStatus = 'active' | 'inactive' | 'on_leave'; // Adjust based on staff_status enum values
export type Gender = 'male' | 'female' | 'other'; // Adjust based on gender_enum values

// Doctor Details Interface
export interface DoctorDetails {
  doctor_id: string;
  department: string;
  speciality: string;
  about_me?: any;
  license_no: string;
  bio?: string;
  slogan?: string;
  educations?: any;
  certifications?: any;
}

// Combined Doctor Interface
export interface Doctor extends Staff {
  doctor_details?: DoctorDetails;
}

// Enums for Doctor
export enum Department {
  CARDIOLOGY = 'cardiology',
  DERMATOLOGY = 'dermatology',
  ENDOCRINOLOGY = 'endocrinology',
  GASTROENTEROLOGY = 'gastroenterology',
  GYNECOLOGY = 'gynecology',
  NEUROLOGY = 'neurology',
  ONCOLOGY = 'oncology',
  ORTHOPEDICS = 'orthopedics',
  PEDIATRICS = 'pediatrics',
  PSYCHIATRY = 'psychiatry',
  RADIOLOGY = 'radiology',
  SURGERY = 'surgery'
}

export enum Speciality {
  GENERAL_MEDICINE = 'general_medicine',
  FAMILY_MEDICINE = 'family_medicine',
  INTERNAL_MEDICINE = 'internal_medicine',
  EMERGENCY_MEDICINE = 'emergency_medicine',
  PREVENTIVE_MEDICINE = 'preventive_medicine'
}
