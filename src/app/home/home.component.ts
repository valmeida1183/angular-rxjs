import { Component, OnInit } from "@angular/core";
import { Course } from "../model/course";
import { interval, noop, Observable, of, throwError, timer } from "rxjs";
import {
  catchError,
  delayWhen,
  finalize,
  map,
  retryWhen,
  shareReplay,
  tap,
} from "rxjs/operators";
import { createHttpObservable } from "../common/util";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  beginnerCourses: Course[];
  advancedCourses: Course[];

  beginnerCourses$: Observable<Course[]>;
  advancedCourses$: Observable<Course[]>;

  constructor() {}

  ngOnInit() {
    const http$ = createHttpObservable("/api/courses");
    const courses$: Observable<Course[]> = http$.pipe(
      // catchError((err) => {
      //   // Replace error strategy with a default value
      //   // return of([
      //   //   {
      //   //     id: 0,
      //   //     description: "RxJs In Practice Course",
      //   //     iconUrl:
      //   //       "https://s3-us-west-1.amazonaws.com/angular-university/course-images/rxjs-in-practice-course.png",
      //   //     courseListIcon:
      //   //       "https://angular-academy.s3.amazonaws.com/main-logo/main-page-logo-small-hat.png",
      //   //     longDescription:
      //   //       "Understand the RxJs Observable pattern, learn the RxJs Operators via practical examples",
      //   //     category: "BEGINNER",
      //   //     lessonsCount: 10,
      //   //   },
      //   // ])

      //   // Rethrow strategy
      //   console.log(`Error ocurred`, err);
      //   return throwError(err);
      // }),
      // finalize(() => {
      //   console.log(`Finalize executed...`);
      // }),
      tap(() => console.log("HTTP request executed!")),
      map((res) => Object.values(res["payload"])),
      shareReplay(),
      // Restry strategy
      retryWhen((errors) => errors.pipe(delayWhen(() => timer(2000))))
    );

    // Imperative approach
    // courses$.subscribe(
    //   (courses) => {
    //     this.beginnerCourses = courses.filter(
    //       (course) => course.category == "BEGINNER"
    //     );
    //     this.advancedCourses = courses.filter(
    //       (course) => course.category == "ADVANCED"
    //     );
    //   },
    //   noop,
    //   () => console.log("Completed")
    // );

    // Reactive approach (is better, however its make two http requests if courses$ nor using shareReplay)
    this.beginnerCourses$ = courses$.pipe(
      map((courses: Course[]) =>
        courses.filter((course) => course.category == "BEGINNER")
      )
    );

    this.advancedCourses$ = courses$.pipe(
      map((courses: Course[]) =>
        courses.filter((course) => course.category == "ADVANCED")
      )
    );
  }
}
