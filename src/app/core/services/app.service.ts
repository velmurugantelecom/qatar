import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }

  userDetails: any = {};
  quoteDetails: any = {};
  planDetails: any = {};
  discountData: any = {}
  vehicleAutoData: any = {};
  policyPopup: boolean;
  
  public _insurerDetails: BehaviorSubject<any> = new BehaviorSubject([]);
  public _loginUserTcNumber: BehaviorSubject<any> = new BehaviorSubject([]);
  public _driverDetails: BehaviorSubject<any> = new BehaviorSubject([]);
  public _dob: BehaviorSubject<any> = new BehaviorSubject('');
  public isBackButtonClicked: boolean = false;
  public _languageChange: BehaviorSubject<any> = new BehaviorSubject('');
  public _invalidChassisNumber: BehaviorSubject<any> = new BehaviorSubject('');
  public _isTokenReady: BehaviorSubject<any> = new BehaviorSubject(false);
  public _manualLanguageChange: BehaviorSubject<any> = new BehaviorSubject(false)

  setuserDetails(value: any): void {
    this.userDetails = value;
  }

  getuserDetails(): any {
    return this.userDetails;
  }

  setQuoteDetails(details) {
    this.quoteDetails = details;
  }

  getQuoteDetails() {
    return this.quoteDetails;
  }

  setPlanDetails(details) {
    this.planDetails = details;
  }

  getDiscountDetails() {
    return this.discountData;
  }

  setDiscountDetails(value) {
    this.discountData = value
  }

  getPlanDetails() {
    return this.planDetails;
  }

  setVehicleAutoData(data) {
    this.vehicleAutoData = data;
  }

  getVehicleAutoData() {
    return this.vehicleAutoData;
  }

  setpolicyDetails(value: any): void {
    this.policyPopup = value;
  }
  getpolicyDetails(): any {
    return this.policyPopup;
  }
}
