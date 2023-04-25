import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { PlaylistService } from 'src/app/services/playlist.service';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';
import { FsService } from 'src/app/services/storage.service';

@Component({
  imports: [IonicModule, CommonModule, FormsModule, ProgressIndicatorComponent],
  selector: 'app-remove-playlist',
  templateUrl: './remove-playlist.component.html',
  styleUrls: ['./remove-playlist.component.scss'],
  standalone: true
})
export class RemovePlaylistComponent  implements OnInit {
  @Input() playlists: any = [];

  public loading = false;
  public progress = 0;

  private toRemove: any = [];

  constructor(private playlistService: PlaylistService, private modalController: ModalController, public fsService: FsService) { }

  ngOnInit() {
    const playlists: any = [];
    this.playlists.forEach(playlistChunk => playlists.push(...playlistChunk));
    this.playlists = playlists;
  }

  public removeList() {
    this.toRemove = this.playlists.filter(playlist => playlist.toRemove);
  }

  public async delete() {
    this.loading = true;

    let i = 0;
    await Promise.all(this.toRemove.map(async playlist => {
      await this.playlistService.deletePlaylist(playlist.id);

      i++;
      this.progress = i / this.toRemove.length;
    }));

    this.loading = false;

    await this.modalController.dismiss('', 'done');
  }
}
