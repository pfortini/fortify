import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FsService {
  constructor() { }

  async writeFile(fileName: string, data: string) {
    return Filesystem.writeFile({
      path: fileName,
      directory: Directory[environment.storageLocation],
      encoding: Encoding.UTF8,
      data
    });
  }

  async readFile(fileName: string) {
    return Filesystem.readFile({
      path: fileName,
      directory: Directory[environment.storageLocation],
      encoding: Encoding.UTF8
    });
  }

  async deleteFile(fileName: string) {
    return Filesystem.deleteFile({
      path: fileName,
      directory: Directory[environment.storageLocation]
    });
  }

  async checkPermissions() {
    return await Filesystem.checkPermissions();
  }

  async requestPermission() {
    return await Filesystem.requestPermissions();
  }
}
