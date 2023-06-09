import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { sleep } from '../tools';
import { LoginService } from './login.service';
import { StatusModalComponent } from '../components/status-modal/status-modal.component';
import { SharedModule } from '../modules/shared/shared.module';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  public perfil;

  private _isReady = false;
  private statusModal: StatusModalComponent

  constructor(private httpService: HttpService, private loginService: LoginService, private sharedModule: SharedModule) {
    this.init();
    this.statusModal = this.sharedModule.statusModalComponent();

  }

  private async init() {
    await this.loginService.isReady();

    try {
      await this.me();
    } catch (e: any) {
      if (e.status == 401 && e.message == 'The access token expired') {
        await this.loginService.refreshAccessToken();
        return await this.init();
      } else {
        console.log(e);
        return await this.statusModal.warning('Algo deu errado...', 'Recarregue a página ou tente novamente mais tarde');
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

    while (playlists.next) {
      const morePlaylists = await this.httpService.get(playlists.next);
      playlists.items.push(...morePlaylists.items);
      playlists.next = morePlaylists.next;
    }

    const playlistsOwned: any = [];
    const playlistsLiked: any = [];
    const gridPlaylistsOwned: any = [];
    const gridPlaylistsLiked: any = [];

    playlists.items.forEach(playlist => {
      if (playlist.owner.display_name == this.perfil.display_name) playlistsOwned.push(playlist);
      else playlistsLiked.push(playlist);
    });

    for (let i = 0; i < playlistsOwned.length; i += 5) gridPlaylistsOwned.push(playlistsOwned.slice(i, i + 5));
    for (let i = 0; i < playlistsLiked.length; i += 5) gridPlaylistsLiked.push(playlistsLiked.slice(i, i + 5));

    this.perfil.playlists = {
      owned: gridPlaylistsOwned,
      _owned: playlistsOwned,
      liked: gridPlaylistsLiked,
      _liked: playlistsLiked
    };
    return this.perfil.playlists;
  }
}
