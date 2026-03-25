import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  HiCalendarDays,
  HiUserGroup,
  HiChevronLeft,
  HiClock,
  HiLockClosed,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import { listingApi } from "../../../services/api/listingApi";
import { bookingApi } from "../../../services/api/bookingApi";
import { useAppSelector } from "../../../store/hooks";
import Button from "../../../components/ui/Button";
import TextArea from "../../../components/ui/TextArea";
import Skeleton from "../../../components/ui/Skeleton";
import RatingDisplay from "../../../components/listing/RatingDisplay";
import type { Listing } from "../../../types";

const BookingPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useAppSelector((state) => state.auth);

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [eventDate, setEventDate] = useState(searchParams.get("date") || "");
  const [guestCount, setGuestCount] = useState(
    searchParams.get("guests") || "",
  );
  const [specialRequests, setSpecialRequests] = useState("");
  const [editingDate, setEditingDate] = useState(false);
  const [editingGuests, setEditingGuests] = useState(false);

  const selectedPackageName = searchParams.get("package") || "";

  useEffect(() => {
    if (!listingId) return;
    const fetchListing = async () => {
      setLoading(true);
      try {
        // Try to fetch by ID - if the API uses slugs, we get it from the listings endpoint
        const res = await listingApi.getBySlug(listingId);
        setListing(res.data.data.listing);
      } catch {
        toast.error("Failed to load listing details");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [listingId, navigate]);

  const selectedPkg = listing?.pricing.packages?.find(
    (p) => p.name === selectedPackageName,
  );
  const displayPrice = selectedPkg?.price || listing?.pricing.basePrice || 0;

  const handleSubmit = async () => {
    if (!listing) return;
    if (!eventDate) {
      toast.error("Please select an event date");
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        listing: listing._id,
        eventDate,
        guestCount: guestCount ? Number(guestCount) : undefined,
        specialRequests: specialRequests || undefined,
      };
      const res = await bookingApi.create(bookingData);
      toast.success("Booking created successfully!");
      navigate(`/my-bookings/${res.data.data.booking._id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton variant="text" width="40%" height={32} className="mb-8" />
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-6">
            <Skeleton variant="rect" height={120} />
            <Skeleton variant="rect" height={120} />
            <Skeleton variant="rect" height={80} />
          </div>
          <div className="lg:w-[380px]">
            <Skeleton variant="card" height={300} />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const primaryImage =
    listing.images.find((img) => img.isPrimary)?.url || listing.images[0]?.url;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <HiChevronLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700">
            Request to Book
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left side */}
          <div className="flex-1 space-y-8">
            {/* Trip Details */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">
                Your trip
              </h2>

              {/* Date */}
              <div className="flex items-start justify-between py-4 border-b border-neutral-100">
                <div className="flex items-start gap-3">
                  <HiCalendarDays className="h-5 w-5 text-neutral-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-700">Date</p>
                    {editingDate ? (
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="mt-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoFocus
                        onBlur={() => setEditingDate(false)}
                      />
                    ) : (
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {eventDate
                          ? new Date(eventDate).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Select a date"}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEditingDate(!editingDate)}
                  className="text-sm font-semibold text-neutral-700 underline underline-offset-4 hover:text-primary-500 transition-colors"
                >
                  {editingDate ? "Done" : "Edit"}
                </button>
              </div>

              {/* Guests */}
              <div className="flex items-start justify-between py-4 border-b border-neutral-100">
                <div className="flex items-start gap-3">
                  <HiUserGroup className="h-5 w-5 text-neutral-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-700">Guests</p>
                    {editingGuests ? (
                      <input
                        type="number"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        min={listing.capacity.min}
                        max={listing.capacity.max}
                        placeholder={`${listing.capacity.min} - ${listing.capacity.max}`}
                        className="mt-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-32"
                        autoFocus
                        onBlur={() => setEditingGuests(false)}
                      />
                    ) : (
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {guestCount
                          ? `${guestCount} guests`
                          : "Add number of guests"}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEditingGuests(!editingGuests)}
                  className="text-sm font-semibold text-neutral-700 underline underline-offset-4 hover:text-primary-500 transition-colors"
                >
                  {editingGuests ? "Done" : "Edit"}
                </button>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">
                Special Requests
              </h2>
              <TextArea
                placeholder="Let the vendor know about any special requirements, dietary needs, or other requests..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                maxCharacters={1000}
                rows={4}
              />
            </div>

            {/* Cancellation Policy */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">
                Cancellation Policy
              </h2>
              <div className="flex items-start gap-3 text-neutral-500">
                <HiClock className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium text-neutral-700">
                      Free cancellation before confirmation.
                    </span>{" "}
                    Once the vendor confirms your booking, cancellation terms
                    may apply. Contact the vendor directly for specific
                    cancellation policies.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-neutral-100">
              <p className="text-sm text-neutral-400 mb-4">
                By clicking the button below, you agree to the Terms of Service
                and Privacy Policy.
              </p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSubmit}
                loading={submitting}
                disabled={!eventDate}
              >
                Confirm Booking
              </Button>
            </div>
          </div>

          {/* Right Side - Listing Summary */}
          <div className="lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                {/* Listing card summary */}
                <div className="flex gap-4 p-4 border-b border-neutral-100">
                  <img
                    src={
                      primaryImage ||
                      "https://placehold.co/120x90?text=No+Image"
                    }
                    alt={listing.title}
                    className="w-28 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-400 uppercase tracking-wide">
                      {listing.category.name}
                    </p>
                    <h3 className="text-sm font-semibold text-neutral-700 line-clamp-2 mt-0.5">
                      {listing.title}
                    </h3>
                    <RatingDisplay
                      rating={listing.averageRating}
                      reviewCount={listing.totalReviews}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-neutral-700">
                    Price details
                  </h3>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">
                      {selectedPkg ? selectedPkg.name : "Base price"}
                    </span>
                    <span className="text-neutral-600">
                      PKR {displayPrice.toLocaleString()}
                    </span>
                  </div>

                  {selectedPkg && selectedPkg.includes.length > 0 && (
                    <div className="text-xs text-neutral-400 pl-2 border-l-2 border-neutral-100">
                      {selectedPkg.includes.map((item, idx) => (
                        <p key={idx}>- {item}</p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm pt-3 border-t border-neutral-100 font-semibold">
                    <span className="text-neutral-700">Total</span>
                    <span className="text-neutral-700 text-lg">
                      PKR {displayPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Secure badge in sidebar */}
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <HiLockClosed className="h-3.5 w-3.5" />
                    <span>Secure checkout powered by Stripe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
