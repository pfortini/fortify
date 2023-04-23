import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  imports: [IonicModule, CommonModule],
  selector: 'app-progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss'],
  standalone: true
})
export class ProgressIndicatorComponent  implements OnInit {
  @Input() message: string | undefined;
  @Input() progress = 0;
  @Input() showProgress = false;

  public loading = false;

  constructor() { }

  ngOnInit() {}

}
