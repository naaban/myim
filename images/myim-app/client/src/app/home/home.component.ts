import { Type } from '@angular/core';
import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginComponent } from '../auth/login/login.component';
import { ModalService } from '../services/modal.service';
import { HOME_NAV_ITEMS } from '../utils/_home.nav';

@Component({
  selector: 'myim-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  public homeNavItems: any[] = HOME_NAV_ITEMS
  public currentNavItem: any = null
  constructor(private modalService: ModalService) { }


  @ViewChild('modal', { read: ViewContainerRef })
  entry!: ViewContainerRef;
  sub!: Subscription;



  private componentType!: Type<LoginComponent>;


  ngOnInit(): void {
    this.currentNavItem = this.homeNavItems.find(item => item.isActive)
  }
  createModal() {

    if (this.modalService.isOpen())
      this.modalService.closeModal()

    this.sub = this.modalService
      .openModal(LoginComponent, this.entry, { title: 'Are you sure ?', body: 'click confirm or close' })
      .subscribe((v) => {
        //your logic
      });

  }
  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  onNavItemClicked(nav: any) {
    this.homeNavItems[this.homeNavItems.indexOf(this.currentNavItem)].isActive = false
    this.homeNavItems[this.homeNavItems.indexOf(nav)].isActive = true
    this.currentNavItem = nav
  }

}
