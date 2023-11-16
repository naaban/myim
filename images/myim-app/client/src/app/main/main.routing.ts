import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartiesComponent } from './parties/parties.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
    {
        path: "dashboard",
        component: DashboardComponent
    },
    {
        path: "parties",
        loadChildren: () => import("./parties/party.module").then(p => p.PartyModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainRoutingModule { }
