import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { UserService } from '../../user/user.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService) { }

  ngOnInit() {

    this.activatedRoute.url.pipe(first()).subscribe(url => {
      if (url[0].path === 'projects') {
        console.log(url[0].path);
        console.log(this.userService.user);
      } else {
        let state = '';
        let authorizationCode = '';
        // subscribe to router event and retrive the callback code
        this.activatedRoute.queryParams.subscribe((params: Params) => {
          authorizationCode = params.code;
          state = params.state;
        });

        // Get the connected user
        if (state === 'api') {
          this.userService.CreateUser(authorizationCode);
        }

        if (state === 'bcf') {
          this.userService.CreateBCFToken(authorizationCode);
        }
      }

    });



  }

}
