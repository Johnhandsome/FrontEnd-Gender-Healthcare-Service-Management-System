import { Injectable, signal, inject } from '@angular/core';
// Temporarily commented out until dependencies are properly installed
// import { OAuthService } from 'angular-oauth2-oidc';
// import { authConfig } from './auth-config';

@Injectable({ providedIn: 'root' })
export class AuthGoogleService {
  // Temporarily commented out until dependencies are properly installed
  // private oAuthService = inject(OAuthService);
  profile = signal<any>(null);

  constructor() {
    // this.initConfiguration();
  }

  initConfiguration() {
    // Temporarily disabled OAuth functionality
    /*
    this.oAuthService.configure(authConfig);
    this.oAuthService.setupAutomaticSilentRefresh();
    this.oAuthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (this.oAuthService.hasValidIdToken()) {
        this.profile.set(this.oAuthService.getIdentityClaims());
        this.saveTokenToLocalStorage();
      }
    });
    */
  }

  login() {
    // this.oAuthService.initImplicitFlow();
    console.log('OAuth login temporarily disabled');
  }

  logout() {
    // this.oAuthService.logOut();
    this.profile.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
  }

  saveTokenToLocalStorage() {
    // Temporarily disabled OAuth functionality
    /*
    const accessToken = this.oAuthService.getAccessToken();
    const idToken = this.oAuthService.getIdToken();
    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (idToken) localStorage.setItem('id_token', idToken);
    */
  }

  getProfile() {
    return this.profile();
  }
}
