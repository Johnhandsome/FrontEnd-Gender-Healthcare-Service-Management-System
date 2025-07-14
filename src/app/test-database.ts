import { supabase } from './supabase-client';

// Test database connection and add sample data
export async function testDatabaseConnection() {
  console.log('Testing database connection...');

  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('patients')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.error('Database connection error:', testError);
      return false;
    }

    console.log('Database connected successfully!');
    console.log('Current patients count:', testData);

    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// Add sample data to database
export async function addSampleData() {
  console.log('🚀 Adding sample data...');
  console.log('📝 This will add:');
  console.log('   - Service categories');
  console.log('   - Doctor details for existing Kisma account');
  console.log('   - Sample patients');
  console.log('   - Medical services');
  console.log('   - Sample appointments');
  console.log('   - Sample receipts');
  console.log('');

  try {
    // 1. Add service categories
    const categories = [
      { category_name: 'Gender Support', category_description: 'Gender-affirming care and support services' },
      { category_name: 'Mental Health', category_description: 'Mental health and counseling services' },
      { category_name: 'Lab Test', category_description: 'Laboratory tests and health screenings' },
      { category_name: 'Education', category_description: 'Educational workshops and resources' }
    ];

    const { data: categoryData, error: categoryError } = await supabase
      .from('service_categories')
      .upsert(categories, { onConflict: 'category_name' })
      .select();

    if (categoryError) {
      console.error('Error adding categories:', categoryError);
      return false;
    }
    console.log('Categories added:', categoryData);

    // 2. Query existing staff member with email "Kisma@example.com"
    console.log('🔍 Querying existing Kisma staff member...');
    const { data: existingStaff, error: staffError } = await supabase
      .from('staff_members')
      .select('staff_id, full_name, working_email, role')
      .eq('working_email', 'Kisma@example.com')
      .single();

    if (staffError || !existingStaff) {
      console.error('❌ Could not find existing Kisma staff member:', staffError);
      return false;
    }

    console.log('✅ Found existing staff member:', existingStaff);
    const kismaStaffId = existingStaff.staff_id;
    console.log('📋 Using staff_id for related data:', kismaStaffId);

    // Skip staff insertion - use existing staff member

    // 3. Add doctor details using the existing Kisma staff ID
    const doctorDetails = [
      {
        doctor_id: kismaStaffId,
        department: 'reproductive_health',
        speciality: 'general_practice',
        license_no: 'MD003-2018',
        bio: 'Experienced reproductive health specialist with expertise in comprehensive healthcare.',
        slogan: 'Caring for your complete health',
        about_me: {
          experience: '10 years in reproductive health',
          approach: 'Holistic and compassionate care'
        }
      }
    ];

    const { data: doctorData, error: doctorError } = await supabase
      .from('doctor_details')
      .upsert(doctorDetails, { onConflict: 'doctor_id' })
      .select();

    if (doctorError) {
      console.error('Error adding doctor details:', doctorError);
      return false;
    }
    console.log('Doctor details added:', doctorData);

    // 4. Add sample patients
    const patients = [
      {
        id: 'patient-001',
        full_name: 'Jordan Smith',
        phone: '+84901234567',
        email: 'jordan.smith@email.com',
        date_of_birth: '1995-03-15',
        gender: 'other',
        patient_status: 'active'
      },
      {
        id: 'patient-002',
        full_name: 'Taylor Johnson',
        phone: '+84901234568',
        email: 'taylor.johnson@email.com',
        date_of_birth: '1992-07-22',
        gender: 'female',
        patient_status: 'active'
      },
      {
        id: 'patient-003',
        full_name: 'Casey Brown',
        phone: '+84901234569',
        email: 'casey.brown@email.com',
        date_of_birth: '1998-11-08',
        gender: 'male',
        patient_status: 'active'
      }
    ];

    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .upsert(patients, { onConflict: 'id' })
      .select();

    if (patientError) {
      console.error('Error adding patients:', patientError);
      return false;
    }
    console.log('Patients added:', patientData);

    // 5. Add medical services
    if (categoryData && categoryData.length > 0) {
      const services = [
        {
          service_id: 'service-001',
          category_id: categoryData.find(c => c.category_name === 'Gender Support')?.category_id,
          service_name: 'Hormone Therapy Consultation',
          service_description: {
            what: 'Comprehensive hormone therapy consultation',
            why: 'To support gender-affirming care',
            who: 'Individuals seeking hormone therapy',
            how: 'One-on-one consultation with specialist'
          },
          service_cost: 300000,
          duration_minutes: 60,
          is_active: true
        },
        {
          service_id: 'service-002',
          category_id: categoryData.find(c => c.category_name === 'Mental Health')?.category_id,
          service_name: 'Mental Health Counseling',
          service_description: {
            what: 'Professional mental health counseling',
            why: 'To support mental wellness',
            who: 'Anyone needing mental health support',
            how: 'Individual therapy sessions'
          },
          service_cost: 250000,
          duration_minutes: 50,
          is_active: true
        }
      ];

      const { data: serviceData, error: serviceError } = await supabase
        .from('medical_services')
        .upsert(services, { onConflict: 'service_id' })
        .select();

      if (serviceError) {
        console.error('Error adding services:', serviceError);
        return false;
      }
      console.log('Services added:', serviceData);
    }

    // 6. Add sample appointments
    const appointments = [
      {
        appointment_id: 'appt-001',
        patient_id: 'patient-001',
        doctor_id: kismaStaffId,
        phone: '+84901234567',
        email: 'jordan.smith@email.com',
        visit_type: 'consultation',
        appointment_status: 'pending',
        schedule: 'morning',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '09:00:00',
        message: 'First consultation for hormone therapy'
      },
      {
        appointment_id: 'appt-002',
        patient_id: 'patient-002',
        doctor_id: kismaStaffId,
        phone: '+84901234568',
        email: 'taylor.johnson@email.com',
        visit_type: 'consultation',
        appointment_status: 'confirmed',
        schedule: 'afternoon',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '14:00:00',
        message: 'Mental health counseling session'
      }
    ];

    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .upsert(appointments, { onConflict: 'appointment_id' })
      .select();

    if (appointmentError) {
      console.error('Error adding appointments:', appointmentError);
      return false;
    }
    console.log('Appointments added:', appointmentData);

    console.log('Sample data added successfully!');
    return true;

  } catch (error) {
    console.error('Error adding sample data:', error);
    return false;
  }
}

// Function to check and populate database
export async function initializeDatabase() {
  const isConnected = await testDatabaseConnection();

  if (isConnected) {
    console.log('Database is connected. Adding sample data...');
    const dataAdded = await addSampleData();

    if (dataAdded) {
      console.log('Database initialization completed successfully!');
    } else {
      console.log('Failed to add sample data.');
    }
  } else {
    console.log('Database connection failed.');
  }
}
