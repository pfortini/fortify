import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpService } from './http.service';
import { JsonService } from './json.service';
import { sleep, generateRandomString, queryString } from '../tools';

@Injectable({ providedIn: 'root' })
export class LoginService {
  public accessCode: any = '';
  public accessToken: any = '';

  private _isReady = false;

  public spotifyLoginUrl = 'https://accounts.spotify.com/authorize?' + queryString({
    response_type: 'code',
    client_id: environment.clientId,
    scope: [
      'user-read-private','user-read-email',
      'playlist-read-private','playlist-read-collaborative',
      'playlist-modify-public','playlist-modify-private',
      'ugc-image-upload'
    ].join(' '),
    redirect_uri: environment.redirectUri,
    state: generateRandomString(16)
  });

  constructor(private jsonService: JsonService, private httpService: HttpService) {
    this.init();
  }

  private async init() {
    const accessCode = await this.jsonService.readJSON('access_code.json', '');
    if (accessCode) this.accessCode = accessCode;

    const accessToken = await this.jsonService.readJSON('access_token.json', '');
    if (accessToken) {
      this.accessToken = accessToken;
      this.httpService.setKey(this.accessToken.access_token);
    }

    this._isReady = this.accessCode && this.accessToken;
  }

  async isReady() {
    while (!this._isReady) await sleep(50);
  }

  async getAccessToken() {
    if (!this.accessCode) throw 'no access code';
    if (this.accessToken) return this.accessToken.access_token;

    const accessToken = await this.httpService.postUrlEncoded(
      'https://accounts.spotify.com/api/token',
      {
        grant_type: 'authorization_code',
        code: this.accessCode,
        redirect_uri: environment.redirectUri
      },
      { Authorization: 'Basic ' + btoa(environment.clientId + ':' + environment.clientSecret) }
    );

    this.accessToken = accessToken;
    await this.jsonService.writeJSON('access_token.json', accessToken);
    this.httpService.setKey(this.accessToken.access_token);

    await this.init();

    return this.accessToken;
  }

  async refreshAccessToken() {
    const accessToken = await this.httpService.postUrlEncoded(
      'https://accounts.spotify.com/api/token',
      {
        grant_type: 'refresh_token',
        refresh_token: this.accessToken.refresh_token
      },
      { Authorization: 'Basic ' + btoa(environment.clientId + ':' + environment.clientSecret) }
    );

    this.accessToken.access_token = accessToken.access_token;
    await this.jsonService.writeJSON('access_token.json', this.accessToken);

    await this.init();
  }

  async getAccessCode() {
    return this.accessCode;
  }

  async setAccessCode(code: string) {
    this.accessCode = code;
    await this.jsonService.writeJSON('access_code.json', code);
    await this.init();
  }
}
