import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { queryString, sleep } from '../tools';
import { LoginService } from './login.service';
import { PerfilService } from './perfil.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private _isReady = false;

  constructor(private httpService: HttpService, private loginService: LoginService, private perfilService: PerfilService) {
    this.init();
  }

  async getPlaylist(id: string) {
    try {
      const playlist = await this.httpService.get(`https://api.spotify.com/v1/playlists/${id}`);
    return playlist;
    } catch (e: any) {
      if (e.status == 401 && e.error.error.message == 'The access token expired') {
        await this.loginService.refreshAccessToken();
        return await this.init()
      }
    }
  }

  private async init() {
    await this.perfilService.isReady();
    this._isReady = true;
  }

  public async isReady() {
    while (!this.isReady) await sleep(50);
  }

  async getAllPlaylistTracks(id: string) {
    const playlist = await this.httpService.get(`https://api.spotify.com/v1/playlists/${id}`);
    const totalTracks = playlist.tracks.total;
    const tracks: any = [];
    let offset = 0;

    while (offset < totalTracks) {
      const moreTracks = await this.httpService.get(`https://api.spotify.com/v1/playlists/${id}/tracks?${queryString({ offset, limit: 100 })}`);
      tracks.push(...moreTracks.items);
      offset += 100;
    }

    return tracks;
  }

  async loadMoreTracks(nextUrl: string) {
    const nextTracks = await this.httpService.get(nextUrl);
    return nextTracks;
  }
}
