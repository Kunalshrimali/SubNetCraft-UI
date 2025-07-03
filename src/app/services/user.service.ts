import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, Observable } from 'rxjs';
import { IResponse } from './../interface/common.interface';
import * as API_CONSTANTS from '../constants/api-endpoints.constants';
import { IUser, IUserRequest } from '../interface/user.interface';
import { DELETE } from './../constants/glob-strings';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private api: ApiService) {}

  getAll(searchTerm?: string, status?: string): Observable<IResponse> {
    let url = `${API_CONSTANTS.GET_ALL_USERS}`;
    let queries = {
      searchTerm: '',
      status: '',
    };
    url = `${API_CONSTANTS.GET_ALL_USERS}`;

    if (searchTerm) {
      queries.searchTerm = searchTerm;
    }

    if (status) {
      queries.status = status;
    }

    let queryString = this.constructQueryString(queries);

    if (queryString) {
       url = `${url}?${queryString}`;
    }

    return this.api.get(url).pipe(map((res) => <IResponse>res.body));
  }

  saveUser(user: IUserRequest) {
    let url = `${API_CONSTANTS.ADD_USER}`;
    return this.api.post(url, user).pipe(map((res) => <IResponse>res.body));
  }

  editUser(user: IUserRequest, userID: string) {
    let url = `${API_CONSTANTS.EDIT_USER}/${userID}`;
    return this.api.put(url, user).pipe(map((res) => <IResponse>res.body));
  }

  removeUser(userID: string) {
    let url = `${API_CONSTANTS.REMOVE_USER}/${userID}`;
    return this.api.post(url);
  }

  /* ---------------------------- UTILS --------------------------- */
  constructQueryString(params:any) {
    let queryString = Object.keys(params)
      .filter((key) => params[key] !== '') // Filter out blank values
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join('&');

    return queryString;
  }
}
