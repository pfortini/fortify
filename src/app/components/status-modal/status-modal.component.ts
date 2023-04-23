import { Component } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'app-status-modal',
  templateUrl: './status-modal.component.html',
  styleUrls: ['./status-modal.component.scss'],
  standalone: true
})
export class StatusModalComponent {
  private swal: SweetAlertResult | undefined;

  constructor() {}

  public async success(msg: string, submsg = '') {
    return this.fire('success', msg, submsg);
  }

  public async error(msg: string, submsg = '') {
    return this.fire('error', msg, submsg);
  }

  public async warning(msg: string, submsg = '') {
    return this.fire('warning', msg, submsg);
  }

  public async info(msg: string, submsg = '') {
    return this.fire('info', msg, submsg);
  }

  private async fire(status: 'warning'|'error'|'success'|'info', msg: string, submsg: string) {
    const colorMap = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'secondary'
    };

    const swalObj: SweetAlertOptions = {
      titleText: msg,
      color: 'var(--ion-color-primary-contrast)',
      background: 'var(--ion-card-background)',
      backdrop: false,
      icon: status,
      iconColor: `var(--ion-color-${colorMap[status]})`,
      confirmButtonText: 'Fechar',
      confirmButtonColor: `var(--ion-color-${colorMap[status]})`,
      customClass: { confirmButton: `${colorMap[status]}-button-text` }
    };

    if (submsg) swalObj.text = submsg;

    this.swal = await Swal.fire(swalObj);

    return this.swal;
  }
}
