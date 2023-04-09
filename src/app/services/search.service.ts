import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { PlaylistService } from './playlist.service';
import { queryString, sleep } from '../tools';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private _isReady = false;
  constructor(private httpService: HttpService, private playlistService: PlaylistService) {
    this.init()
  }

  public async search(types: any = [], q: string) {
    const items = await this.httpService.get('https://api.spotify.com/v1/search?' + queryString({ q, type: types.join(',') }));

    return items;
  }

  private async init() {
    await this.playlistService.isReady();
    this._isReady = true;
  }

  public async isReady() {
    while (!this._isReady) await sleep(50);
  }
}
