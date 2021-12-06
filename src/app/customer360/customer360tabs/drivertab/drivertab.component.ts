import { Component, OnInit } from '@angular/core';
import { Customer360Service } from '../../customer360.service';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';
@Component({
  selector: 'app-drivertab',
  templateUrl: './drivertab.component.html',
  styleUrls: ['./drivertab.component.scss']
})
export class DrivertabComponent implements OnInit {
  public language: any;

  constructor(private service1: Customer360Service,public runtimeConfigService: RuntimeConfigService) { }
  driverdetails: any;
  tcfilenumber: number;
  ngOnInit() {
    this.service1.ongetpolicyno.subscribe(value => {
      if (value.length != 0) {
        this.driverdetails = value.data.drivers[0];
        // this.driverdetails = value.data.userDetails;
      }
      this.tcfilenumber = value.data.vehicleDetails.tcFileNumber;
    }, err => {
    })
    this.language = localStorage.getItem("language");
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }
}
