import { Component } from '@angular/core';
import { IonicModule, MenuController, ModalController } from '@ionic/angular';
import { LoginService } from '../services/login.service';
import { CommonModule } from '@angular/common';
import { PerfilService } from '../services/perfil.service';
import { Router } from '@angular/router';
import { NewPlaylistComponent } from '../components/new-playlist/new-playlist.component';
import { RemovePlaylistComponent } from '../components/remove-playlist/remove-playlist.component';
import { StatusModalComponent } from '../components/status-modal/status-modal.component';
import { FsService } from '../services/storage.service';

@Component({
  imports: [IonicModule, CommonModule],
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [StatusModalComponent],
  standalone: true
})
export class HomePage {
  constructor(
      public loginService: LoginService, public perfilService: PerfilService, private router: Router,
      private modalController: ModalController, private statusModal: StatusModalComponent, public fsService: FsService,
      private menu: MenuController
    ) {}

  async ionViewWillEnter() {
    await this.perfilService.isReady();
  }

  public async goToPlaylist(playlistId: string) {
    await this.router.navigate(['/playlist'], { queryParams: { id: playlistId } });
  }

  public async openNewPlaylistModal() {
    const newPlaylistModal = await this.modalController.create({
      component: NewPlaylistComponent,
      cssClass: 'fit-modal-wrapper'
    });

    await newPlaylistModal.present();
    const r = await newPlaylistModal.onDidDismiss();

    if (r.role == 'done') {
      await this.statusModal.success('Playlist criada com sucesso!');
      await this.perfilService.me();
      await this.goToPlaylist(r.data.id);
    } else if (r.role == 'done_with_errors') {
      await this.perfilService.me();
      await this.goToPlaylist(r.data.id);
    }
  }

  public async openDeletePlaylistsModal() {
    const modal = await this.modalController.create({
      component: RemovePlaylistComponent,
      cssClass: 'fit-modal-wrapper',
      componentProps: { playlists: this.perfilService.perfil.playlists.owned }
    });

    await modal.present();
    const dismiss = await modal.onDidDismiss();
    if (dismiss.role == 'done') {
      await this.statusModal.success('Playlists deletadas com sucesso!');
      await this.perfilService.me();
    }
  }

  public async navigate(url: string) {
    await this.menu.close();
    return await this.router.navigate([url]);
  }

  public async login() {
    return this.loginService.login();
  }

  public async logout() {
    await this.statusModal.success('Até a próxima!');
    await this.menu.close();
    await this.loginService.logout();
  }
}
