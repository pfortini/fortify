import { Injectable } from '@angular/core';
import { Filesystem, Encoding } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class FsService {
  public platform: 'mobile'|'desktop';

  private storageLocation: any;

  constructor(private platformService: Platform) {
    if (this.platformService.platforms().includes('mobile')) {
      this.platform = 'mobile';
      this.storageLocation = 'External';
    } else {
      this.platform = 'desktop';
      this.storageLocation = 'Documents';
    }
  }

  async writeFile(fileName: string, data: string) {
    return Filesystem.writeFile({
      path: fileName,
      directory: this.storageLocation,
      encoding: Encoding.UTF8,
      data
    });
  }

  async readFile(fileName: string) {
    return Filesystem.readFile({
      path: fileName,
      directory: this.storageLocation,
      encoding: Encoding.UTF8
    });
  }

  async deleteFile(fileName: string) {
    return Filesystem.deleteFile({
      path: fileName,
      directory: this.storageLocation
    });
  }

  async checkPermissions() {
    return await Filesystem.checkPermissions();
  }

  async requestPermission() {
    return await Filesystem.requestPermissions();
  }
}
