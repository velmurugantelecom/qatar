import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
  HttpHeaders
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { tap, catchError, retry } from "rxjs/operators";
import swal from 'sweetalert'
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";
import { AppService } from "./core/services/app.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
  serverError :any ;
  tryAgain :any ;
  tokenExpired : any;
  public invalidAutoDataCount = 0;
  public disableGlobalErrorHandler = false;
  constructor(
    public spinner: NgxSpinnerService,
    public router: Router,
    public appService: AppService,
    private translate: TranslateService
  ) { }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let token: string;
    let updatedRequest;
    if (
      localStorage.getItem("tokenDetails") &&
      localStorage.getItem("isLoggedIn") == "true"
    ) {
      token = localStorage.getItem("tokenDetails");
      let userId = localStorage.getItem('userId');
      if (req.url.includes('login/validatePassword')) {
        const headers = new HttpHeaders({
          Authorization: token,
          userId: userId
        });
        updatedRequest = req.clone({headers});
      } else {
        updatedRequest = req.clone({
          headers: req.headers.set("Authorization", token),
        });
      }
    } else if (
      localStorage.getItem("guesttokenDetails") &&
      localStorage.getItem("isLoggedIn") == "false"
    ) {
      token = localStorage.getItem("guesttokenDetails");
      updatedRequest = req.clone({
        headers: req.headers.set("Authorization", token),
      });
    } else {
      updatedRequest = req.clone();
    }

    return next.handle(updatedRequest).pipe(
      tap((evt) => {
        if (evt instanceof HttpResponse) {
        }
      }),
      catchError((err: any) => {
        console.log(err)
        if (err instanceof HttpErrorResponse) {
          try {
            if (req.url.includes('user/confirmPasswordReset') || req.url.includes('policy/fetchByChassisNoAndTcNo') || req.url.includes('quotes/quoteDetailsSummary')) {
              this.disableGlobalErrorHandler = true;
            }
            this.spinner.hide();
            let errorMsg = err.error.text || err.error.error || err.error;
            let errorStatus = err.status.toString();
            this.translate.get('InternalError').subscribe(value => {
              this.serverError = value;
            });
            this.translate.get('TryAgain').subscribe(value => {
              this.tryAgain = value;
            });
            this.translate.get('TokenExpired').subscribe(value => {
              this.tokenExpired = value;
            });
            if (errorStatus == '401') {
              if (localStorage.getItem('isLoggedIn') === 'true') {
                localStorage.removeItem('tokenDetails');
                localStorage.removeItem('Username');
                localStorage.removeItem('guesttokenDetails');
                localStorage.setItem('isLoggedIn', 'false');
              }
              this.router.navigate([`/new-login`]);
              swal(
                this.tokenExpired,  this.tryAgain, 'error'
              );
            } else if (errorStatus.startsWith('5')) {
              swal(this.serverError, this.tryAgain, 'error');
            } else {
              if (!this.disableGlobalErrorHandler)
              swal('', errorMsg, 'error');
            }
            // let errorMsg = err.error.text || err.error.error || err.error;
            // this.spinner.hide();
            // if (!err.status) {
            //   this.toasterService.error('', 'An error has occurred please try again', {
            //     timeOut: 3000
            //   });
            // }
            // else if (err.status === 503) {
            //   this.toasterService.error("", " Service Unavailable", {
            //     timeOut: 3000,
            //   });
            // } else if (err.status === 400) {
            //   if (errorMsg === "Unable to fetch data from auto data") {

            //   } else {
            //     if (errorMsg.includes('Invalid file type')) {
            //     } else {
            //       // this.toasterService.error("", errorMsg, {
            //       //   timeOut: 3000,
            //       // });
            //     }
            //   }
            // } else if (errorMsg != "Internal Server Error") {
            //   if (
            //     err.url.includes("brokerservice/policy") &&
            //     !err.url.includes("Summary")
            //   ) {
            //     this.router.navigate(["/contact-message", "policy-failed"]);
            //   } else {
            //     if (errorMsg === "Unable to fetch data from auto data") {
            //     } else {
            //       if (errorMsg === `Endorsement exists. Policy can't be cancelled.`) {
            //         this.toasterService.error("", 'Endorsement exists. Only 1 endorsement(s) can be processed at a time.', {
            //           timeOut: 3000,
            //         });
            //       } else {
            //         this.toasterService.error("", errorMsg, {
            //           timeOut: 3000,
            //         });
            //       }
            //     }
            //   }
            // } else {
            //   this.toasterService.error(
            //     "",
            //     "An error has occurred please try again",
            //     {
            //       timeOut: 3000,
            //     }
            //  );
            // }
          } catch (e) {
            swal(
              'An error occurred', '', 'error'
            );
            this.spinner.hide();
          }
        }
        this.disableGlobalErrorHandler = false;
        return throwError(err);
      })
    );
  }
}
