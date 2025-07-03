import { Component, inject } from '@angular/core';
import { AuthGoogleService } from '../../auth/auth-google.service';

@Component({
  selector: 'app-google',
  standalone: true,
  templateUrl: './google.component.html',
  styleUrl: './google.component.css',
})
export class GoogleComponent {
  private googleAuth = inject(AuthGoogleService);

  loginWithGoogle() {
    this.googleAuth.login(); // <-- chỉ cần gọi hàm login
  }
}
