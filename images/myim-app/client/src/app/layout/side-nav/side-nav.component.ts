import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SlideDown } from 'src/app/animations';
import { AppRouteHandler } from '../../utils/app-route.handler';
import { ACTION_NAV_ITEMS } from 'src/app/utils/_action.nav';
import { SIDE_NAV_ITEMS } from 'src/app/utils/_side.nav';
import { I18nService } from 'src/app/utils/language/i18n.service';
import { Location } from '@angular/common';
@Component({
  selector: 'myim-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [SlideDown]
})
export class SideNavComponent extends AppRouteHandler implements OnInit {

  public animationState = 'out';
  public sideNavItems: any[] = SIDE_NAV_ITEMS
  public categories: any[] = ACTION_NAV_ITEMS
  public appRouteHandler!: AppRouteHandler

  public showActions: boolean = false

  constructor(router: Router, ngZone: NgZone, _location: Location, public i18nService: I18nService) {
    super(router, ngZone, _location);
  }

  ngOnInit(): void {
    this.setCurrentNavItemAsActive()

  }
  /**
   * To set current nav item as active
   * @memberof  SideNavComponent
   * @returns void
   */
  setCurrentNavItemAsActive() {
    this.sideNavItems = this.sideNavItems.map(item => {
      item.isActive = false;
      if (item.path === this.router.url) {

        item.isActive = true;
        if (item.children && item.children.length) {
          item.isOpen = true;
        }
        else {
          this.goto(item.path)
        }
      }
      if (item.children && item.children.length) {

        item.children = item.children.map((ci: any) => {
          if (ci.path === this.router.url) {
            ci.isActive = true;
            this.goto(ci.path)
          }
          return ci;
        })
      }

      return item;

    })
  }

  onNavItemClicked(index: number, childIndex?: any) {
    let nav = this.sideNavItems[index];
    this.sideNavItems.map(item => {
      item.isActive = false
      item.isOpen = false
      if (item.children && item.children.length) {
        item.children = item.children.map((c: any) => {
          c.isActive = false;
          return c
        })
      }
      return item
    })

    this.sideNavItems[index].isActive = true

    if (nav.children) {
      this.sideNavItems.map(item => {
        item.isOpen = false;
        return item
      })
      this.sideNavItems[index].isOpen = !this.sideNavItems[index].isOpen
    }

    if (childIndex > -1) {
      this.sideNavItems[index].children[childIndex].isActive = true
      this.goto(this.sideNavItems[index].children[childIndex].path)
    }

    else {
      this.goto(this.sideNavItems[index].path)
    }
  }

  openActions() {
    this.showActions = !this.showActions;
  }

  onActionClicked(action : any) {
    this.showActions = !this.showActions;
    this.goto(action.path)
  }
}
