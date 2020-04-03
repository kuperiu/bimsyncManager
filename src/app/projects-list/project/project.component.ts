import { Component, OnInit, Input } from '@angular/core';
import { IProject } from 'src/app/shared/models/bimsync.model';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  @Input() project: IProject;
  @Input() starVisible: boolean;

  constructor() { }

  ngOnInit() {
  }

  open(event: Event) {
    event.preventDefault();
    // EDIT: Looks like you also have to include Event#stopImmediatePropogation as well
    event.stopImmediatePropagation();
    // ...
    alert('open');
  }

  favorite(event: Event) {
    event.preventDefault();
    // EDIT: Looks like you also have to include Event#stopImmediatePropogation as well
    event.stopImmediatePropagation();
    // ...
    alert('favorite');
  }

}
