import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { queryString, sleep } from '../tools';
import { PerfilService } from './perfil.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
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

  async createPlaylist(playlist: { name: string, public: boolean, collaborative: boolean, description: string, cover: string }) {
    const coverImage = playlist.cover.substring(playlist.cover.indexOf('base64,') + 7);

    const newPlaylist = await this.httpService.post(
      `https://api.spotify.com/v1/users/${this.perfilService.perfil.id}/playlists`,
      {
        name: playlist.name,
        description: playlist.description,
        public: playlist.public,
        collaborative: playlist.collaborative
      }
    );

    try {
      await this.httpService.put(`https://api.spotify.com/v1/playlists/${newPlaylist.id}/images`, coverImage);
    } catch (e) { console.log(e); }

    return newPlaylist;
  }

  async addToPlaylist(playlistId: string, items: any, noLive: boolean, noRemix: boolean) {
    if (!Array.isArray(items)) items = [items];

    if (noLive) {
      await Promise.all(items.map(async item => {
        const analitics = await this.httpService.get('https://api.spotify.com/v1/audio-features', { query: { ids: [item.id] } });
        item.analytics = analitics;
      }));

      items = items.filter(item => parseFloat(item.analytics.audio_features[0].liveness) < 0.8);
    }

    if (noRemix) {
      items = items.filter(item => {
        ['- remix', ' (remix', '- alternate', ' (alternate'].forEach(rule => {
          if (item.name.toLocaleLowerCase().includes(rule)) item.skip = true;
        });

        return !item.skip;
      });
    }

    for (let i = 0; i < items.length; i += 100)
      await this.httpService.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {uris: (items.map(item => item.uri)).slice(i, i + 100)});

  }

  async getPlaylist(id: string) {
    try {
      const playlist = await this.httpService.get(`https://api.spotify.com/v1/playlists/${id}`);
    return playlist;
    } catch (e: any) {
      return console.log(e);
    }
  }

  async getPlaylistArtists(playlistId: string) {
    const artists: any = {};
    const allTracks: any = await this.getAllPlaylistTracks(playlistId);

    (allTracks
      .map(track => track.track.artists[0]))
      .forEach(artist => { if (!artists[artist.name]) artists[artist.name] = artist; }
    );

    // complete with image info
    await Promise.all(Object.values(artists).map(async (artist: any) =>
      artist.images = (await this.httpService.get(`https://api.spotify.com/v1/artists/${artist.id}`)).images
    ));

    return { artists: Object.values(artists), allTracks };
  }

  async getAllPlaylistTracks(id: string) {
    const playlist = await this.httpService.get(`https://api.spotify.com/v1/playlists/${id}`);
    const totalTracks = playlist.tracks.total;
    const tracks: any = [];
    let offset = 0;

    while (offset < totalTracks) {
      const moreTracks = await this.httpService.get(
        `https://api.spotify.com/v1/playlists/${id}/tracks?${queryString({ offset, limit: 100 })}`
      );

      tracks.push(...moreTracks.items);
      offset += 100;
    }

    return tracks;
  }

  async loadMoreTracks(nextUrl: string) {
    const nextTracks = await this.httpService.get(nextUrl);
    return nextTracks;
  }

  async deleteFromPlaylist(playlistId: string, snapshotId: string, items: any) {
    if (!Array.isArray(items)) items = [items];

    items = items.map(item => {
      const obj: any = { uri: item.uri };

      if (item.position) obj.positions = [item.position];

      return obj;
    });
    for (let i = 0; i < items.length; i += 100) {
      await this.httpService.delete(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          body: {
            snapshot_id: snapshotId,
            tracks: items.slice(i, i + 100)
          }
        }
      );
    }
  }

  async deletePlaylist(playlistId: string) {
    await this.httpService.delete(`https://api.spotify.com/v1/playlists/${playlistId}/followers`);
  }
}
