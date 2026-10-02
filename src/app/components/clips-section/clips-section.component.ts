import { Component, Input } from '@angular/core';

import { Clip } from '../../faro-config';

@Component({
  selector: 'app-clips-section',
  standalone: true,
  templateUrl: './clips-section.component.html'
})
export class ClipsSectionComponent {
  @Input({ required: true }) clips: Clip[] = [];

  selectedClipSeries = 'TODOS';
  activeClip: Clip | null = null;
  isClipModalOpen = false;

  get clipSeriesList(): string[] {
    const seriesSet = new Set(this.clips.map(c => c.series));
    return ['TODOS', ...Array.from(seriesSet)];
  }

  get filteredClips(): Clip[] {
    if (this.selectedClipSeries === 'TODOS') {
      return this.clips;
    }
    return this.clips.filter(c => c.series === this.selectedClipSeries);
  }

  filterClips(series: string): void {
    this.selectedClipSeries = series;
  }

  openClip(clip: Clip): void {
    this.activeClip = clip;
    this.isClipModalOpen = true;
  }

  closeClip(): void {
    this.isClipModalOpen = false;
    this.activeClip = null;
  }

  nextClip(): void {
    if (!this.activeClip) return;
    const currentList = this.filteredClips;
    const currentIndex = currentList.findIndex(c => c.id === this.activeClip?.id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % currentList.length;
      this.activeClip = currentList[nextIndex];
    }
  }

  prevClip(): void {
    if (!this.activeClip) return;
    const currentList = this.filteredClips;
    const currentIndex = currentList.findIndex(c => c.id === this.activeClip?.id);
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length;
      this.activeClip = currentList[prevIndex];
    }
  }
}
