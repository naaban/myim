import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRouteHandler } from 'src/app/utils/app-route.handler';
import { I18nService } from 'src/app/utils/language/i18n.service';

@Component({
  selector: 'myim-parties',
  templateUrl: './parties.component.html',
  styleUrls: ['./parties.component.scss']
})
export class PartiesComponent implements OnInit {


  public categories: any[] = []
  constructor(public i18nService: I18nService) {
  }

  ngOnInit(): void {

  }

}
