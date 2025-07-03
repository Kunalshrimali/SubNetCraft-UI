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

import * as ERROR_CONSTANTS from '../../../constants/error.constants';
import { Router, RouterModule } from '@angular/router';
import { LoginRequest } from '../../../interface/login.interface';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { IErrorResponse } from './../../../interface/common.interface'
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
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
export class LogoutComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    debugger;
    this.authService.logout();
    this.router.navigate(['login'])
  }

}
