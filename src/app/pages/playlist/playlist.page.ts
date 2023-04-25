import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { PlaylistService } from 'src/app/services/playlist.service';
import { PerfilService } from 'src/app/services/perfil.service';
import { AddArtistComponent } from 'src/app/components/add-artist/add-artist.component';
import { RemoveArtistComponent } from 'src/app/components/remove-artist/remove-artist.component';
import { ShowDuplicatesComponent } from 'src/app/components/show-duplicates/show-duplicates.component';
import { StatusModalComponent } from 'src/app/components/status-modal/status-modal.component';
import { RemoveAlbumComponent } from 'src/app/components/remove-album/remove-album.component';
import { FsService } from 'src/app/services/storage.service';

@Component({
  imports: [IonicModule, CommonModule, FormsModule],
  selector: 'app-playlist',
  templateUrl: './playlist.page.html',
  styleUrls: ['./playlist.page.scss'],
  providers: [StatusModalComponent],
  standalone: true
})
export class PlaylistPage implements OnInit {
  public id: any = '';
  public playlist: any;
  public tracks: any = [];
  public artists: any = [];
  public loading = false;
  public owned = false;

  constructor(private perfilService: PerfilService, private playlistService: PlaylistService,
    private modalController: ModalController, private statusModal: StatusModalComponent, public fsService: FsService
  ) { }

  async ngOnInit() {
    await this.init();
  }

  private async init() {
    this.loading = true;

    await this.perfilService.isReady();

    this.id = new URL(window.location.toString()).searchParams.get('id');

    const playlist = await this.playlistService.getPlaylist(this.id);
    this.playlist = playlist;
    this.owned = this.playlist.owner.id == this.perfilService.perfil.id;
    this.playlist.description = this.htmlDecode(this.playlist.description);

    this.tracks = [];
    this.tracks.push(...this.playlist.tracks.items);

    this.loading = false;
  }

  public htmlDecode(str: string) {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.documentElement.textContent;
  }

  public convertMinutes(ms: number) {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.ceil((ms - (minutes * 1000 * 60)) / 1000);

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  public async loadMoreTracks() {
    this.loading = true;

    const nextTracks = await this.playlistService.loadMoreTracks(this.playlist.tracks.next);
    this.tracks.push(...nextTracks.items);
    this.playlist.tracks.next = nextTracks.next;

    this.loading = false;
  }

  public async loadAllTracks() {
    this.loading = true;

    const allTracks = await this.playlistService.getAllPlaylistTracks(this.id);
    this.tracks = allTracks;

    this.loading = false;
  }

  public async openAddArtistModal() {
    const modal = await this.modalController.create({
      component: AddArtistComponent,
      componentProps: { playlistId: this.id },
      cssClass: 'fit-modal-wrapper'
    });

    await modal.present();
    const dismissData = await modal.onDidDismiss();
    if (dismissData.role == 'done') {
      await this.statusModal.success('Músicas adicionadas com sucesso!');
      await this.init();
    }
  }

  public async openRemoveArtistModal() {
    const modal = await this.modalController.create({
      component: RemoveArtistComponent,
      componentProps: { playlistId: this.id, snapshotId: this.playlist.snapshot_id },
      cssClass: 'fit-modal-wrapper'
    });

    await modal.present();
    const dismissData = await modal.onDidDismiss();
    if (dismissData.role == 'done') {
      await this.statusModal.success('Músicas removidas com sucesso!');
      await this.init();
    }
  }

  public async openRemoveAlbumModal() {
    const modal = await this.modalController.create({
      component: RemoveAlbumComponent,
      componentProps: { playlistId: this.id, snapshotId: this.playlist.snapshot_id },
      cssClass: 'fit-modal-wrapper'
    });

    await modal.present();
    const dismissData = await modal.onDidDismiss();
    if (dismissData.role == 'done') {
      await this.statusModal.success('Músicas removidas com sucesso!');
      await this.init();
    }
  }

  public async showDuplicatesModal() {
    const modal = await this.modalController.create({
      component: ShowDuplicatesComponent,
      componentProps: { playlistId: this.id, snapshotId: this.playlist.snapshot_id },
      cssClass: 'fit-modal-wrapper'
    });

    await modal.present();

    const dismiss = await modal.onDidDismiss();
    if (dismiss.role == 'done') {
      await this.statusModal.success('Músicas removidas com sucesso!');
      await this.init();
    }
  }

  public async openIncorporateModal() {
    await this.statusModal.info('Função em desenvolvimento...');
  }

  public async openDislikeModal() {
    await this.statusModal.info('Função em desenvolvimento...');
  }
}
