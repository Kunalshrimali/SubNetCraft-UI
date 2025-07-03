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
  DropdownModule,
  FormModule,
  SpinnerModule,
  GridModule,
  CardHeaderComponent,
} from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { SubnetService } from './../../../services/subnet.service';
import { ISubnet, ISubnetResponse } from '../../../interface/subnet.interface';
import { Observable, of } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from './../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SUCCESS } from 'src/app/constants/glob-strings';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IResponse } from './../../../interface/common.interface';
import { map, shareReplay } from 'rxjs/operators';
import { REQUEST_NEW_IP } from 'src/app/constants/api-endpoints.constants';
import * as VERBIAGE from '../../../constants/verbiage';

@Component({
  selector: 'app-register',
  templateUrl: './request-new-ip.component.html',
  styleUrls: ['./request-new-ip.component.scss'],
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
    DropdownModule,
    CommonModule,
    FormModule,
    ReactiveFormsModule,
    SpinnerModule,
    GridModule,
    RouterModule,
    CardHeaderComponent
  ],
})
export class RequestNewIPComponent {
  subnets$!: Observable<ISubnet[]>;
  form: FormGroup;
  loading = false;
  readonly PLACEHOLDER = VERBIAGE.placeholder;
  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private subnetService: SubnetService
  ) {
    this.form = this.formBuilder.group({
      subnet_id: [''],
      description: ['', [Validators.required]],
      host_name: [''],
      requester_name: ['', [Validators.required]],
      additional_comment: [''],
    });


  }

  ngAfterViewInit() {
    this.subnets$ = this.subnetService
    .getAllSummarizedSubnets()
    .pipe(
      map((value) => value.data as ISubnet[]));
  }

  get subnetFormField() {
    return this.form.get('subnet_id');
  }

  get descriptionFormField() {
    return this.form.get('description');
  }

  get hostnameFormField() {
    return this.form.get('host_name');
  }

  get requesterNameFormField() {
    return this.form.get('requester_name');
  }

  get additionalCommentFormField() {
    return this.form.get('additional_comment');
  }

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    this.subnetService.requestNewIP(REQUEST_NEW_IP, this.form.value).subscribe({
      next: (e:IResponse) => {
        this.toastr.success(e.message);
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['login']);
        }, 800);
      },
      error: (e: HttpErrorResponse) => {
        this.router.navigate(['login']);
        this.toastr.error(e.message, 'Error');
        this.loading = false;
      },
    });
  }
}
