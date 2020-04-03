import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserComponent } from './user.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { HomeComponent } from 'src/app/home/home/home.component';
import { ProjectsComponent } from 'src/app/projects-list/projects/projects.component';
import { Page404Component } from 'src/app/shared/components/page404/page404.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserComponent, HomeComponent , ProjectsComponent, Page404Component   ],
      imports: [
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        HttpClientModule,
        AppRoutingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the log in button in a <a> tag when no user are logged', () => {
    const compiled = fixture.debugElement.nativeElement;
    if (!component.user) {
      expect(compiled.querySelector('a').textContent).toContain('Log In');
    } else {
      expect(compiled.querySelector('a').textContent).toContain('Log In');
    }
  });
});
