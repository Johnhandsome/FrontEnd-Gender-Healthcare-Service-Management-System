import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  OnChanges,
} from '@angular/core';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements AfterViewInit, OnChanges {
  @Output() isFocus = new EventEmitter<boolean>();
  @Input() autoFocus = false;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    if (this.autoFocus) {
      this.searchInput?.nativeElement.focus();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['autoFocus'] && changes['autoFocus'].currentValue) {
      setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
    }
  }

  openSearch() {
    this.isFocus.emit(true);
  }
}
