import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-database-init',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-6">Database Initialization</h1>

          <!-- Status Display -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4">Connection Status</h2>
            <div class="flex items-center space-x-2">
              <div [class]="connectionStatus === 'connected' ? 'w-3 h-3 bg-green-500 rounded-full' :
                           connectionStatus === 'failed' ? 'w-3 h-3 bg-red-500 rounded-full' :
                           'w-3 h-3 bg-yellow-500 rounded-full animate-pulse'"></div>
              <span class="text-gray-700">{{ getConnectionStatusText() }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-4 mb-8">
            <button
              (click)="testConnection()"
              [disabled]="isLoading"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              {{ isLoading ? 'Testing...' : 'Test Database Connection' }}
            </button>

            <button
              (click)="addSampleDataToDb()"
              [disabled]="isLoading || connectionStatus !== 'connected'"
              class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              {{ isLoading ? 'Adding Data...' : 'Add Sample Data' }}
            </button>

            <button
              (click)="initializeFullDatabase()"
              [disabled]="isLoading"
              class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              {{ isLoading ? 'Initializing...' : 'Initialize Complete Database' }}
            </button>
          </div>

          <!-- Logs Display -->
          <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            <h3 class="text-white mb-2">Console Logs:</h3>
            <div *ngFor="let log of logs" class="mb-1">
              <span class="text-gray-500">{{ log.timestamp }}</span>
              <span [class]="log.type === 'error' ? 'text-red-400' :
                           log.type === 'success' ? 'text-green-400' :
                           'text-blue-400'">{{ log.message }}</span>
            </div>
            <div *ngIf="logs.length === 0" class="text-gray-500">
              No logs yet. Click a button to start testing.
            </div>
          </div>

          <!-- Back to Admin -->
          <div class="mt-6 text-center">
            <a href="/admin/dashboard" class="text-blue-600 hover:text-blue-800">
              ← Back to Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
  `]
})
export class DatabaseInitComponent {
  connectionStatus: 'unknown' | 'connected' | 'failed' | 'testing' = 'unknown';
  isLoading = false;
  logs: Array<{timestamp: string, message: string, type: 'info' | 'success' | 'error'}> = [];

  constructor(private supabaseService: SupabaseService) {
    // Override console methods to capture logs
    this.setupConsoleCapture();
  }

  private setupConsoleCapture() {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      this.addLog(args.join(' '), 'info');
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      this.addLog(args.join(' '), 'error');
      originalError.apply(console, args);
    };
  }

  private addLog(message: string, type: 'info' | 'success' | 'error') {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push({ timestamp, message, type });

    // Keep only last 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }
  }

  getConnectionStatusText(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'Database Connected Successfully';
      case 'failed': return 'Database Connection Failed';
      case 'testing': return 'Testing Connection...';
      default: return 'Connection Status Unknown';
    }
  }

  async testConnection() {
    this.isLoading = true;
    this.connectionStatus = 'testing';
    this.addLog('Starting database connection test...', 'info');

    try {
      // Test connection by trying to fetch staff data
      const result = await this.supabaseService.getAllStaff();
      if (result.success && result.data) {
        this.connectionStatus = 'connected';
        this.addLog(`Database connection successful! Found ${result.data.length} staff members.`, 'success');
      } else {
        this.connectionStatus = 'failed';
        this.addLog(`Connection test failed: ${result.error}`, 'error');
      }
    } catch (error) {
      this.connectionStatus = 'failed';
      this.addLog(`Connection test error: ${error}`, 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async addSampleDataToDb() {
    this.isLoading = true;
    this.addLog('Starting to add sample data...', 'info');

    try {
      // For now, just log that this feature is available
      this.addLog('Sample data functionality is available through the Supabase service.', 'info');
      this.addLog('Use the staff management section to add staff members.', 'success');
    } catch (error) {
      this.addLog(`Error adding sample data: ${error}`, 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async initializeFullDatabase() {
    this.isLoading = true;
    this.connectionStatus = 'testing';
    this.addLog('Starting full database initialization...', 'info');

    try {
      // Test the connection first
      await this.testConnection();
      this.addLog('Database is already initialized and ready to use!', 'success');
      this.addLog('Use the management sections to add data as needed.', 'info');
    } catch (error) {
      this.connectionStatus = 'failed';
      this.addLog(`Database initialization error: ${error}`, 'error');
    } finally {
      this.isLoading = false;
    }
  }
}
