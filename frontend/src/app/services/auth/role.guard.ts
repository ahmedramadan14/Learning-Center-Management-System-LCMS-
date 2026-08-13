import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { AccessControlService, isDashboardResource } from './access-control.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate, CanActivateChild {
  constructor(
    private readonly auth: AuthService,
    private readonly access: AccessControlService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.authorize(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.authorize(childRoute);
  }

  private authorize(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.auth.isAuthenticated() || !this.access.currentRole) {
      this.auth.logout();
      return this.router.createUrlTree(['/login']);
    }

    const resource = route.data['resource'];
    if (!isDashboardResource(resource)) {
      return this.router.createUrlTree(['/dashboard']);
    }

    return this.access.canView(resource)
      ? true
      : this.router.createUrlTree(['/dashboard']);
  }
}
