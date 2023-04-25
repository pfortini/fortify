import { Component, Input, OnInit } from '@angular/core';
import { PlaylistService } from 'src/app/services/playlist.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';

@Component({
  imports: [IonicModule, CommonModule, FormsModule, ProgressIndicatorComponent],
  selector: 'app-remove-album',
  templateUrl: './remove-album.component.html',
  styleUrls: ['./remove-album.component.scss'],
  standalone: true
})
export class RemoveAlbumComponent  implements OnInit {
  @Input() playlistId= '';
  @Input() snapshotId = '';

  public loading = false;
  public state = 'init';
  public progress = 0;

  public toDelete: any = [];

  public albums: any = [];
  public allTracks: any = [];

  constructor(private playlistService: PlaylistService, private modalController: ModalController) {}

  async ngOnInit() {
    this.state = 'init';
    this.loading = true;

    const { albums, allTracks } = await this.playlistService.getPlaylistAlbums(this.playlistId);

    this.albums = albums;
    this.allTracks = allTracks;
    this.loading = false;
  }

  public updateDelete() {
    this.toDelete = [];

    this.albums.forEach(album => { if (album.toDelete) this.toDelete.push(album); });
  }

  public async delete() {
    this.loading = true;
    this.state = 'deleting';

    const tracksToDelete = this.allTracks
      .filter(track => this.toDelete.map(album => album.name).includes(track.track.album.name))
      .map(track => track.track);

    await this.playlistService.deleteFromPlaylist(this.playlistId, this.snapshotId, tracksToDelete);

    this.progress = 1;
    this.loading = false;
    this.state = 'done';

    await this.modalController.dismiss('', 'done');
  }
}
