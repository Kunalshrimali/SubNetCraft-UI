import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = () => {
  return checkAuth();
};

function checkAuth(): boolean {
  if (AuthService.isLoggedIn()) {
    return false;
  } else {
    return true;
  }
}
