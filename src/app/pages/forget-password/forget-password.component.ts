import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { NgForm, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgotPasswordComponent {
  @Output() close = new EventEmitter<void>();

  step = signal(1); // 1: nhập sđt, 2: nhập otp + mk mới, 3: done
  phone = signal('');
  otp = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  isLoading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  private userService = inject(UserService);

  // Gửi OTP
  onSubmitPhone(form: NgForm) {
    if (this.isLoading()) return;
    this.errorMsg.set('');
    this.successMsg.set('');
    if (!form.valid) return;
    this.isLoading.set(true);
    this.userService.forgotPassword(this.phone()).subscribe({
      next: () => {
        this.successMsg.set('OTP đã được gửi về số điện thoại!');
        this.step.set(2);
      },
      error: (err: any) => {
        this.errorMsg.set(err?.error?.message || 'Không gửi được OTP!');
      },
      complete: () => this.isLoading.set(false),
    });
  }

  // Đặt lại mật khẩu
  onSubmitReset(form: NgForm) {
    if (this.isLoading()) return;
    this.errorMsg.set('');
    this.successMsg.set('');
    if (!form.valid) return;
    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMsg.set('Mật khẩu xác nhận không khớp!');
      return;
    }
    this.isLoading.set(true);
    this.userService
      .resetPassword(this.phone(), this.otp(), this.newPassword())
      .subscribe({
        next: () => {
          this.successMsg.set(
            'Đặt lại mật khẩu thành công! Đăng nhập lại nha.'
          );
          this.step.set(3);
        },
        error: (err: any) => {
          this.errorMsg.set(
            err?.error?.message || 'OTP hoặc mật khẩu không hợp lệ!'
          );
        },
        complete: () => this.isLoading.set(false),
      });
  }
}
