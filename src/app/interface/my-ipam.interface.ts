export interface IMyIPAM {
  title: string;
  network: string;
  actions:{
    view?:boolean,
    edit?:boolean,
    delete?:boolean
  }
}
