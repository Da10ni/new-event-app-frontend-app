import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheck,
  HiPhoto,
  HiXMark,
  HiStar,
  HiPlus,
  HiTrash,
  HiCloudArrowUp,
  HiDocumentText,
  HiMapPin,
  HiCurrencyDollar,
  HiSparkles,
  HiInformationCircle,
} from 'react-icons/hi2';
import { listingApi } from '../../../services/api/listingApi';
import { categoryApi } from '../../../services/api/categoryApi';
import Input from '../../../components/ui/Input';
import TextArea from '../../../components/ui/TextArea';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Chip from '../../../components/ui/Chip';
import LoadingSpinner from '../../../components/feedback/LoadingSpinner';
import toast from 'react-hot-toast';
import type { Category, Listing } from '../../../types';

interface PackageItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface PhotoItem {
  id: string;
  file?: File;
  preview: string;
  isCover: boolean;
  isExisting: boolean;
  existingUrl?: string;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  city: string;
  area: string;
  address: string;
  basePrice: string;
  priceUnit: string;
  packages: PackageItem[];
  capacityMin: string;
  capacityMax: string;
  amenities: string[];
  additionalInfo: string;
}

const STEPS = [
  { key: 'basic', label: 'Basic Info', icon: <HiDocumentText className="h-5 w-5" /> },
  { key: 'location', label: 'Location', icon: <HiMapPin className="h-5 w-5" /> },
  { key: 'photos', label: 'Photos', icon: <HiPhoto className="h-5 w-5" /> },
  { key: 'pricing', label: 'Pricing', icon: <HiCurrencyDollar className="h-5 w-5" /> },
  { key: 'amenities', label: 'Amenities', icon: <HiSparkles className="h-5 w-5" /> },
];

const COMMON_AMENITIES = [
  'WiFi', 'Parking', 'Air Conditioning', 'Sound System', 'Projector',
  'Stage', 'Catering', 'Bar Service', 'Decoration', 'Photography',
  'DJ/Music', 'Lighting', 'Dance Floor', 'Outdoor Area', 'VIP Area',
  'Security', 'Valet Parking', 'Wheelchair Accessible', 'Power Backup',
  'Changing Rooms', 'Green Room', 'Kitchen', 'Bridal Suite', 'Pool Area',
];

const PRICE_UNITS = [
  { value: 'per_event', label: 'Per Event' },
  { value: 'per_day', label: 'Per Day' },
  { value: 'per_person', label: 'Per Person' },
  { value: 'per_hour', label: 'Per Hour' },
];

const CITIES = [
  { value: 'Lahore', label: 'Lahore' },
  { value: 'Karachi', label: 'Karachi' },
  { value: 'Islamabad', label: 'Islamabad' },
  { value: 'Rawalpindi', label: 'Rawalpindi' },
  { value: 'Faisalabad', label: 'Faisalabad' },
  { value: 'Multan', label: 'Multan' },
  { value: 'Peshawar', label: 'Peshawar' },
  { value: 'Quetta', label: 'Quetta' },
  { value: 'Sialkot', label: 'Sialkot' },
  { value: 'Hyderabad', label: 'Hyderabad' },
];

const EditListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [customAmenity, setCustomAmenity] = useState('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    city: '',
    area: '',
    address: '',
    basePrice: '',
    priceUnit: 'per_event',
    packages: [],
    capacityMin: '',
    capacityMax: '',
    amenities: [],
    additionalInfo: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      try {
        const [catRes, listingRes] = await Promise.all([
          categoryApi.getAll(),
          listingApi.getBySlug(id!),
        ]);

        const cats = catRes.data?.data?.categories || [];
        setCategories(cats.filter((c: Category) => c.isActive));

        const listing: Listing = listingRes.data?.data?.listing;
        if (listing) {
          setFormData({
            title: listing.title || '',
            description: listing.description || '',
            category: listing.category?._id || '',
            tags: listing.tags || [],
            city: listing.address?.city || '',
            area: listing.address?.area || '',
            address: listing.address?.street || '',
            basePrice: String(listing.pricing?.basePrice || ''),
            priceUnit: listing.pricing?.priceUnit || 'per_event',
            packages: (listing.pricing?.packages || []).map((p, i) => ({
              id: `pkg-${i}`,
              name: p.name,
              description: p.description || '',
              price: p.price,
            })),
            capacityMin: String(listing.capacity?.min || ''),
            capacityMax: String(listing.capacity?.max || ''),
            amenities: listing.amenities || [],
            additionalInfo: (listing.attributes?.additionalInfo as string) || '',
          });

          // Load existing images
          setPhotos(
            (listing.images || []).map((img) => ({
              id: img._id,
              preview: img.url,
              isCover: img.isPrimary,
              isExisting: true,
              existingUrl: img.url,
            }))
          );
        }
      } catch {
        toast.error('Failed to load listing data');
        navigate('/provider/listings');
      } finally {
        setPageLoading(false);
      }
    };
    if (id) loadData();
  }, [id, navigate]);

  const updateField = (field: keyof FormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      updateField('tags', [...formData.tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateField('tags', formData.tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newPhotos: PhotoItem[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }
      newPhotos.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        isCover: false,
        isExisting: false,
      });
    });
    setPhotos((prev) => {
      const combined = [...prev, ...newPhotos];
      if (combined.length > 0 && !combined.some((p) => p.isCover)) {
        combined[0].isCover = true;
      }
      return combined;
    });
  }, []);

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== photoId);
      if (updated.length > 0 && !updated.some((p) => p.isCover)) {
        updated[0].isCover = true;
      }
      return updated;
    });
  };

  const setCoverPhoto = (photoId: string) => {
    setPhotos((prev) => prev.map((p) => ({ ...p, isCover: p.id === photoId })));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const addPackage = () => {
    const newPkg: PackageItem = {
      id: `pkg-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
    };
    updateField('packages', [...formData.packages, newPkg]);
  };

  const updatePackage = (pkgId: string, field: keyof PackageItem, value: string | number) => {
    updateField(
      'packages',
      formData.packages.map((pkg) => (pkg.id === pkgId ? { ...pkg, [field]: value } : pkg))
    );
  };

  const removePackage = (pkgId: string) => {
    updateField('packages', formData.packages.filter((pkg) => pkg.id !== pkgId));
  };

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      updateField('amenities', formData.amenities.filter((a) => a !== amenity));
    } else {
      updateField('amenities', [...formData.amenities, amenity]);
    }
  };

  const addCustomAmenity = () => {
    const amenity = customAmenity.trim();
    if (amenity && !formData.amenities.includes(amenity)) {
      updateField('amenities', [...formData.amenities, amenity]);
      setCustomAmenity('');
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 0:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (formData.title.length > 100) newErrors.title = 'Title must be under 100 characters';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      case 1:
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        break;
      case 2:
        if (photos.length < 3) newErrors.photos = 'At least 3 photos are required';
        break;
      case 3:
        if (!formData.basePrice || Number(formData.basePrice) <= 0) newErrors.basePrice = 'Valid price is required';
        if (!formData.capacityMin || Number(formData.capacityMin) <= 0) newErrors.capacityMin = 'Minimum capacity is required';
        if (!formData.capacityMax || Number(formData.capacityMax) <= 0) newErrors.capacityMax = 'Maximum capacity is required';
        if (Number(formData.capacityMin) > Number(formData.capacityMax)) newErrors.capacityMax = 'Max must be greater than min';
        break;
      case 4:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const goPrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        toast.error('Please fix the errors before saving');
        return;
      }
    }

    setSubmitting(true);
    try {
      const updateData: Record<string, unknown> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags,
        address: {
          city: formData.city,
          country: 'Pakistan',
          area: formData.area || undefined,
          street: formData.address || undefined,
        },
        pricing: {
          basePrice: Number(formData.basePrice),
          priceUnit: formData.priceUnit,
          currency: 'PKR',
          packages: formData.packages.map((p) => ({
            name: p.name,
            description: p.description,
            price: Number(p.price),
            includes: [],
          })),
        },
        capacity: {
          min: Number(formData.capacityMin),
          max: Number(formData.capacityMax),
        },
        amenities: formData.amenities,
      };

      if (formData.additionalInfo) {
        updateData.attributes = { additionalInfo: formData.additionalInfo };
      }

      await listingApi.update(id!, updateData);
      toast.success('Listing updated successfully');
      navigate('/provider/listings');
    } catch {
      toast.error('Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return <LoadingSpinner fullPage label="Loading listing..." />;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Input
              label="Title"
              placeholder="e.g. Elegant Garden Wedding Venue"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              error={errors.title}
              helperText={`${formData.title.length}/100 characters`}
            />
            <TextArea
              label="Description"
              placeholder="Describe your service..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              error={errors.description}
              maxCharacters={2000}
              rows={6}
            />
            <Select
              label="Category"
              placeholder="Select a category"
              options={categories.map((c) => ({ value: c._id, label: c.name }))}
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              error={errors.category}
            />
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">Tags</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  containerClassName="flex-1"
                />
                <Button variant="outline" onClick={addTag} disabled={!tagInput.trim()}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <Chip key={tag} label={tag} removable onRemove={() => removeTag(tag)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <Select
              label="City"
              placeholder="Select a city"
              options={CITIES}
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              error={errors.city}
            />
            <Input
              label="Area / Neighborhood"
              placeholder="e.g. Gulberg, DHA Phase 5"
              value={formData.area}
              onChange={(e) => updateField('area', e.target.value)}
            />
            <TextArea
              label="Full Address"
              placeholder="Complete street address..."
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              error={errors.address}
              rows={3}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
              } ${errors.photos ? 'border-error' : ''}`}
            >
              <HiCloudArrowUp className={`h-12 w-12 mx-auto mb-3 ${isDragging ? 'text-primary-500' : 'text-neutral-300'}`} />
              <p className="text-base font-medium text-neutral-600 mb-1">
                Drag and drop new photos here
              </p>
              <p className="text-sm text-neutral-400">or click to browse files</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
            {errors.photos && <p className="text-sm text-error -mt-4">{errors.photos}</p>}

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                      photo.isCover ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img src={photo.preview} alt="Preview" className="w-full h-full object-cover" />
                    {photo.isCover && (
                      <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                    {photo.isExisting && (
                      <span className="absolute top-2 right-10 bg-secondary-500/80 text-white text-xs px-1.5 py-0.5 rounded">
                        Existing
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setCoverPhoto(photo.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-primary-50 transition-colors"
                        title="Set as cover"
                      >
                        <HiStar className={`h-4 w-4 ${photo.isCover ? 'text-primary-500' : 'text-neutral-400'}`} />
                      </button>
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                        title="Remove"
                      >
                        <HiXMark className="h-4 w-4 text-error" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-neutral-400">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Base Price"
                type="number"
                placeholder="0"
                value={formData.basePrice}
                onChange={(e) => updateField('basePrice', e.target.value)}
                error={errors.basePrice}
                leftIcon={<span className="text-sm font-medium">PKR</span>}
              />
              <Select
                label="Price Unit"
                options={PRICE_UNITS}
                value={formData.priceUnit}
                onChange={(e) => updateField('priceUnit', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Capacity"
                type="number"
                placeholder="e.g. 50"
                value={formData.capacityMin}
                onChange={(e) => updateField('capacityMin', e.target.value)}
                error={errors.capacityMin}
              />
              <Input
                label="Maximum Capacity"
                type="number"
                placeholder="e.g. 500"
                value={formData.capacityMax}
                onChange={(e) => updateField('capacityMax', e.target.value)}
                error={errors.capacityMax}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-neutral-600">
                  Packages <span className="text-neutral-300 font-normal">(Optional)</span>
                </label>
                <Button variant="ghost" size="sm" leftIcon={<HiPlus className="h-4 w-4" />} onClick={addPackage}>
                  Add Package
                </Button>
              </div>
              <div className="space-y-4">
                {formData.packages.map((pkg, idx) => (
                  <Card key={pkg.id} padding="md" className="relative">
                    <button
                      onClick={() => removePackage(pkg.id)}
                      className="absolute top-3 right-3 p-1 rounded-full hover:bg-red-50 text-neutral-300 hover:text-error transition-colors"
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                    <p className="text-xs font-semibold text-neutral-400 uppercase mb-3">Package {idx + 1}</p>
                    <div className="space-y-3">
                      <Input label="Package Name" placeholder="e.g. Gold Package" value={pkg.name} onChange={(e) => updatePackage(pkg.id, 'name', e.target.value)} />
                      <TextArea label="Description" placeholder="What is included..." value={pkg.description} onChange={(e) => updatePackage(pkg.id, 'description', e.target.value)} rows={2} />
                      <Input label="Price (PKR)" type="number" placeholder="0" value={String(pkg.price || '')} onChange={(e) => updatePackage(pkg.id, 'price', Number(e.target.value))} />
                    </div>
                  </Card>
                ))}
                {formData.packages.length === 0 && (
                  <p className="text-sm text-neutral-300 text-center py-4">No packages added.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-3">Common Amenities</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_AMENITIES.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    selected={formData.amenities.includes(amenity)}
                    onClick={() => toggleAmenity(amenity)}
                    variant="outlined"
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">Custom Amenity</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a custom amenity"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity(); } }}
                  containerClassName="flex-1"
                />
                <Button variant="outline" onClick={addCustomAmenity} disabled={!customAmenity.trim()}>
                  Add
                </Button>
              </div>
            </div>
            {formData.amenities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-2">
                  Selected Amenities ({formData.amenities.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <Chip key={amenity} label={amenity} selected removable onRemove={() => toggleAmenity(amenity)} />
                  ))}
                </div>
              </div>
            )}
            <TextArea
              label="Additional Information"
              placeholder="Any other details..."
              value={formData.additionalInfo}
              onChange={(e) => updateField('additionalInfo', e.target.value)}
              maxCharacters={1000}
              rows={4}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/provider/listings')}
          className="p-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
        >
          <HiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-600">Edit Listing</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Update your listing details</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => setCurrentStep(idx)}
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    idx < currentStep
                      ? 'bg-green-500 text-white'
                      : idx === currentStep
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {idx < currentStep ? <HiCheck className="h-5 w-5" /> : step.icon}
                </button>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    idx === currentStep ? 'text-primary-500' : 'text-neutral-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-3 rounded-full ${
                    idx < currentStep ? 'bg-green-500' : 'bg-neutral-100'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-neutral-600 mb-1">{STEPS[currentStep].label}</h2>
        <p className="text-sm text-neutral-400 mb-6">
          {currentStep === 0 && 'Update your listing basic information.'}
          {currentStep === 1 && 'Update your service location.'}
          {currentStep === 2 && 'Manage your listing photos.'}
          {currentStep === 3 && 'Update your pricing and capacity.'}
          {currentStep === 4 && 'Update amenities and additional information.'}
        </p>
        {renderStepContent()}
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate('/provider/listings')}>
          Cancel
        </Button>
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <Button variant="outline" leftIcon={<HiArrowLeft className="h-4 w-4" />} onClick={goPrev}>
              Previous
            </Button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button variant="primary" rightIcon={<HiArrowRight className="h-4 w-4" />} onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              leftIcon={<HiCheck className="h-5 w-5" />}
              onClick={handleSubmit}
              loading={submitting}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditListingPage;
