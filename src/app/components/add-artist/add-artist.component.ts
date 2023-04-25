import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { PlaylistService } from 'src/app/services/playlist.service';
import { SearchService } from 'src/app/services/search.service';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';
import { StatusModalComponent } from '../status-modal/status-modal.component';
import { ArtistService } from 'src/app/services/artist.service';
import { AlbumService } from 'src/app/services/album.service';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { FsService } from 'src/app/services/storage.service';

@Component({
  imports: [CommonModule, IonicModule, FormsModule, ProgressIndicatorComponent],
  selector: 'app-add-artist',
  templateUrl: './add-artist.component.html',
  styleUrls: ['./add-artist.component.scss'],
  standalone: true
})
export class AddArtistComponent  implements OnInit {
  @Input() playlistId = '';

  public searchString = '';

  public artists: any = [];
  public artistArray: any = [];
  public filteredArtists: any = [];
  public selectedArtists: any = [];
  public selectedArtistsMobile: any = [];

  public slide = 0;
  public subslide = 0;
  public albumStep = false;

  public qty = 0;
  public qty20 = false;
  public qty50 = false;
  public qty100 = false;
  public qtyAll = false;
  public qtyAlbum = false;

  public noLive = false;
  public noRemix = false;

  public progress = 0;

  private qtyMap = {
    'todas': -1,
    'album': -2
  };

  private statusModal: StatusModalComponent

  constructor(private searchService: SearchService, private artistService: ArtistService,
    private playlistService: PlaylistService, private modalController: ModalController,
    private sharedModule: SharedModule, private albumService: AlbumService, public fsService: FsService
  ) {
    this.statusModal = this.sharedModule.statusModalComponent();
  }

  async ngOnInit() {
    await this.searchService.isReady();
  }

  public async search(q: any) {
    q = q.detail.value;

    if (!q) { this.artists = []; return; }

    this.artists = (await this.searchService.search(['artist'], q)).artists;
    this.filterArtists();
  }

  private filterArtists() {
    this.filteredArtists = { items: this.artists.items.filter(artist => !artist.hide) };
  }

  public async addArtist(a: any) {
    this.artists.items.forEach(artist => { if (artist.id == a.id) artist.hide = true; });

    if (this.selectedArtists.length > 0) {
      if (this.selectedArtists[this.selectedArtists.length - 1].length < 5) this.selectedArtists[this.selectedArtists.length - 1].push(a);
      else this.selectedArtists.push([a]);
    } else this.selectedArtists.push([a]);

    if (this.selectedArtistsMobile.length > 0) {
      if (this.selectedArtistsMobile[this.selectedArtistsMobile.length - 1].length < 3) this.selectedArtistsMobile[this.selectedArtistsMobile.length - 1].push(a);
      else this.selectedArtistsMobile.push([a]);
    } else this.selectedArtistsMobile.push([a]);

    this.filterArtists();
  }

  public removeArtist(i: number, j: number, artist: any) {
    this.selectedArtists[i] = this.selectedArtists[i].filter((a: any, _j: number) => j != _j);

    artist.hide = false;

    this.filterArtists();
    this.rearrangeSelected();
  }

  private rearrangeSelected() {
    const result: any = [];
    const ordered: any = [];
    const orderedMobile: any = [];

    this.selectedArtists.forEach((chunk: any) => result.push(...chunk));

    for (let i = 0; i < result.length; i += 5) ordered.push(result.slice(i, i + 5));
    for (let i = 0; i < result.length; i += 3) orderedMobile.push(result.slice(i, i + 3));

    this.selectedArtists = ordered;
    this.selectedArtistsMobile = orderedMobile;
  }

  public async loadMoreArtists(e: any) {
    const moreArtists = await this.searchService.searchMore(this.artists.next);
    this.artists.items.push(...moreArtists.artists.items);
    this.artists.next = moreArtists.artists.next;

    this.filterArtists();

    e.target.complete();
  }

  private async addArtists() {
    const artists: any = [];
    this.selectedArtists.forEach(artistChunk => artists.push(...artistChunk));

    const tracksToAdd: any = [];
    const albumsToAdd: any = [];

    if (this.qty == this.qtyMap['album']) {
      artists.forEach(artist => {
        artist.albums.forEach(albumGroup => {
          albumGroup.forEach(album => {
            if (album.toAdd) albumsToAdd.push(album);
          });
        });
      });

      await Promise.all(albumsToAdd.map(async (album, i) => {
        const albumTracks = await this.albumService.getTracks(album.id);

        tracksToAdd.push(...albumTracks);

        this.progress = (i + 1) / artists.length;
      }));
    } else {
      await Promise.all(artists.map(async (artist, i)=> {
        const topTracks = await this.artistService.getTopTracks(artist.name, this.qty);

        console.log(topTracks);
        console.log(this.qty);

        tracksToAdd.push(...topTracks.items);

        this.progress = (i + 1) / artists.length;
      }));

    }

    await this.playlistService.addToPlaylist(this.playlistId, tracksToAdd, this.noLive, this.noRemix);
  }

  public qtyChange(e: any) {
    if (e.target.innerText == 'Top 20' && e.detail.checked) {
      this.qty = 20;
      this.qty50 = false;
      this.qty100 = false;
      this.qtyAll = false;
      this.qtyAlbum = false;
    } else if (e.target.innerText == 'Top 50' && e.detail.checked) {
      this.qty = 50;
      this.qty20 = false;
      this.qty100 = false;
      this.qtyAll = false;
      this.qtyAlbum = false;
    } else if (e.target.innerText == 'Top 100' && e.detail.checked) {
      this.qty = 100;
      this.qty20 = false;
      this.qty50 = false;
      this.qtyAll = false;
      this.qtyAlbum = false;
    } else if (e.target.innerText == 'Todas' && e.detail.checked) {
      this.qty = -1;
      this.qty20 = false;
      this.qty50 = false;
      this.qty100 = false;
      this.qtyAlbum = false;
    } else if (e.target.innerText == 'Escolher Álbuns' && e.detail.checked) {
      this.qty = -2;
      this.qty20 = false;
      this.qty50 = false;
      this.qty100 = false;
      this.qtyAll = false;
    } else if (!e.detail.checked) this.qty = 0;
  }

  public async showSwal(event) {
    if (event.detail.checked)
      await this.statusModal.info('Essa é uma função experimental e pode apresentar erros ao filtrar músicas');
  }

  public async nextSlide() {
    if (this.slide == 0) this.slide++;

    else if (this.slide == 1) {
      if (!this.albumStep && this.qty == this.qtyMap['album']) {
        this.albumStep = true;
        this.selectedArtists.forEach(artistChunk => this.artistArray.push(...artistChunk));
        await Promise.all(this.artistArray.map(async artist => {
          artist.albums = await this.artistService.getAlbums(artist.id);
        }));
      } else if (!this.albumStep && this.qty != this.qtyMap['album']) {
        this.slide++;
        await this.addArtists();
        await this.modalController.dismiss('', 'done');
      } else if (this.albumStep) {
        if (this.subslide + 1 < this.artistArray.length) this.subslide++;
        else {
          this.slide++;
          this.albumStep = false;
          await this.addArtists();
          await this.modalController.dismiss('', 'done');
        }
      }
    }
  }

  public markAlbum(e, album) {
    if (e.detail.checked) album.toAdd = true;
  }
}
