import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../core/services/app.service';
import { CoreService } from '../core/services/core.service';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../core/services/data.service';

export interface KeyValue<K, V> {
  key: K;
  value: V;
}

@Component({
  selector: "app-compare-plans",
  templateUrl: "./compare-plans.component.html",
  styleUrls: ["./compare-plans.component.scss"]
})

export class ComparePlansComponent implements OnInit {

  public mandatoryCovers = {};
  public optionalCovers = {};
  public isPlanAvailable: boolean;
  public isPlanSelected: boolean;
  public planOb = {};
  public selectedPlan = {};
  public selectedPlanAmount = '0';
  public reviseDetails = 'false';
  public discounts: any = {};
  public promoDiscounts: any = {};
  public loadings: any = {};
  public charges: any = {};
  public excess: any = {};
  public VatPercentage = '';
  public language: any;
  showPromoDiscount = false;
  public discountCode = null;
  selectAlert: any;
  ratingError: any;
  demo1TabIndex;
  disableDisctFld;
  panelOpenState = false;
  @ViewChild('tabGroup', {
    static: false
  }) tabGroup;
  public isContentLoaded: boolean;
  constructor(private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private appService: AppService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef) {
    this.route.queryParams
      .subscribe(params => {
        if (params['reviseDetails']) {
          this.reviseDetails = params['reviseDetails'];
        }
      });
  }

  originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  }

  ngOnInit() {
    this.planOb = this.dataService.getPlanDetails();
    this.appService._manualLanguageChange.subscribe(value => {
      if (value && this.isContentLoaded) {
        this.language = localStorage.getItem('language');
        this.loadCovers();
      }
    });
    if (this.planOb) {
      this.loadVATandPremium();
      this.loadCovers();
      this.isContentLoaded = true;
      this.initLoading();
      this.loadExcess();
      this.isPlanAvailable = true;
    } else {
      this.isPlanAvailable = false;
    }
    this.language = localStorage.getItem("language");
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
    if (this.planOb['discountsAvailable']) {
      this.applyDiscounts();
    }
    let data = this.appService.getDiscountDetails();
    if (data['discountsAvailable']) {
      this.planOb['discountCode'] = data['discountCode']
      this.applyDiscounts();
    }
  }

  loadCovers() {
  this.mandatoryCovers = {};
    let temp = false;
    this.planOb['plans'].forEach((plan, index) => {
      if (plan.prodID === '105') {
      //  temp = true
      }
      let pgroup = this.promoDiscounts['Promotional Discount'] || [];
      if (pgroup.length == 0) this.promoDiscounts['Promotional Discount'] = [];
      this.promoDiscounts['Promotional Discount'].push({
        planId: plan.planDetails[0].planId,
        amount: 0
      })
      plan['bgColor'] = index;
      plan['applyPromoDiscount'] = false;
      plan['promoFieldId'] = `promo${index}`
      if (plan.confirmed) {
        this.demo1TabIndex = index;
        this.isPlanSelected = true;
        this.selectedPlan['planId'] = plan.planDetails[0].planId;
        this.selectedPlanAmount = plan.planDetails[0].grossPremium;
      }
      if (localStorage.getItem('language') === 'en') {
        plan.planDetails[0].coverageDetails[0].mandatoryCoverages.forEach(
          cover => {
            if (cover.pcmCoverageDesc === 'Glass Brokage' && index === 0 && temp === true) {
              this.mandatoryCovers['Glass Brokage'] = [];
            //  this.mandatoryCovers['Driver Cover'] = [];
             // this.mandatoryCovers['Oman Cover (Including Oman Territories inside UAE)'] = [];
            }
            let cvrGroup = this.mandatoryCovers[cover.pcmCoverageDesc] || [];
            if (cvrGroup.length == 0)
              this.mandatoryCovers[cover.pcmCoverageDesc] = [];
            this.mandatoryCovers[cover.pcmCoverageDesc].push({
              planId: plan.planDetails[0].planId,
              cover: cover
            });
          });
      } else {
        plan.planDetails[0].coverageDetails[0].mandatoryCoverages.forEach(
          cover => {
            if (cover.pcmCoverageDesc1 === 'خدمة الإسعاف' && index === 0 && temp === true) {
              this.mandatoryCovers['خدمة الإسعاف'] = [];
              this.mandatoryCovers['تأمین السائق'] = [];
              this.mandatoryCovers['غطاء عُمان'] = [];
            }
            let cvrGroup = this.mandatoryCovers[cover.pcmCoverageDesc1] || [];
            if (cvrGroup.length == 0)
              this.mandatoryCovers[cover.pcmCoverageDesc1] = [];
            this.mandatoryCovers[cover.pcmCoverageDesc1].push({
              planId: plan.planDetails[0].planId,
              cover: cover
            });
          });
      }
      plan.planDetails[0].coverageDetails[0].optionalCoverages.forEach(
        cover => {
          let cvrGroup = this.optionalCovers[cover.pcmCoverageDesc] || [];
          if (cvrGroup.length == 0)
            this.optionalCovers[cover.pcmCoverageDesc] = [];
          this.optionalCovers[cover.pcmCoverageDesc].push({
            planId: plan.planDetails[0].planId,
            cover: cover
          });
        }
      );
    });
    // To remove empty hardcoded covers 
    if (localStorage.getItem('language') === 'en') {
      if (!temp)
      return 
      if (this.mandatoryCovers['Oman Cover (Including Oman Territories inside UAE)'].length === 0) {
        delete this.mandatoryCovers['Oman Cover (Including Oman Territories inside UAE)']
      }
      if (this.mandatoryCovers['Ambulance Cover'].length === 0) {
        delete this.mandatoryCovers['Ambulance Cover']
      }
      if (this.mandatoryCovers['Driver Cover'].length === 0) {
        delete this.mandatoryCovers['Driver Cover']
      }
    } else {
      if (!temp)
      return 
      if (this.mandatoryCovers['غطاء عُمان'].length === 0) {
        delete this.mandatoryCovers['غطاء عُمان']
      }
      if (this.mandatoryCovers['خدمة الإسعاف'].length === 0) {
        delete this.mandatoryCovers['خدمة الإسعاف']
      }
      if (this.mandatoryCovers['تأمین السائق'].length === 0) {
        delete this.mandatoryCovers['تأمین السائق']
      }
    }
  }

  getData(searchKey, values): boolean {
    let isAvailable = false;
    values.forEach(value => {
      if (value.planId == searchKey) {
        if (value.cover.selected) {
          isAvailable = true;
        }
      }
    });
    return isAvailable;
  }

  getOptionalData(searchKey, values): boolean {
    let isAvailable = false;
    values.forEach(value => {
      if (value) {
        if (value.planId == searchKey) {
          isAvailable = true;
        }
      }
    });
    return isAvailable;
  }

  selectPlan(selectedPlan) {
    this.isPlanSelected = true;
    this.selectedPlan['planId'] = selectedPlan.planDetails[0].planId;
    this.selectedPlanAmount = selectedPlan.planDetails[0].grossPremium
    this.planOb['plans'].filter((plan) => {
      if (plan.planDetails[0].planId === this.selectedPlan['planId']) {
        plan.confirmed = true;
      } else {
        plan.confirmed = false;
      }
    });
  }

  confirmPlan() {
    if (!this.isPlanSelected) {
      this.translate.get('Required.SelectPlan').subscribe(value => {
        this.selectAlert = value;
      });
      swal(
        '', this.selectAlert, 'error'
      );
    }
    else if (this.selectedPlanAmount == '0' || this.selectedPlanAmount == null) {
      this.translate.get('Required.RatingError').subscribe(value => {
        this.ratingError = value;
      });
      swal(
        '', this.ratingError, 'error'
      );
    }
    else {
      if (this.showPromoDiscount) {
        this.planOb['discountsAvailable'] = true;
        this.planOb['promoDiscounts'] = this.promoDiscounts;
        this.planOb['discountCode'] = this.discountCode
      } else {
        this.planOb['discountsAvailable'] = false;
      }
      this.appService.setPlanDetails(this.planOb);
      let params = {
        quoteId: this.planOb['quoteId'],
        amndVerNo: this.planOb['amndVerNo'],
        planId: this.selectedPlan['planId']
      };

      this.coreService.saveInputs('confirmPlan', params, null).subscribe(res => {
        this.router.navigate([`/quote-summary`], { queryParams: { quoteNo: this.planOb['quoteId'], isQuickSummary: true } });
      });
    }
  }

  doCall(plan, value) {
    let selCoverage = value.filter(
      ({ planId }) => planId == plan.planDetails[0].planId
    )[0].cover;
    if (selCoverage.selected) {
      return true
    }
    return false;
  }

  toggleCoverage(plan, covers, event) {
    this.spinner.show();
    let selCoverage = covers.filter(
      ({ planId }) => planId == plan.planDetails[0].planId
    )[0].cover;
    let params = {
      coverageId: selCoverage.pcmCoverageId,
      isChecked: event.checked,
      sgsId: this.planOb['quoteId'],
      productId: this.planOb['productId'],
      planId: plan.planDetails[0].planId,
    };

    this.coreService
      .saveInputs("fetchnIndividualPlansWithRate", params, null)
      .subscribe(response => {
        plan.planDetails[0].grossPremium = response.data.grossPremium;
        if (plan.planDetails[0].planId === this.selectedPlan['planId'])
          this.selectedPlanAmount = response.data.grossPremium;
        this.spinner.hide();
      }, err => {
        this.spinner.hide();
      });
  }

  goBack() {
    let value;
    if (this.showPromoDiscount) {
      value = {
        discountsAvailable: true,
        promoDiscounts: this.promoDiscounts,
        discountCode: this.discountCode
      }
    } else {
      value = {
        discountsAvailable: false
      }
    }
    this.appService.setDiscountDetails(value);
    if (!this.planOb) {
      this.router.navigate(['/new-motor-info']);
      return
    }
    this.router.navigate(['/new-motor-info'],
      {
        queryParams: {
          quoteNo: this.planOb['quoteNo']
        }
      });
  }

  isSelectedPlan(value) {
    if (value.confirmed)
      return true;
  }

  loadExcess() {
    this.planOb['plans'].forEach(plan => {
      let i = 0;
      plan.excess.forEach(item => {
        // if (item.description === "Excess") {
          let group = this.excess[item.description] || [];
          if (group.length == 0) this.excess[item.description] = [];
          // if (i === 0) {
          //   i++;
            this.excess[item.description].push({
              planId: plan.planDetails[0].planId,
              id: item.id,
              ratePer: item.ratePer,
              rate: item.rate,
              amount: item.amount
            });
          // }
        // }
      });
    });
  }

  loadVATandPremium() {
    console.log("planDetails",this.planOb['plans']);
    this.planOb['plans'].forEach(plan => {
      plan.planDetails[0]['premiumWithCharges'] = 0;
      plan.planDetails[0]['premiumWithVAT'] = 0;
      let premiumWithCharge = 0;
      let premiumWithVat = 0;
      plan.charges.forEach(item => {
        if (item.description === 'Premium VAT') {
          let group = this.charges[item.description] || [];
          if (group.length == 0) this.charges[item.description] = [];
          this.charges[item.description].push({
            planId: plan.planDetails[0].planId,
            id: item.id,
            ratePer: item.ratePer,
            rate: item.rate,
            amount: item.amount
          });
          premiumWithVat += item.amount;
        } else {
          premiumWithCharge += item.amount
        }
      });
      plan.planDetails[0]['premiumWithVAT'] = premiumWithVat + parseFloat(plan.planDetails[0]['grossPremium']);
      plan.planDetails[0]['premiumWithCharges'] = premiumWithCharge + plan.planDetails[0]['txnPremium'];
    });
  }

  getPremiumWithCharges(plan) {
    if (plan.premiumWithCharges) {
      return plan.premiumWithCharges.toFixed(2);
    }
    return '0.00';
  }

  getPremiumWithVat(plan) {
    if (plan.premiumWithVAT) {
      return plan.premiumWithVAT.toFixed(2);
    }
    return '0.00';
  }

  getNetPremium(plan) {
    if (plan.grossPremium) {
      return parseFloat(plan.grossPremium).toFixed(2);
    }
    return '0.00';
  }

  fetchAmount(searchKey, values, type) {
    let amount;
    let obj = values.filter(({ planId }) => planId == searchKey)[0];
    if (obj) {
      if (obj.amount == null) amount = 0;
      else amount = obj.amount;
      if (type === 'P') {
        this.VatPercentage = `${obj.rate}%`;
      }
      return `${amount.toFixed(2)}`;
    }
  }

  fetchAmountMobile(searchKey, values, type) {
    let amount;
    let obj = values.filter(({ planId }) => planId == searchKey)[0];
    if (obj) {
      if (obj.amount == null) amount = 0;
      else amount = obj.amount;
      if (type === 'P') {
        this.VatPercentage = `(${obj.rate}%)`;
      }
      return `${amount.toFixed(2)}`;
    }
  }

  isNotEmpty = obj => Object.keys(obj).length > 0;

  initLoading() {
    this.planOb['plans'].forEach(plan => {
    plan.loading.forEach(item => {
    //if (item.id === 'DIND02')
    if (item.id === 'MIN_PREM_LD')
    return;
    if (item.id === '106') {
    let group = this.discounts[item.description] || [];
    if (group.length == 0)
    this.discounts[item.description] = [];
    this.discounts[item.description].push({
    planId: plan.planDetails[0].planId,
    id: item.id,
    ratePer: item.ratePer,
    rate: item.rate,
    amount: item.amount
    });
    }
    else {
    if(this.loadings[item.description] == null){
    this.loadings[item.description] = [];
    }
    this.loadings[item.description].push({
    planId: plan.planDetails[0].planId,
    id: item.id,
    ratePer: item.ratePer,
    rate: item.rate,
    amount: item.amount
    });
    }
    });
    });
    }

  onTabChanged(event) {
    this.isPlanSelected = true;
    this.selectedPlan['planId'] = this.planOb['plans'][event.index].planDetails[0].planId;
    this.selectedPlanAmount = this.planOb['plans'][event.index].planDetails[0].grossPremium
    this.planOb['plans'].filter((plan) => {
      if (plan.planDetails[0].planId === this.selectedPlan['planId']) {
        plan.confirmed = true;
      } else {
        plan.confirmed = false;
      }
    });
  }

  onBlurMethodMob(event, type) {
    let code;
    if (type)
      code = event;
    else
      code = event.target.value;
    if (!code) {
      return
    }
    this.spinner.show();
    this.discountCode = code;
    let id = this.planOb['quoteId'];
    console.log(id);
    let param = {
      discountCode : code,
      quoteId: id
    }
    this.coreService.postInputs7(`discount/applyPromocode`, '',param).subscribe((response) => {
      this.spinner.hide();
      if (response) {
        this.planOb['plans'].forEach(plan => {
          let x: any = (<HTMLInputElement>document.getElementById(plan.promoFieldId));
          x.value = code;
          x.disabled = true;
        });
        response = JSON.parse(response);
        this.addPromoDiscount(response)
      }
    }, err => {
      this.spinner.hide();
      if (!type)
        event.target.value = '';
    })
  }

  onBlurMethod(field) {
    let x: any = (<HTMLInputElement>document.getElementById(field));
    let code = x.value;
    if (!code) {
      return
    }
    this.spinner.show();
    this.discountCode = code;
    let id = this.planOb['quoteId'];
    console.log(id);
    let param = {
      discountCode : code,
      quoteId: id
    }
    this.coreService.postInputs7(`discount/applyPromocode`, '',param).subscribe((response) => {
      this.spinner.hide();
      if (response) {
        response = JSON.parse(response);
        x.disabled = true;
        this.addPromoDiscount(response)
      }
    }, err => {
      this.spinner.hide();
      x.value = '';
    })
  }

  addPromoDiscount(response) {
    this.charges['Premium VAT'].forEach((element, index) => {
      element.amount = parseFloat(response.plans[index].vat)
    });
    this.planOb['plans'].filter((plan, index) => {
      if (plan.planDetails[0].planId === response.plans[index].planId) {
        plan.planDetails[0]['grossPremium'] = response.plans[index].grossPremium;
        plan.planDetails[0]['premiumWithVAT'] = parseFloat(response.plans[index].vat) + parseFloat(response.plans[index]['grossPremium']);
        plan.applyPromoDiscount = true;
        this.promoDiscounts['Promotional Discount'].forEach((item, index) => {
          if (item.planId === response.plans[index].planId) {
            if (response.plans[index].loading.length > 1) {
              item.amount = response.plans[index].loading[1].amount
            } else {
              item.amount = response.plans[index].loading[0].amount
            }
          }
        });
      }
    });
    this.showPromoDiscount = true;
  }

  removePromoDiscountMob(id) {
    this.showPromoDiscount = false;
    this.discountCode = null;
    let x = (<HTMLInputElement>document.getElementById(id));
    let code = x.value;
    this.planOb['plans'].forEach(plan => {
      let x: any = (<HTMLInputElement>document.getElementById(plan.promoFieldId));
      x.value = '';
      x.disabled = false;
    });
    this.spinner.show();
    this.discountCode = code;
    let id1 = this.planOb['quoteId'];
    let param = {
      discountCode : code,
      quoteId: id1
    }
    
    this.coreService.postInputs7(`discount/removePromocode`, '',param).subscribe((response) => {
      this.spinner.hide();
      if (response) {
        this.charges['Premium VAT'].forEach((element, index) => {
          element.amount = parseFloat(response.plans[index].vat)
        });
        this.planOb['plans'].filter((plan, index) => {
          if (plan.planDetails[0].planId === response.plans[index].planId) {
            plan.planDetails[0]['grossPremium'] = response.plans[index].grossPremium;
            plan.planDetails[0]['premiumWithVAT'] = parseFloat(response.plans[index].vat) + parseFloat(response.plans[index]['grossPremium']);
            plan.applyPromoDiscount = true;
            this.promoDiscounts['Promotional Discount'].forEach((item, index) => {
              if (item.planId === response.plans[index].planId) {
                item.amount = 0
              }
            });
          }
        });
      }
    }, err => {
      this.spinner.hide();
    })
  }

  removePromoDiscount(id) {
    this.showPromoDiscount = false;
    this.discountCode = null;
    let x = (<HTMLInputElement>document.getElementById(id));
    let code = x.value;
    x.value = '';
    x.disabled = false;
    this.spinner.show();
    this.discountCode = code;
    let id1 = this.planOb['quoteId'];
    console.log(id);
    let param = {
      discountCode : code,
      quoteId: id1
    }
    this.coreService.postInputs7(`discount/removePromocode`, '',param).subscribe((response) => {
      this.spinner.hide();
      if (response) {
        this.charges['Premium VAT'].forEach((element, index) => {
          element.amount = parseFloat(response.plans[index].vat)
        });
        this.planOb['plans'].filter((plan, index) => {
          if (plan.planDetails[0].planId === response.plans[index].planId) {
            plan.planDetails[0]['grossPremium'] = response.plans[index].grossPremium;
            plan.planDetails[0]['premiumWithVAT'] = parseFloat(response.plans[index].vat) + parseFloat(response.plans[index]['grossPremium']);
            plan.applyPromoDiscount = true;
            this.promoDiscounts['Promotional Discount'].forEach((item, index) => {
              if (item.planId === response.plans[index].planId) {
                item.amount = 0
              }
            });
          }
        });
      }
    }, err => {
      this.spinner.hide();
    })
  }

  planselectMob(selectedPlan) {
    this.isPlanSelected = true;
    this.selectedPlan['planId'] = selectedPlan.planDetails[0].planId;
    this.selectedPlanAmount = selectedPlan.planDetails[0].grossPremium
    this.planOb['plans'].filter((plan) => {
      if (plan.planDetails[0].planId === this.selectedPlan['planId']) {
        plan.confirmed = true;
      } else {
        plan.confirmed = false;
      }
    });
  }

  applyDiscounts() {
    if (window.screen.width < 990) {
      this.planOb['plans'].forEach(plan => {
        let x: any = (<HTMLInputElement>document.getElementById(plan.promoFieldId));
        x.value = this.planOb['discountCode'];
        x.disabled = true;
      });
      this.onBlurMethodMob(this.planOb['discountCode'], 'bind')
    } else {
      let x: any = (<HTMLInputElement>document.getElementById('promoInputField'));
      x.value = this.planOb['discountCode'];
      this.onBlurMethod('promoInputField')
    }
  }
}
