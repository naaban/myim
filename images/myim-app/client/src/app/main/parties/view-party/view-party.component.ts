import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRouteHandler } from 'src/app/utils/app-route.handler';
import { I18nService } from 'src/app/utils/language/i18n.service';
import { Location } from '@angular/common';
@Component({
  selector: 'myim-view-party',
  templateUrl: './view-party.component.html',
  styleUrls: ['./view-party.component.scss']
})
export class ViewPartyComponent extends AppRouteHandler implements OnInit {

  public categories: any[] = []
  constructor(public i18nService: I18nService, router: Router, ngZone: NgZone, _location: Location) {
    super(router, ngZone, _location);
  }

  ngOnInit(): void {
    this.categories = [{
      name: "Data"
    }, {
      name: "ASDAS"
    }]
  }

}
