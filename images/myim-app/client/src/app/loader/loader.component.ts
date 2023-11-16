import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [
    trigger("fadeIn", [
      state("in", style({ opacity: 1 })),
      transition(":enter", [style({ opacity: 0 }), animate(300)]),
      transition(":leave", animate(200, style({ opacity: 0 }))),
    ]),
  ],
})
export class LoaderComponent implements OnInit {


  show: boolean = false


  constructor(public loaderSerive: LoaderService) { }

  ngOnInit(): void {
    this.loaderSerive.getLoader().subscribe(status => {
      this.show = status
    })
  }

}
