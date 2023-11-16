import { NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { Location } from '@angular/common';
export abstract class AppRouteHandler {
    constructor(public router: Router, public ngZone: NgZone, private _location: Location) {

    }
    gotoDashboard() {
        this.goto('/dashboard')
    }
    gotoAddParty() {
        this.goto('/layout/parties/add-party')
    }
    goto(route: any) {
        this.ngZone.run(() => {
            this.router.navigate([route])
        })
    }
    goBack() {
       this._location.back()
    }
}