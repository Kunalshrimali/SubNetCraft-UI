import { Component, ViewChild } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress/work-in-progress.component';
import {
  ButtonCloseDirective,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  ContainerComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormControlDirective,
  FormLabelDirective,
  FormSelectDirective,
  ModalComponent,
  ModalModule,
  PageItemDirective,
  PageLinkDirective,
  PaginationComponent,
  RowComponent,
  TableModule,
  UtilitiesModule,
} from '@coreui/angular';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AddUserComponent } from './add-user/add-user.component';
import { IconDirective } from '@coreui/icons-angular';
import { RouterLink } from '@angular/router';

import * as GLOBAL_STRING_CONSTS from '../../../constants/glob-strings';
import * as VERBIAGE from '../../../constants/verbiage';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCoffee, faTrashCan, faKey, faPencil } from '@fortawesome/free-solid-svg-icons';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { IUser, IUserRequest, IUsersList } from './../../../interface/user.interface';
import { UserService } from './../../../services/user.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { IErrorResponse, IResponse } from 'src/app/interface/common.interface';
import { confirmPasswordValidator } from './../../../validators/password-match.validator';
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    WorkInProgressComponent,
    TableModule,
    UtilitiesModule,
    CardBodyComponent,
    CardHeaderComponent,
    CardComponent,
    ButtonDirective,
    ContainerComponent,
    RowComponent,
    ColComponent,
    FormLabelDirective,
    FormControlDirective,
    FormSelectDirective,
    TitleCasePipe,
    ModalModule,
    AddUserComponent,
    ButtonCloseDirective,
    IconDirective,
    PaginationComponent,
    PageItemDirective,
    PageLinkDirective,
    RouterLink,
    FontAwesomeModule,
    CommonModule,
    FormCheckComponent,
    FormCheckInputDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  readonly GLOBAL_STRING_CONSTS = GLOBAL_STRING_CONSTS;
  readonly PLACEHOLDER =  VERBIAGE.placeholder
  readonly faCoffee = faCoffee;
  readonly faTrashCan = faTrashCan;
  readonly faPencil = faPencil;

  readonly StrongPasswordRegx: RegExp =
    /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;
  readonly faKey = faKey;

  loading = false;
  showPassword: boolean = false;

  searchText$ = new Subject<string>();
  users$!: Observable<IUsersList[]>;

  form: FormGroup;
  passwordForm: FormGroup;

  @ViewChild('addUserModal') addUserModal!: ModalComponent;
  @ViewChild('changePasswordModal') changePasswordModal!: ModalComponent;

  isEditing = false;
  currentEditUserID: string = '';
  showConfirmPassword: boolean;

  constructor(
    private service: UserService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.isEditing = false;
    this.showConfirmPassword = false;
    this.form = new FormGroup({
      first_name: new FormControl('', [Validators.required]),
      last_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(this.StrongPasswordRegx),
      ]),
    });

    this.passwordForm = new FormGroup(
      {
        new_password: new FormControl<string>('', [
          Validators.required,
          Validators.pattern(this.StrongPasswordRegx),
        ]),
        confirm_password: new FormControl<string>('', [Validators.required]),
      },
      { validators: [confirmPasswordValidator] }
    );
  }

  ngOnInit() {
    this.loading = true;
    this.searchUsers('');
  }

  ngAfterViewInit() {
    this.addUserModal.visibleChange.subscribe((visible) => {
      if (!visible) {
        setTimeout(() => {
          this.isEditing = false;
          this.resetUserForm();
          this.form.get('email')?.enable();
          this.form.get('password')?.enable();
        }, 200);
      }
    });
    this.changePasswordModal.visibleChange.subscribe((visible) => {
      if (!visible) {
        setTimeout(() => {
          this.resetChangePasswordForm();
        }, 200);
      }
    });
  }

  // getData(searchTerm: string) {
  //   return this.service.getAll(searchTerm);
  // }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  search(searchTerm: string) {
    this.searchText$.next(searchTerm);
  }

  get passwordFormField() {
    return this.form.get('password');
  }

  get passwordChangeFormField() {
    return this.passwordForm.get('new_password');
  }

  get confirmPasswordChangeFormField() {
    return this.passwordForm.get('confirm_password');
  }

  resetUserForm() {
    this.form.setValue({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    });
    this.form.markAsPristine();
    this.form.setErrors(null);
  }

  resetChangePasswordForm() {
    this.passwordForm.setValue({
      new_password: '',
      confirm_password: '',
    });
    this.passwordForm.markAsPristine();
    this.passwordForm.setErrors(null);
    this.passwordForm.setValidators(confirmPasswordValidator);
  }

  saveUser() {
    if (this.form.invalid) {
      return;
    }

    // Call API service to create user
    if (!this.isEditing) {
      this.service.saveUser(this.form.value).subscribe({
        next: (e) => {
          this.toastr.success(GLOBAL_STRING_CONSTS.SUCCESS);
          this.addUserModal.visible = false;
          setTimeout(() => {
            this.searchUsers(''); // Trigger search after user creation
          }, 800);

          this.resetUserForm();
          this.loading = false;
        },
        error: (e: IErrorResponse) => {
          this.toastr.error(e.error.message, 'Error');
          this.loading = false;
        },
      });
    } else {
      this.service.editUser(this.form.value, this.currentEditUserID).subscribe({
        next: (e) => {
          this.toastr.success(GLOBAL_STRING_CONSTS.SUCCESS);
          this.addUserModal.visible = false;
          setTimeout(() => {
            this.searchUsers(''); // Trigger search after user creation
          }, 800);

          this.resetUserForm();
          this.loading = false;
        },
        error: (e: IErrorResponse) => {
          this.toastr.error(e.error.message, 'Error');
          this.loading = false;
        },
      });
    }
  }

  searchUsers(searchTerm: string,status = '') {
    this.users$ = this.getData(searchTerm,status).pipe(
      map((res) => {
        return res.data as IUsersList[];
      }),
      catchError((error) => {
        this.loading = false;
        console.error('Error fetching users:', error);
        return of([]); // Return empty array or handle error
      })
    );
  }

  // Function to fetch users based on search term with debounce
  private getData(searchTerm: string,status:string): Observable<any> {
    return this.searchText$.pipe(
      debounceTime(500), // Debounce the search input
      distinctUntilChanged(), // Only emit if the value has changed
      startWith(searchTerm), // Start with the initial searchTerm
      switchMap((term) => {
        this.loading = false;
        return this.service.getAll(term,status).pipe(
          catchError((error) => {
            this.loading = false;
            console.error('Error fetching users:', error);
            return of([]); // Return empty array or handle error
          })
        );
      })
    );
  }

  editUser(user: IUser,userID:string) {
    this.currentEditUserID = userID;
    this.showPassword = false;
    this.isEditing = true;
    this.form.get('email')?.disable();
    this.form.get('password')?.disable();
    this.form.patchValue(user);
    this.addUserModal.visible = true;
  }

  savePassword() {
    if (this.passwordForm.invalid) {
      return;
    }
  }

  removeUser(confirmationModal:ModalComponent){
    this.service.removeUser(this.currentEditUserID).subscribe({
      next:(res)=>{
        this.toastr.success(GLOBAL_STRING_CONSTS.DELETE_USER_SUCCESSFULLY);
        confirmationModal.visible = false;
        setTimeout(() => {
          this.searchUsers(''); // Trigger search after user creation
        }, 1000);
      },
      error: (e: IErrorResponse) => {
        this.toastr.error(e.error.message, 'Error');
        confirmationModal.visible = false;
      },
    })
  }

  changeStatus(val:any,userID:string){
    this.currentEditUserID = userID;
    let data: IUserRequest = {
     _id:userID,
     is_active:val
    }
    this.service.editUser(data,this.currentEditUserID).subscribe({
      next: (e:IResponse) => {
        this.toastr.success(e.message);
        this.addUserModal.visible = false;
        setTimeout(() => {
          this.searchUsers(''); // Trigger search after user creation
        }, 800);
      },
      error: (e: IErrorResponse) => {
        this.toastr.error(e.error.message, 'Error');
        this.loading = false;
      },
    })
  }
  delegateRemoval(userID:string,confirmationModal:ModalComponent){
    this.currentEditUserID = userID;
    confirmationModal.visible = true;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onInputChange(value:string,searchTerm:string){
    searchTerm = searchTerm ? searchTerm : '';
    this.searchUsers(searchTerm,value);
  }
}
