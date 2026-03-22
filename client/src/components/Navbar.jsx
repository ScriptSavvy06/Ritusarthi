import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Phone, X } from 'lucide-react';
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  SITE_NAME,
  SITE_TAGLINE
} from '../constants/site';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Packages', to: '/packages' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' }
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur-md">
      <div className="site-shell">
        <div className="flex h-24 items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
              <img
                src="/assets/logo.png"
                alt={`${SITE_NAME} Logo`}
                className="h-12 w-auto"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-extrabold text-brand-green md:text-2xl">
                {SITE_NAME}
              </div>
              <div className="truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-red md:text-xs">
                {SITE_TAGLINE}
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-brand-green'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/admin/login"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"            >
              Admin Login
            </Link>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-right shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Quick Support
              </div>
              <a href={CONTACT_PHONE_HREF} className="text-sm font-bold text-slate-800">
                {CONTACT_PHONE_DISPLAY}
              </a>
            </div>
            <a href={CONTACT_PHONE_HREF} className="brand-button">
              <Phone size={18} className="mr-2" />
              Call Now
            </a>
          </div>

          <button
            onClick={() => setIsOpen((currentValue) => !currentValue)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-700 lg:hidden"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="site-shell py-4">
            <div className="space-y-2">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`block rounded-2xl px-4 py-3 text-sm font-semibold ${isActive
                        ? 'bg-brand-green/10 text-brand-green'
                        : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <Link
                to="/admin/login"
                onClick={() => setIsOpen(false)}
                className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                Login
              </Link>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Travel Support
              </div>
              <a
                href={CONTACT_PHONE_HREF}
                className="mt-2 flex items-center text-base font-bold text-slate-800"
              >
                <Phone size={18} className="mr-2 text-brand-red" />
                {CONTACT_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
