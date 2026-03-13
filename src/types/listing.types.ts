export interface Listing {
  _id: string; title: string; slug: string; description: string;
  vendor: { _id: string; businessName: string; businessSlug: string; averageRating: number };
  category: { _id: string; name: string; slug: string };
  pricing: { basePrice: number; currency: string; priceUnit: string; maxPrice?: number; packages?: ListingPackage[] };
  capacity: { min: number; max: number };
  address: { street?: string; city: string; state?: string; country: string; area?: string };
  location: { type: string; coordinates: number[] };
  images: Array<{ _id: string; url: string; publicId: string; caption?: string; isPrimary: boolean }>;
  amenities: string[]; tags: string[]; attributes: Record<string, unknown>;
  status: string; isFeatured: boolean; averageRating: number; totalReviews: number; viewCount: number; createdAt: string;
}
export interface ListingPackage { name: string; description?: string; price: number; includes: string[]; }
export interface Category { _id: string; name: string; slug: string; description?: string; icon?: { url: string }; image?: { url: string }; listingCount: number; isActive: boolean; }
export interface ListingFilter { page?: number; limit?: number; sort?: string; search?: string; category?: string; city?: string; minPrice?: number; maxPrice?: number; rating?: number; }
