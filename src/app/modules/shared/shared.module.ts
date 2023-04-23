import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusModalComponent } from 'src/app/components/status-modal/status-modal.component';

@NgModule({
  imports: [CommonModule, StatusModalComponent],
  declarations: [],
  exports: [StatusModalComponent]
})

export class SharedModule {
  statusModalComponent() {
    return new StatusModalComponent();
  }
}
