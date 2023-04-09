import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { queryString } from '../tools';

@Injectable({ providedIn: 'root' })
export class HttpService {
  public key: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  public setKey(k: string) {
    this.key = k;

    return this.key;
  }

  async get(url: string, options = {}) {
    options = this.setOptions(options);

    try {
      const r = await lastValueFrom(this.http.get(url, options));
      return this.handleResponse(r);
    } catch (e) { return this.handleError(e); }
  }

  async postUrlEncoded(url: string, body: {}, headers = {}): Promise<any> {
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

  async put(url: string, body: any, options = {}) {
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

  private handleError(res: any) {
    if ([401, 400].includes(res.status)) {
      throw res;
    } else if (res.status >= 300) throw res.status;
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
