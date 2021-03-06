import { Component, OnInit } from '@angular/core';

import { Observable, from } from 'rxjs';
import { mergeMap, merge, map } from 'rxjs/operators';


import {
  ICreatedProject,
  ICreatedMember,
  ICreatedModel,
  ICreatedBoard,
  ICreatedStatus,
  ICreatedType,
  ICreatedFolder
} from "app/bimsync-project/creator.models";

import {
  IProject,
  IBimsyncBoard, IExtensionStatus, IExtensionType,
  ILibrary,
  ILibraryItem
} from "app/bimsync-project/bimsync-project.models"

import { BimsyncProjectService } from "app/bimsync-project/bimsync-project.services";
import { AppService } from "app/app.service";

@Component({
  selector: 'app-project-create-modal',
  templateUrl: './project-create-modal.component.html',
  styleUrls: ['./project-create-modal.component.scss'],
  providers: [BimsyncProjectService]
})
export class ProjectCreateModalComponent implements OnInit {

  errorMessage: string;
  existingProject: IProject;
  open: boolean;
  share: boolean;
  jsonConfig: any;
  submitted: boolean = false;
  appService: AppService;
  loaded: boolean = false;

  constructor(
    private _appService: AppService,
    private _bimsyncProjectService: BimsyncProjectService
  ) {
    this.appService = _appService;
  }

  ngOnInit() {
  }

  OpenCreateModal(project) {
    this.existingProject = project;
    this.open = true;
  }

  onSubmit() {
    // let temp = (<any>this.jsonConfig);
    // let creators = <ICreator[]>temp;
    this.submitted = true;

    let creators = JSON.parse(this.jsonConfig);
    console.log(creators);

    let creatorArray: ICreatedProject[] = creators;

    if (this.existingProject) {
      from(creatorArray).pipe(
        mergeMap(creator => {
          return this.UpdateProject(creator, this.existingProject);
        })).subscribe(result => {
          console.log(result);
        },
          error => this.errorMessage = <any>error,
          () => {
            console.log("complete");
            this.submitted = false;
            this.open = false;
          }
        );
    } else {
      from(creatorArray).pipe(
        mergeMap(creator => {
          return this.CreateProject(creator);
        })).subscribe(result => {
          console.log(result);
        },
          error => this.errorMessage = <any>error,
          () => {
            console.log("complete");
            this.submitted = false;
            this.open = false;
          }
        );
    }
  }

  UpdateProject(creator: ICreatedProject, project: IProject): Observable<any> {

    let observable$: Observable<any> = new Observable<ILibraryItem>(observer => {
      // observable execution
      observer.next(null);
      observer.complete();
    });


    if (creator.users) {
      // Assign users
      observable$ = observable$.pipe(
        merge(this.AssingUsers(creator.users, project.id))
      );
    }
    if (creator.models) {
      // Create models
      observable$ = observable$.pipe(
        merge(this.CreateModels(creator.models, project.id))
      );
    }

    if (creator.boards) {
      // Create boards
      observable$ = observable$.pipe(
        merge(this.CreateBoards(creator, project.id))
      );
    }

    if (creator.folders) {
      // Create folders
      observable$ = observable$.pipe(
        merge(this.CreateFolders(creator.folders, project.id))
      );
    }

    return observable$;
  }

  CreateProject(creator: ICreatedProject): Observable<any> {
    // Create the project
    return this._bimsyncProjectService
      .createNewProject(creator.projectName, creator.projectDescription).pipe(
        mergeMap(
          project => {
            return this.UpdateProject(creator, project);
          }
        )
      );
  }

  AssingUsers(users: ICreatedMember[], projectId: string): Observable<any> {
    // Assign new users
    return from(users).pipe(
      mergeMap(user => {
        return this._bimsyncProjectService.AddUser(
          projectId,
          user.id,
          user.role
        );
      })
    );
  }

  CreateModels(models: ICreatedModel[], projectId: string): Observable<any> {
    // Create new models
    return from(models).pipe(
      mergeMap(model => {
        return this._bimsyncProjectService.AddModel(
          projectId,
          model.name
        );
      })
    );
  }

  CreateFolders(folders: ICreatedFolder[], projectId: string): Observable<any> {
    return this.GetDocumentLibrary(projectId).pipe(
      mergeMap(library => {
        let parentId = null;
        return from(folders).pipe(
          mergeMap(subfolder => {
            return this.CreateAFolder(
              subfolder,
              projectId,
              parentId,
              library
            );
          })
        );
      })
    );
  }

  CreateAFolder(
    folder: ICreatedFolder,
    projectId: string,
    parentId: string,
    library: ILibrary
  ): Observable<ILibraryItem> {
    return this._bimsyncProjectService
      .AddFolder(projectId, folder.name, parentId, library.id).pipe(
        mergeMap(createdFolder => {
          if (folder.folders) {
            return from(folder.folders).pipe(
              mergeMap(
                subfolder => {
                  return this.CreateAFolder(
                    subfolder,
                    projectId,
                    createdFolder.id,
                    library
                  );
                }
              )
            );
          } else {
            return new Observable<ILibraryItem>(observer => {
              // observable execution
              observer.next(createdFolder);
              observer.complete();
            });
          }
        })
      );
  }

  GetDocumentLibrary(projectId: string): Observable<ILibrary> {
    // Get the Document library id
    return this._bimsyncProjectService
      .getLibraries(projectId).pipe(
        map(libraries => {
          let documentLibrary = libraries.filter(
            library => library.name === "Documents"
          );
          return documentLibrary.length > 0 ? documentLibrary[0] : null;
        })
      );
  }

  CreateBoards(creator: ICreatedProject, projectId: string): Observable<any> {
    // Create new boards
    return from(creator.boards).pipe(
      mergeMap(board => {
        return this.CreateABoard(creator, projectId, board)
      })
    );
  }

  CreateABoard(creator: ICreatedProject, projectId: string, board: ICreatedBoard): Observable<any> {
    // Create a new board
    return this._bimsyncProjectService
      .AddBoard(projectId, board.name).pipe(
        mergeMap(createdboard => {

          let statues$: Observable<IExtensionStatus> = null;
          let types$: Observable<IExtensionType> = null;

          // Create extention statuses
          if (board.statuses) {
            statues$ = this.CreateExtensionStatuses(
              createdboard,
              board
            );
          }
          // Create extension types
          if (board.types) {
            types$ = this.CreateExtensionTypes(
              createdboard,
              board
            );
          }

          if (statues$ != null && types$ != null) {
            return statues$.pipe( merge(types$));
          } else if (statues$ != null) {
            return statues$
          } else if (types$ != null) {
            return types$
          } else {
            return null
          }

        })
      );
  }

  CreateExtensionStatuses(
    bimsyncBoard: IBimsyncBoard,
    board: ICreatedBoard
  ): Observable<IExtensionStatus> {
    let existingStatusesNames: string[] = ["Closed", "Open"];

    let createdStatuses: ICreatedStatus[] = [];
    let updatedStatues: ICreatedStatus[] = [];

    for (let status of board.statuses) {
      let index = existingStatusesNames.indexOf(status.name);

      if (index > -1) {
        // The status already exist, we will have to update it
        updatedStatues.push(status);
        // Remove it from the existingTypesNames
        existingStatusesNames.splice(index, 1);
      } else {
        // The status does not exist, we will have to create it
        createdStatuses.push(status);
      }
    }

    // Update statuses
    let updatedStatues$: Observable<any> = from(
      updatedStatues
    ).pipe(
      mergeMap(status => {
        return this._bimsyncProjectService.UpdateExtensionStatus(
          bimsyncBoard.project_id,
          status.name,
          status.name,
          status.color,
          status.type
        );
      })
    );

    // Create statues
    let createdStatues$: Observable<any> = from(
      createdStatuses
    ).pipe(mergeMap(status => {
      return this._bimsyncProjectService.AddExtensionStatus(
        bimsyncBoard.project_id,
        status.name,
        status.color,
        status.type
      );
    })
    );

    // Detele remaining existing statuses
    let deleteStatues$: Observable<any> = from(
      existingStatusesNames
    ).pipe(
      mergeMap(name => {
      return this._bimsyncProjectService.DeleteExtensionStatus(
        bimsyncBoard.project_id,
        name
      );
    }));

    return createdStatues$.pipe(
      merge(updatedStatues$),
      merge(deleteStatues$)
      );
  }

  CreateExtensionTypes(
    bimsyncBoard: IBimsyncBoard,
    board: ICreatedBoard
  ): Observable<IExtensionType> {
    let existingTypesNames: string[] = [
      "Error",
      "Warning",
      "Info",
      "Unknown"
    ];

    let createdTypes: ICreatedType[] = [];
    let updatedTypes: ICreatedType[] = [];

    for (let type of board.types) {
      let index = existingTypesNames.indexOf(type.name);

      if (index > -1) {
        // The type already exist, we will have to update it
        updatedTypes.push(type);
        // Remove it from the existingTypesNames
        existingTypesNames.splice(index, 1);
      } else {
        // The type does not exist, we will have to create it
        createdTypes.push(type);
      }
    }

    // Update types
    let updatedTypes$: Observable<any> = from(
      updatedTypes
    ).pipe(
      mergeMap(type => {
        return this._bimsyncProjectService.UpdateExtensionType(
          bimsyncBoard.project_id,
          type.name,
          type.name,
          type.color
        );
      })
    );

    // Create types
    let createdTypes$: Observable<any> = from(
      createdTypes
    ).pipe(
      mergeMap(type => {
        return this._bimsyncProjectService.AddExtensionType(
          bimsyncBoard.project_id,
          type.name,
          type.color
        );
      })
    );

    // Detele remaining existing types
    let deleteTypes$: Observable<any> = from(
      existingTypesNames
    ).pipe(
      mergeMap(name => {
        return this._bimsyncProjectService.DeleteExtensionType(
          bimsyncBoard.project_id,
          name
        );
      })
    );

    return updatedTypes$.pipe(
      merge(createdTypes$),
      merge(deleteTypes$)
    );
  }

}
