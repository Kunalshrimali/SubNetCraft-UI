import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as API_CONSTANTS from '../constants/api-endpoints.constants';
import { ApiService } from './api.service';
import { IResponse } from '../interface/common.interface';
import { map, Observable } from 'rxjs';
import { RequestIP } from './../interface/request-ip';
@Injectable({
  providedIn: 'root',
})
export class SubnetService {
  constructor(private api: ApiService) {}

  getAll(): Observable<IResponse> {
    return this.api
      .get(API_CONSTANTS.GET_ALL_SUBNETS)
      .pipe(map((res) => <IResponse>res.body));
  }

  requestNewIP(url: string, data: any, options?: any): Observable<IResponse> {
    return this.api.post(url, data, options).pipe(map((res) => <IResponse>res.body));;
  }

  addSubnet(url: string, data: any, options?: any) {
    return this.api.post(url, data, options);
  }

  getAllSummarizedSubnets(): Observable<IResponse> {
    return this.api
      .get(API_CONSTANTS.GET_ALL_SUMMARIZED_SUBNETS)
      .pipe(map((res) => <IResponse>res.body));
  }

  getByID(id:string){
    return this.api
      .get(`${API_CONSTANTS.GET_ALL_SUBNETS}/${id}`)

  }

  removeSubnet(id:string){
    return this.api.post(`${API_CONSTANTS.REMOVE_SUBNET}/${id}`, {},);
  }

  editSubnet(url: string, data: any, options?: any) {
    return this.api.put(url, data, options).pipe(map((res) => <IResponse>res.body));;
  }
}
