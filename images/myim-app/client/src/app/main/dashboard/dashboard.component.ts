import { Component, OnInit } from '@angular/core';
import { I18nService } from 'src/app/utils/language/i18n.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {


  public lastTransactions: any = []
  constructor(public i18nService: I18nService) { }
  ngOnInit(): void {
    this.lastTransactions = [{
      date: "2022-01-01",
      type: "Sales Invoice",
      trx_no: 1,
      parity_name: "Padmanaban",
      amount: 1000
    }]
  }


  get lastTransactionsColumns() {
    return Object.keys(this.lastTransactions[0])
  }

  alterColumnName(col: string) {
    return col.split("_").join(" ").toUpperCase()
  }

}
