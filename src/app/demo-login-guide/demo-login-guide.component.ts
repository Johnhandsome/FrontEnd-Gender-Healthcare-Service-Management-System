import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-demo-login-guide',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-12 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <img src="./logoNgang.png" alt="GenderCare Logo" class="h-24 mx-auto mb-6" />
          <h1 class="text-4xl font-bold text-gray-800 mb-4">🎯 Demo Login Guide</h1>
          <p class="text-xl text-gray-600">Hướng dẫn đăng nhập hệ thống Healthcare Management</p>
        </div>

        <!-- Login Options Grid -->
        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <!-- Customer Portal -->
          <div class="bg-white rounded-xl shadow-lg p-8 border-l-4 border-pink-500">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">👩‍💼</span>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Customer Portal</h3>
              <p class="text-gray-600 text-sm">Dành cho khách hàng</p>
            </div>
            
            <div class="space-y-3 mb-6">
              <div class="bg-pink-50 p-3 rounded-lg">
                <p class="text-sm font-medium text-pink-800">📱 Phone Login:</p>
                <p class="text-pink-700">0123456789</p>
              </div>
            </div>

            <div class="space-y-2 mb-6 text-sm text-gray-600">
              <p>✅ Đặt lịch khám</p>
              <p>✅ Xem thông tin bác sĩ</p>
              <p>✅ Đọc blog y tế</p>
              <p>✅ Xem dịch vụ</p>
            </div>

            <a routerLink="/login" 
               class="block w-full bg-pink-600 hover:bg-pink-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
              Đăng nhập Customer
            </a>
          </div>

          <!-- Admin Portal -->
          <div class="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">👨‍💼</span>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Admin Portal</h3>
              <p class="text-gray-600 text-sm">Dành cho quản trị viên</p>
            </div>
            
            <div class="space-y-3 mb-6">
              <div class="bg-blue-50 p-3 rounded-lg">
                <p class="text-sm font-medium text-blue-800">🔑 Admin:</p>
                <p class="text-blue-700 text-xs">admin&#64;gendercare.com</p>
                <p class="text-blue-700 text-xs">Password: admin123</p>
              </div>
              <div class="bg-blue-50 p-3 rounded-lg">
                <p class="text-sm font-medium text-blue-800">🔑 Manager:</p>
                <p class="text-blue-700 text-xs">manager&#64;gendercare.com</p>
                <p class="text-blue-700 text-xs">Password: manager123</p>
              </div>
            </div>

            <div class="space-y-2 mb-6 text-sm text-gray-600">
              <p>✅ Quản lý nhân viên</p>
              <p>✅ Thống kê hệ thống</p>
              <p>✅ Quản lý dịch vụ</p>
              <p>✅ Cấu hình hệ thống</p>
            </div>

            <a routerLink="/admin/login" 
               class="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
              Đăng nhập Admin
            </a>
          </div>

          <!-- Doctor Portal -->
          <div class="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">👨‍⚕️</span>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Doctor Portal</h3>
              <p class="text-gray-600 text-sm">Dành cho bác sĩ</p>
            </div>
            
            <div class="space-y-3 mb-6">
              <div class="bg-green-50 p-3 rounded-lg">
                <p class="text-sm font-medium text-green-800">🔑 Doctor 1:</p>
                <p class="text-green-700 text-xs">doctor&#64;gendercare.com</p>
                <p class="text-green-700 text-xs">Password: doctor123</p>
              </div>
              <div class="bg-green-50 p-3 rounded-lg">
                <p class="text-sm font-medium text-green-800">🔑 Doctor 2:</p>
                <p class="text-green-700 text-xs">doctor2&#64;gendercare.com</p>
                <p class="text-green-700 text-xs">Password: doctor123</p>
              </div>
            </div>

            <div class="space-y-2 mb-6 text-sm text-gray-600">
              <p>✅ Quản lý lịch khám</p>
              <p>✅ Hồ sơ bệnh nhân</p>
              <p>✅ Báo cáo y tế</p>
              <p>✅ Theo dõi chu kỳ</p>
            </div>

            <a routerLink="/doctor/login" 
               class="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
              Đăng nhập Doctor
            </a>
          </div>
        </div>

        <!-- Quick Access -->
        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">🚀 Quick Access</h3>
          <div class="grid md:grid-cols-4 gap-4">
            <a routerLink="/" 
               class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-4 px-4 rounded-lg font-medium transition-colors">
              🏠 Trang chủ
            </a>
            <a routerLink="/login" 
               class="bg-pink-100 hover:bg-pink-200 text-pink-800 text-center py-4 px-4 rounded-lg font-medium transition-colors">
              👩‍💼 Customer Login
            </a>
            <a routerLink="/admin/login" 
               class="bg-blue-100 hover:bg-blue-200 text-blue-800 text-center py-4 px-4 rounded-lg font-medium transition-colors">
              👨‍💼 Admin Login
            </a>
            <a routerLink="/doctor/login" 
               class="bg-green-100 hover:bg-green-200 text-green-800 text-center py-4 px-4 rounded-lg font-medium transition-colors">
              👨‍⚕️ Doctor Login
            </a>
          </div>
        </div>

        <!-- System Status -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">📊 System Status</h3>
          <div class="grid md:grid-cols-3 gap-6 text-center">
            <div class="space-y-2">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span class="text-green-600 text-xl">✅</span>
              </div>
              <p class="font-medium text-gray-800">Authentication</p>
              <p class="text-sm text-green-600">Active</p>
            </div>
            <div class="space-y-2">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span class="text-green-600 text-xl">✅</span>
              </div>
              <p class="font-medium text-gray-800">Routing</p>
              <p class="text-sm text-green-600">Functional</p>
            </div>
            <div class="space-y-2">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <span class="text-yellow-600 text-xl">⚠️</span>
              </div>
              <p class="font-medium text-gray-800">Database</p>
              <p class="text-sm text-yellow-600">Demo Mode</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transition-colors {
      transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
    }
  `]
})
export class DemoLoginGuideComponent {
}
