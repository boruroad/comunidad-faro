import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-first-visit-section',
  standalone: true,
  templateUrl: './first-visit-section.component.html'
})
export class FirstVisitSectionComponent {
  @Input({ required: true }) firstVisit: [string, string][] = [];
  @Input() facebookUrl = '';
}
