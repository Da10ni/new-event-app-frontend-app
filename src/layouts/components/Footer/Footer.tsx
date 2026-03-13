import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = {
  about: {
    title: 'About',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Newsroom', href: '/newsroom' },
      { label: 'Investors', href: '/investors' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  community: {
    title: 'Community',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Forum', href: '/forum' },
      { label: 'Events', href: '/events' },
      { label: 'Referral Program', href: '/referral' },
    ],
  },
  hosting: {
    title: 'Hosting',
    links: [
      { label: 'List Your Service', href: '/become-provider' },
      { label: 'Provider Resources', href: '/provider-resources' },
      { label: 'Responsible Hosting', href: '/responsible-hosting' },
      { label: 'Provider Community', href: '/provider-community' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Safety Info', href: '/safety' },
      { label: 'Cancellation Policy', href: '/cancellation-policy' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-100">
      {/* Main footer */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-neutral-600 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-neutral-400 hover:text-neutral-600 hover:underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-200">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-400">
              &copy; {new Date().getFullYear()} EventsApp. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
                Terms
              </Link>
              <Link to="/sitemap" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
