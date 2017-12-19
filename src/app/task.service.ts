import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { Task } from './task';
//import { TASKS } from './mock-task';

import { MessageService } from './message.service';
import { catchError, map, tap } from 'rxjs/operators';

// The heroes web API expects a special header in HTTP save requests. 
// That header is in the httpOption constant defined in the HeroService.

const httpHaljson = {
  headers: new HttpHeaders({ 
  "X-CSRF-Token": "Qfnczb1SUnvOAsEy0A_xuGp_rkompgO2oTkCBOSEItM",
  "Authorization": "Basic Qfnczb1SUnvOAsEy0A_xuGp_rkompgO2oTkCBOSEItM", // encoded user/pass - this is admin/123qwe
  // "Content-Type": "application/json"
  "Content-Type": "application/hal+json"
  })
};

@Injectable()
export class TaskService {
  private mainUrl = 'http://drupal.dd:8083'

constructor(
  private http: HttpClient,
  private messageService: MessageService) { }

  	getTasks(): Observable<Task[]> {
      const url = `${this.mainUrl}/tasks`;
  	  return this.http.get<Task[]>(url)
	    .pipe(
	    tap(tasks => this.log(`fetched tasks`)),	
      	catchError(this.handleError('getTasks', []))
    	);  	  
  	}

/** GET task by id. Will 404 if id not found */
getTask(id: number): Observable<Task> {
  const url = `${this.mainUrl}/tasks/${id}`;
  const returnGet = this.http.get<Task>(url);
  return returnGet
  .pipe(
        map(tasks => tasks[0]),
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} hero id=${id}`);
        }),    
    catchError(this.handleError<Task>(`getTask id=${id}`))
  );
}


/** POST: add a new hero to the server */
/* HeroService.addHero() differs from updateHero in two ways.
  *- it calls HttpClient.post() instead of put().
  *- it expects the server to generates an id for the new hero, which it returns 
  *  in the Observable<Hero> to the caller. */
addTask (task: Task): Observable<Task> {
  const url = `${this.mainUrl}/entity/node`;  
  // console.log(JSON.stringify(task));    
  return this.http.post(url, task, httpHaljson).pipe(    
    tap((task: Task) => this.log(`added task w/ id=${task.id}`)),
    catchError(this.handleError<Task>('addtask'))
  );
}
    // {
    //   "_links": {"type": {"href": "http://drupal.dd:8083/rest/type/node/task"}},
    //   "nid": {"": {"value": "5"}},
    //   "title": {"value": "Test Article 2"},  
    //   "body": {"": {"value": "i am an update content"}} 
    // }
    /** PUT: update the task on the server */
    updateTask (task: Task, id): Observable<any> {
      // const id = typeof task === 'number' ? task : task.id;
      
      const url = `${this.mainUrl}/node/${id}`;      
      
      // console.log(JSON.stringify('id: ' + id));    
      // console.log(JSON.stringify(task));    

      return this.http.patch(url, task, httpHaljson).pipe(
        tap(_ => this.log(`updated task id=${id}`)),
        catchError(this.handleError<any>('updateTask'))
      );
    }


/** DELETE: delete the task from the server */
deleteTask (task: Task | number): Observable<Task> {
  const id = typeof task === 'number' ? task : task.id;
  const url = `${this.mainUrl}/node/${id}`;

  return this.http.delete<Task>(url, httpHaljson).pipe(
    tap(_ => this.log(`deleted task id=${id}`)),
    catchError(this.handleError<Task>('deleteHero'))
  );
}


  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add('HeroService: ' + message);
  }
private handleError<T> (operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {

    // TODO: send the error to remote logging infrastructure
    console.error(error); // log to console instead

    // TODO: better job of transforming error for user consumption
    this.log(`${operation} failed: ${error.message}`);

    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
}
}
