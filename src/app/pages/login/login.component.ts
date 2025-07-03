// ==================== IMPORTS ====================
import { Router, RouterLink } from '@angular/router';
import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { GoogleComponent } from '../../components/google/google.component';
import { debounceTime } from 'rxjs';
import { UserService } from '../../Services/user.service';
import { TokenService } from '../../Services/token.service';
import { type UserLogin } from '../../models/user.model';

// ==================== COMPONENT DECORATOR ====================
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, GoogleComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  // ==================== STATE / PROPERTY ====================
  RememberMe = false;
  ShowPass = false;
  formSubmitted = false;
  isWrong = false;
  isSubmitting = false;
  errorMsg = '';
  showForgotPassword = signal(false);

  // ==================== VIEWCHILD & DEPENDENCY INJECTION ====================
  private form = viewChild.required<NgForm>('form');
  private destroyRef = inject(DestroyRef);
  private userService = inject(UserService);
  private tokenService = inject(TokenService);
  public router = inject(Router);

  // ==================== CONSTRUCTOR ====================
  constructor() {
    afterNextRender(() => {
      // --- Lấy thông tin login đã lưu ---
      let savedForm: string | null = null;
      if (window.localStorage.getItem('Remember-login-form')) {
        savedForm = window.localStorage.getItem('Remember-login-form');
      } else if (window.localStorage.getItem('save-login-form')) {
        savedForm = window.localStorage.getItem('save-login-form');
      }
      if (savedForm) {
        const loadedFormData = JSON.parse(savedForm);
        Promise.resolve().then(() => {
          if (this.form().controls['phone'] && loadedFormData.phone) {
            this.form().controls['phone'].setValue(loadedFormData.phone);
          }
          if (this.form().controls['password'] && loadedFormData.password) {
            this.form().controls['password'].setValue(loadedFormData.password);
          }
          if (this.form().controls['rememberMe'] && loadedFormData.rememberMe) {
            this.form().controls['rememberMe'].setValue(
              loadedFormData.rememberMe
            );
            this.RememberMe = loadedFormData.rememberMe;
          }
        });
      }

      // --- Auto save số điện thoại vào localStorage mỗi lần user nhập ---
      const subscription = this.form()
        .valueChanges?.pipe(debounceTime(500))
        .subscribe({
          next: (value) =>
            window.localStorage.setItem(
              'save-login-form',
              JSON.stringify({ phone: value.phone })
            ),
        });
      this.destroyRef.onDestroy(() => subscription?.unsubscribe());
    });
  }

  // ==================== METHODS ====================
  openForgotPassword(event: Event) {
    event.preventDefault();
    this.showForgotPassword.set(true);
  }

  closeForgotPassword() {
    this.showForgotPassword.set(false);
  }
  // Xử lý khi sai thì set lại error
  onInput() {
    this.isWrong = false;
    this.errorMsg = '';
  }
  /**
   * Xử lý khi submit form đăng nhập
   * @param formData Dữ liệu form (NgForm)
   */
  onSubmit(formData: NgForm) {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.formSubmitted = true;
    this.errorMsg = '';
    if (formData.valid) {
      console.log(formData.valid);
      // --- Lấy giá trị từ form ---
      const phone: UserLogin['phone'] = formData.form.value.phone;
      const password: UserLogin['password'] = formData.form.value.password;
      const rememberMe = formData.form.value.rememberMe;

      // --- Gọi API login ---
      const subscription = this.userService
        .loginWithPhone(phone, password)
        .subscribe({
          next: (res: any) => {
            // --- Lấy token từ response (tùy BE) ---
            const token =
              res.access_token ||
              (res.data && res.data.access_token) ||
              res.token;
            if (token) {
              // --- Xử lý lưu token + remember me ---
              if (rememberMe) {
                this.tokenService.setToken(token); // Lưu vào localStorage
                localStorage.setItem(
                  'Remember-login-form',
                  JSON.stringify({
                    phone,
                    password,
                    rememberMe: true,
                  })
                );
                sessionStorage.removeItem('access_token');
              } else {
                this.tokenService.setTokenSession(token); // Lưu vào sessionStorage
                localStorage.removeItem('Remember-login-form');
                localStorage.removeItem('save-login-form');
                localStorage.removeItem('access_token');
              }
              // --- Chuyển hướng về trang chủ ---
              this.router.navigate(['/']);
              // formData.resetForm(); // (optional) Reset form sau login
            }
          },
          error: (err: any) => {
            // --- Xử lý lỗi ---
            if (err.status === 401) {
              this.errorMsg = 'Sai số điện thoại hoặc mật khẩu!';
              this.isWrong = true;
              alert(this.errorMsg);
            } else if (err.status === 500) {
              this.errorMsg = 'Lỗi server, vui lòng thử lại!';
              alert(this.errorMsg);
            } else {
              this.errorMsg = 'Đăng nhập thất bại!';
              alert(this.errorMsg);
            }
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
      this.destroyRef.onDestroy(() => subscription?.unsubscribe());
    } else {
      this.formSubmitted = true;
      this.isSubmitting = false;
      return;
    }
  }
}
