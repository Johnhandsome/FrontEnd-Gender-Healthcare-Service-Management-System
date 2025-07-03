export interface Slot {
  slot_id: string;
  slot_date: string;
  slot_time: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorSlotAssignment {
  doctor_slot_id: string;
  slot_id: string;
  doctor_id: string;
  appointments_count: number;
  max_appointments: number;
  // Additional fields for display
  slot_date?: string;
  slot_time?: string;
  doctor_name?: string;
  is_available?: boolean;
}

export interface SlotWithAssignment extends Slot {
  assignment?: DoctorSlotAssignment;
  is_assigned?: boolean;
  appointments_count?: number;
  max_appointments?: number;
}

export interface CreateSlotRequest {
  slot_date: string;
  slot_time: string;
  is_active?: boolean;
}

export interface CreateDoctorSlotAssignmentRequest {
  slot_id: string;
  doctor_id: string;
  max_appointments?: number;
}

export interface UpdateDoctorSlotAssignmentRequest {
  doctor_slot_id: string;
  max_appointments?: number;
}
