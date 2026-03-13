export const APP_NAME = 'Events Platform';
export const APP_VERSION = '1.0.0';

export const ROLES = { CLIENT: 'client', VENDOR: 'vendor', ADMIN: 'admin' } as const;

export const BOOKING_STATUSES = {
  INQUIRY: 'inquiry', PENDING: 'pending', CONFIRMED: 'confirmed',
  REJECTED: 'rejected', CANCELLED: 'cancelled', COMPLETED: 'completed',
} as const;

export const LISTING_STATUSES = {
  DRAFT: 'draft', PENDING: 'pending', APPROVED: 'approved',
  REJECTED: 'rejected', ARCHIVED: 'archived',
} as const;

export const PRICE_UNITS: Record<string, string> = {
  per_event: '/ event', per_day: '/ day', per_night: '/ night',
  per_hour: '/ hour', per_person: '/ person', per_plate: '/ plate', package: 'package',
};
