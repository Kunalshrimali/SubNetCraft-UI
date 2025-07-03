import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const isLoggedIn = AuthService.isLoggedIn();

    if (isLoggedIn) {
      // req = req.clone({
      //     setHeaders: {
      //       'Set-Cookie':`Authorization=${localStorage.getItem("accessToken")}`
      //     }
      // });
    }

    return next.handle(req);
  }
}
