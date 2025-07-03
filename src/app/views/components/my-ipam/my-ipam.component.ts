import { Component } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress/work-in-progress.component';
import {
  ButtonCloseDirective,
  ButtonDirective,
  CardModule,
  ColComponent,
  ContainerComponent,
  ModalComponent,
  ModalModule,
  RowComponent,
  ToasterService,
  TooltipDirective,
} from '@coreui/angular';
import { Router, RouterModule } from '@angular/router';
import { IMyIPAM } from '../../../interface/my-ipam.interface';
import { of, Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { SubnetService } from 'src/app/services/subnet.service';
import { ISubnetResponse } from 'src/app/interface/subnet.interface';
import { faFileExport, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as GLOBAL_STRING_CONSTS from '../../../constants/glob-strings';
import { ToastrService } from 'ngx-toastr';
import { IErrorResponse } from 'src/app/interface/common.interface';

@Component({
  selector: 'app-my-ipam',
  standalone: true,
  imports: [
    WorkInProgressComponent,
    CardModule,
    ButtonDirective,
    RouterModule,
    CommonModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    IconDirective,
    TooltipDirective,
    RouterModule,
    FontAwesomeModule,
    ModalModule,
    ButtonCloseDirective
  ],
  templateUrl: './my-ipam.component.html',
  styleUrl: './my-ipam.component.scss',
})
export class MyIpamComponent {
  readonly faTrashCan = faTrashCan;
  readonly faFileExport = faFileExport;
  readonly GLOBAL_STRING_CONSTS = GLOBAL_STRING_CONSTS;

  [x: string]: any;
  data$!: Observable<ISubnetResponse[]>;
  currentSubnetGrp!:any
  constructor(private router: Router, private subnetService: SubnetService, private toastr:ToastrService) {
    this.data$ = this.getData().pipe(
      map((value) => value.data as ISubnetResponse[])
    );
  }

  getData() {
    return this.subnetService.getAll();
  }

  removeSubnet(modal:ModalComponent){
    this.subnetService.removeSubnet(this.currentSubnetGrp._id).subscribe({
      next:(res)=>{
        modal.visible = false;
        this.toastr.success(GLOBAL_STRING_CONSTS.DELETE_SUBNET_SUCCESSFULLY, 'Success');

        this.data$ = this.getData().pipe(
          map((value) => value.data as ISubnetResponse[])
        );
      },
      error:(err:IErrorResponse)=>{
        this.toastr.error(err.error.message, 'Error');
        modal.visible = false;
      }
    })
  }

  delegateRemoval(modal:ModalComponent,myipam:any){
    modal.visible = true;
    this.currentSubnetGrp = myipam;
    // this.removeSubnet(modal);
  }
}
