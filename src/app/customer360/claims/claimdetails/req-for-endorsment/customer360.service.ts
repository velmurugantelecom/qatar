
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';



@Injectable({
    providedIn: 'root'
})


export class Customer360Service {
    public DevEndpoint
    public DevEndpoint2;
    public DevEndpoint1
    public ongetpolicyno: BehaviorSubject<any> = new BehaviorSubject([]);
    public ondocuments: BehaviorSubject<any> = new BehaviorSubject([]);
    languageLable:string='language';
    constructor(private http: HttpClient, private configService: RuntimeConfigService) {

        this.DevEndpoint = configService.config.DevEndpoint;
        this.DevEndpoint1 = configService.config.DevEndpointdbsync;
        this.DevEndpoint2 = configService.config.DevEndpoint2;
    }
    // search a customer
    public searchCustomer(params) {

        let httpParams = new HttpParams();
        if (params && params != '') {
            for (let key in params) {
                httpParams = httpParams.append(key, params[key]);
            }
        }
        // let url = this.DevEndpoint + 'brokerservice/quotes/customer';
        let url = this.DevEndpoint1 + 'customer/findAll';

        return this.http.get(url, { params: httpParams });
    }
    // get policy by emiratesid
    getpolicy(params): Observable<any> {
        let httpParams = new HttpParams();
        if (params && params != '') {
            for (let key in params) {
                httpParams = httpParams.append(key, params[key]);
            }
        }
        let url = `${this.DevEndpoint}portal-service/search/policies/findAll`
        return this.http.get(url, { params: httpParams })


    }
    // get claims
    getclaims(params): Observable<any> {
      
        let httpParams = new HttpParams();
        if (params && params != '') {
            for (let key in params) {
                httpParams = httpParams.append(key, params[key]);
            }
        }
        let url = `${this.DevEndpoint1}claims/findAll`;
        return this.http.get(url, { params: httpParams })
    }

    // get endorsement list
    getEndorsementList(params) {
        let httpParams = new HttpParams();
        if (params && params != '') {
            for (let key in params) {
                httpParams = httpParams.append(key, params[key]);
            }
        }
        let url = `${this.DevEndpoint1}endorsement/findAllEndorsements`;
        return this.http.get(url, { params: httpParams })
    }
    // get policyinformation
    getItems(params) {
        let  languageValue=localStorage.getItem("language");
        let value
        let httpParams = new HttpParams();
        if (params && params != '') {
            for (let key in params) {
                httpParams = httpParams.append(key, params[key]);
            }
        }
        httpParams=httpParams.append(
            this.languageLable,languageValue
            );
        let url = `${this.DevEndpoint2}/policy/policySummary`
        this.http.get(url, { params: httpParams }).subscribe((data: any) => {
            value = data;
            this.ongetpolicyno.next(data);

        })

    }
    getdocuments(params) {
        let value
        let httpParams = new HttpParams();
        if (params && params != '') {
            for (let key in params) {
                httpParams = httpParams.append(key, params[key]);
            }
        }
        let url = `${this.DevEndpoint2}/document/generated`
        this.http.get(url, { params: httpParams }).subscribe((data: any) => {
            value = data;
            this.ondocuments.next(data);

        })

    }

    reportaloss(value) {
        let url = `${this.DevEndpoint1}claims/notifyLoss`;
        return this.http.post(url, value, { responseType: 'text' })
    }
    getdropdownvalues(url, params) {
        
        let httpParams = new HttpParams();
        if (params && params != '') {
            for (let key in params) {
                httpParams = httpParams.append(key, params[key]);
            }
        }
        return this.http.get(`${this.DevEndpoint}${url}`, { params: httpParams })
    }
  

    getdropdownvaluesdbsync(url, params) {
        let  languageValue = localStorage.getItem("language");
        let httpParams = new HttpParams();
        httpParams=httpParams.append(
            this.languageLable,languageValue);
        if (params && params != '') {
            for (let key in params) {
                httpParams = httpParams.append(key, params[key]);
            }
        }
         
        return this.http.get(`${this.DevEndpoint1}${url}`, { params: httpParams })
    }
    requestForCancellation(value) {
        let url = `${this.DevEndpoint1}endorsement/cancelPolicy`;
        return this.http.post(url, value,{ responseType: 'text' })
    }

    requestForEndorsement(value) {
        let url = `${this.DevEndpoint1}Fnol`;
        return this.http.post(url, value,{ responseType: 'text' })
    }
    
    // requestForCancellation(value,params) {
    //     let url = `${this.DevEndpoint1}endorsement/cancelPolicy`;
    //     let  languageValue = localStorage.getItem("language");
    //     let httpParams = new HttpParams();
    //     httpParams=httpParams.append(
    //         this.languageLable,languageValue);
    //     if (params && params != '') {
    //         for (let key in params) {
    //             httpParams = httpParams.append(key, params[key]);
    //         }
    //     }
    //     return this.http.post(url, value,{ responseType: 'text', params: httpParams })
    // }

    requestForEndorsement1(value, params) {
        let url = `${this.DevEndpoint1}Fnol`;
        let  languageValue = localStorage.getItem("language");
        let httpParams = new HttpParams();
        httpParams=httpParams.append(
            this.languageLable,languageValue);
        if (params && params != '') {
            for (let key in params) {
                httpParams = httpParams.append(key, params[key]);
            }
        }
        return this.http.post(url, value,{ responseType: 'text', params: httpParams })
    }

    getpay(params) {

        let httpParams = new HttpParams();
        if (params && params != '') {
            for (let key in params) {
                httpParams = httpParams.append(key, params[key]);
            }
        }
        let url = `${this.DevEndpoint1}account/outstandingDueAmt`;
        return this.http.get(url, { params: httpParams })
    }
}