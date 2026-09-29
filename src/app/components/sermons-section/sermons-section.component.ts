import { Component, Input } from '@angular/core';

import { Clip, FaroConfig, Sermon } from '../../faro-config';
import { ClipsSectionComponent } from '../clips-section/clips-section.component';

@Component({
  selector: 'app-sermons-section',
  standalone: true,
  imports: [ClipsSectionComponent],
  templateUrl: './sermons-section.component.html'
})
export class SermonsSectionComponent {
  @Input() isSermonsEnabled = false;
  @Input({ required: true }) sermonsConfig!: FaroConfig['sermons'];
  @Input() clips: Clip[] = [];

  get sermonFeatured(): Sermon | undefined {
    return this.sermonsConfig?.featured;
  }

  get sermonList(): Sermon[] {
    return this.sermonsConfig?.list ?? [];
  }
}
