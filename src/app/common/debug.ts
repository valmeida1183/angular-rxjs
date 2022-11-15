import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

let rxLoggingLevel = 2;

export enum RxJsLoggingLevel {
  TRACE,
  DEBUG,
  INFO,
  ERROR,
}

export function setRxJsLoggingLevel(level: RxJsLoggingLevel) {
  rxLoggingLevel = level;
}

export function debug(level: number, message: string) {
  return (source: Observable<any>) => {
    return source.pipe(
      tap((value) => {
        if (level >= rxLoggingLevel) {
          console.log(`${message}: `, value);
        }
      })
    );
  };
}
