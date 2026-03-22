import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  PhoneCall,
  ShieldCheck,
  Star,
  Users
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Hero from '../components/Hero';
import PackageCard from '../components/PackageCard';
import SectionHeading from '../components/SectionHeading';
import { api } from '../lib/api';
import { FALLBACK_PACKAGES } from '../data/packageCatalog';
import {
  PLANNING_STEPS,
  SERVICE_CATEGORIES,
  TESTIMONIALS,
  TRUST_PILLARS,
  WHY_CHOOSE_US
} from '../data/brandContent';
import { normalizePackageForClient } from '../utils/packages';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from '../constants/site';

const Home = () => {
  const prefersReducedMotion = useReducedMotion();
  const [featuredPackages, setFeaturedPackages] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedPackages = async () => {
      try {
        const response = await api.get('/api/packages');
        const packageList = Array.isArray(response.data) ? response.data : [];
        const normalizedPackages = packageList.map(normalizePackageForClient);
        const featuredList = normalizedPackages.filter((pkg) => pkg.isFeatured).slice(0, 3);

        if (isMounted && featuredList.length > 0) {
          setFeaturedPackages(featuredList);
          return;
        }

        if (isMounted && normalizedPackages.length > 0) {
          setFeaturedPackages(normalizedPackages.slice(0, 3));
          return;
        }
      } catch (error) {
        // Use curated fallback packages if the API is unavailable.
      }

      if (isMounted) {
        setFeaturedPackages(FALLBACK_PACKAGES.filter((pkg) => pkg.isFeatured).slice(0, 3));
      }
    };

    loadFeaturedPackages();

    return () => {
      isMounted = false;
    };
  }, []);

  const highlightPackage = useMemo(() => {
    return featuredPackages[0] || FALLBACK_PACKAGES[0];
  }, [featuredPackages]);

  return (
    <div className="bg-white">
      <Hero />

      <section className="section-space bg-white pt-28">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Why travellers choose us"
            title="A travel experience that feels guided, dependable, and thoughtfully planned."
            description="We focus on clarity, comfort, and practical coordination so families, pilgrims, and leisure travellers can move with confidence."
            align="center"
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {WHY_CHOOSE_US.map((item, index) => (
              <RevealCard key={item.title} index={index} prefersReducedMotion={prefersReducedMotion}>
                <div className="soft-panel h-full p-7">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
                    {index === 0 ? (
                      <ShieldCheck size={26} />
                    ) : index === 1 ? (
                      <HeartHandshake size={26} />
                    ) : index === 2 ? (
                      <Star size={26} />
                    ) : (
                      <Users size={26} />
                    )}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-slate-50">
        <div className="site-shell">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Featured spiritual tours"
              title="Popular journeys travellers ask us about the most."
              description="These packages are pulled from the live package feed, so your featured section stays aligned with what the business is currently offering."
            />
            <Link to="/packages" className="brand-button-secondary">
              View All Packages
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredPackages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Travel categories"
            title="From temple routes to family getaways, we plan journeys around how you actually want to travel."
            description="Our work is not limited to one type of traveler. We support devotional trips, leisure travel, group movement, and customized planning across India."
            align="center"
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-4">
            {SERVICE_CATEGORIES.map((category, index) => (
              <RevealCard key={category.title} index={index} prefersReducedMotion={prefersReducedMotion}>
                <div className="section-card h-full p-7">
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-red">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-slate-900">{category.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{category.description}</p>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="site-shell">
          <div className="section-card overflow-hidden bg-white">
            <div className="grid gap-10 lg:grid-cols-[0.92fr,1.08fr]">
              <div className="relative min-h-[320px]">
                <img
                  src={highlightPackage?.heroImage || highlightPackage?.image}
                  alt={highlightPackage?.title || 'Featured spiritual journey'}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/15 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                    Seasonal spiritual journey
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-white">
                    {highlightPackage?.title || 'Upcoming spiritual departure'}
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 lg:p-12">
                <SectionHeading
                  eyebrow="Upcoming highlight"
                  title="A well-supported route for travellers planning their next sacred journey."
                  description="For seasonal pilgrimage planning, timing, route comfort, and practical support matter just as much as the destination. We help travellers prepare with clarity before departure."
                />
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <InfoChip icon={<CalendarDays size={16} />} label={highlightPackage?.duration || 'Seasonal itinerary'} />
                  <InfoChip icon={<ShieldCheck size={16} />} label="Comfort-focused coordination" />
                  <InfoChip icon={<PhoneCall size={16} />} label="Direct planning support" />
                </div>
                <p className="mt-8 text-base leading-8 text-slate-600">
                  If you are planning a Himalayan darshan, temple route, or a spiritually
                  important family trip, our team can guide you on the package, timing,
                  and support approach that suits you best.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    to={`/package/${highlightPackage?.slug || highlightPackage?._id || ''}`}
                    className="brand-button"
                  >
                    View Journey Details
                    <ArrowRight size={18} className="ml-2" />
                  </Link>
                  <a href={CONTACT_PHONE_HREF} className="brand-button-secondary">
                    Talk to Our Team
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-brand-green text-white">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Travel assurance"
            title="What gives travellers confidence when they plan with us."
            description="Good travel support is built on practical communication, comfort planning, and consistency before and during the journey."
            align="center"
            light
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {TRUST_PILLARS.map((pillar) => (
              <div
                key={pillar}
                className="rounded-[1.5rem] border border-white/10 bg-white/8 px-5 py-4 text-sm font-medium text-white/85 backdrop-blur-sm"
              >
                {pillar}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="site-shell">
          <SectionHeading
            eyebrow="How we plan your trip"
            title="A simple process that keeps planning clear from the first enquiry."
            description="We keep the conversation practical so you understand the route, package, and support before the trip begins."
            align="center"
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-4">
            {PLANNING_STEPS.map((step, index) => (
              <RevealCard key={step.title} index={index} prefersReducedMotion={prefersReducedMotion}>
                <div className="soft-panel h-full p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-red text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-slate-50">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Traveller feedback"
            title="Warm words from people who wanted dependable planning, not just a booking."
            description="These reviews reflect the kind of experience we aim to deliver: practical communication, smoother coordination, and travel that feels well cared for."
            align="center"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <RevealCard
                key={`${testimonial.author}-${testimonial.location}`}
                index={index}
                prefersReducedMotion={prefersReducedMotion}
              >
                <div className="section-card h-full p-8">
                  <div className="text-5xl leading-none text-brand-red/20">"</div>
                  <p className="mt-3 text-base leading-8 text-slate-600">
                    {testimonial.quote}
                  </p>
                  <div className="mt-8 border-t border-slate-200 pt-5">
                    <div className="font-bold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.location}</div>
                  </div>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="site-shell">
          <div className="overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,#8f1212_0%,#cc2121_48%,#14532d_100%)] p-8 text-white shadow-[0_26px_70px_-28px_rgba(127,29,29,0.45)] md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
              <div>
                <span className="inline-flex rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                  Start planning with confidence
                </span>
                <h2 className="mt-5 text-3xl font-extrabold text-white md:text-5xl">
                  Need a spiritual route, family holiday, or custom package planned with care?
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
                  Share your travel requirement with us and we will help you understand the
                  best route, support style, and package direction for your journey.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                  Quick support
                </div>
                <div className="mt-3 text-3xl font-extrabold text-white">
                  {CONTACT_PHONE_DISPLAY}
                </div>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  Call or send an enquiry for temple tours, holiday planning, group travel,
                  and personalized assistance.
                </p>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                  <Link to="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-100">
                    Get a Free Travel Consultation
                  </Link>
                  <a
                    href={CONTACT_PHONE_HREF}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const RevealCard = ({ children, index, prefersReducedMotion }) => (
  <motion.div
    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.25 }}
    transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : index * 0.05 }}
  >
    {children}
  </motion.div>
);

const InfoChip = ({ icon, label }) => (
  <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
    <span className="mr-2 text-brand-red">{icon}</span>
    {label}
  </div>
);

export default Home;
