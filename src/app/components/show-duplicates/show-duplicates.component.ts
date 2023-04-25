import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { PlaylistService } from 'src/app/services/playlist.service';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { StatusModalComponent } from '../status-modal/status-modal.component';
import { sleep } from 'src/app/tools';

@Component({
  imports: [IonicModule, CommonModule, FormsModule, ProgressIndicatorComponent],
  selector: 'app-show-duplicates',
  templateUrl: './show-duplicates.component.html',
  styleUrls: ['./show-duplicates.component.scss'],
  standalone: true
})
export class ShowDuplicatesComponent  implements OnInit {
  @Input() playlistId = '';
  @Input() snapshotId = '';

  public state = '';
  public loading = false;
  public progress = 0;

  public allTracks: any = [];
  public duplicates: any = [];

  public toDelete: any = [];

  private statusModal: StatusModalComponent

  constructor(private playlistService: PlaylistService, private modalController: ModalController, private sharedModule: SharedModule) {
    this.statusModal = this.sharedModule.statusModalComponent();
  }

  async ngOnInit() {
    this.state = 'init';
    this.loading = true;

    this.allTracks = await this.playlistService.getAllPlaylistTracks(this.playlistId);

    Object.values(this.allTracks.reduce((acc, track, i) => {
      track.track.position = i;

      const trackName = track.track.name + '|' + track.track.artists.map(artist => artist.name).join('|');

      if (acc[trackName]) {
        acc[trackName].tracks.push(track.track);
        acc[trackName].count++;
      } else acc[trackName] = { tracks: [track.track], count: 1 };

      return acc;
    }, {})).forEach((trackObj: any) => {
      if (trackObj.count > 1) this.duplicates.push(...trackObj.tracks);
    });

    this.loading = false;

    if (this.duplicates.length == 0) {
      await this.dismiss('', 'nothing');
      await this.statusModal.success('Sua playlist não contém músicas duplicadas!');
    }
  }

  public markDelete() {
    this.toDelete = this.duplicates.filter(track => track.toDelete);
  }

  public async delete() {
    this.loading = true;
    this.state = 'deleting';

    await this.playlistService.deleteFromPlaylist(this.playlistId, this.snapshotId, this.toDelete);

    this.loading = false;

    this.modalController.dismiss('', 'done');
  }

  public async dismiss(data: any, role: string) {
    return this.modalController.dismiss(data, role);
  }
}
