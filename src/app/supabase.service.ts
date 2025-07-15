import { Patient } from './models/patient.interface';
import { Injectable } from '@angular/core';
import { supabase } from './supabase-client';
import { from, Observable } from 'rxjs';
import { Staff, DoctorDetails, Doctor, Role } from './models/staff.interface';
import { Service } from './models/service.interface';
import { Category } from './models/category.interface';
import { Appointment, Guest, GuestAppointment, CreateAppointmentRequest, UpdateAppointmentRequest, VisitType, ProcessStatus, ScheduleEnum } from './models/appointment.interface';
import { BlogPost, CreateBlogPostRequest, UpdateBlogPostRequest } from './models/blog.interface';
import { Notification } from './models/notification.interface';
import { PatientReport, UpdatePatientReportRequest, CreatePatientReportRequest } from './models/patient-report.interface';
import { Receipt } from './models/receipt.interface';
import { Slot, DoctorSlotAssignment, DoctorSlotWithDetails } from './models/slot.interface';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {





  // Đếm số bệnh nhân theo tháng
  getPatientCountByMonth(year: number, month: number): Observable<number> {
    return from(
      supabase
        .rpc('count_patients_by_month', { target_year: year, target_month: month })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || 0;
        })
    );
  }

  // Tính doanh thu theo ngày
  getAppointmentCountByDay(targetDate: string): Observable<number> {
    return from(
      supabase
        .rpc('count_appointments_by_day', { target_date: targetDate })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || 0;
        })
    );
  }

  // Tính doanh thu theo ngày
  getDailyRevenue(targetDate: string): Observable<number> {
    return from(
      supabase
        .rpc('calculate_daily_revenue', { target_date: targetDate })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || 0;
        })
    );
  }

  // Hàm helper để format ngày tháng
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Lấy ngày hôm nay
  getTodayDate(): string {
    return this.formatDate(new Date());
  }

  // Lấy ngày hôm qua
  getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.formatDate(yesterday);
  }




  async searchPatientsGeneral(query: string) {
    const { data, error } = await supabase
      .rpc('search_patients_by_fields', {
        full_name: query,
        phone: query,
        email: query
      });

    if (error) {
      console.error("Lỗi tìm kiếm bệnh nhân: ", error.message);
      throw error;
    }

    return data || [];
  }
  //#region DASHBOARD

  // Thêm method này vào SupabaseService class

  /**
   * Lấy số lượng appointments có status pending
   */
  async getPendingAppointmentsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_status', 'pending');

      if (error) {
        console.error('Error fetching pending appointments count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getPendingAppointmentsCount:', error);
      throw error;
    }
  }

  /**
   * Lấy số lượng appointments pending cho ngày hôm nay
   */
  async getTodayPendingAppointmentsCount(): Promise<number> {
    try {
      const today = this.getTodayDate();

      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_status', 'pending')
        .eq('appointment_date', today);

      if (error) {
        console.error('Error fetching today pending appointments count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getTodayPendingAppointmentsCount:', error);
      throw error;
    }
  }

  /**
   * Lấy số lượng appointments pending cho ngày mai (upcoming)
   */
  async getUpcomingPendingAppointmentsCount(): Promise<number> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_status', 'pending')
        .gte('appointment_date', tomorrowStr);

      if (error) {
        console.error('Error fetching upcoming pending appointments count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUpcomingPendingAppointmentsCount:', error);
      throw error;
    }
  }

  /*
   * Lấy notifications
  */
  async getRecentNotifications(limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
      notification_id,
      notification_type,
      sent_at,
      appointment:appointments(
        appointment_id,
        created_at,
        patient:patients(full_name)
      )
    `)
      .eq('notification_type', 'new_appointment')
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return data || [];
  }

  async getTodayAppointments(today: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
      appointment_id,
      created_at,
      appointment_status,
      patient:patients(full_name)
    `)
      .gte('created_at', `${today}T00:00:00+00:00`)
      .lte('created_at', `${today}T23:59:59+00:00`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching today\'s appointments:', error);
      throw error;
    }

    return data || [];
  }

  //#endregion

  //#region ANALYTIC




  // 🟦 KPI: Appointments Count
  async getAppointmentsCount(start: string, end: string): Promise<number> {
    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end);

    if (error) {
      console.error('Error fetching appointments count:', error);
      throw error;
    }

    return count || 0;
  }

  // 🟦 KPI: New Patients Count
  async getNewPatientsCount(start: string, end: string): Promise<number> {
    const { count, error } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end);

    if (error) {
      console.error('Error fetching new patients count:', error);
      throw error;
    }

    return count || 0;
  }

  // 🟦 KPI: Revenue Sum
  async getRevenueSum(start: string, end: string) {
    const { data } = await supabase
      .from('receipts')
      .select('amount')
      .gte('created_at', start)
      .lte('created_at', end);
    return data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
  }

  // 🟦 KPI: Task Completion Ratio
  async getTaskCompletionRatio(start: string, end: string) {
    const { data } = await supabase
      .from('appointments')
      .select('appointment_status')
      .gte('created_at', start)
      .lte('created_at', end);

    const completed = data?.filter(d => d.appointment_status === 'completed').length || 0;
    const pending = data?.filter(d => d.appointment_status === 'pending').length || 0;
    return completed + pending > 0 ? Math.round((completed / (completed + pending)) * 100) : 0;
  }

  // 🟩 CHART: Age Distribution
  async getAgeDistribution() {
    const { data } = await supabase.from('patients').select('date_of_birth');
    const today = new Date();
    const buckets = { '0–18': 0, '19–35': 0, '36–50': 0, '51+': 0 };

    data?.forEach(p => {
      const dob = new Date(p.date_of_birth);
      const age = today.getFullYear() - dob.getFullYear();
      if (age <= 18) buckets['0–18']++;
      else if (age <= 35) buckets['19–35']++;
      else if (age <= 50) buckets['36–50']++;
      else buckets['51+']++;
    });

    return buckets;
  }

  // 🟩 CHART: Gender Distribution
  async getGenderDistribution() {
    const { data } = await supabase.from('patients').select('gender');
    const genderMap: { [key: string]: number } = {};
    data?.forEach(p => {
      genderMap[p.gender] = (genderMap[p.gender] || 0) + 1;
    });
    return genderMap;
  }

  // 🟩 CHART: Cancelled Rate
  async getCancelledRate(start: string, end: string) {
    const { data } = await supabase
      .from('appointments')
      .select('appointment_status')
      .gte('created_at', start)
      .lte('created_at', end);

    const cancelled = data?.filter(d => d.appointment_status === 'cancelled').length || 0;
    return (cancelled / (data?.length || 1)) * 100;
  }

  // 🟩 CHART: Avg Appointment Duration (Mock)
  async getAvgAppointmentDuration() {
    return 25; // you can replace this with real logic once you track actual duration
  }

  // 🟩 CHART: Staff Workload Balance
  async getStaffWorkloadBalance() {
    const { data: doctors } = await supabase.from('staff_members').select('staff_id').eq('role', 'doctor');
    const { data: appts } = await supabase.from('appointments').select('doctor_id');

    const docCount = doctors?.length || 1;
    const totalAppts = appts?.length || 0;
    const perDoctor = Math.round(totalAppts / docCount);

    return { doctorCount: docCount, totalAppointments: totalAppts, perDoctor };
  }


  // 🟩 CHART: Monthly Patient Growth
  async getMonthlyPatientGrowth(months: number = 6): Promise<any[]> {
    try {
      console.log(`🔄 Fetching monthly patient growth for last ${months} months...`);
      const monthsData = [];
      const currentDate = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { count, error } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);

        if (error) {
          console.error(`❌ Error fetching patient count for ${date.toLocaleDateString()}:`, error);
          throw new Error(`Failed to fetch patient data for ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}: ${error.message}`);
        }

        monthsData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          value: count || 0
        });
      }

      console.log('✅ Successfully fetched monthly patient growth:', monthsData);
      return monthsData;
    } catch (error: any) {
      console.error('❌ Error fetching monthly patient growth:', error);
      throw new Error(`Database error: ${error.message || 'Unable to fetch patient growth data'}`);
    }
  }

  // 🟩 CHART: Monthly Revenue Data
  async getMonthlyRevenue(months: number = 6): Promise<any[]> {
    try {
      console.log(`🔄 Fetching monthly revenue for last ${months} months...`);
      const monthsData = [];
      const currentDate = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { data, error } = await supabase
          .from('receipts')
          .select('amount')
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);

        if (error) {
          console.error(`❌ Error fetching revenue for ${date.toLocaleDateString()}:`, error);
          throw new Error(`Failed to fetch revenue data for ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}: ${error.message}`);
        }

        const totalRevenue = data?.reduce((sum, receipt) => sum + (receipt.amount || 0), 0) || 0;

        monthsData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          value: totalRevenue
        });
      }

      console.log('✅ Successfully fetched monthly revenue:', monthsData);
      return monthsData;
    } catch (error: any) {
      console.error('❌ Error fetching monthly revenue:', error);
      throw new Error(`Database error: ${error.message || 'Unable to fetch revenue data'}`);
    }
  }

  // 🟩 CHART: Appointment Status Distribution
  async getAppointmentStatusDistribution(): Promise<any[]> {
    try {
      console.log('🔄 Fetching appointment status distribution...');
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_status');

      if (error) {
        console.error('❌ Error fetching appointment status:', error);
        throw new Error(`Failed to fetch appointment status data: ${error.message}`);
      }

      const statusCounts: { [key: string]: number } = {};
      data?.forEach(appointment => {
        const status = appointment.appointment_status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const result = Object.entries(statusCounts).map(([status, count]) => ({
        name: this.formatAppointmentStatus(status),
        value: count
      }));

      console.log('✅ Successfully fetched appointment status distribution:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Error fetching appointment status distribution:', error);
      throw new Error(`Database error: ${error.message || 'Unable to fetch appointment status data'}`);
    }
  }

  // Helper method to format appointment status
  private formatAppointmentStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no_show': 'No Show',
      'unknown': 'Unknown'
    };
    return statusMap[status] || status;
  }

  //#endregion

  // Admin Dashboard Statistics
  async getAdminDashboardStats() {
    const today = new Date().toISOString().split('T')[0];

    try {
      // Get today's appointments count
      const { data: todayAppointments, error: todayError } = await supabase
        .from('appointments')
        .select('appointment_id')
        .eq('appointment_date', today);

      if (todayError) throw todayError;

      // Get total pending appointments count
      const { data: pendingAppointments, error: pendingError } = await supabase
        .from('appointments')
        .select('appointment_id')
        .eq('appointment_status', 'pending');

      if (pendingError) throw pendingError;

      // Get total patients count
      const { count: totalPatients, error: patientsError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      if (patientsError) throw patientsError;

      // Get total staff count
      const { count: totalStaff, error: staffError } = await supabase
        .from('staff_members')
        .select('*', { count: 'exact', head: true });

      if (staffError) throw staffError;

      // Get today's revenue
      const todayRevenue = await this.getDailyRevenue(today).toPromise().catch(() => 0);

      return {
        todayAppointments: todayAppointments?.length || 0,
        pendingAppointments: pendingAppointments?.length || 0,
        totalPatients: totalPatients || 0,
        totalStaff: totalStaff || 0,
        todayRevenue: todayRevenue || 0
      };
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw error;
    }
  }

  // Get recent activities for admin dashboard
  async getRecentActivities(): Promise<any[]> {
    try {
      // Get recent appointments (last 5)
      const { data: recentAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          appointment_id,
          created_at,
          appointment_status,
          patient:patients(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (appointmentsError) throw appointmentsError;

      // Get recent patients (last 3)
      const { data: recentPatients, error: patientsError } = await supabase
        .from('patients')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (patientsError) throw patientsError;

      // Combine and format activities
      const activities: any[] = [];

      // Add appointment activities
      recentAppointments?.forEach((appointment: any) => {
        activities.push({
          type: 'appointment',
          description: `Appointment with ${appointment.patient?.full_name || 'Unknown Patient'}`,
          timestamp: appointment.created_at,
          status: appointment.appointment_status
        });
      });

      // Add patient activities
      recentPatients?.forEach((patient: any) => {
        activities.push({
          type: 'patient',
          description: `New patient: ${patient.full_name}`,
          timestamp: patient.created_at
        });
      });

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return activities.slice(0, 8); // Return top 8 activities
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  //#endregion

  //#region // ============= PATIENT FUNCTIONS ============= //



  async getPatients(page: number, itemsPerPage: number): Promise<{ patients: Patient[]; total: number }> {
    const start = (page - 1) * itemsPerPage;
    const { data, count } = await supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .range(start, start + itemsPerPage - 1);
    return { patients: data ?? [], total: count ?? 0 };
  }

  async getAllPatients(): Promise<{ success: boolean; data?: Patient[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching patients:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async createPatient(patientData: Partial<Patient>): Promise<{ success: boolean; data?: Patient; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data };
    } catch (error) {
      console.error('Unexpected error creating patient:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async updatePatient(patientId: string, patientData: Partial<Patient>): Promise<{ success: boolean; data?: Patient; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', patientId)
        .select()
        .single();

      if (error) {
        console.error('Error updating patient:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data };
    } catch (error) {
      console.error('Unexpected error updating patient:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async softDeletePatient(patientId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          patient_status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);

      if (error) {
        console.error('Error soft deleting patient:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error soft deleting patient:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async restorePatient(patientId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          patient_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);

      if (error) {
        console.error('Error restoring patient:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error restoring patient:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async getPatientsAppointment() {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name')
      .order('full_name', { ascending: true }); // Sắp xếp theo tên để dễ chọn
    if (error) throw error;
    return data || [];
  }

  async searchPatients(
    fullName: string,
    phone: string,
    email: string,
    page: number,
    itemsPerPage: number
  ): Promise<{ patients: Patient[]; total: number }> {
    const start = (page - 1) * itemsPerPage;
    const query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .or(`full_name.ilike.%${fullName}%,phone.ilike.%${phone}%,email.ilike.%${email}%`)
      .range(start, start + itemsPerPage - 1);
    const { data, count } = await query;
    return { patients: data ?? [], total: count ?? 0 };
  }



  //#endregion

  //#region // ============= APPOINTMENT FUNCTIONS ============= //

  // Get all appointments with comprehensive JOIN queries (unified patient and guest appointments)
  async getAllAppointments(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // Fetch patient appointments
      const { data: patientAppointments, error: patientError } = await supabase
        .from('appointments')
        .select(`
          appointment_id,
          patient_id,
          doctor_id,
          slot_id,
          category_id,
          phone,
          email,
          visit_type,
          appointment_status,
          created_at,
          updated_at,
          schedule,
          message,
          appointment_date,
          appointment_time,
          preferred_date,
          preferred_time,
          patient:patients(id, full_name, phone, email, gender),
          doctor:staff_members!appointments_doctor_id_fkey(staff_id, full_name, working_email),
          category:service_categories(category_id, category_name),
          slot:doctor_slot_assignments!appointments_slot_id_fkey(
            doctor_slot_id,
            slot:slots(slot_id, slot_date, slot_time)
          )
        `)
        .order('created_at', { ascending: false });

      if (patientError) {
        console.error('Error fetching patient appointments:', patientError);
        return { success: false, error: patientError.message };
      }

      // Fetch guest appointments
      const { data: guestAppointments, error: guestError } = await supabase
        .from('guest_appointments')
        .select(`
          guest_appointment_id,
          guest_id,
          doctor_id,
          slot_id,
          category_id,
          phone,
          email,
          visit_type,
          appointment_status,
          created_at,
          updated_at,
          schedule,
          message,
          appointment_date,
          appointment_time,
          preferred_date,
          preferred_time,
          guest:guests(guest_id, full_name, phone, email, gender),
          doctor:doctor_details!guest_appointments_doctor_id_fkey(
            doctor_id,
            staff:staff_members(staff_id, full_name, working_email)
          ),
          category:service_categories(category_id, category_name),
          slot:doctor_slot_assignments!guest_appointments_slot_id_fkey(
            doctor_slot_id,
            slot:slots(slot_id, slot_date, slot_time)
          )
        `)
        .order('created_at', { ascending: false });

      if (guestError) {
        console.error('Error fetching guest appointments:', guestError);
        return { success: false, error: guestError.message };
      }

      // Transform patient appointments
      const transformedPatientAppointments = (patientAppointments || []).map((appointment: any) => {
        const patient = Array.isArray(appointment.patient) ? appointment.patient[0] : appointment.patient;
        const doctor = Array.isArray(appointment.doctor) ? appointment.doctor[0] : appointment.doctor;
        const category = Array.isArray(appointment.category) ? appointment.category[0] : appointment.category;
        const slotInfo = Array.isArray(appointment.slot) ? appointment.slot[0] : appointment.slot;
        const slot = slotInfo?.slot ? (Array.isArray(slotInfo.slot) ? slotInfo.slot[0] : slotInfo.slot) : null;

        return {
          ...appointment,
          appointment_type: 'patient' as const,
          original_table: 'appointments' as const,
          original_id: appointment.appointment_id,
          patient_name: patient?.full_name || 'N/A',
          display_name: patient?.full_name || `Phone: ${appointment.phone}`,
          patient_phone: patient?.phone || appointment.phone,
          patient_email: patient?.email || appointment.email,
          doctor_name: doctor?.full_name || 'Unassigned',
          category_name: category?.category_name || 'N/A',
          slot_date: slot?.slot_date || appointment.appointment_date,
          slot_time: slot?.slot_time || appointment.appointment_time
        };
      });

      // Transform guest appointments
      const transformedGuestAppointments = (guestAppointments || []).map((appointment: any) => {
        const guest = Array.isArray(appointment.guest) ? appointment.guest[0] : appointment.guest;
        const doctorDetails = Array.isArray(appointment.doctor) ? appointment.doctor[0] : appointment.doctor;
        const doctor = doctorDetails?.staff ? (Array.isArray(doctorDetails.staff) ? doctorDetails.staff[0] : doctorDetails.staff) : null;
        const category = Array.isArray(appointment.category) ? appointment.category[0] : appointment.category;
        const slotInfo = Array.isArray(appointment.slot) ? appointment.slot[0] : appointment.slot;
        const slot = slotInfo?.slot ? (Array.isArray(slotInfo.slot) ? slotInfo.slot[0] : slotInfo.slot) : null;

        return {
          ...appointment,
          appointment_id: appointment.guest_appointment_id, // Normalize ID field
          appointment_type: 'guest' as const,
          original_table: 'guest_appointments' as const,
          original_id: appointment.guest_appointment_id,
          guest_name: guest?.full_name || 'N/A',
          display_name: guest?.full_name || `Phone: ${appointment.phone}`,
          patient_phone: guest?.phone || appointment.phone,
          patient_email: guest?.email || appointment.email,
          doctor_name: doctor?.full_name || 'Unassigned',
          category_name: category?.category_name || 'N/A',
          slot_date: slot?.slot_date || appointment.appointment_date,
          slot_time: slot?.slot_time || appointment.appointment_time
        };
      });

      // Combine and sort all appointments by created_at
      const allAppointments = [...transformedPatientAppointments, ...transformedGuestAppointments]
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

      return { success: true, data: allAppointments };
    } catch (error) {
      console.error('Unexpected error fetching appointments:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get appointments with pagination and filtering (unified patient and guest appointments)
  async getAppointments(page: number, itemsPerPage: number, filters?: any): Promise<{ appointments: any[]; total: number }> {
    try {
      // For pagination with filtering, we'll use the getAllAppointments method and apply client-side pagination
      // This ensures consistent filtering across both appointment types
      const result = await this.getAllAppointments();

      if (!result.success || !result.data) {
        return { appointments: [], total: 0 };
      }

      let filteredAppointments = result.data;

      // Apply filters if provided
      if (filters) {
        filteredAppointments = result.data.filter((appointment: any) => {
          // Status filter
          if (filters.status && appointment.appointment_status !== filters.status) {
            return false;
          }

          // Visit type filter
          if (filters.visit_type && appointment.visit_type !== filters.visit_type) {
            return false;
          }

          // Doctor filter
          if (filters.doctor_id && appointment.doctor_id !== filters.doctor_id) {
            return false;
          }

          // Date range filters
          if (filters.date_from) {
            const appointmentDate = appointment.appointment_date || appointment.slot_date;
            if (!appointmentDate || appointmentDate < filters.date_from) {
              return false;
            }
          }

          if (filters.date_to) {
            const appointmentDate = appointment.appointment_date || appointment.slot_date;
            if (!appointmentDate || appointmentDate > filters.date_to) {
              return false;
            }
          }

          // Appointment type filter (if provided)
          if (filters.appointment_type && appointment.appointment_type !== filters.appointment_type) {
            return false;
          }

          return true;
        });
      }

      // Apply pagination
      const start = (page - 1) * itemsPerPage;
      const paginatedAppointments = filteredAppointments.slice(start, start + itemsPerPage);

      return {
        appointments: paginatedAppointments,
        total: filteredAppointments.length
      };
    } catch (error) {
      console.error('Error in getAppointments:', error);
      return { appointments: [], total: 0 };
    }
  }

  async getGuestAppointments(): Promise<GuestAppointment[]> {
    const { data, error } = await supabase
      .from('guest_appointments')
      .select('*');
    if (error) throw error;
    return data ?? [];
  }

  async getPatientAppointment(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*');
    if (error) throw error;
    return data ?? [];
  }

  async getGuests(): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('guest_id, full_name, phone, email, date_of_birth, gender, created_at');
    if (error) throw error;
    return data ?? [];
  }
  //#endregion

  //#region // ============= STAFF FUNCTIONS ============= //



  async getStaffRoles(): Promise<Role[]> {
    // Adjust this based on how staff_role_enum is stored (e.g., a table or hardcoded enum)
    // Example: Fetch from a roles table or return static enum values
    return [
      { value: 'doctor', label: 'Doctor' },
      { value: 'receptionist', label: 'Receptionist' },
      { value: 'admin', label: 'Admin' }
      // Add other roles as per staff_role_enum
    ];
  }


  async getStaffMembers(): Promise<Staff[]> {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .order('full_name', { ascending: true });
    if (error) throw error;
    return data as Staff[];
  }

  // Updated getAllStaff method to return consistent format
  async getAllStaff(): Promise<{ success: boolean; data?: Staff[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching staff:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as Staff[] || [] };
    } catch (error) {
      console.error('Unexpected error fetching staff:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async updateStaffMember(staffId: string, staffData: Partial<Staff>): Promise<void> {
    const { error } = await supabase
      .from('staff_members')
      .update(staffData)
      .eq('staff_id', staffId);
    if (error) throw error;
  }

  async addStaffMember(staffData: Omit<Staff, 'staff_id' | 'created_at' | 'updated_at'>): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff_members')
      .insert([staffData])
      .select()
      .single();
    if (error) throw error;
    return data as Staff;
  }

  // Doctor Profile Methods
  async getDoctorProfile(staffId: string): Promise<any> {
    const { data, error } = await supabase
      .from('staff_members')
      .select(`
        *,
        doctor_details (*)
      `)
      .eq('staff_id', staffId)
      .eq('role', 'doctor')
      .single();

    if (error) throw error;

    // Debug logging
    console.log('🔍 Raw Supabase response:', data);
    console.log('🔍 Doctor details from response:', data?.doctor_details);
    console.log('🔍 Is doctor_details array?', Array.isArray(data?.doctor_details));

    return data;
  }

  // Check if doctor_details record exists
  async checkDoctorDetailsExists(doctorId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('doctor_details')
      .select('doctor_id')
      .eq('doctor_id', doctorId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  }

  //#endregion

  async getMedicalService(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('medical_services')
      .select('*');
    if (error) throw error;
    return data as Service[];
  }



  async addMedicalService(service: Service): Promise<void> {
    const { error } = await supabase
      .from('medical_services')
      .insert([{
        category_id: service.category_id,
        service_name: service.service_name,
        service_description: service.service_description,
        service_cost: service.service_cost,
        duration_minutes: service.duration_minutes,
        is_active: service.is_active,
        image_link: service.image_link,
        excerpt: service.excerpt
      }]);
    if (error) throw error;
  }





  //#endregion

  // Get slot assignments for a doctor
  async getDoctorSlotAssignments(doctor_id: string) {
    const { data, error } = await supabase
      .from('doctor_slot_assignments')
      .select('*')
      .eq('doctor_id', doctor_id);
    if (error) throw error;
    return data || [];
  }

  // Get blog posts for a doctor
  async getDoctorBlogPosts(doctor_id: string) {
    console.log('🔍 Fetching blog posts for doctor_id:', doctor_id);

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('doctor_id', doctor_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error in getDoctorBlogPosts:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('✅ Successfully fetched blog posts:', data?.length || 0, 'posts');
    return data || [];
  }

  // Get all appointments for a doctor
  async getAppointmentsByDoctor(doctor_id: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        appointment_id,
        appointment_date,
        appointment_time,
        appointment_status,
        visit_type,
        schedule,
        message,
        phone,
        email,
        patient:patients(full_name),
        category:service_categories(category_name)
      `)
      .eq('doctor_id', doctor_id)
      .order('appointment_date', { ascending: false });
    if (error) throw error;
    // Map patient name for easier display
    return (data || []).map((appt: any) => ({
      appointment_id: appt.appointment_id,
      appointment_date: appt.appointment_date,
      appointment_time: appt.appointment_time,
      appointment_status: appt.appointment_status,
      visit_type: appt.visit_type,
      schedule: appt.schedule,
      message: appt.message,
      phone: appt.phone,
      email: appt.email,
      patient_name: appt.patient?.full_name || 'Unknown',
      category_name: appt.category?.category_name || 'General'
    }));
  }

  // Get doctor details with staff information
  async getDoctorDetails(doctor_id: string): Promise<Doctor | null> {
    const { data, error } = await supabase
      .from('staff_members')
      .select(`
        *,
        doctor_details (*)
      `)
      .eq('staff_id', doctor_id)
      .eq('role', 'doctor')
      .single();

    if (error) throw error;
    return data ? {
      ...data,
      doctor_details: data.doctor_details
    } : null;
  }

  // Update doctor profile with upsert logic
  async updateDoctorProfile(doctor_id: string, staffData: Partial<Staff>, doctorData?: Partial<DoctorDetails>): Promise<void> {
    // Update staff_members table
    if (staffData && Object.keys(staffData).length > 0) {
      const { error: staffError } = await supabase
        .from('staff_members')
        .update(staffData)
        .eq('staff_id', doctor_id);
      if (staffError) throw staffError;
    }

    // Handle doctor_details table with upsert logic
    if (doctorData && Object.keys(doctorData).length > 0) {
      // First, check if doctor_details record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('doctor_details')
        .select('doctor_id')
        .eq('doctor_id', doctor_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if no record exists
        throw checkError;
      }

      if (existingRecord) {
        // Record exists, update it
        const { error: updateError } = await supabase
          .from('doctor_details')
          .update(doctorData)
          .eq('doctor_id', doctor_id);
        if (updateError) throw updateError;
      } else {
        // Record doesn't exist, create it
        const newDoctorData = {
          doctor_id: doctor_id,
          ...doctorData
        };
        const { error: insertError } = await supabase
          .from('doctor_details')
          .insert(newDoctorData);
        if (insertError) throw insertError;
      }
    }
  }

  // Get doctor's patients (patients who have appointments with this doctor)
  async getDoctorPatients(doctor_id: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        appointments!inner(doctor_id)
      `)
      .eq('appointments.doctor_id', doctor_id);

    if (error) throw error;
    return data || [];
  }

  // Get doctor notifications
  async getDoctorNotifications(doctor_id: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        appointment:appointments(appointment_date, patient:patients(full_name))
      `)
      .eq('staff_id', doctor_id)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((notif: any) => ({
      ...notif,
      title: this.getNotificationTitle(notif.notification_type),
      message: this.getNotificationMessage(notif.notification_type, notif.appointment)
    }));
  }

  private getNotificationTitle(type: string): string {
    switch (type) {
      case 'appointment_created': return 'New Appointment';
      case 'appointment_updated': return 'Appointment Updated';
      case 'appointment_cancelled': return 'Appointment Cancelled';
      case 'appointment_reminder': return 'Appointment Reminder';
      default: return 'Notification';
    }
  }

  private getNotificationMessage(type: string, appointment: any): string {
    const patientName = appointment?.patient?.full_name || 'Unknown Patient';
    const appointmentDate = appointment?.appointment_date || 'Unknown Date';

    switch (type) {
      case 'appointment_created':
        return `New appointment with ${patientName} on ${appointmentDate}`;
      case 'appointment_updated':
        return `Appointment with ${patientName} has been updated`;
      case 'appointment_cancelled':
        return `Appointment with ${patientName} has been cancelled`;
      case 'appointment_reminder':
        return `Reminder: Appointment with ${patientName} on ${appointmentDate}`;
      default:
        return 'You have a new notification';
    }
  }

  // Blog Posts Management
  async createBlogPost(doctor_id: string, blogData: CreateBlogPostRequest): Promise<BlogPost> {
    console.log('📝 Creating blog post for doctor_id:', doctor_id);
    console.log('📝 Blog data:', blogData);

    const insertData = {
      doctor_id,
      ...blogData,
      published_at: blogData.blog_status === 'published' ? new Date().toISOString() : null
    };

    console.log('📝 Insert data:', insertData);

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error in createBlogPost:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('✅ Successfully created blog post:', data);
    return data;
  }

  async updateBlogPost(blogData: UpdateBlogPostRequest): Promise<void> {
    const updateData: any = { ...blogData };
    delete updateData.blog_id;

    if (blogData.blog_status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('blog_id', blogData.blog_id);

    if (error) throw error;
  }

  async deleteBlogPost(blog_id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('blog_id', blog_id);

    if (error) throw error;
  }

  // Receipts Management
  async getDoctorReceipts(doctor_id: string): Promise<Receipt[]> {
    // First get patient IDs for this doctor
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('doctor_id', doctor_id);

    if (appointmentError) throw appointmentError;

    const patientIds = appointmentData?.map(a => a.patient_id).filter(Boolean) || [];

    if (patientIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        patient:patients(full_name)
      `)
      .in('patient_id', patientIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((receipt: any) => ({
      ...receipt,
      patient_name: receipt.patient?.full_name || 'Unknown Patient'
    }));
  }

  async updateReceiptStatus(receipt_id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('receipts')
      .update({ status })
      .eq('receipt_id', receipt_id);

    if (error) throw error;
  }

  // Patient Reports Management
  async getDoctorPatientReports(doctor_id: string): Promise<PatientReport[]> {
    const { data, error } = await supabase
      .from('patient_reports')
      .select(`
        *,
        patient:patients(full_name)
      `)
      .eq('staff_id', doctor_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((report: any) => ({
      ...report,
      patient_name: report.patient?.full_name || 'Unknown Patient'
    }));
  }

  async createPatientReport(doctor_id: string, reportData: CreatePatientReportRequest): Promise<PatientReport> {
    const { data, error } = await supabase
      .from('patient_reports')
      .insert([{
        staff_id: doctor_id,
        ...reportData
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePatientReport(reportData: UpdatePatientReportRequest): Promise<void> {
    const updateData: any = { ...reportData };
    delete updateData.report_id;

    const { error } = await supabase
      .from('patient_reports')
      .update(updateData)
      .eq('report_id', reportData.report_id);

    if (error) throw error;
  }

  // Period tracking functionality removed

  // Appointment Management for Doctors
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAppointmentStatus(appointmentData: UpdateAppointmentRequest): Promise<void> {
    const updateData: any = { ...appointmentData };
    delete updateData.appointment_id;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('appointment_id', appointmentData.appointment_id);

    if (error) throw error;
  }

  // Admin appointment management methods (unified for both patient and guest appointments)
  async updateAppointment(appointmentId: string, appointmentData: Partial<any>, appointmentType?: 'patient' | 'guest', originalTable?: 'appointments' | 'guest_appointments'): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const updateData = { ...appointmentData };
      updateData.updated_at = new Date().toISOString();

      // Determine which table to update
      let tableName: string;
      let idField: string;

      if (originalTable) {
        tableName = originalTable;
        idField = originalTable === 'appointments' ? 'appointment_id' : 'guest_appointment_id';
      } else {
        // Fallback: try to determine from appointmentType or default to appointments
        tableName = appointmentType === 'guest' ? 'guest_appointments' : 'appointments';
        idField = appointmentType === 'guest' ? 'guest_appointment_id' : 'appointment_id';
      }

      // Remove fields that don't belong in the update
      delete updateData.appointment_type;
      delete updateData.original_table;
      delete updateData.original_id;
      delete updateData.display_name;
      delete updateData.patient_name;
      delete updateData.guest_name;
      delete updateData.doctor_name;
      delete updateData.category_name;
      delete updateData.slot_date;
      delete updateData.slot_time;

      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq(idField, appointmentId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${tableName}:`, error);
        return { success: false, error: error.message };
      }

      // Re-fetch the updated appointment with all JOIN data
      const refreshResult = await this.getAllAppointments();
      if (refreshResult.success && refreshResult.data) {
        const updatedAppointment = refreshResult.data.find((apt: any) =>
          apt.original_id === appointmentId || apt.appointment_id === appointmentId
        );

        if (updatedAppointment) {
          return { success: true, data: updatedAppointment };
        }
      }

      // Fallback: return basic updated data
      return { success: true, data: { ...data, appointment_type: appointmentType || 'patient' } };
    } catch (error) {
      console.error('Unexpected error updating appointment:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async deleteAppointment(appointmentId: string, appointmentType?: 'patient' | 'guest', originalTable?: 'appointments' | 'guest_appointments'): Promise<{ success: boolean; error?: string }> {
    try {
      // Determine which table to delete from
      let tableName: string;
      let idField: string;

      if (originalTable) {
        tableName = originalTable;
        idField = originalTable === 'appointments' ? 'appointment_id' : 'guest_appointment_id';
      } else {
        // Fallback: try to determine from appointmentType or try both tables
        if (appointmentType === 'guest') {
          tableName = 'guest_appointments';
          idField = 'guest_appointment_id';
        } else {
          tableName = 'appointments';
          idField = 'appointment_id';
        }
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(idField, appointmentId);

      if (error) {
        // If deletion failed and we don't know the table, try the other table
        if (!originalTable && !appointmentType) {
          const alternateTable = tableName === 'appointments' ? 'guest_appointments' : 'appointments';
          const alternateIdField = alternateTable === 'appointments' ? 'appointment_id' : 'guest_appointment_id';

          const { error: alternateError } = await supabase
            .from(alternateTable)
            .delete()
            .eq(alternateIdField, appointmentId);

          if (alternateError) {
            console.error(`Error deleting from both tables:`, error, alternateError);
            return { success: false, error: `Failed to delete appointment: ${error.message}` };
          }

          return { success: true };
        }

        console.error(`Error deleting from ${tableName}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error deleting appointment:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get appointment statistics for admin dashboard
  async getAppointmentStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_status, visit_type, created_at');

      if (error) {
        console.error('Error fetching appointment stats:', error);
        return { success: false, error: error.message };
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(a => a.appointment_status === 'pending').length || 0,
        confirmed: data?.filter(a => a.appointment_status === 'confirmed').length || 0,
        completed: data?.filter(a => a.appointment_status === 'completed').length || 0,
        cancelled: data?.filter(a => a.appointment_status === 'cancelled').length || 0,
        no_show: data?.filter(a => a.appointment_status === 'no_show').length || 0,
        consultation: data?.filter(a => a.visit_type === 'consultation').length || 0,
        follow_up: data?.filter(a => a.visit_type === 'follow_up').length || 0,
        emergency: data?.filter(a => a.visit_type === 'emergency').length || 0,
        routine_checkup: data?.filter(a => a.visit_type === 'routine_checkup').length || 0
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Unexpected error fetching appointment stats:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Dashboard Statistics for Doctors
  async getDoctorDashboardStats(doctor_id: string) {
    const today = new Date().toISOString().split('T')[0];

    // Get today's appointments count
    const { data: todayAppointments, error: todayError } = await supabase
      .from('appointments')
      .select('appointment_id')
      .eq('doctor_id', doctor_id)
      .eq('appointment_date', today);

    if (todayError) throw todayError;

    // Get pending appointments count
    const { data: pendingAppointments, error: pendingError } = await supabase
      .from('appointments')
      .select('appointment_id')
      .eq('doctor_id', doctor_id)
      .eq('appointment_status', 'pending');

    if (pendingError) throw pendingError;

    // Get total patients count
    const { data: totalPatients, error: patientsError } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('doctor_id', doctor_id)
      .not('patient_id', 'is', null);

    if (patientsError) throw patientsError;

    // Get unique patients count
    const uniquePatients = new Set(totalPatients?.map(p => p.patient_id)).size;

    // Get recent appointments
    const { data: recentAppointments, error: recentError } = await supabase
      .from('appointments')
      .select(`
        appointment_id,
        appointment_date,
        appointment_time,
        appointment_status,
        visit_type,
        patient:patients(full_name)
      `)
      .eq('doctor_id', doctor_id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    return {
      todayAppointments: todayAppointments?.length || 0,
      pendingAppointments: pendingAppointments?.length || 0,
      totalPatients: uniquePatients,
      recentAppointments: (recentAppointments || []).map((appt: any) => ({
        ...appt,
        patient_name: appt.patient?.full_name || 'Unknown Patient'
      }))
    };
  }

  // Get doctor services
  async getDoctorServices(doctor_id: string) {
    const { data, error } = await supabase
      .from('doctor_services')
      .select(`
        *,
        service:medical_services(
          service_id,
          service_name,
          service_description,
          service_cost,
          duration_minutes,
          category:service_categories(category_name)
        )
      `)
      .eq('doctor_id', doctor_id);

    if (error) throw error;
    return (data || []).map((ds: any) => ({
      ...ds.service,
      category_name: ds.service?.category?.category_name || 'General'
    }));
  }

  // Add service to doctor
  async addDoctorService(doctor_id: string, service_id: string): Promise<void> {
    const { error } = await supabase
      .from('doctor_services')
      .insert([{ doctor_id, service_id }]);

    if (error) throw error;
  }

  // Remove service from doctor
  async removeDoctorService(doctor_id: string, service_id: string): Promise<void> {
    const { error } = await supabase
      .from('doctor_services')
      .delete()
      .eq('doctor_id', doctor_id)
      .eq('service_id', service_id);

    if (error) throw error;
  }

  //#endregion

  // RPC method for calling Supabase functions
  async callRpc(functionName: string, params: any): Promise<any> {
    const { data, error } = await supabase.rpc(functionName, params);
    if (error) throw error;
    return data;
  }

  // Authentication methods
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  }

  // Sign in with email and password for RLS policies
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }

    return data;
  }

  // Enhanced staff authentication with Supabase Auth integration
  async authenticateStaffWithSupabase(email: string, password: string): Promise<{
    success: boolean;
    staff?: Staff;
    supabaseUser?: any;
    error?: {
      code: string;
      message: string;
      timestamp: string;
    };
  }> {
    const timestamp = new Date().toISOString();

    try {
      console.log('🔐 Authenticating staff with Supabase Auth:', { email, timestamp });

      // First authenticate with our custom method
      const authResult = await this.authenticateStaff(email, password);

      if (!authResult.success) {
        return authResult;
      }

      // If staff authentication successful, try to authenticate with Supabase Auth
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (data.user) {
          console.log('✅ Staff authenticated with Supabase Auth');
          return {
            success: true,
            staff: authResult.staff,
            supabaseUser: data.user
          };
        }

        if (error) {
          console.log('⚠️ Supabase Auth failed, proceeding with staff-only auth:', error.message);
        }
      } catch (supabaseError: any) {
        console.log('⚠️ Supabase Auth error, proceeding with staff-only auth:', supabaseError.message);
      }

      // Return success even if Supabase Auth fails
      return {
        success: true,
        staff: authResult.staff
      };

    } catch (error: any) {
      console.error('❌ Staff authentication error:', error);

      return {
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: error.message || 'Authentication failed. Please try again.',
          timestamp
        }
      };
    }
  }

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async getStaffByEmail(email: string): Promise<Staff | null> {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('working_email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No user found
      }
      throw error;
    }
    return data as Staff;
  }

  // Enhanced staff authentication with detailed error reporting
  async authenticateStaff(email: string, password: string): Promise<{
    success: boolean;
    staff?: Staff;
    error?: {
      code: string;
      message: string;
      timestamp: string;
    };
  }> {
    const timestamp = new Date().toISOString();

    try {
      console.log('🔍 Authenticating staff:', { email, timestamp });

      // Hardcoded admin login
      if (email === 'admin@example.com' && password === '123456') {
        const adminStaff: Staff = {
          staff_id: 'admin-hardcoded-id',
          full_name: 'System Administrator',
          working_email: 'admin@example.com',
          role: 'admin',
          years_experience: 5,
          hired_at: '2024-01-01',
          is_available: true,
          staff_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          image_link: undefined,
          gender: undefined,
          languages: []
        };

        console.log('✅ Hardcoded admin authentication successful:', {
          staff_id: adminStaff.staff_id,
          role: adminStaff.role,
          email: adminStaff.working_email,
          timestamp
        });

        return {
          success: true,
          staff: adminStaff
        };
      }

      // Get staff member from database for other users
      const staff = await this.getStaffByEmail(email);

      if (!staff) {
        return {
          success: false,
          error: {
            code: 'STAFF_NOT_FOUND',
            message: 'No staff member found with this email address.',
            timestamp
          }
        };
      }

      // Check if staff is active
      if (staff.staff_status !== 'active') {
        return {
          success: false,
          error: {
            code: 'STAFF_INACTIVE',
            message: 'Staff account is not active. Please contact administrator.',
            timestamp
          }
        };
      }

      // Validate password (using default password '123456' for all staff)
      const defaultPassword = '123456';
      if (password !== defaultPassword) {
        return {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Invalid password. Please check your credentials.',
            timestamp
          }
        };
      }

      console.log('✅ Staff authentication successful:', {
        staff_id: staff.staff_id,
        role: staff.role,
        email: staff.working_email,
        timestamp
      });

      return {
        success: true,
        staff
      };

    } catch (error: any) {
      console.error('❌ Staff authentication error:', error);

      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message || 'Database connection error. Please try again.',
          timestamp
        }
      };
    }
  }

  // ==================== SLOT MANAGEMENT METHODS ====================

  // Get doctor's assigned slots with details
  async getDoctorSlots(doctorId: string, dateFrom?: string, dateTo?: string): Promise<any[]> {
    let query = supabase
      .from('doctor_slot_assignments')
      .select(`
        *,
        slots (
          slot_id,
          slot_date,
          slot_time,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('doctor_id', doctorId);

    if (dateFrom) {
      query = query.gte('slots.slot_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('slots.slot_date', dateTo);
    }

    const { data, error } = await query.order('slots.slot_date', { ascending: true });

    if (error) throw error;

    // Transform data to include calculated fields
    return (data || []).map(assignment => ({
      ...assignment,
      slot_details: assignment.slots,
      is_full: assignment.appointments_count >= assignment.max_appointments,
      availability_percentage: (assignment.appointments_count / assignment.max_appointments) * 100
    }));
  }

  // Get doctor slots for a specific date range (for calendar view)
  async getDoctorSlotsForDateRange(doctorId: string, startDate: string, endDate: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('doctor_slot_assignments')
      .select(`
        *,
        slots!inner (
          slot_id,
          slot_date,
          slot_time,
          is_active
        )
      `)
      .eq('doctor_id', doctorId)
      .gte('slots.slot_date', startDate)
      .lte('slots.slot_date', endDate)
      .order('slots.slot_date', { ascending: true });

    if (error) throw error;

    return (data || []).map(assignment => ({
      ...assignment,
      slot_details: assignment.slots,
      is_full: assignment.appointments_count >= assignment.max_appointments,
      availability_percentage: (assignment.appointments_count / assignment.max_appointments) * 100
    }));
  }

  // Get slot statistics for a doctor
  async getDoctorSlotStatistics(doctorId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    let query = supabase
      .from('doctor_slot_assignments')
      .select(`
        appointments_count,
        max_appointments,
        slots!inner (
          is_active,
          slot_date
        )
      `)
      .eq('doctor_id', doctorId);

    if (dateFrom) {
      query = query.gte('slots.slot_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('slots.slot_date', dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    const slots = data || [];
    const totalSlots = slots.length;
    const activeSlots = slots.filter((s: any) => s.slots.is_active).length;
    const fullSlots = slots.filter((s: any) => s.appointments_count >= s.max_appointments).length;
    const totalAppointments = slots.reduce((sum: number, s: any) => sum + s.appointments_count, 0);
    const totalCapacity = slots.reduce((sum: number, s: any) => sum + s.max_appointments, 0);
    const utilizationRate = totalCapacity > 0 ? (totalAppointments / totalCapacity) * 100 : 0;

    return {
      totalSlots,
      activeSlots,
      fullSlots,
      totalAppointments,
      totalCapacity,
      utilizationRate: Math.round(utilizationRate * 100) / 100
    };
  }

  // Update slot assignment capacity
  async updateSlotCapacity(assignmentId: string, maxAppointments: number): Promise<any> {
    const { data, error } = await supabase
      .from('doctor_slot_assignments')
      .update({ max_appointments: maxAppointments })
      .eq('doctor_slot_id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
