import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Course } from "../model/course";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import * as moment from "moment";
import { fromEvent, Observable } from "rxjs";
import {
  concatMap,
  distinctUntilChanged,
  exhaustMap,
  filter,
  mergeMap,
} from "rxjs/operators";
import { fromPromise } from "rxjs/internal-compatibility";

@Component({
  selector: "course-dialog",
  templateUrl: "./course-dialog.component.html",
  styleUrls: ["./course-dialog.component.css"],
})
export class CourseDialogComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  course: Course;

  @ViewChild("saveButton", { static: true }) saveButton: ElementRef;

  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) course: Course
  ) {
    this.course = course;

    this.form = fb.group({
      description: [course.description, Validators.required],
      category: [course.category, Validators.required],
      releasedAt: [moment(), Validators.required],
      longDescription: [course.longDescription, Validators.required],
    });
  }

  ngOnInit() {
    this.form.valueChanges
      .pipe(
        filter(() => this.form.valid),
        // concatMap vai esperar cada observable oriundo de saveCourse terminar antes de chamar o próximo.
        /* should we wait for one save request to complete before
           doing another save? 
         */
        concatMap((changes) => this.saveCourse(changes))
        // mergeMap vai executar cada observable oriundo de saveCourse em paralelo, na medida em que forem sendo criados.
        /* 
          should we do multiple saves in parallel?
        */
        //mergeMap((changes) => this.saveCourse(changes))
      )
      .subscribe();
  }

  ngAfterViewInit() {
    fromEvent(this.saveButton.nativeElement, "click")
      .pipe(
        // exhaustMap ignora as emissões do observable pai enquanto o observable filho ainda não completou, neste caso permitindo clicar multiplas vezes no botão save sem disparar inúmeros requests.
        // should we ignore new save attempts while one is already ongoing
        exhaustMap(() => this.saveCourse(this.form.value))
      )
      .subscribe();
  }

  saveCourse(changes): Observable<Response> {
    return fromPromise(
      fetch(`/api/courses/${this.course.id}`, {
        method: "PUT",
        body: JSON.stringify(changes),
        headers: {
          "content-type": "application/json",
        },
      })
    );
  }

  close() {
    this.dialogRef.close();
  }
}
