import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  // Koristi sr-Latn-RS za latinicu (ne ćirilicu)
  return new Date(date).toLocaleDateString('sr-Latn-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date) {
  // Koristi sr-Latn-RS za latinicu + lokalno vreme (ne UTC)
  const localDate = new Date(date);
  return localDate.toLocaleString('sr-Latn-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getMonthYearString(date) {
  return new Date(date).toLocaleDateString('sr-Latn-RS', {
    year: 'numeric',
    month: 'long',
  });
}
