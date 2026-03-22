import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  OFFICE_ADDRESS,
  SITE_NAME,
  SOCIAL_LINKS
} from '../constants/site';

const Footer = () => {
  return (
    <footer className="bg-brand-green pt-16 text-white">
      <div className="site-shell">
        <div className="section-card overflow-hidden border-white/10 bg-gradient-to-br from-green-950 via-brand-green to-green-900 p-8 text-white md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.4fr,0.8fr,0.8fr,1fr]">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                Trusted Travel Support
              </span>
              <h2 className="mt-5 text-3xl font-extrabold text-white md:text-4xl">
                {SITE_NAME} Tour & Travels
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
                Spiritual journeys, holiday packages, and personalized travel planning
                across India with a practical, warm, and trustworthy approach.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <TrustBadge label="Transparent Guidance" />
                <TrustBadge label="Comfort-First Planning" />
                <TrustBadge label="Phone & WhatsApp Support" />
              </div>
              <div className="mt-8 flex gap-3">
                <SocialIcon href={SOCIAL_LINKS.facebook} icon={<Facebook size={18} />} />
                <SocialIcon
                  href={SOCIAL_LINKS.instagram}
                  icon={<Instagram size={18} />}
                  external
                />
                <SocialIcon href={SOCIAL_LINKS.twitter} icon={<Twitter size={18} />} />
              </div>
            </div>

            <div>
              <FooterHeading title="Quick Links" />
              <FooterLinks
                items={[
                  { label: 'Home', to: '/' },
                  { label: 'Tour Packages', to: '/packages' },
                  { label: 'About Us', to: '/about' },
                  { label: 'Contact Us', to: '/contact' }
                ]}
              />
            </div>

            <div>
              <FooterHeading title="Travel Services" />
              <ul className="space-y-3 text-sm text-white/75">
                <li>Spiritual Tours</li>
                <li>Holiday Packages</li>
                <li>Group Travel Planning</li>
                <li>Customized Trips</li>
              </ul>
            </div>

            <div>
              <FooterHeading title="Contact Details" />
              <ul className="space-y-4 text-sm text-white/75">
                <li className="flex items-start gap-3">
                  <IconShell icon={<MapPin size={16} />} />
                  <span>{OFFICE_ADDRESS}</span>
                </li>
                <li className="flex items-center gap-3">
                  <IconShell icon={<Phone size={16} />} />
                  <a href={CONTACT_PHONE_HREF} className="hover:text-white">
                    {CONTACT_PHONE_DISPLAY}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <IconShell icon={<Mail size={16} />} />
                  <a href={`mailto:${CONTACT_EMAIL}`} className="break-all hover:text-white">
                    {CONTACT_EMAIL}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60 md:flex md:items-center md:justify-between">
            <p>
              Copyright {new Date().getFullYear()} {SITE_NAME} Tour & Travels. All rights
              reserved.
            </p>
            <p className="mt-3 md:mt-0">
              Developed by{' '}
              <a
                href="https://www.linkedin.com/in/ashish-sharma-66031b268"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white/80 hover:text-white"
              >
                Ashish Sharma
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="h-10"></div>
    </footer>
  );
};

const FooterHeading = ({ title }) => (
  <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/85">
    {title}
  </h3>
);

const FooterLinks = ({ items }) => (
  <ul className="space-y-3 text-sm text-white/75">
    {items.map((item) => (
      <li key={item.to}>
        <Link to={item.to} className="hover:text-white">
          {item.label}
        </Link>
      </li>
    ))}
  </ul>
);

const TrustBadge = ({ label }) => (
  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
    {label}
  </span>
);

const IconShell = ({ icon }) => (
  <span className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-red">
    {icon}
  </span>
);

const SocialIcon = ({ href, icon, external = false }) => (
  <a
    href={href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/85 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
  >
    {icon}
  </a>
);

export default Footer;
