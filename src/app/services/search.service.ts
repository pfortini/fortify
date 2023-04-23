import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { PlaylistService } from './playlist.service';
import { queryString, sleep } from '../tools';
import { PerfilService } from './perfil.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private _isReady = false;
  constructor(private httpService: HttpService, private playlistService: PlaylistService, private perfilService: PerfilService) {
    this.init();
  }

  public async search(types: any = [], q: string) {
    const items = await this.httpService.get(
      'https://api.spotify.com/v1/search',
      { query: { q, type: types.join(','), market: this.perfilService.perfil.country } }
    );

    return items;
  }

  public async searchMore(nextUrl: string) {
    const items = await this.httpService.get(nextUrl);

    return items;
  }

  private async init() {
    await this.perfilService.isReady();
    await this.playlistService.isReady();
    this._isReady = true;
  }

  public async isReady() {
    while (!this._isReady) await sleep(50);
  }
}
