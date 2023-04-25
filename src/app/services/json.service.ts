import { Injectable } from '@angular/core';
import { FsService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class JsonService {

  constructor(private fsService: FsService) { }

  async writeJSON(fileName: string, o: any) {
    return this.fsService.writeFile(fileName, JSON.stringify(o));
  }

  async readJSON(fileName: string, zeroValue: any = []) {
    try {
      return JSON.parse((await this.fsService.readFile(fileName)).data);
    } catch (e) {
      if (e == 'Error: File does not exist' || e == 'Error: File does not exist.') {
        await this.writeJSON(fileName, zeroValue);
        return zeroValue;
      }
    }
  }

  async deleteJSON(fileName: string) {
    try {
      return await this.fsService.deleteFile(fileName);
    } catch (e) {
      if (e != 'Error: File does not exist' && e != 'Error: File does not exist.') throw e;
    }
  }
}
