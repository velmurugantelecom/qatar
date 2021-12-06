import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { config } from '../config'
import { RuntimeConfigService } from './runtime-config.service';
@Injectable({
  providedIn: 'root'
})
export class CoreService {

  DevEndpoint: string;
  DevEndpointDbsync: string;
  PaymentEndpoint: string;
  DevEndpointAutoData: string;
  greyImport: string;
  DevEndpoint2: string;
  configs = {};
  languageLable: string = 'language';

  constructor(private http: HttpClient,
    private configService: RuntimeConfigService) {
    this.DevEndpoint = configService.config.DevEndpoint;
    this.DevEndpointDbsync = configService.config.DevEndpointdbsync;
    this.DevEndpoint2 = configService.config.DevEndpoint2;
    this.PaymentEndpoint = configService.config.PaymentEndpoint;
    this.DevEndpointAutoData = configService.config.DevEndpointAutoData;
    this.greyImport = configService.config.GreyImport;
    this.configs = config;
  }

  getLocalData(url) {
    return this.http.get("assets/json/" + url + ".json");
  }

  greyImportService(serviceAPI, params): Observable<any> {
    let languageValue = localStorage.getItem("language");
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key])
      }
    }
    httpParams = httpParams.append(
      this.languageLable, languageValue
    );
    let url = `${this.greyImport}${serviceAPI}`;
    return this.http.get(url, {
      params: httpParams
    });
  }

  postInputsGreyImportService(serviceAPI, body: any, params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.greyImport}${serviceAPI}`;
    return this.http.post(url, body, {
      params: httpParams
    });
  }
  getInputs(serviceAPI, params): Observable<any> {
    let languageValue = localStorage.getItem("language");
    let httpParams = new HttpParams();
    httpParams = httpParams.append(
      this.languageLable, languageValue
    );
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
   
    let url = `${this.DevEndpoint2}${serviceAPI}`;
    return this.http.get(url, {
      params: httpParams
    });
  }
  listOptions1(serviceAPI, params) {
    let languageValue = localStorage.getItem("language");
    let httpParams = new HttpParams();
    
    httpParams = httpParams.append(
      this.languageLable, languageValue
    );
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpoint2}${serviceAPI}`;
    return this.http.get(url, { 
      params: httpParams
    });
  }
  getInputsPolicy(serviceAPI, params): Observable<any> {
    let languageValue = localStorage.getItem("language");
    let value
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    httpParams = httpParams.append(
      this.languageLable, languageValue
    );
    let url = `${this.DevEndpoint2}${serviceAPI}`;
    return this.http.get(url, {
      params: httpParams
    });
  }
  getInputs1(serviceAPI, body: any): Observable<any> {
    let url = `${this.DevEndpoint2}${serviceAPI}`;
    return this.http.get(url, { responseType: 'text' });
  }

  getInputs2(serviceAPI, params): Observable<any> {
    let url = `${this.DevEndpoint}${serviceAPI}`;
    let languageValue = localStorage.getItem("language");
    let httpParams = new HttpParams();
    if (params && params != '') {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    httpParams = httpParams.append(
      this.languageLable, languageValue
    );
    return this.http.get(url, { params: httpParams });
  }
  getInputs3(serviceAPI, body: any, params): Observable<any> {
    let url = `${this.DevEndpoint2}${serviceAPI}`;
    let languageValue = localStorage.getItem("language");
    let httpParams = new HttpParams();
    if (params && params != '') {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    httpParams = httpParams.append(
      this.languageLable, languageValue
    );
    return this.http.get(url, { responseType: 'text',
    params: httpParams });
  }

  postInputs3(serviceAPI, body: any): Observable<any> {
    let url = `${this.DevEndpoint}${serviceAPI}`;
    return this.http.post(url, body, { responseType: 'text' });
  }

  getInputsDbsync(serviceAPI, params): Observable<any> {
    let  languageValue = localStorage.getItem("language");
    let httpParams = new HttpParams();
    httpParams = httpParams.append(
      this.languageLable,languageValue);
    
      if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpointDbsync}${serviceAPI}`;
    return this.http.get(url, {
      params: httpParams
    });
  }

  getInputsAutoData(serviceAPI, params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpointAutoData}${serviceAPI}`;
    return this.http.get(url, {
      params: httpParams
    });
  }

  postInputs(serviceAPI, body: any, params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpoint2}${serviceAPI}`;
    return this.http.post(url, body, {
      params: httpParams
    });
  }
  postInputs4(serviceAPI, body: any, params): Observable<any> {
    let httpParams = new HttpParams();
    let languageValue = localStorage.getItem("language");
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    httpParams = httpParams.append(
      this.languageLable, languageValue
    );
    let url = `${this.DevEndpoint}${serviceAPI}`;
    return this.http.post(url, body, {
      params: httpParams
    });
  }
  postInputs1(serviceAPI, body: any, params): Observable<any> {
  let languageValue = localStorage.getItem("language");
    let httpParams = new HttpParams();
    httpParams = httpParams.append(
      this.languageLable, languageValue
    );
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpointDbsync}${serviceAPI}`;
    return this.http.post(url, body, { params: httpParams , 
       responseType: 'text' });
  }
  postInputs7(serviceAPI,  body: any, params): Observable<any> {
    let languageValue = localStorage.getItem("language");
    let httpParams = new HttpParams();
    httpParams = httpParams.append(
      this.languageLable, languageValue
    );
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpointDbsync}${serviceAPI}`;
    return this.http.post(url, body, { params: httpParams , 
       responseType: 'text' });

  }
  
  postInputs5(serviceAPI, body: any): Observable<any> {
    let url = `${this.DevEndpoint2}${serviceAPI}`;
    return this.http.post(url, body, { responseType: 'text' });
  }

  deleteInputs(serviceAPI, body: any): Observable<any> {
    let url = `${this.DevEndpointDbsync}${serviceAPI}`;
    return this.http.delete(url, body);
  }

  postInputs2(serviceAPI, body, params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpointDbsync}${serviceAPI}`;
    return this.http.post(url, body, {
      params: httpParams
    });
  }
  saveInputs(serviceAPI, body: any, params): Observable<any> {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let url = `${this.DevEndpointDbsync}${serviceAPI}`;
    return this.http.post(url, body);
  }

  updateInputs(serviceAPI, body): Observable<any> {
    let url = `${this.DevEndpoint}${serviceAPI}`;
    return this.http.put(url, body);
  }

  delteInputs(serviceAPI): Observable<any> {
    let url = `${this.DevEndpoint}${serviceAPI}`;
    return this.http.delete(url);
  }

  dropdownservice(serviceAPI, optionId, productId) {
    let url = `${this.DevEndpoint}${serviceAPI}optionType=${optionId}&productId=${productId}`;
    return this.http.delete(url);
  }

  listOptions(optionId, productId) {
    let languageValue = localStorage.getItem("language");
    let httpParams = new HttpParams();
    httpParams = httpParams.append(
      this.languageLable, languageValue
    );
    if (optionId === 'MAKE') return this.listMake(httpParams);
    if (optionId === 'MOTOR_YEAR') return this.listYear();
    if (optionId == 'NCD_YRS') return this.listClaimYears();
    let url = `${this.DevEndpoint2}options/list?optionType=${optionId}&productId=${productId}`;
    return this.http.get(url, {
      params: httpParams
    });
  }

  listMake(params) {
    let languageValue = localStorage.getItem("language");
    let httpParams = new HttpParams();
    httpParams = httpParams.append(
      this.languageLable, languageValue
    );

    let url = `${this.DevEndpoint2}vehicledetails/make/findAll`;
    return this.http.get(url, {
      params: httpParams
    });
  }

  listModel(make) {
    let url = `${this.DevEndpoint2}vehicledetails/model/find?makeId=${make}`;
    return this.http.get(url);
  }

  listYear() {
    let url = `${this.DevEndpoint}portal-service/options/list?optionType=MOTOR_YEAR&productId=*`;
    return this.http.get(url);
  }

  listClaimYears() {
    let url = `${this.DevEndpoint}portal-service/options/list?optionType=NCD_YRS&productId=*`;
    return this.http.get(url);
  }

  public listBody(make, model) {
    let url = `${this.DevEndpoint}portal-service/vehicledetails/vehicleType/find?modelId=${model}&makeId=${make}`;
    return this.http.get(url);
  }


  listUsage() {
    let url = `${this.DevEndpoint}portal-service/options/list?optionType=VEH_USAGE&productId=*`;
    return this.http.get(url);
  }

  listRepairType() {
    let url = `${this.DevEndpoint}portal-service/options/list?optionType=REPAIR_TYPE&productId=*`;
    return this.http.get(url);
  }

  listRegisteredAt() {
    let url = `${this.DevEndpoint}portal-service/options/list?optionType=REG_AT&productId=*`;
    return this.http.get(url);
  }


  // TestInputs(body: any): Observable<any> {

  //   let url = `${environment.OcrEndpoint}ocr/submitTransaction`;
  //   return this.http.post(url, body);
  // }

  // TestInput1(body: any): Observable<any> {

  //   let url = `${environment.OcrEndpoint}ocr/submitTransaction3`;
  //   return this.http.post(url, body);
  // }



  getDownload(url, params) {
    let httpParams = new HttpParams();
    if (params && params != "") {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    let apiurl = `${this.DevEndpoint2}${url}`;

    return this.http.get(apiurl, { params: httpParams, responseType: 'blob' });
  }

  paymentService(quoteNumber) {
    return this.http.post(`${this.PaymentEndpoint}payment/make/payment`, quoteNumber);
  }

  getOptions(url) {
    return this.http.get(this.DevEndpoint2 + url);
  }

  mergeDocument(url) {
    return this.http.get(this.DevEndpoint2 + url, { responseType: "blob" });
  }

  // mergeDocument(url) {
  //   return this.http.get(this.DevEndpoint + url);
  // }
}
