import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { BasicSubnetComponent } from './basic-subnet/basic-subnet.component';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  CollapseDirective,
  ContainerComponent,
  DropdownComponent,
  FormControlDirective,
  NavbarBrandDirective,
  NavbarComponent,
  NavbarModule,
  NavbarNavComponent,
  NavbarTogglerDirective,
  NavItemComponent,
  SpinnerComponent,
  SpinnerModule,
} from '@coreui/angular';
import { AdvancedSubnetGridComponent } from './advanced-subnet-grid/advanced-subnet-grid.component';
import {
  IAddSubnetRequest,
  IBaseSubnet,
  IEditSubnetRequest,
  ISubnetResponse,
} from 'src/app/interface/subnet.interface';
import { CombinedSubnetComponent } from './combined-subnet/combined-subnet.component';
import { Subscription, filter } from 'rxjs';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { SubnetService } from 'src/app/services/subnet.service';
import { ADD_SUBNET } from 'src/app/constants/api-endpoints.constants';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { IResponse } from 'src/app/interface/common.interface';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-subnet',
  standalone: true,
  imports: [
    BasicSubnetComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    AdvancedSubnetGridComponent,
    ContainerComponent,
    ButtonDirective,
    CombinedSubnetComponent,
    TitleCasePipe,
    ButtonDirective,
    NavbarComponent,
    NavbarNavComponent,
    NavItemComponent,
    DropdownComponent,
    CollapseDirective,
    NavbarTogglerDirective,
    FormControlDirective,
    NavbarBrandDirective,
    SpinnerModule,
    CommonModule,
    FontAwesomeModule,
  ],
  templateUrl: './subnet.component.html',
  styleUrl: './subnet.component.scss',
})
export class SubnetComponent {
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;
  subnetBasicDetails: IBaseSubnet = {
    name: '',
    network: '10.0.0.0',
    netsize: 16,
  };

  subnetSubscriptions: Subscription[] = [];
  combinedSubnetComponentsArr: ComponentRef<CombinedSubnetComponent>[] = [];
  subnets: any[] = [];
  loading = false;
  currentSubnetGrpID: string;
  currentSubnetGrpData: IEditSubnetRequest | null;
  isEditing: boolean;
  readonly faSearch = faSearch;
  constructor(
    public service: SubnetService,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.isEditing = false;
    this.currentSubnetGrpID = '';
    this.currentSubnetGrpData = null;
  }
  ngAfterViewInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (Object.keys(params)) {
        this.currentSubnetGrpID = params['subnet_id'];
      }

      if (this.currentSubnetGrpID) {
        this.service.getByID(this.currentSubnetGrpID).subscribe({
          next: (res: any) => {
            this.isEditing = true;

            this.addNewSubnet(res.body.data);
          },
          error: (err) => {
            this.isEditing = false;
          },
        });
      } else {
        this.isEditing = false;
        this.addInitialComponent();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {}

  addInitialComponent(data?: IEditSubnetRequest) {
    let componentRef: ComponentRef<CombinedSubnetComponent> =
      this.container.createComponent(CombinedSubnetComponent);
    componentRef.instance.isDefault = true;
    componentRef.instance.componentID =
      this.container.indexOf(componentRef.hostView) + 1;
    this.container.insert(componentRef.hostView);
    this.combinedSubnetComponentsArr.push(componentRef);
  }

  set onBasicSubnetDetailsSubmitted(value: IBaseSubnet) {
    this.subnetBasicDetails = value;
  }

  outResetClicked() {
    this.subnetBasicDetails = {
      name: '',
      network: '10.0.0.0',
      netsize: 16,
    };
  }

  addNewSubnet(data?: any) {
    if (data) {
      data.subnet_detail_json.forEach((subnet: any) => {
        let componentRef: ComponentRef<CombinedSubnetComponent> =
          this.container.createComponent(CombinedSubnetComponent);
        let name  =  Object.keys(subnet)[0];
        let firstSubnetObject  = Object.values(subnet)[0];
        let network = '10.0.0.0';
        if(firstSubnetObject){
          let network  = Object.keys(firstSubnetObject)[0];
          let existingBasicDetails = {
            name : Object.keys(subnet)[0],
            network : network,
            netsize: 16
          }
          componentRef.setInput('existingBasicDetails', existingBasicDetails);
        }

        componentRef.setInput('subnetGrp', Object.values(subnet)[0]);
        componentRef.setInput('isEditing', true);

        componentRef.instance.isDefault = false;
        if(this.container.indexOf(componentRef.hostView) + 1 === 1) componentRef.instance.isDefault = true;

        componentRef.instance.componentID =
          this.container.indexOf(componentRef.hostView) + 1;

        let subscription = componentRef.instance.removeComponent.subscribe({
          next: (val) => {
            this.combinedSubnetComponentsArr.splice(
              this.container.indexOf(componentRef.hostView),
              1
            );
            this.container.remove(
              this.container.indexOf(componentRef.hostView)
            );
          },
        });
        this.combinedSubnetComponentsArr.push(componentRef);
        this.subnetSubscriptions.push(subscription);
      });
    } else {
      let componentRef: ComponentRef<CombinedSubnetComponent> =
        this.container.createComponent(CombinedSubnetComponent);

      componentRef.instance.isDefault = false;
      componentRef.instance.componentID =
        this.container.indexOf(componentRef.hostView) + 1;

      let subscription = componentRef.instance.removeComponent.subscribe({
        next: (val) => {
          this.combinedSubnetComponentsArr.splice(
            this.container.indexOf(componentRef.hostView),
            1
          );
          this.container.remove(this.container.indexOf(componentRef.hostView));
        },
      });
      this.combinedSubnetComponentsArr.push(componentRef);
      this.subnetSubscriptions.push(subscription);
    }
  }

  save() {
    this.subnets = [];
    let basicSubnetDetails!: IBaseSubnet;
    this.combinedSubnetComponentsArr.forEach(
      (element: ComponentRef<CombinedSubnetComponent>) => {
        this.subnets.push(element.instance.delegate());
        basicSubnetDetails = element.instance.subnetBasicDetails;
      }
    );

    let data: IAddSubnetRequest = {
      name: basicSubnetDetails.name,
      mask_bits: basicSubnetDetails.netsize,
      network_address: basicSubnetDetails.network,
      subnet_detail_json: this.subnets,
    };
    this.loading = true;
    if(!this.isEditing){
      this.service.addSubnet(ADD_SUBNET, data).subscribe({
        next: (val) => {
          this.loading = false;
          this.router.navigate(['pages', 'my-ipam']);
        },
        error: (e: HttpErrorResponse) => {
          this.toastr.error(e.message, 'Error');
          this.loading = false;
        },
      });
    } else{
      this.service.editSubnet(`${ADD_SUBNET}${this.currentSubnetGrpID}`, data).subscribe({
        next: (val) => {
          this.loading = false;
          this.toastr.success(val.message)
          this.router.navigate(['pages', 'my-ipam']);
        },
        error: (e: HttpErrorResponse) => {
          this.toastr.error(e.message, 'Error');
          this.loading = false;
        },
      });
    }

  }

  ngDestroy() {
    if (this.subnetSubscriptions.length) {
      this.subnetSubscriptions.forEach((subscription: Subscription, indx) => {
        subscription.unsubscribe();
      });
    }
  }
}
