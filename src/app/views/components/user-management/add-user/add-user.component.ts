import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  FormFloatingDirective,
} from '@coreui/angular';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
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
    FormFloatingDirective,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  form: FormGroup ;
  StrongPasswordRegx: RegExp =
  /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;
  showPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  constructor(){
    this.form = new FormGroup({
      first_name: new FormControl('',[ Validators.required,Validators.minLength(5)]),
      last_name: new FormControl('',[ Validators.required,Validators.minLength(5)]),
      email: new FormControl('',[Validators .email]),
      password: new FormControl('',[ Validators.required,Validators.pattern(this.StrongPasswordRegx)])
   });
  }

  get passwordFormField() {
    return this.form.get('password');
  }

}
