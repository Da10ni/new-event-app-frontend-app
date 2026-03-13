export interface Booking {
  _id: string; bookingNumber: string;
  client: { _id: string; firstName: string; lastName: string; email: string; phone: string; avatar: { url: string } };
  vendor: { _id: string; businessName: string; businessSlug: string };
  listing: { _id: string; title: string; slug: string; images: Array<{ url: string }>; pricing: { basePrice: number; currency: string; priceUnit: string }; address: { city: string; country: string } };
  eventDate: string; eventEndDate?: string; eventType?: string; guestCount?: number;
  pricingSnapshot: { basePrice: number; totalAmount: number; currency: string };
  status: string; clientMessage?: string; vendorResponse?: string; isReviewed: boolean; createdAt: string;
}
export interface CreateBookingRequest { listing: string; eventDate: string; eventEndDate?: string; eventType?: string; guestCount?: number; clientMessage?: string; specialRequests?: string; }
