import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export function JwtInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const isLoggedIn = AuthService.isLoggedIn();
  if (isLoggedIn) {
    const authRequ = req.clone({
      setHeaders: {
        Cookie: 'Authorization=' + localStorage.getItem('token'),
      },
    });
    return next(authRequ);
  }
  return next(req);
}
