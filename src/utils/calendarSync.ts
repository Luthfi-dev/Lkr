/**
 * Calendar Sync Utilities for Lingkar
 * Generates direct Google Calendar, Outlook Web/365 deep links and universal .ICS files
 * Supports two-way sync parsing for .ics imports.
 */

export interface CalendarEventData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  url?: string;
}

// Convert Indonesian date string (e.g., "24 Agustus 2026", "28 Agustus 2026") into a valid Date object
export const parseIndonesianDate = (dateStr: string, fallbackDaysAhead: number = 3): { start: Date; end: Date } => {
  const monthMap: { [key: string]: number } = {
    januari: 0,
    februari: 1,
    maret: 2,
    april: 3,
    mei: 4,
    juni: 5,
    juli: 6,
    agustus: 7,
    september: 8,
    oktober: 9,
    november: 10,
    desember: 11,
  };

  const now = new Date();
  const cleaned = (dateStr || '').trim().toLowerCase();

  // Pattern: "24 Agustus 2026" or "24 Ags 2026"
  const parts = cleaned.match(/(\d{1,2})\s+([a-z]+)\s*(\d{4})?/);
  if (parts) {
    const day = parseInt(parts[1], 10);
    const monthKey = parts[2];
    const year = parts[3] ? parseInt(parts[3], 10) : now.getFullYear();

    const matchedMonth = Object.keys(monthMap).find((m) => m.startsWith(monthKey.slice(0, 3)));
    const month = matchedMonth !== undefined ? monthMap[matchedMonth] : now.getMonth();

    const start = new Date(year, month, day, 9, 0, 0);
    const end = new Date(year, month, day, 17, 0, 0);
    if (!isNaN(start.getTime())) {
      return { start, end };
    }
  }

  // Fallback
  const start = new Date(now.getTime() + fallbackDaysAhead * 24 * 60 * 60 * 1000);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return { start, end };
};

// Format Date to ISO 8601 Compact for Google / ICS: YYYYMMDDTHHmmssZ
export const formatDateToCompactISO = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Generate Google Calendar Deep Link
 */
export const createGoogleCalendarUrl = (event: {
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
}): string => {
  const dates = `${formatDateToCompactISO(event.start)}/${formatDateToCompactISO(event.end)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: dates,
    details: event.description,
    location: event.location || 'Lingkar Workspace (Online)',
    sprop: 'website:lingkar.app',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate Outlook Live / Office 365 Deep Link
 */
export const createOutlookCalendarUrl = (event: {
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
}): string => {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.start.toISOString(),
    enddt: event.end.toISOString(),
    body: event.description,
    location: event.location || 'Lingkar Workspace',
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Generate Universal iCalendar (.ics) String for Single or Multiple Events
 */
export const generateIcsContent = (
  events: Array<{
    id: string;
    title: string;
    description: string;
    start: Date;
    end: Date;
    location?: string;
    circleName?: string;
  }>
): string => {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lingkar Collaborative App//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Lingkar Tasks & Team Events',
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  events.forEach((ev) => {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}@lingkar.app`);
    lines.push(`DTSTAMP:${formatDateToCompactISO(new Date())}`);
    lines.push(`DTSTART:${formatDateToCompactISO(ev.start)}`);
    lines.push(`DTEND:${formatDateToCompactISO(ev.end)}`);
    lines.push(`SUMMARY:${ev.title.replace(/\n/g, ' ')}`);
    lines.push(
      `DESCRIPTION:${(ev.description || '').replace(/\n/g, '\\n')} (Lingkar: ${ev.circleName || 'Komunitas'})`
    );
    lines.push(`LOCATION:${(ev.location || 'Lingkar Online Workspace').replace(/\n/g, ' ')}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT15M');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Pengingat: ${ev.title}`);
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

/**
 * Download .ics file directly in browser
 */
export const downloadIcsFile = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Parse an .ics file content into structured tasks/events for importing into Lingkar
 */
export const parseIcsFile = (
  icsContent: string
): Array<{
  title: string;
  description: string;
  deadline: string;
  location: string;
}> => {
  const results: Array<{
    title: string;
    description: string;
    deadline: string;
    location: string;
  }> = [];

  const vevents = icsContent.split('BEGIN:VEVENT');
  for (let i = 1; i < vevents.length; i++) {
    const block = vevents[i].split('END:VEVENT')[0];
    
    let summary = 'Event Kalender Impor';
    let description = 'Diimpor dari kalender eksternal';
    let location = 'Online';
    let dtstart = '';

    const lines = block.split(/\r\n|\n|\r/);
    lines.forEach((line) => {
      if (line.startsWith('SUMMARY:')) {
        summary = line.replace('SUMMARY:', '').trim();
      } else if (line.startsWith('DESCRIPTION:')) {
        description = line.replace('DESCRIPTION:', '').replace(/\\n/g, '\n').trim();
      } else if (line.startsWith('LOCATION:')) {
        location = line.replace('LOCATION:', '').trim();
      } else if (line.startsWith('DTSTART:')) {
        dtstart = line.replace('DTSTART:', '').trim();
      } else if (line.startsWith('DTSTART;')) {
        dtstart = line.split(':')[1] || '';
      }
    });

    let deadlineFormatted = 'Akhir Bulan Ini';
    if (dtstart) {
      // e.g. 20260824T090000Z or 20260824
      const y = dtstart.slice(0, 4);
      const m = parseInt(dtstart.slice(4, 6), 10) - 1;
      const d = dtstart.slice(6, 8);
      const monthsIndo = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      if (y && !isNaN(m) && d) {
        deadlineFormatted = `${parseInt(d, 10)} ${monthsIndo[m] || 'Agustus'} ${y}`;
      }
    }

    results.push({
      title: summary,
      description: description,
      deadline: deadlineFormatted,
      location: location,
    });
  }

  return results;
};
