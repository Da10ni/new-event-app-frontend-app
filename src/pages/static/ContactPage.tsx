import React, { useState } from 'react';
import { HiOutlineMapPin, HiOutlinePhone, HiOutlineEnvelope, HiOutlineClock, HiPaperAirplane } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select a subject' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'booking', label: 'Booking Issue' },
  { value: 'vendor', label: 'Vendor Support' },
  { value: 'technical', label: 'Technical Problem' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
  { value: 'other', label: 'Other' },
];

const CONTACT_INFO = [
  {
    icon: <HiOutlineMapPin className="h-6 w-6" />,
    title: 'Address',
    details: ['Shahrah-e-Faisal, Karachi', 'Sindh 75400, Pakistan'],
  },
  {
    icon: <HiOutlinePhone className="h-6 w-6" />,
    title: 'Phone',
    details: ['+92 21 1234 5678', '+92 300 1234567'],
  },
  {
    icon: <HiOutlineEnvelope className="h-6 w-6" />,
    title: 'Email',
    details: ['support@eventsapp.pk', 'info@eventsapp.pk'],
  },
  {
    icon: <HiOutlineClock className="h-6 w-6" />,
    title: 'Working Hours',
    details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 2:00 PM'],
  },
];

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject) newErrors.subject = 'Please select a subject';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary-50 to-primary-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-700 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto">
            Have a question or need help? We would love to hear from you. Reach out and we will respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              <h2 className="text-xl font-bold text-neutral-700 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    error={errors.name}
                    placeholder="John Doe"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                    placeholder="john@example.com"
                  />
                </div>
                <Select
                  label="Subject"
                  options={SUBJECT_OPTIONS}
                  value={formData.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  error={errors.subject}
                  placeholder="Select a subject"
                />
                <TextArea
                  label="Message"
                  value={formData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  error={errors.message}
                  placeholder="Tell us how we can help you..."
                  rows={6}
                  maxCharacters={2000}
                />
                <Button
                  variant="primary"
                  type="submit"
                  size="lg"
                  loading={sending}
                  leftIcon={<HiPaperAirplane className="h-5 w-5" />}
                >
                  Send Message
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {CONTACT_INFO.map((info) => (
              <Card key={info.title} padding="md" hoverable>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-700 mb-1">{info.title}</h3>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-sm text-neutral-500">{detail}</p>
                    ))}
                  </div>
                </div>
              </Card>
            ))}

            {/* Map Placeholder */}
            <Card padding="none" className="overflow-hidden">
              <div className="h-64 bg-neutral-100 flex items-center justify-center">
                <div className="text-center">
                  <HiOutlineMapPin className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">Map view</p>
                  <p className="text-xs text-neutral-300 mt-1">Shahrah-e-Faisal, Karachi</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
