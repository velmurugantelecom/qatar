import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Customer360Service } from '../../customer360.service'
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';

@Component({
  selector: 'app-claimdetails',
  templateUrl: './claimdetails.component.html',
  styleUrls: ['./claimdetails.component.scss']
})
export class ClaimdetailsComponent implements OnInit {
  policyNo: any;
  public language: any;
  policyarr: any = [];
  public productName = '';
  constructor(router: Router, 
    public runtimeConfigService: RuntimeConfigService,
    private route: ActivatedRoute, private formBuilder: FormBuilder, private service1: Customer360Service) {
    this.policyNo = this.route.snapshot.params.policyNo;


  }
  ngOnInit() {
    this.service1.ongetpolicyno.subscribe((data) => {
      this.policyarr = data.data;
      if (localStorage.getItem('language') === 'en')
        this.productName = this.policyarr.productTypeName;
        else
        this.productName = this.policyarr.productTypeNameAr;
    })
    this.language = localStorage.getItem("language");

  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }

}
