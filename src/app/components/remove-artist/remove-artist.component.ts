import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { PlaylistService } from 'src/app/services/playlist.service';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';

@Component({
  imports: [IonicModule, CommonModule, FormsModule, ProgressIndicatorComponent],
  selector: 'app-remove-artist',
  templateUrl: './remove-artist.component.html',
  styleUrls: ['./remove-artist.component.scss'],
  standalone: true
})
export class RemoveArtistComponent  implements OnInit {
  @Input() playlistId = '';
  @Input() snapshotId = '';

  public artists: any = [];
  public allTracks: any = [];
  public artistsToDelete: any = [];

  public loading = false;
  public state = '';
  public progress = 0;

  constructor(private playlistService: PlaylistService, private modalController: ModalController) { }

  async ngOnInit() {
    await this.getAllArtists();
  }

  private async getAllArtists() {
    this.loading = true;
    this.state = 'init';

    const { artists, allTracks } = await this.playlistService.getPlaylistArtists(this.playlistId);
    this.artists = artists;
    this.allTracks = allTracks;

    this.loading = false;
  }

  public updateDelete() {
    this.artistsToDelete = this.artists.filter(artist => artist.toDelete);
  }

  public async delete() {
    this.loading = true;
    this.state = 'deleting';

    await Promise.all(this.artistsToDelete.map(async (artist, i) => {
      const toDelete = this.allTracks.filter(track =>
        (track.track.artists.filter(trackArtists => trackArtists.id == artist.id)).length > 0
      ).map(track => track.track);

      await this.playlistService.deleteFromPlaylist(this.playlistId, this.snapshotId, toDelete);

        this.progress = (i + 1) / this.artistsToDelete.length;
    }));

    this.loading = false;
    this.state = 'done';
    await this.dismiss();
  }

  public async dismiss() {
    await this.modalController.dismiss('', 'done');
  }
}
