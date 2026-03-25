import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiStar } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { bookingApi } from '../../../services/api/bookingApi';
import { reviewApi } from '../../../services/api/reviewApi';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import TextArea from '../../../components/ui/TextArea';
import StarRating from '../../../components/ui/StarRating';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import Skeleton from '../../../components/ui/Skeleton';
import type { Booking } from '../../../types';

const MIN_CHARS = 10;
const MAX_CHARS = 500;

const ReviewPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [overallRating, setOverallRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [comment, setComment] = useState('');

  const isValid = overallRating > 0 && comment.trim().length >= MIN_CHARS;

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      try {
        const res = await bookingApi.getById(bookingId);
        const data = res.data?.data?.booking;
        if (!data) {
          toast.error('Booking not found');
          navigate('/my-bookings');
          return;
        }
        if (data.isReviewed) {
          toast.error('You have already reviewed this booking');
          navigate(`/my-bookings/${bookingId}`);
          return;
        }
        setBooking(data);
      } catch {
        toast.error('Failed to load booking');
        navigate('/my-bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  const handleSubmit = async () => {
    if (!isValid || !bookingId) return;

    const detailedRatings: Record<string, number> = {};
    if (qualityRating > 0) detailedRatings.quality = Math.round(qualityRating);
    if (communicationRating > 0) detailedRatings.communication = Math.round(communicationRating);
    if (valueRating > 0) detailedRatings.valueForMoney = Math.round(valueRating);
    if (punctualityRating > 0) detailedRatings.punctuality = Math.round(punctualityRating);

    try {
      setSubmitting(true);
      await reviewApi.create({
        booking: bookingId,
        rating: Math.round(overallRating),
        comment: comment.trim(),
        detailedRatings: Object.keys(detailedRatings).length > 0 ? detailedRatings : undefined,
      });
      toast.success('Review submitted successfully!');
      navigate(`/my-bookings/${bookingId}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Skeleton variant="text" width="200px" height="32px" />
        <Skeleton variant="rect" height={300} />
      </div>
    );
  }

  if (!booking) return null;

  const listingTitle = typeof booking.listing === 'object' && booking.listing !== null
    ? (booking.listing as { title?: string }).title || 'Listing'
    : 'Listing';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'My Bookings', href: '/my-bookings' },
          { label: 'Booking Details', href: `/my-bookings/${bookingId}` },
          { label: 'Write a Review' },
        ]}
      />

      <h1 className="text-2xl font-bold text-neutral-700 mt-6 mb-2">Write a Review</h1>
      <p className="text-sm text-neutral-400 mb-8">
        Share your experience with <span className="font-medium text-neutral-600">{listingTitle}</span>
      </p>

      {/* Overall Rating */}
      <Card padding="lg" className="mb-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-neutral-700 mb-2">How was your experience?</h2>
          <p className="text-sm text-neutral-400 mb-4">Click a star to rate</p>
          <div className="flex justify-center mb-2">
            <StarRating
              rating={overallRating}
              size="lg"
              interactive
              onChange={setOverallRating}
            />
          </div>
          {overallRating > 0 && (
            <p className="text-sm font-medium text-neutral-500">{overallRating} / 5</p>
          )}
        </div>
      </Card>

      {/* Detailed Ratings */}
      <Card padding="lg" className="mb-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-4">Detailed Ratings (Optional)</h3>
        <div className="space-y-4">
          {[
            { label: 'Quality', value: qualityRating, setter: setQualityRating },
            { label: 'Communication', value: communicationRating, setter: setCommunicationRating },
            { label: 'Value for Money', value: valueRating, setter: setValueRating },
            { label: 'Punctuality', value: punctualityRating, setter: setPunctualityRating },
          ].map(({ label, value, setter }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">{label}</span>
              <StarRating rating={value} size="sm" interactive onChange={setter} />
            </div>
          ))}
        </div>
      </Card>

      {/* Comment */}
      <Card padding="lg" className="mb-6">
        <TextArea
          label="Your Review"
          placeholder="Share your experience with this service. What did you like? What could be improved?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          maxCharacters={MAX_CHARS}
          error={
            comment.trim().length > 0 && comment.trim().length < MIN_CHARS
              ? `Minimum ${MIN_CHARS} characters required`
              : undefined
          }
        />
      </Card>

      {/* Submit */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="ghost"
          onClick={() => navigate(`/my-bookings/${bookingId}`)}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!isValid || submitting}
          leftIcon={<HiStar className="h-5 w-5" />}
        >
          Submit Review
        </Button>
      </div>
    </div>
  );
};

export default ReviewPage;
