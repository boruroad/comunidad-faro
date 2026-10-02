import { Component, Input } from '@angular/core';

import { FaroConfig } from '../../faro-config';

@Component({
  selector: 'app-moments-section',
  standalone: true,
  templateUrl: './moments-section.component.html'
})
export class MomentsSectionComponent {
  @Input({ required: true }) moments!: FaroConfig['moments'];
}
