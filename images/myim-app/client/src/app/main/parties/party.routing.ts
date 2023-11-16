import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPartyComponent } from './add-party/add-party.component';
import { PartiesComponent } from './parties.component';
import { ViewPartyComponent } from './view-party/view-party.component';

const routes: Routes = [
    {
        path: "",
        component: ViewPartyComponent,

    },
    {
        path: "add-party",
        component: AddPartyComponent
    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PartyRoutingModule { }
