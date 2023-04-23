import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage{

  constructor(private router: Router, private loginService: LoginService) {}

  async ionViewWillEnter() {
    await this.loginService.isReady();
    const params = new URL(window.location.toString()).searchParams;
    const forceNew = Boolean(params.get('forceNew'));

    if (!forceNew && this.loginService.accessCode && this.loginService.accessToken) { await this.router.navigate(['/home']); return; }


    const code = params.get('code');
    if (code) {
      this.loginService.setAccessCode(code);
      params.delete('code');
      window.history.replaceState({}, document.title, '/login?' + params.toString());
    } else return window.location.assign(this.loginService.spotifyLoginUrl);

    await this.loginService.getAccessToken();
    await this.router.navigate(['/home']);
  }

}
