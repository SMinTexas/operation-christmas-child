import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if (error) {
          switch (error.status) {
            case 400:
              if (error.error.errors) {
                const modalStateErrors = [];
                for (const key in error.error.errors) {
                  if (error.error.errors[key]) {
                    modalStateErrors.push(error.error.errors[key])
                  }
                }
                throw modalStateErrors.flat();
                //console.log('ModalStateErrors = ', modalStateErrors.flat());
                //this.toastr.error(modalStateErrors.flat().toString());
              } else {
                //for some reason this is returning OK as the statusText
                if (error.statusText == "OK") error.statusText = "Bad Request"; //probably not right way to fix the problem
                this.router.navigateByUrl('/bad-request');
              }
              break;
            case 401:
              //returning OK as the statusText
              if (error.statusText == "OK") error.statusText = "Unauthorized";
              this.router.navigateByUrl('/unauthorized');
              break;
            case 404:
              this.router.navigateByUrl('/not-found');
              break;
            case 500:
              const navigationExtras: NavigationExtras = {state: {error: error.error}}
              this.router.navigateByUrl('/server-error', navigationExtras);
              break;
            default:
              this.toastr.error('I have a bad feeling about this');
              console.log('Default Case error: ', error);
              break;
          }
        }
        return throwError(error);
      })
    )
  }
}
