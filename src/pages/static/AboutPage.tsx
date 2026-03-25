import React from 'react';
import { HiOutlineHeart, HiOutlineGlobeAlt, HiOutlineLightBulb, HiOutlineShieldCheck } from 'react-icons/hi2';
import Button from '../../components/ui/Button';

const TEAM_MEMBERS = [
  { name: 'Ahmed Khan', role: 'Co-Founder & CEO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
  { name: 'Sara Ali', role: 'Co-Founder & CTO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
  { name: 'Bilal Hassan', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
  { name: 'Fatima Zahra', role: 'Head of Design', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
];

const VALUES = [
  { icon: <HiOutlineHeart className="h-7 w-7" />, title: 'Customer First', description: 'Every decision we make starts with asking how it benefits our users and their events.' },
  { icon: <HiOutlineShieldCheck className="h-7 w-7" />, title: 'Trust & Safety', description: 'We verify every vendor and ensure a secure platform for all transactions.' },
  { icon: <HiOutlineLightBulb className="h-7 w-7" />, title: 'Innovation', description: 'We continuously improve our platform with the latest technology and user feedback.' },
  { icon: <HiOutlineGlobeAlt className="h-7 w-7" />, title: 'Accessibility', description: 'Making event planning accessible and affordable for everyone across Pakistan.' },
];

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-700 mb-6">
            About EventsApp
          </h1>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            We are on a mission to make event planning effortless. From finding the perfect venue to
            booking the best caterer, we connect you with trusted service providers across Pakistan.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold text-primary-500 uppercase tracking-wider">Our Mission</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-700 mt-2 mb-6">
              Simplifying event planning for everyone
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-4">
              Planning an event should be exciting, not stressful. EventsApp was born from the
              frustration of spending countless hours searching for reliable vendors, comparing
              prices, and coordinating services.
            </p>
            <p className="text-neutral-500 leading-relaxed mb-4">
              We built a platform that brings together the best event service providers in one place,
              with transparent pricing, genuine reviews, and a seamless booking experience.
            </p>
            <p className="text-neutral-500 leading-relaxed">
              Whether you are planning a wedding, corporate event, birthday party, or any celebration,
              EventsApp is your trusted partner in making it memorable.
            </p>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden h-40">
                  <img
                    src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80"
                    alt="Event"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden h-56">
                  <img
                    src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80"
                    alt="Celebration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden h-56">
                  <img
                    src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80"
                    alt="Party"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden h-40">
                  <img
                    src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80"
                    alt="Wedding"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Vendors', value: '2,000+' },
              { label: 'Bookings', value: '15,000+' },
              { label: 'Cities', value: '25+' },
              { label: 'Happy Customers', value: '10,000+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-primary-500">{stat.value}</p>
                <p className="text-neutral-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-700">Our Values</h2>
          <p className="text-neutral-400 mt-2">What drives us every day</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUES.map((value) => (
            <div key={value.title} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500 mx-auto mb-4">
                {value.icon}
              </div>
              <h3 className="font-semibold text-neutral-700 mb-2">{value.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-700">Meet Our Team</h2>
            <p className="text-neutral-400 mt-2">The people behind EventsApp</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 ring-4 ring-white shadow-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-semibold text-neutral-700">{member.name}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to plan your next event?
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Join thousands of happy customers who have found their perfect event services through EventsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              as="link"
              to="/search"
              variant="primary"
              size="lg"
              className="bg-white !text-primary-500 hover:bg-neutral-50"
            >
              Explore Services
            </Button>
            <Button
              as="link"
              to="/contact"
              variant="outline"
              size="lg"
              className="!border-white !text-white hover:bg-white/10"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
