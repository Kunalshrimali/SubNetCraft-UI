import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonCloseDirective, ButtonDirective, ModalComponent, ModalModule, InputGroupComponent, RowComponent, ColComponent, GutterDirective, FormFloatingDirective, FormLabelDirective, FormDirective, FormControlDirective, FormSelectDirective, CardModule, FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective, AccordionComponent, AccordionItemComponent, TemplateIdDirective, AccordionButtonDirective } from '@coreui/angular';
import { getStyle } from '@coreui/utils';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { IBaseSubnet, IEditSubnetRequest } from 'src/app/interface/subnet.interface';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable'

type subnetAdditionalFields = {
  VLAN:number,
  VRF:string,
  site:string,
  device: string,
  gateway: string,
  routable: boolean,
  masterSubnet: string,
  subnetLocation: string,
  businessUnit: string,
  notes: string,
}
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-advanced-subnet-grid',
  standalone: true,
  imports: [
  CommonModule,
	ModalModule,
	ButtonDirective,
	ButtonCloseDirective,
	ReactiveFormsModule,
	InputGroupComponent,
	RowComponent,
	ColComponent,
	GutterDirective,
	FormFloatingDirective,
	FormLabelDirective,
	FormDirective,
	FormControlDirective,
	FormSelectDirective,
  CardModule,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  AccordionComponent,
  AccordionItemComponent,
  TemplateIdDirective,
  AccordionButtonDirective,
  FontAwesomeModule
  ],
  templateUrl: './advanced-subnet-grid.component.html',
  styleUrl: './advanced-subnet-grid.component.scss',
})
export class AdvancedSubnetGridComponent {
  private subnetMap: any = {};
  subnetNotes: any = {};
  maxNetSize: number = 0;
  infoColumnCount = 5;
  readonly faFileExport = faFileExport;
  // NORMAL mode:
  //   - Smallest subnet: /32
  //   - Two reserved addresses per subnet of size <= 30:
  //     - Network Address (network + 0)
  //     - Broadcast Address (last network address)
  // AWS mode (future):
  //   - Smallest subnet: /28
  //   - Two reserved addresses per subnet:
  //     - Network Address (network + 0)
  //     - AWS Reserved - VPC Router
  //     - AWS Reserved - VPC DNS
  //     - AWS Reserved - Future Use
  //     - Broadcast Address (last network address)
  operatingMode = 'NORMAL';
  noteTimeout = 0;
  minSubnetSize = 32;
  inflightColor = 'NONE';
  urlVersion = '1';
  configVersion = '1';
  currentColor = '';
  @Input() subnetBasicDetails: IBaseSubnet = {
	name: '',
	netsize: 16,
	network: '10.0.0.0',
  };

  colorPaletteVisibility = false;
  @ViewChild('calcbody')
  calcbody!: ElementRef;
  @ViewChild('editSubnetRow')
  editSubnetRow!: ModalComponent;
  currentRow:any;
  advancedFormFields!: FormGroup;
  currentSelectedRowAttr:string | null | undefined = '';
  @Input() componentID = 0;
  @Input() subnetGrp: IEditSubnetRequest | null;
  isEditing: boolean;

  options = [
    // { key: '_subnet', displayValue: 'Subnet Address', checked: true, headerKey:'subnet'},
    // {
    //   key: '_range',
    //   displayValue: 'Range Of Addresses',
    //   checked: true,
    //   headerKey:'range'
    // },
    // { key: '_useable', displayValue: 'Useable IPS', checked: true,headerKey:'useable' },
    // { key: '_hosts', displayValue: 'Hosts', checked: true,headerKey:'hosts' },
    // { key: 'divide', displayValue: 'Divide', checked: false },
    // { key: 'join', displayValue: 'Join', checked: false },

    { headerKey:'vlan',key: '_vlan', displayValue: 'VLAN', checked: true, },
    { key: '_vrf', displayValue: 'VRF', checked: true,headerKey:'vrf' },
    { key: '_site', displayValue: 'Site', checked: true,headerKey:'site' },
    { key: '_device', displayValue: 'Device', checked: true,headerKey:'device' },
    { key: '_gateway', displayValue: 'Gateway', checked: true,headerKey:'gateway' },
    { key: '_routable', displayValue: 'Routable', checked: true,headerKey:'routable' },
    { key: '_masterSubnet', displayValue: 'Master Subnet', checked: true,headerKey:'masterSubnet' },
    { key: '_subnetLocation', displayValue: 'Subnet Location', checked: true,headerKey:'subnetLocation' },
    { key: '_businessUnit', displayValue: 'Business Unit', checked: true,headerKey:'businessUnit' },
    // { key: 'note', displayValue: 'Note', checked: false },
  ];
  optionArrIndx!: number;
  constructor(private el: ElementRef,
			  private renderer: Renderer2,
			  private formBuilder:FormBuilder) {
		this.subnetGrp = null;
    this.isEditing = false;
	 //TODO: Validations for fields
	 this.advancedFormFields = this.formBuilder.group({
	  VLAN: ['', Validators.required],
	  VRF: ['', [Validators.required]],
	  site: ['', [Validators.required]],
	  device: ['', [Validators.required]],
	  gateway: ['', [Validators.required]],
	  routable: [false, [Validators.required]],
	  masterSubnet: [{ disabled: true}, [Validators.required]],
	  subnetLocation: ['', [Validators.required]],
	  businessUnit: ['', [Validators.required]],
	  note: ['', [Validators.required]],
	  });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.reset();
    const calcbody = this.el.nativeElement.querySelector('#calcbody');
    this.renderer.listen(calcbody, 'click', this.attachEvents.bind(this));
    this.editSubnetRow.visible = false;

  }

  onClickedEdit(event: MouseEvent) {}

  attachEvents(event: MouseEvent) {
    let originalElement = event.target as HTMLElement;
    let clickedElement: HTMLElement;

    if (
      originalElement.parentElement &&
      originalElement.parentElement.tagName.toLowerCase() == 'td'
    ) {
      clickedElement = originalElement.parentElement;
      this.clickedForOperation(clickedElement);
    }

    if (originalElement.tagName.toLowerCase() == 'td') {
      clickedElement = originalElement;
      this.clickedForOperation(clickedElement);
    }

    /* ------------------------- Input additional fields ------------------------ */
    if (
      (originalElement.tagName.toLowerCase() == 'button' &&
      originalElement.classList.contains('edt-subnet')) ||
      (originalElement.tagName.toLowerCase() == 'td' &&
      originalElement.className == 'cstm_edit')
    ) {
      // this.advancedFormFields.reset();
        this.editSubnetRow.visible = true;
        if(originalElement.closest('tr')){
          if(originalElement.closest('tr')?.getAttribute('data-subnet')){
          this.currentSelectedRowAttr = originalElement.closest('tr')?.getAttribute('data-subnet');
          }
        }
      }
  }

  clickedForOperation(clickedElement: HTMLElement) {
    if (clickedElement) {
      const dataset: DOMStringMap = clickedElement.dataset;
      if (dataset['subnet']) {
      if (
        clickedElement.classList.contains('split') ||
        clickedElement.classList.contains('join')
      ) {
          // Assuming you have a method to render the table
          if (dataset['mutateVerb']) {
          this.mutate_subnet_map(
            dataset['mutateVerb'],
            dataset['subnet'],
            ''
          );
          this.renderTable();
          }
        } else {
          if (this.inflightColor !== 'NONE') {
          this.mutate_subnet_map(
            'color',
            dataset['subnet'],
            '',
            this.inflightColor
          );
          this.renderer.setStyle(
            clickedElement.closest('tr'),
            'background-color',
            this.inflightColor
          );
          }
        }
      }
    }
  }

  mutate_subnet_map(
	verb: string,
	network: string,
	subnetTree: any,
	propValue?: subnetAdditionalFields | any
  ) {
    if (subnetTree === '') {
      subnetTree = this.subnetMap;
    }
    for (let mapKey in subnetTree) {
      if (mapKey.startsWith('_')) {
      continue;
      }
      if (this.has_network_sub_keys(subnetTree[mapKey])) {
      this.mutate_subnet_map(verb, network, subnetTree[mapKey], propValue);
      }

      if (mapKey === network) {
      let netSplit = mapKey.split('/');
      let netSize = parseInt(netSplit[1]);
      if (verb === 'split') {
        if (netSize < this.minSubnetSize) {
          let new_networks = this.split_network(netSplit[0], netSize)
          // Could maybe optimize this for readability with some null coalescing
          subnetTree[mapKey][new_networks[0]] = {}
          subnetTree[mapKey][new_networks[1]] = {}
          // Options:
          //   [ Selected ] Copy note to both children and delete parent note
          //   [ Possible ] Blank out the new and old subnet notes
          if (subnetTree[mapKey].hasOwnProperty('_note')) {
            subnetTree[mapKey][new_networks[0]]['_note'] = subnetTree[mapKey]['_note']
            subnetTree[mapKey][new_networks[1]]['_note'] = subnetTree[mapKey]['_note']
          }
          delete subnetTree[mapKey]['_note'];

          if (subnetTree[mapKey].hasOwnProperty('_color')) {
            subnetTree[mapKey][new_networks[0]]['_color'] = subnetTree[mapKey]['_color']
            subnetTree[mapKey][new_networks[1]]['_color'] = subnetTree[mapKey]['_color']
          }
          delete subnetTree[mapKey]['_color'];

          if (subnetTree[mapKey].hasOwnProperty('_vlan')) {
            subnetTree[mapKey][new_networks[0]]['_vlan'] = subnetTree[mapKey]['_vlan']
            subnetTree[mapKey][new_networks[1]]['_vlan'] = subnetTree[mapKey]['_vlan']
          }
          delete subnetTree[mapKey]['_vlan']

          if (subnetTree[mapKey].hasOwnProperty('_vrf')) {
            subnetTree[mapKey][new_networks[0]]['_vrf'] = subnetTree[mapKey]['_vrf']
            subnetTree[mapKey][new_networks[1]]['_vrf'] = subnetTree[mapKey]['_vrf']
          }
          delete subnetTree[mapKey]['_vrf'];

          if (subnetTree[mapKey].hasOwnProperty('_site')) {
            subnetTree[mapKey][new_networks[0]]['_site'] = subnetTree[mapKey]['_site']
            subnetTree[mapKey][new_networks[1]]['_site'] = subnetTree[mapKey]['_site']
          }
          delete subnetTree[mapKey]['_site'];

          if (subnetTree[mapKey].hasOwnProperty('_device')) {
            subnetTree[mapKey][new_networks[0]]['_device'] = subnetTree[mapKey]['_device']
            subnetTree[mapKey][new_networks[1]]['_device'] = subnetTree[mapKey]['_device']
          }
          delete subnetTree[mapKey]['_device'];

          if (subnetTree[mapKey].hasOwnProperty('_gateway')) {
            subnetTree[mapKey][new_networks[0]]['_gateway'] = subnetTree[mapKey]['_gateway']
            subnetTree[mapKey][new_networks[1]]['_gateway'] = subnetTree[mapKey]['_gateway']
          }
          delete subnetTree[mapKey]['_gateway'];

          if (subnetTree[mapKey].hasOwnProperty('_routable')) {
            subnetTree[mapKey][new_networks[0]]['_routable'] = subnetTree[mapKey]['_routable']
            subnetTree[mapKey][new_networks[1]]['_routable'] = subnetTree[mapKey]['_routable']
          }
          delete subnetTree[mapKey]['_routable'];

          if (subnetTree[mapKey].hasOwnProperty('_masterSubnet')) {
            subnetTree[mapKey][new_networks[0]]['_masterSubnet'] = subnetTree[mapKey]['_masterSubnet']
            subnetTree[mapKey][new_networks[1]]['_masterSubnet'] = subnetTree[mapKey]['_masterSubnet']
          }
          delete subnetTree[mapKey]['_masterSubnet'];

          if (subnetTree[mapKey].hasOwnProperty('_subnetLocation')) {
            subnetTree[mapKey][new_networks[0]]['_subnetLocation'] = subnetTree[mapKey]['_subnetLocation']
            subnetTree[mapKey][new_networks[1]]['_subnetLocation'] = subnetTree[mapKey]['_subnetLocation']
          }
          delete subnetTree[mapKey]['_subnetLocation'];

          if (subnetTree[mapKey].hasOwnProperty('_businessUnit')) {
            subnetTree[mapKey][new_networks[0]]['_businessUnit'] = subnetTree[mapKey]['_businessUnit']
            subnetTree[mapKey][new_networks[1]]['_businessUnit'] = subnetTree[mapKey]['_businessUnit']
          }
          delete subnetTree[mapKey]['_businessUnit'];
        }
      } else if (verb === 'join') {
        // Options:
        //   [ Selected ] Keep note if all the notes are the same, blank them out if they differ. Most intuitive
        //   [ Possible ] Lose note data for all deleted subnets.
        //   [ Possible ] Keep note from first subnet in the join scope. Reasonable but I think rarely will the note be kept by the user
        //   [ Possible ] Concatenate all notes. Ugly and won't really be useful for more than two subnets being joined
        subnetTree[mapKey] = {
        _note: this.get_consolidated_property(subnetTree[mapKey], '_note'),
        _color: this.get_consolidated_property(
          subnetTree[mapKey],
          '_color'
        ),
        _vlan: this.get_consolidated_property(
          subnetTree[mapKey],
          '_vlan'
        ),
        _vrf: this.get_consolidated_property(
          subnetTree[mapKey],
          '_vrf'
        ),
        _site: this.get_consolidated_property(
          subnetTree[mapKey],
          '_site'
        ),
        _device: this.get_consolidated_property(
          subnetTree[mapKey],
          '_device'
        ),
        _gateway: this.get_consolidated_property(
          subnetTree[mapKey],
          '_gateway'
        ),
        _routable: this.get_consolidated_property(
          subnetTree[mapKey],
          '_routable'
        ),
        _masterSubnet: this.get_consolidated_property(
          subnetTree[mapKey],
          '_masterSubnet'
        ),
        _subnetLocation: this.get_consolidated_property(
          subnetTree[mapKey],
          '_subnetLocation'
        ),
        _businessUnit: this.get_consolidated_property(
          subnetTree[mapKey],
          '_businessUnit'
        )
        };
      } else if (verb === 'color') {
        subnetTree[mapKey]['_color'] = propValue;
      } else {
        subnetTree[mapKey]['_vlan'] = propValue.VLAN;
        subnetTree[mapKey]['_vrf'] = propValue.VRF;
        subnetTree[mapKey]['_site'] = propValue.site;
        subnetTree[mapKey]['_device'] = propValue.device;
        subnetTree[mapKey]['_gateway'] = propValue.gateway;
        subnetTree[mapKey]['_routable'] = propValue.routable;
        subnetTree[mapKey]['_masterSubnet'] = propValue.masterSubnet;
        subnetTree[mapKey]['_subnetLocation'] = propValue.subnetLocation;
        subnetTree[mapKey]['_businessUnit'] = propValue.businessUnit;
        subnetTree[mapKey]['_note'] = propValue.note;

        // How did you get here?
      }
      }
    }
  }
  ngOnChanges(changes: SimpleChanges) {

    if (
      changes['subnetBasicDetails'] &&
      !changes['subnetBasicDetails'].firstChange
    ) {
      this.reset();
    }

    if(changes['subnetGrp'] && changes['subnetGrp'].currentValue){
      this.subnetMap = changes['subnetGrp'].currentValue;
      this.isEditing = true;
      // this.renderTable();
    }

  }

  reset() {
    if (this.operatingMode === 'AWS') {
      this.minSubnetSize = 28;
    } else {
      this.minSubnetSize = 32;
    }
    let cidrInput =
      this.subnetBasicDetails?.network + '/' + this.subnetBasicDetails?.netsize;
    let rootNetwork = this.get_network(
      this.subnetBasicDetails.network,
      this.subnetBasicDetails.netsize
    );
    let rootCidr = rootNetwork + '/' + this.subnetBasicDetails?.netsize;
    if (cidrInput !== rootCidr) {
      // show_warning_modal('<div>Your network input is not on a network boundary for this network size. It has been automatically changed:</div><div class="font-monospace pt-2">' + $('#network').val() + ' -> ' + rootNetwork + '</div>')
    }
    if(!this.isEditing) {
      this.subnetMap = {};
      this.subnetMap[rootCidr] = {};
    }

    this.maxNetSize = this.subnetBasicDetails?.netsize;
    this.renderTable();
  }

  renderTable() {
    this.calcbody.nativeElement.innerHTML = '';
    let maxDepth = this.get_dict_max_depth(this.subnetMap, 0);

    this.addRowTree(this.subnetMap, 0, maxDepth);
	// const edtSubnet = this.el.nativeElement.querySelector('.edt-subnet');
	// this.renderer.listen(edtSubnet, 'click', this.onClickedEdit.bind(this));
  }

  get_dict_max_depth(dict: any, curDepth: number) {
    let maxDepth = curDepth;
    for (let mapKey in dict) {
      if (mapKey.startsWith('_')) {
      continue;
      }
      let newDepth = this.get_dict_max_depth(dict[mapKey], curDepth + 1);
      if (newDepth > maxDepth) {
      maxDepth = newDepth;
      }
    }
	  return maxDepth;
  }

  addRowTree(subnetTree: any, depth: number, maxDepth: number) {
    for (let mapKey in subnetTree) {
      if (mapKey.startsWith('_')) {
        continue;
      }
      if (this.has_network_sub_keys(subnetTree[mapKey])) {
        this.addRowTree(subnetTree[mapKey], depth + 1, maxDepth);
        } else {
        let subnet_split = mapKey.split('/');
        let notesWidth = '30%';
        if (maxDepth > 5 && maxDepth <= 10) {
          notesWidth = '25%';
        } else if (maxDepth > 10 && maxDepth <= 15) {
          notesWidth = '20%';
        } else if (maxDepth > 15 && maxDepth <= 20) {
          notesWidth = '15%';
        } else if (maxDepth > 20) {
          notesWidth = '10%';
        }

        this.addRow(
          subnet_split[0],
          parseInt(subnet_split[1]),
          (this.infoColumnCount + maxDepth - depth),
          (subnetTree[mapKey] || ''),
          notesWidth,
          (subnetTree[mapKey]['_color'] || '')
        );
      }
    }
  }

  addRow(
	network: string,
	netSize: number,
	colspan: number,
	props:any,
	notesWidth: string,
	color: string
  ) {
    let addressFirst: number = this.ip2int(network);
    let addressLast = this.subnet_last_address(addressFirst, netSize);
    let usableFirst = this.subnet_usable_first(
      addressFirst,
      netSize,
      this.operatingMode
    );
    let usableLast = this.subnet_usable_last(addressFirst, netSize);
    let hostCount = 1 + usableLast - usableFirst;
    let styleTag = '';
    if (color !== '') {
      styleTag = ' style="background-color: ' + color + '"';
    }

    let rangeCol, usableCol;
    if (netSize < 32) {
      rangeCol = this.int2ip(addressFirst) + ' - ' + this.int2ip(addressLast);
      usableCol = this.int2ip(usableFirst) + ' - ' + this.int2ip(usableLast);
    } else {
      rangeCol = this.int2ip(addressFirst);
      usableCol = this.int2ip(usableFirst);
    }

    let newRow = '';
    // props['_subnet']= network + '/' + netSize ;
    // props['_range']=rangeCol;
    // props['_useable']=usableCol ;
    // props['_hosts']=hostCount  ;
    props['_vlan'] =  props['_vlan'] || '';
    props['_vrf'] = props['_vrf'] || '';
    props['_site'] = props['_site'] || '';
    props['_device'] = props['_device'] || '';
    props['_gateway'] = props['_gateway'] || '';
    props['_routable'] = props['_routable'] == undefined ? false : props['_routable'];
    props['_masterSubnet'] = props['_masterSubnet'] || '';
    props['_subnetLocation'] = props['_subnetLocation'] || '';
    props['_businessUnit'] = props['_businessUnit'] || '';
    props['_note'] = props['_note'] || '';

    newRow +='                <td data-subnet="' + network + '/' + netSize + '" class="cstm_edit"><button class="btn btn-info edt-subnet text-white"><i class="fa fa-pencil"></i></button></td>\n'+
		'                <td data-subnet="' + network + '/' + netSize + '" class="common_row">' + network + '/' + netSize + '</td>\n' +
		'                <td data-subnet="' + network + '/' + netSize + '" class="common_row">' + rangeCol + '</td>\n' +
		'                <td data-subnet="' + network + '/' + netSize + '" class="common_row">' + usableCol + '</td>\n' +
		'                <td data-subnet="' + network + '/' + netSize + '" class="common_row">' + hostCount + '</td>\n'

    this.options.forEach(option=>{
      if(option.checked){
           newRow +='<td data-subnet="' + network + '/' + netSize + '" class="common_row">' + props[option.key] || '' + '</td>\n'
      }
    })

    newRow +=  '<td class="note" style="width:' + notesWidth + '">'+ props._note +'</td>\n' +
		'                <td rowspan="1" colspan="' + colspan + '" class="split rotate" data-subnet="' + network + '/' + netSize + '" data-mutate-verb="split"><span>/' + netSize + '</span></td>\n'

    if (netSize > this.maxNetSize) {
      // This is wrong. Need to figure out a way to get the number of children so you can set rowspan and the number
      // of ancestors so you can set colspan.
      // DONE: If the subnet address (without the mask) matches a larger subnet address
      // in the heirarchy that is a signal to add more join buttons to that row, since they start at the top row and
      // via rowspan extend downward.
      let matchingNetworkList = this.get_matching_network_list(
      network,
      this.subnetMap
      ).slice(1);
      for (const i in matchingNetworkList) {
      let matchingNetwork = matchingNetworkList[i];
      let networkChildrenCount = this.count_network_children(
        matchingNetwork,
        this.subnetMap,
        []
      );
      newRow +=
        '                <td rowspan="' +
        networkChildrenCount +
        '" colspan="1" class="join rotate headcol " data-subnet="' +
        matchingNetwork +
        '" data-mutate-verb="join"><span>/' +
        matchingNetwork.split('/')[1] +
        '</span></td>\n';
      }
    }

    let newRow1 = this.renderer.createElement('tr');
    this.renderer.setProperty(
      newRow1,
      'id',
      `row_${network.replace('.', '-')}_${netSize}`
    );
    this.renderer.setStyle(newRow1, 'background-color', color);
    this.renderer.setProperty(newRow1, 'innerHTML', newRow);
    this.renderer.setAttribute(newRow1,'data-subnet',`${network}/${netSize}`)
    this.renderer.appendChild(this.calcbody.nativeElement, newRow1);
  }

  get_matching_network_list(network: string, subnetTree: any) {
    let subnetList = [];
    for (let mapKey in subnetTree) {
      if (mapKey.startsWith('_')) {
      continue;
      }
      if (this.has_network_sub_keys(subnetTree[mapKey])) {
      subnetList.push.apply(
        subnetList,
        this.get_matching_network_list(network, subnetTree[mapKey])
      );
      }
      if (mapKey.split('/')[0] === network) {
      subnetList.push(mapKey);
      }
    }
    return subnetList;
  }

  has_network_sub_keys(dict: {}) {
    let allKeys = Object.keys(dict);
    // Maybe an efficient way to do this with a Lambda?
    for (let i in allKeys) {
      if (!allKeys[i].startsWith('_')) {
      return true;
      }
    }
    return false;
  }

  /* -------------------------------- Utilities ------------------------------- */
  get_network(networkInput: string, netSize: number) {
    let ipInt = this.ip2int(networkInput);
    for (let i = 31 - netSize; i >= 0; i--) {
      ipInt &= ~1 << i;
    }
    return this.int2ip(ipInt);
  }

  ip2int(ip: string): number {
    return (
      ip.split('.').reduce((ipInt, octet) => {
      return (ipInt << 8) + parseInt(octet, 10);
      }, 0) >>> 0
    );
  }

  int2ip(ipInt: number) {
    return (
      (ipInt >>> 24) +
      '.' +
      ((ipInt >> 16) & 255) +
      '.' +
      ((ipInt >> 8) & 255) +
      '.' +
      (ipInt & 255)
    );
  }

  subnet_last_address(subnet: number, netSize: number) {
	  return subnet + this.subnet_addresses(netSize) - 1;
  }

  subnet_addresses(netSize: number) {
	  return 2 ** (32 - netSize);
  }

  subnet_usable_first(network: number, netSize: number, operatingMode: string) {
    if (netSize < 31) {
      // https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html
      // AWS reserves 3 additional IPs
      return network + (operatingMode === 'AWS' ? 4 : 1);
    } else {
      return network;
    }
  }

  subnet_usable_last(network: number, netSize: number) {
    let last_address = this.subnet_last_address(network, netSize);
    if (netSize < 31) {
      return last_address - 1;
    } else {
      return last_address;
    }
  }

  count_network_children(
	network: string,
	subnetTree: any,
	ancestryList: any[]
    ) {
    // TODO: This might be able to be optimized. Ultimately it needs to count the number of keys underneath
    // the current key are unsplit networks (IE rows in the table, IE keys with a value of {}).
    let childCount = 0;
    for (let mapKey in subnetTree) {
      if (mapKey.startsWith('_')) {
      continue;
      }
      if (this.has_network_sub_keys(subnetTree[mapKey])) {
      childCount += this.count_network_children(
        network,
        subnetTree[mapKey],
        ancestryList.concat([mapKey])
      );
      } else {
      if (ancestryList.includes(network)) {
        childCount += 1;
      }
      }
    }
	  return childCount;
  }

  split_network(networkInput: string, netSize: number) {
    let subnets = [networkInput + '/' + (netSize + 1)];
    let newSubnet = this.ip2int(networkInput) + 2 ** (32 - netSize - 1);
    subnets.push(this.int2ip(newSubnet) + '/' + (netSize + 1));
    return subnets;
  }

  get_consolidated_property(subnetTree: any, property: string) {
    let allValues = this.get_property_values(subnetTree, property);
    // https://stackoverflow.com/questions/14832603/check-if-all-values-of-array-are-equal
    let allValuesMatch = allValues.every((val, i, arr) => val === arr[0]);
    if (allValuesMatch) {
      return allValues[0];
    } else {
      return '';
    }
  }

  get_property_values(subnetTree: any, property: string) {
    let propValues = [];
    for (let mapKey in subnetTree) {
      if (this.has_network_sub_keys(subnetTree[mapKey])) {
      propValues.push.apply(
        propValues,
        this.get_property_values(subnetTree[mapKey], property)
      );
      } else {
      // The "else" above is a bit different because it will start tracking values for subnets which are
      // in the hierarchy, but not displayed. Those are always blank so it messes up the value list
      propValues.push(subnetTree[mapKey][property] || '');
      }
    }
	  return propValues;
  }

  rgba2hex(rgba: any) {
    return `#${rgba
      .match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/)
      .slice(1)
      .map((n: string, i: number) =>
      (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n))
        .toString(16)
        .padStart(2, '0')
        .replace('NaN', '')
      )
      .join('')}`;
  }

  pickedColor(color: HTMLElement) {
    try {
      this.inflightColor = this.rgba2hex(getStyle('background-color', color));
    } catch (error) {
      console.log(error, 'Something went wrong');
    }
  }

  stopChangingColor() {
    this.colorPaletteVisibility = !this.colorPaletteVisibility;
    this.inflightColor = 'NONE';
  }

  onSubmitted(){
	if(this.currentSelectedRowAttr){
	  this.mutate_subnet_map('create', this.currentSelectedRowAttr, '', this.advancedFormFields.getRawValue() as subnetAdditionalFields)
	  this.renderTable();
	  this.editSubnetRow.visible = false;
	}
  }

  exportConfig() {
    return {
      [`${this.subnetBasicDetails.name}`]: this.subnetMap,
    }
  }

  optionChanged(checked:boolean,option:string,optionArrIndx:number){

    this.options[optionArrIndx].checked = checked;
    let tableHeader = this.el.nativeElement.querySelector(`#${this.options[optionArrIndx].headerKey}Header`);
    this.optionArrIndx = optionArrIndx;
    if(tableHeader){
      if(checked) this.renderer.setStyle(tableHeader,'display','table-cell')
      else this.renderer.setStyle(tableHeader,'display','none');
      this.renderTable();
    }

  }

  exportCurrentSubnet(){
    const doc = new jsPDF();
    const calcbody = this.el.nativeElement.querySelector('#calc');
    const clonedTable = calcbody.cloneNode(true) as HTMLElement;

    this.removeFirstAndLastColumn(clonedTable);

    // Create a div element with h1 and p tags for current date and time
    const divToAdd = document.createElement('div');
    const currentDate = new Date();
    divToAdd.classList.add('p-3')
    divToAdd.innerHTML = `
      <h1>Report Title</h1>
      <p>Generated on: ${currentDate.toLocaleString()}</p>
     `;
    divToAdd.appendChild(clonedTable)
     // Append the created div to the body or any container you want
    document.body.appendChild(divToAdd);
    // Use html2canvas to capture the updated content
    html2canvas(calcbody,{ scrollX: -window.scrollX, scale: 2}).then(canvas => {
       // Remove the dynamically added div after capturing the canvas
      document.body.removeChild(divToAdd);
      // Few necessary setting options
      let imgWidth = 208;
      let imgHeight = canvas.height * imgWidth / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png')
      let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
      let position = 0;

      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
      pdf.save('html2canas.pdf'); // Generated PDF
    });

  }

  private removeFirstAndLastColumn(table: HTMLElement) {
    const rows = Array.from(table.querySelectorAll('tr'));
    rows.forEach(row => {
      if(row.firstElementChild) row.removeChild(row.firstElementChild); // Remove first column
      if(row.lastElementChild) row.removeChild(row.lastElementChild);
    });
  }

}
