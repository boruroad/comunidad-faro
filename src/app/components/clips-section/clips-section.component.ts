import { Component, Input } from '@angular/core';

import { Clip } from '../../faro-config';

@Component({
  selector: 'app-clips-section',
  standalone: true,
  templateUrl: './clips-section.component.html'
})
export class ClipsSectionComponent {
  @Input({ required: true }) clips: Clip[] = [];

  selectedCategory = 'TODOS';
  searchQuery = '';
  activeClip: Clip | null = null;
  isClipModalOpen = false;

  readonly categories = [
    'TODOS',
    'Fortaleza',
    'Propósito',
    'Paz & Consuelo',
    'Familia',
    'Fe & Obediencia',
    'Oración'
  ];

  get filteredClips(): Clip[] {
    let list = this.clips;

    // Filter by selected category/emotion pill
    if (this.selectedCategory !== 'TODOS') {
      const catLower = this.selectedCategory.toLowerCase();
      list = list.filter(c =>
        (c.theme && c.theme.toLowerCase().includes(catLower)) ||
        (c.emotion && c.emotion.toLowerCase().includes(catLower)) ||
        (c.series && c.series.toLowerCase().includes(catLower))
      );
    }

    // Filter by free text search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.series && c.series.toLowerCase().includes(q)) ||
        (c.theme && c.theme.toLowerCase().includes(q)) ||
        (c.emotion && c.emotion.toLowerCase().includes(q))
      );
    }

    return list;
  }

  filterCategory(category: string): void {
    this.selectedCategory = category;
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedCategory = 'TODOS';
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
