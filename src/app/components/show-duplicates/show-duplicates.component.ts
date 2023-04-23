import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { PlaylistService } from 'src/app/services/playlist.service';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';

@Component({
  imports: [IonicModule, CommonModule, FormsModule, ProgressIndicatorComponent],
  selector: 'app-show-duplicates',
  templateUrl: './show-duplicates.component.html',
  styleUrls: ['./show-duplicates.component.scss'],
  standalone: true
})
export class ShowDuplicatesComponent  implements OnInit {
  @Input() playlistId: string = '';
  @Input() snapshotId: string = '';

  public state: string = '';
  public loading = false;
  public progress = 0;

  public allTracks: any = [];
  public duplicates: any = [];

  public toDelete: any = [];

  constructor(private playlistService: PlaylistService, private modalController: ModalController) { }

  async ngOnInit() {
    this.state = 'init';
    this.loading = true;

    this.allTracks = await this.playlistService.getAllPlaylistTracks(this.playlistId);

    Object.values(this.allTracks.reduce((acc, track, i) => {
      track.track.position = i;

      if (acc[track.track.name]) {
        acc[track.track.name].tracks.push(track.track)
        acc[track.track.name].count++
      } else {
        acc[track.track.name] = { tracks: [track.track], count: 1 }
      }

      return acc;
    }, {})).forEach((trackObj: any) => {
      if (trackObj.count > 1) this.duplicates.push(...trackObj.tracks)
    })

    this.loading = false;
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
