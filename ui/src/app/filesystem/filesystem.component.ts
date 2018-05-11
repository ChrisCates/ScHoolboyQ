import { Component, OnInit } from '@angular/core';
import { MainService } from '../main.service';

@Component({
  selector: 'app-filesystem',
  templateUrl: './filesystem.component.html',
  styleUrls: ['./filesystem.component.scss']
})
export class FilesystemComponent implements OnInit {

  constructor(public main: MainService) {

  }

  ngOnInit() {

  }

}
