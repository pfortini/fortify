import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddArtistComponent } from './add-artist.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule,],
  declarations: [AddArtistComponent ],
  exports: [AddArtistComponent ]
})
export class AddArtistComponent Module {}
