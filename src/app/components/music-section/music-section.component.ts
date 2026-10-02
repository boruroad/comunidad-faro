import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { MusicRelease } from '../../faro-config';
import { toPhotoBackground } from '../../shared/presentation.utils';

@Component({
  selector: 'app-music-section',
  standalone: true,
  templateUrl: './music-section.component.html'
})
export class MusicSectionComponent {
  @Input() isMusicEnabled = false;
  @Input({ required: true }) releases: MusicRelease[] = [];
  @Input() artistSpotifyUrl?: string;

  private readonly sanitizer = inject(DomSanitizer);

  selectedReleaseIndex = 0;
  expandedReleaseIndex: number | null = null;

  get selectedRelease(): MusicRelease {
    return this.releases[this.selectedReleaseIndex] ?? this.releases[0];
  }

  get selectedSpotifyUrl(): SafeResourceUrl | null {
    const trackId = this.selectedRelease?.spotifyTrackId;
    return trackId
      ? this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`
        )
      : null;
  }

  selectRelease(index: number): void {
    this.selectedReleaseIndex = index;
  }

  nextRelease(): void {
    if (this.releases.length === 0) return;
    this.selectedReleaseIndex = (this.selectedReleaseIndex + 1) % this.releases.length;
  }

  prevRelease(): void {
    if (this.releases.length === 0) return;
    this.selectedReleaseIndex = (this.selectedReleaseIndex - 1 + this.releases.length) % this.releases.length;
  }

  toggleRelease(index: number): void {
    this.expandedReleaseIndex = this.expandedReleaseIndex === index ? null : index;
  }

  isReleaseExpanded(index: number): boolean {
    return this.expandedReleaseIndex === index;
  }

  photoStyle(path: string): string | null {
    return toPhotoBackground(path);
  }
}
