import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  imports: [IonicModule, CommonModule],
  selector: 'app-progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss'],
  standalone: true
})
export class ProgressIndicatorComponent {
  @Input() message: string | undefined;
  @Input() progress = 0;
  @Input() showProgress = false;
  @Input() fullscreen = false;
  @Input() spinnerStyle = 'crescent';

  public loading = false;

  constructor() {}
}
