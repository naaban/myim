import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LoaderService } from '../loader/loader.service';
import { SIDE_NAV_ITEMS } from '../utils/_side.nav';

@Component({
  selector: 'myim-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  constructor(private loaderService: LoaderService) {
  }
  
  ngOnInit(): void {
  }

}
