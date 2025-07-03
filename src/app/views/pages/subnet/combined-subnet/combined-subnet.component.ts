import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ContainerComponent,
} from '@coreui/angular';
import { AdvancedSubnetGridComponent } from './../advanced-subnet-grid/advanced-subnet-grid.component';
import { BasicSubnetComponent } from './../basic-subnet/basic-subnet.component';
import { IBaseSubnet, IEditSubnetRequest } from '../../../../interface/subnet.interface';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-combined-subnet',
  standalone: true,
  imports: [
    BasicSubnetComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    AdvancedSubnetGridComponent,
    ContainerComponent,
    ButtonDirective,
  ],
  templateUrl: './combined-subnet.component.html',
  styleUrl: './combined-subnet.component.scss',
})
export class CombinedSubnetComponent {
  subnetBasicDetails: IBaseSubnet = {
    name: '',
    network: '10.0.0.0',
    netsize: 16,
  };

  @Input() isDefault = false;
  @Input() componentID:number = 0;
  removeComponent = new Subject();
  @Output() onSaveSubnets = new EventEmitter();
  @ViewChild('advancedSubnet') advancedSubnet!: AdvancedSubnetGridComponent;
  @Output()
  set onBasicSubnetDetailsSubmitted(value: IBaseSubnet) {
    this.subnetBasicDetails = value;
  }
  @Input() subnetGrp: any ;
  @Input() isEditing:boolean ;
  @Input() existingBasicDetails:IBaseSubnet =  {
    name: '',
    network: '10.0.0.0',
    netsize: 16,
  };
  constructor(){
    this.subnetGrp = null;
    this.isEditing = false;
  }
  outResetClicked() {
    this.subnetBasicDetails = {
      name: '',
      network: '10.0.0.0',
      netsize: 16,
    };
  }
  onRemoveComponent(event:number){
    this.removeComponent.next('removed');
  }

  delegate(){
    return this.advancedSubnet.exportConfig();
  }

  ngOnChanges(changes: SimpleChanges) {
  }
}
