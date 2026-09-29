import { Component, Input } from '@angular/core';

import { CalendarEvent, FaroConfig } from '../../faro-config';

@Component({
  selector: 'app-calendar-section',
  standalone: true,
  templateUrl: './calendar-section.component.html'
})
export class CalendarSectionComponent {
  @Input() isStaticCalendarEnabled = false;
  @Input({ required: true }) calendar!: FaroConfig['calendar'];
  @Input() calendarEmbedUrl = '';

  formatCalendarDate(
    date: string
  ): string {
    const parsedDate =
      Date.parse(date);

    if (
      Number.isNaN(parsedDate)
    ) {
      return date;
    }

    return new Intl.DateTimeFormat(
      'es-MX',
      {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        timeZone: 'America/Mexico_City'
      }
    )
      .format(parsedDate)
      .replace('.', '')
      .toUpperCase();
  }

  hasCalendarCta(
    event: CalendarEvent
  ): boolean {
    return Boolean(
      (event.ctaLabel || '').trim() &&
      (event.ctaUrl || '').trim()
    );
  }
}
