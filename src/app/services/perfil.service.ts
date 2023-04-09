import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { sleep } from '../tools';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  public perfil;

  private _isReady = false;

  constructor(private httpService: HttpService, private loginService: LoginService) {
    this.init();
  }

  private async init() {
    await this.loginService.isReady();

    try {
      await this.me();
    } catch (e: any) {
      if (e.status == 401 && e.error.error.message == 'The access token expired') {
        await this.loginService.refreshAccessToken();
        return await this.init()
      }
    }

    this._isReady = true;
  }

  async isReady() {
    while (!this._isReady) await sleep(50);
  }

  async me() {
    this.perfil = await this.httpService.get('https://api.spotify.com/v1/me');
    await this.playlists();
    return this.perfil;
  }

  async playlists() {
    const playlists = await this.httpService.get('https://api.spotify.com/v1/me/playlists');
    const playlistsOwned: any = [];
    const playlistsLiked: any = [];
    const gridPlaylistsOwned: any = [];
    const gridPlaylistsLiked: any = [];

    playlists.items.forEach(playlist => {
      if (playlist.owner.display_name == this.perfil.display_name) playlistsOwned.push(playlist);
      else playlistsLiked.push(playlist);
    });

    for (let i = 0; i < playlistsOwned.length; i += 4) gridPlaylistsOwned.push(playlistsOwned.slice(i, i + 4))
    for (let i = 0; i < playlistsLiked.length; i += 4) gridPlaylistsLiked.push(playlistsLiked.slice(i, i + 4))

    this.perfil.playlists = { owned: gridPlaylistsOwned, liked: gridPlaylistsLiked };
    return this.perfil.playlists;
  }
}
