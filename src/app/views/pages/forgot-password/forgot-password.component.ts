import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  TextColorDirective,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective,
  SpinnerModule,
  CardHeaderComponent,
} from '@coreui/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IErrorResponse, IResponse } from 'src/app/interface/common.interface';

import * as VERBIAGE from '../../../constants/verbiage';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
ContainerComponent,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    RouterModule,
    FormsModule,
    CommonModule,
    SpinnerModule,
    CardHeaderComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  readonly PLACEHOLDER = VERBIAGE.placeholder;
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngAfterViewInit(){
    this.email = ''
  }
  forgotPassword(f: NgForm) {
    if (f.form.invalid) {
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(f.form.value).subscribe({
      next:(res)=>{
        this.toastr.success(res.message);
        this.loading = false;
      },
      error: (e: IErrorResponse) => {
        this.toastr.error(e.error.message, 'Error');
        this.loading = false;
      },
    })
  }
}

// .subscribe({
//   next: (e:IResponse) => {
//     this.toastr.success(SUCCESS);
//     this.loading = false;
//   },
//   error: (e: IErrorResponse) => {
//     this.toastr.error(e.error.message, 'Error');
//     this.loading = false;
//   },
// });
