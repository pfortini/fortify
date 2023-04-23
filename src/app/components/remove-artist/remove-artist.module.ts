import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RemoveArtistComponent } from './remove-artist.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule,],
  declarations: [RemoveArtistComponent ],
  exports: [RemoveArtistComponent ]
})
export class RemoveArtistComponent Module {}
