import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {
  concat,
  fromEvent,
  interval,
  merge,
  noop,
  Observable,
  of,
  timer,
} from "rxjs";
import { map } from "rxjs/operators";
import { createHttpObservable } from "../common/util";

@Component({
  selector: "about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"],
})
export class AboutComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // const interval$ = timer(3000, 1000);
    // const subscriptionInt1 = interval$.subscribe((val) =>
    //   console.log(`Stream 1 ---> ${val}`)
    // );
    // const subscriptionInt2 = interval$.subscribe((val) =>
    //   console.log(`Stream 2 ---> ${val}`)
    // );
    // const click$ = fromEvent(document, "click");
    // const subscriptionClick = click$.subscribe(
    //   (evt) => console.log(evt),
    //   (err) => console.log(err),
    //   () => console.log("Completed!!!")
    // );
    // setTimeout(() => {
    //   subscriptionInt1.unsubscribe();
    //   subscriptionInt2.unsubscribe();
    // }, 5000);

    // Concat ex:
    // const source1$ = of(1, 2, 3);
    // const source2$ = of(4, 5, 6);
    // const source3$ = of(7, 8, 9);

    // const result$ = concat(source1$, source2$, source3$);
    // result$.subscribe((val) => console.log(val));

    //Merge ex:
    // const interval1$ = interval(1000);
    // const interval2$ = interval1$.pipe(map((val) => val * 10));

    // const result2$ = merge(interval1$, interval2$);
    // result2$.subscribe(console.log);

    //Unsubscription ex:
    const interval1$ = interval(1000);
    const sub = interval1$.subscribe(console.log);

    setTimeout(() => sub.unsubscribe(), 5000);

    const http$ = createHttpObservable("/api/courses");
    const subs = http$.subscribe(console.log());

    setTimeout(() => {
      return subs.unsubscribe();
    }, 0);
  }
}
