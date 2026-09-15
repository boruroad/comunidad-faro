import { Component, Input } from '@angular/core';

import { MusicRelease } from '../faro-config';
import {
  toCoverAriaLabel,
  toPhotoBackground
} from '../shared/presentation.utils';

@Component({
  selector: 'app-music-section',
  standalone: true,
  templateUrl: './music-section.component.html'
})
export class MusicSectionComponent {
  @Input() isMusicEnabled = false;
  @Input({ required: true }) releases: MusicRelease[] = [];

  expandedReleaseIndex: number | null = null;

  toggleRelease(index: number): void {
    this.expandedReleaseIndex =
      this.expandedReleaseIndex === index
        ? null
        : index;
  }

  isReleaseExpanded(index: number): boolean {
    return (
      this.expandedReleaseIndex ===
      index
    );
  }

  photoStyle(path: string): string | null {
    return toPhotoBackground(path);
  }

  coverAriaLabel(
    title: string,
    artist: string
  ): string {
    return toCoverAriaLabel(
      title,
      artist
    );
  }
}
