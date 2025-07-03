export interface ISubnetResponse extends IAddSubnetRequest {
  _id: string;
}

export interface IBaseSubnet {
  name: string;
  network: string;
  netsize: number;
}
export interface ISubnet {
  name: string;
  id: number;
}

export interface ISubnetGrp {
  name: string;
  network_address: string;
  mask_bits: number;
  subnet_detail_json: JSON[];
}
export interface IAddSubnetRequest extends ISubnetGrp {}

export interface IEditSubnetRequest extends ISubnetGrp {}
