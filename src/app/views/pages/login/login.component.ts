import { Component } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardGroupComponent,
  TextColorDirective,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective,
  FormFeedbackComponent,
  SpinnerModule,
} from '@coreui/angular';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as ERROR_CONSTANTS from './../../../constants/error.constants';
import * as VERBIAGE from '../../../constants/verbiage';

import { Router, RouterModule } from '@angular/router';
import { LoginRequest } from '../../../interface/login.interface';
import { AuthService } from './../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { IErrorResponse } from 'src/app/interface/common.interface';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle,
    ReactiveFormsModule,
    FormFeedbackComponent,
    CommonModule,
    FormsModule,
    RouterModule,
    SpinnerModule
  ],
  providers: [AuthService],
})
export class LoginComponent {
  loginForm!: FormGroup;
  ERROR_CONSTS = ERROR_CONSTANTS;
  loading = false;
  credentials: LoginRequest = {
    email: '',
    password: '',
  };
  showPassword:boolean;
  readonly PLACEHOLDER =  VERBIAGE.placeholder

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.showPassword = false;
    this.authService.logout();
  }

  isLoggedIn(): boolean {
    return AuthService.isLoggedIn();
  }

  login() {
    this.loading = true;
    this.authService.login(this.credentials).subscribe({
      next: (v:any) => {
        this.toastr.success(v.message);

        this.router.navigateByUrl('pages')
      },
      error: (e: IErrorResponse) => {
        this.toastr.error(e.error.message, 'Error');
        this.loading = false;
        // this.router.navigateByUrl('pages');
      },
      complete: () =>{
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login'])
  }
}
