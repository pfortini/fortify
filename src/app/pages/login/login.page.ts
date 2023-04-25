import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { ProgressIndicatorComponent } from 'src/app/components/progress-indicator/progress-indicator.component';
import { JsonService } from 'src/app/services/json.service';

@Component({
  imports: [IonicModule, CommonModule, FormsModule, ProgressIndicatorComponent],
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
})
export class LoginPage{

  constructor(private router: Router, private loginService: LoginService, private jsonService: JsonService) {}

  async ionViewWillEnter() {
    const params = new URL(window.location.toString()).searchParams;
    const code = params.get('code');
    const state = params.get('state');

    if (this.loginService.accessCode && this.loginService.accessToken) return await this.router.navigate(['/home']);

    if (code && state) {
      const storedState = await this.jsonService.readJSON('login_state.json', '');
      if (state != storedState) return this.router.navigate(['/home']);

      this.loginService.setAccessCode(code);
      await this.loginService.getAccessToken();
    }

    return await this.router.navigate(['/home']);
  }

}
