import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonicModule, ModalController } from '@ionic/angular';
import { PlaylistService } from 'src/app/services/playlist.service';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';

@Component({
  imports: [IonicModule, CommonModule, FormsModule, ProgressIndicatorComponent],
  selector: 'app-new-playlist',
  templateUrl: './new-playlist.component.html',
  styleUrls: ['./new-playlist.component.scss'],
  standalone: true
})
export class NewPlaylistComponent {
  public coverImage = '';
  public title = '';
  public description = '';

  public loading = false;
  public progress = 0;

  public private = false;
  public collaborative = false;

  constructor(private modalController: ModalController, private playlistService: PlaylistService) { }

  public async close(data:any, role: string) {
    await this.modalController.dismiss(data, role);
  }

  public async uploadCoverImage() {
    const image: any = (await Camera.getPhoto({
      allowEditing: true,
      width: 200,
      height: 200,
      quality: 50,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    })).dataUrl;

    if (image) this.coverImage = image;
  }

  public safetyToggle() {
    if (!this.private) this.collaborative = false;
  }

  public async createPlaylist() {
    this.loading = true;

    const newPlaylist: any = await this.playlistService.createPlaylist({
      name: this.title,
      description: this.description,
      public: !this.private,
      collaborative: this.collaborative,
      cover: this.coverImage,
    });

    this.progress = 1;
    this.loading = false;

    await this.close(newPlaylist, 'done');
  }
}
