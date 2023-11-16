
import { Component, Type } from "@angular/core";
import { ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from "@angular/core";
import { Subject } from "rxjs";
import { LoginComponent } from "../auth/login/login.component";


@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private componentRef!: ComponentRef<any>
  private componentSubscriber!: Subject<string>;
  // private resolver: ComponentFactoryResolver
  constructor() { }

  openModal(component: any, entry: ViewContainerRef, extras: any) {
    // this.componentRef = this.resolver.resolveComponentFactory(LoginComponent);
    this.componentRef = entry.createComponent(component);
    Object.keys(extras).map(item => {
      this.componentRef.instance[item] = extras[item];
    })
    this.componentRef.instance.closeMeEvent.subscribe(() => this.closeModal());
    this.componentRef.instance.confirmEvent.subscribe(() => this.confirm());
    this.componentSubscriber = new Subject<string>();
    return this.componentSubscriber.asObservable();
  }

  closeModal() {
    this.componentSubscriber.complete();
    this.componentRef.destroy();
  }

  confirm() {
    this.componentSubscriber.next('confirm');
    this.closeModal();
  }

  isOpen() {
    return this.componentSubscriber ? true : false
  }
}