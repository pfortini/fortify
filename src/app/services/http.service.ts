import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { generateRandomString, queryString } from '../tools';
import { StatusModalComponent } from '../components/status-modal/status-modal.component';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpService {
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

  public key = '';

  constructor(private http: HttpClient, private router: Router) {}

  public setKey(k: string) {
    this.key = k;

    return this.key;
  }

  async get(url: string, options: any = {}) {
    options = this.setOptions(options);

    try {
      if (options.query) url += '?' + queryString(options.query);
      const r = await lastValueFrom(this.http.get(url, options));
      return this.handleResponse(r);
    } catch (e) { return await this.handleError(e); }
  }

  async postUrlEncoded(url: string, body: Record<string, unknown>, headers = {}): Promise<any> {
    headers = Object.assign({}, headers, { 'Content-Type': 'application/x-www-form-urlencoded' });

    try {
      const r = await lastValueFrom(this.http.post(
        url,
        queryString(body),
        { headers }
      ));
      return r;
    } catch (e) { return this.handleError(e); }
  }

  async post(url: string, body: any, options = {}) {
    options = this.setOptions(options);

    try {
      const r = await lastValueFrom(this.http.post(url, body, options));
      return this.handleResponse(r);
    } catch (e) { return this.handleError(e); }
  }

  async put(url: string, body: any = '', options = {}) {
    options = this.setOptions(options);

    try {
      const r = await lastValueFrom(this.http.put(url, body, options));
      return this.handleResponse(r);
    } catch (e) { return this.handleError(e); }
  }

  async delete(url: string, options = {}) {
    options = this.setOptions(options);

    try {
      const r = await lastValueFrom(this.http.delete(url, options));
      return this.handleResponse(r);
    } catch (e) { return this.handleError(e); }
  }

  private async handleError(res: any) {
    // not logged in
    if (res.error.error?.status == 401 && res.error.error?.message == 'No token provided') return window.location.assign(this.spotifyLoginUrl);
    else if (res.error.error?.status == 401 && res.error.error?.message == 'The access token expired') throw res.error.error;
    else if (res.status >= 300) throw res.status;
    throw res;
  }

  private handleResponse(res: any) {
    if ([401, 400].includes(res.status)) {
      console.log(res);
      throw res;
    } else if (res.status >= 300) throw res.status;
    return res.body;
  }

  private setOptions(options: any, contentType: any = 'application/json') {
    let header: HttpHeaders = new HttpHeaders();

    if (contentType) header = header.append('Content-Type', contentType);
    else if (options.contentType) header = header.append('Content-Type', options.contentType);
    if (this.key) header = header.append('Authorization', 'Bearer ' + this.key);

    options = Object.assign({ headers: header }, options, { observe: 'response' });
    return options;
  }
}
