
import { Component, Type, ViewChild } from "@angular/core";
import { ComponentRef, Injectable, ViewContainerRef } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { LoginComponent } from "../auth/login/login.component";
import { LoaderComponent } from "./loader.component";


@Injectable({
  providedIn: 'root'
})
export class LoaderService {


  public loaderObservable = new BehaviorSubject<boolean>(false);


  constructor() {

  }

  show() {
    this.loaderObservable.next(true)
  }

  hide() {
    this.loaderObservable.next(false)
  }

  getLoader(): Observable<boolean> {
    return this.loaderObservable
      .asObservable()
  }


}