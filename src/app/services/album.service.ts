import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { PerfilService } from './perfil.service';
import { sleep } from '../tools';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private _isReady = false;

  constructor(private httpService: HttpService, private perfilService: PerfilService) {
    this.init();
  }

  private async init() {
    await this.perfilService.isReady();
    this._isReady = true;
  }

  public async isReady() {
    while (!this._isReady) await sleep(50);
  }

  async getTracks(albumId: string) {
    const tracks = await this.httpService.get(
      `https://api.spotify.com/v1/albums/${albumId}/tracks`,
      { query: { market: this.perfilService.perfil.country, limit: 50 } }
    );

    while (tracks.next) {
      const moreTracks = await this.httpService.get(tracks.next);
      tracks.items.push(...moreTracks.items);
      tracks.next = moreTracks.next;
    }

    return tracks.items;
  }
}
