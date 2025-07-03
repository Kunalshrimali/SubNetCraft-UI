import { CommonModule, TitleCasePipe, UpperCasePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  FormCheckComponent,
  FormControlDirective,
  FormFeedbackComponent,
  FormFloatingDirective,
  FormSelectDirective,
  RowComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { IBaseSubnet, ISubnet } from 'src/app/interface/subnet.interface';

@Component({
  selector: 'app-basic-subnet',
  standalone: true,
  imports: [
    ColComponent,
    RowComponent,
    FormControlDirective,
    FormCheckComponent,
    FormSelectDirective,
    ButtonDirective,
    FormFloatingDirective,
    CardComponent,
    CardBodyComponent,
    TitleCasePipe,
    ReactiveFormsModule,
    CommonModule,
    IconDirective,
    RouterLink,
    FormFeedbackComponent,
    FontAwesomeModule,
  ],
  templateUrl: './basic-subnet.component.html',
  styleUrl: './basic-subnet.component.scss',
})
export class BasicSubnetComponent {
  cardTitle = 'create subnet';
  ipv4FormatRegex =
    '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
  maskingBitsRangeRegex = '^(d|[12]d|30)$';
  form: FormGroup;
  submitted = false;
  @Output() outBasicSubnetDetails = new EventEmitter();
  @Output() outResetClicked = new EventEmitter();
  @Input() isDefault = false;
  @Output() onRemoveComponent = new EventEmitter();
  @Input() componentID = 0;
  @Output() onSaveSubnets = new EventEmitter();
  @Input() isEditing = false;
  @Input() existingDetails: IBaseSubnet = {
    name: '',
    network: '10.0.0.0',
    netsize: 16,
  };
  readonly faFileExport = faFileExport;
  constructor(private formBuilder: FormBuilder) {
    //TODO: pattern validation for both network and netsize
    this.form = this.formBuilder.group({
      subnetName: ['', [Validators.required]],
      network: ['10.0.0.0', [Validators.required]],
      netsize: [16, [Validators.required]],
    });

    this.form.updateValueAndValidity();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['existingDetails'] && this.isEditing
    ) {
      let subnetDetails =  changes['existingDetails'].currentValue as IBaseSubnet;

      this.form = this.formBuilder.group({
        subnetName: [subnetDetails.name, [Validators.required]],
        network: [subnetDetails.network, [Validators.required]],
        netsize: [subnetDetails.netsize, [Validators.required]],
      });;
    }
  }
  onSubmit() {
    this.submitted = true;
    // if(!this.basicSubnetForm.valid){
    //   this.basicSubnetForm.markAllAsTouched();
    //   return;
    // }

    let data: IBaseSubnet = {
      netsize: this.form.get('netsize')?.value,
      network: this.form.get('network')?.value,
      name: this.form.get('subnetName')?.value,
    };
    this.outBasicSubnetDetails.emit(data);
  }

  reset() {
    this.form.patchValue({ subnetName: '' });
    this.form.patchValue({ network: '10.0.0.0' });
    this.form.patchValue({ netsize: 16 });
    this.form.updateValueAndValidity();
    this.outResetClicked.emit();
  }

  removeComponent() {
    this.onRemoveComponent.emit(this.componentID);
  }

  delegate() {
    this.onSaveSubnets.emit();
  }

  onChangeName() {
    this.onSubmit();
  }
}
