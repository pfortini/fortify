import { Injectable } from '@angular/core';
import { SearchService } from './search.service';
import { HttpService } from './http.service';
import { PerfilService } from './perfil.service';
import { sleep } from '../tools';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private _isReady = false;

  constructor(private searchService: SearchService, private httpService: HttpService,
    private perfilService: PerfilService
  ) {
    this.init();
  }

  public async isReady() {
    while (!this._isReady) await sleep(50);
  }

  private async init() {
    await this.perfilService.isReady();
    await this.searchService.isReady();

    this._isReady = true;
  }

  public async getTopTracks(artistName: string, qty = 45) {
    let _tracks: any = [];
    const tracksSet = new Set();

    const feats = (await this.searchService.search(['track'], artistName)).tracks;

    feats.items.forEach(track => {
      if (
        !tracksSet.has(track.name.toLocaleLowerCase()) &&
        track.artists.map(artist => artist.name.toLocaleLowerCase()).includes(artistName.toLocaleLowerCase()) &&
        (track.album.album_type != 'compilation' && track.album.album_group != 'compilation')
      ) {
        tracksSet.add(track.name.toLocaleLowerCase());
        _tracks.push(track);
      }
    });

    while (feats.next && ((qty != -1 && _tracks.length < qty) || qty == -1)) {
      const moreTracks = (await this.searchService.searchMore(feats.next)).tracks;

      moreTracks.items.forEach(track => {
        if (
          !tracksSet.has(track.name.toLocaleLowerCase()) &&
          track.artists.map(artist => artist.name.toLocaleLowerCase()).includes(artistName.toLocaleLowerCase()) &&
          (track.album.album_type != 'compilation' && track.album.album_group != 'compilation')
        ) {
          tracksSet.add(track.name.toLocaleLowerCase());
          _tracks.push(track);
        }
      });

      feats.next = moreTracks.next;
    }

    _tracks = _tracks.sort((a, b) => b.popularity - a.popularity );
    if (qty != -1) _tracks = _tracks.slice(0, qty);

    feats.items = _tracks;
    return feats;
  }

  async getAlbums(artistId: string) {
    const albums = await this.httpService.get(
      `https://api.spotify.com/v1/artists/${artistId}/albums`,
      { query: { include_groups: 'album', market: this.perfilService.perfil.country } }
    );

    while (albums.next) {
      const moreAlbums = await this.httpService.get(albums.next);
      albums.items.push(...moreAlbums.items);
      albums.next = moreAlbums.next;
    }

    const presentAlbums: any = {};
    const returnAlbums: any = [];

    for (let i = 0; i < albums.items.length; i++) {
      if (Object.keys(presentAlbums).includes(albums.items[i].name)) presentAlbums[albums.items[i].name].push(albums.items[i]);
      else presentAlbums[albums.items[i].name] = [albums.items[i]];
    }

    return Object.values(presentAlbums);
  }
}
