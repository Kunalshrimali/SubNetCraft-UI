import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest, LoginResponse } from '../interface/login.interface';
import { map, Observable } from 'rxjs';
import { IResponse } from '../interface/common.interface';
import * as API_CONSTANTS from '../constants/api-endpoints.constants';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient, private api: ApiService) {}

  login(credentials: LoginRequest): Observable<IResponse> {
    return this.httpClient
      .post<IResponse>(API_CONSTANTS.LOGIN, credentials)
      .pipe(
        map((response) => {
          let data: LoginResponse = response.data as LoginResponse;
          localStorage.setItem('token', data.token_data.token);
          document.cookie = `Authorization=${data.token_data.token}`;
          return response;
        })
      );
  }

  // refreshToken(): Observable<LoginResponse> {
  //   const refreshToken = this.getRefreshTokenFromCookie();

  //   return this.httpClient
  //     .post<LoginResponse>(API_CONSTANTS.REFRESH_TOKEN, { refreshToken })
  //     .pipe(
  //       map((response) => {
  //         localStorage.setItem('accessToken', response.accessToken);
  //         // document.cookie = `refreshToken=${response.refreshToken}`;
  //         return response;
  //       })
  //     );
  // }

  // getRefreshTokenFromCookie(): string | null {
  //   const cookieString = document.cookie;
  //   const cookieArray = cookieString.split('; ');

  //   for (const cookie of cookieArray) {
  //     const [name, value] = cookie.split('=');

  //     if (name == 'refreshToken') {
  //       return value;
  //     }
  //   }

  //   return null;
  // }

  logout() {
    localStorage.removeItem('token');
    document.cookie = `Authorization=${null}`
  }

  public static isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  forgotPassword(email: Object): Observable<IResponse> {
    return this.httpClient
      .post<IResponse>(API_CONSTANTS.FORGOT_PASSWORD,email)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  checkIfEmailExistsInSystem(email: string) {
    return this.httpClient
      .post<any>(API_CONSTANTS.CHECK_IF_EMAIL_EXISTS, email)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}
