import { Component, Input } from '@angular/core';

import { toSocialLabel } from '../shared/presentation.utils';

@Component({
  selector: 'app-social-section',
  standalone: true,
  templateUrl: './social-section.component.html'
})
export class SocialSectionComponent {
  @Input({ required: true }) socialEntries: Array<[string, string]> = [];

  socialLabel(name: string): string {
    return toSocialLabel(name);
  }
}
