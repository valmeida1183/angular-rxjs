import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Course } from "../model/course";
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
  delay,
  map,
  concatMap,
  switchMap,
  withLatestFrom,
  concatAll,
  shareReplay,
  throttle,
  throttleTime,
} from "rxjs/operators";
import { merge, fromEvent, Observable, concat, interval } from "rxjs";
import { Lesson } from "../model/lesson";
import { createHttpObservable } from "../common/util";
import { debug, RxJsLoggingLevel } from "../common/debug";

@Component({
  selector: "course",
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.css"],
})
export class CourseComponent implements OnInit, AfterViewInit {
  courseId: string;
  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;

  @ViewChild("searchInput", { static: true }) input: ElementRef;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.params["id"];
    this.course$ = createHttpObservable(`/api/courses/${this.courseId}`).pipe(
      debug(RxJsLoggingLevel.INFO, "course value")
    );
  }

  ngAfterViewInit() {
    // const searchLessons$ = fromEvent<any>(
    //   this.input.nativeElement,
    //   "keyup"
    // ).pipe(
    //   map((keyUpEvent) => keyUpEvent.target.value),
    //   debounceTime(400),
    //   distinctUntilChanged(),
    //   // SwitchMap serve quando queremos resolver esta situação:
    //   // should we cancel an ongoing save and start a new one?
    //   switchMap((searchTerm) => this.loadLessons(searchTerm))
    // );
    // const initialLessons$ = this.loadLessons();
    // this.lessons$ = concat(initialLessons$, searchLessons$);

    // better way to write same code above with startWith operator!
    this.lessons$ = fromEvent<any>(this.input.nativeElement, "keyup").pipe(
      map((keyUpEvent) => keyUpEvent.target.value),
      startWith(""),
      debug(RxJsLoggingLevel.TRACE, "search"),
      debounceTime(400),
      distinctUntilChanged(),
      // SwitchMap serve quando queremos resolver esta situação:
      // should we cancel an ongoing save and start a new one?
      switchMap((searchTerm) => this.loadLessons(searchTerm)),
      debug(RxJsLoggingLevel.DEBUG, "lessons value")
    );

    // Throttling vs Debouncing:

    // Debauncing need to stream stabilize for a certain period of time to emit values (ex: 400 ms).
    // If never stabilize (ex: user never stop to write) it will never emit a new value.
    // fromEvent<any>(this.input.nativeElement, "keyup")
    //   .pipe(
    //     map((keyUpEvent) => keyUpEvent.target.value),
    //     startWith(""),
    //     debounceTime(400)
    //   )
    //   .subscribe(console.log);

    //Throttling will emit values of stream after a period of time, in this example 500ms.
    // This will ignore values that will be emited before 500ms between one value and another, bacause of this behavior
    // fromEvent<any>(this.input.nativeElement, "keyup")
    //   .pipe(
    //     map((keyUpEvent) => keyUpEvent.target.value),
    //     startWith(""),
    //     throttleTime(500)
    //   )
    //   .subscribe(console.log);
  }

  loadLessons(searchTerm: string = ""): Observable<Lesson[]> {
    return createHttpObservable(
      `/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${searchTerm}`
    ).pipe(map((response) => response["payload"]));
  }
}
