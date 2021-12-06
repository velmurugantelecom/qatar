// angularLib modules
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from "ngx-spinner";
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { UserIdleModule } from 'angular-user-idle';
import { MAT_DATE_LOCALE, } from '@angular/material/core';

// modules
import { AppRoutingModule } from './app-routing.module';
import { AppMaterialModule } from './app-material.module';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

// components
import { AppComponent, TimeoutDialogComponent } from './app.component';
import { AppHttpInterceptor } from './app.interceptor';
import { AuthGuard } from './core/guard/auth.guard';
import { AuthService } from './core/services/auth.service';
import { CoreService } from './core/services/core.service';
import { EmailPopupComponent } from './modal/email-popup/email-popup.component';
import { WebCamComponent } from './shared/web-cam/web-cam.component';
import { WebcamModule } from 'ngx-webcam';

import { NgSelectModule } from '@ng-select/ng-select';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxCurrencyModule } from "ngx-currency";
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule, MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { MessagePopupComponent } from './modal/message-popup/message-popup.component';
import { ContentPopupComponent } from './modal/content-popup/content-popup.component';
import { GuestAuthGuard } from './core/guard/guest.auth.guard';
import { chooseProduct } from './shared/product-selection/product-selection.component';
import { ProductChangePopupComponent } from './modal/product-change/product-change.component';
import { DropDownService } from './core/services/dropdown.service';
import { NgxGaugeModule } from 'ngx-gauge';
import { DataService } from './core/services/data.service';
import { NgxCaptchaModule } from 'ngx-captcha';

import { RuntimeConfigService } from './core/services/runtime-config.service';
import { DynamicContentDialog } from './shared/dynamic-content/dynamic-content.component';
const userIdleConfig = {
  idle: 300,
  timeout: 1,
  ping: 100
};

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

export const MY_CUSTOM_FORMATS = {
  fullPickerInput: 'DD/MM/YYYY',
  parseInput: localStorage.getItem("DatePickerFormat"),
  datePickerInput: localStorage.getItem("DatePickerFormat"),
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY'
};

export const configFactory = (configService: RuntimeConfigService) => {
  return () => configService.loadConfig();
};

@NgModule({
  declarations: [
    AppComponent,
    TimeoutDialogComponent,
    EmailPopupComponent,
    MessagePopupComponent,
    ProductChangePopupComponent,
    ContentPopupComponent],
  imports: [
    //angularLib
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgSelectModule,
    NgxSpinnerModule,
    HttpClientModule,
    NgxCurrencyModule,
    NgxGaugeModule,
    // UserIdleModule.forRoot(userIdleConfig),

    //angularModules
    AppRoutingModule,
    AppMaterialModule,
    SharedModule,
    CoreModule,
    WebcamModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    OwlMomentDateTimeModule,
    NgxCaptchaModule,
  ],
  entryComponents: [chooseProduct, EmailPopupComponent, WebCamComponent, TimeoutDialogComponent
    , MessagePopupComponent, ProductChangePopupComponent, ContentPopupComponent,  
    DynamicContentDialog],
    providers: [
    CoreService,
    AuthGuard,
    GuestAuthGuard,
    DropDownService,
    AuthService,
    DataService,
    { provide: HTTP_INTERCEPTORS, useClass: AppHttpInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS },
    {
      provide: APP_INITIALIZER,
      useFactory: configFactory,
      deps: [RuntimeConfigService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
