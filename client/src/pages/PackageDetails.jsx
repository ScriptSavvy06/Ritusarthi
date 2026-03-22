import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  IndianRupee,
  MapPin,
  Phone,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import PackageCard from '../components/PackageCard';
import SectionHeading from '../components/SectionHeading';
import { api } from '../lib/api';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from '../constants/site';
import { TRUST_PILLARS } from '../data/brandContent';
import { normalizePackageForClient } from '../utils/packages';

const PackageDetails = () => {
  const { id: packageIdentifier } = useParams();
  const prefersReducedMotion = useReducedMotion();
  const [pkg, setPkg] = useState(null);
  const [relatedPackages, setRelatedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPackage = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/api/packages/${packageIdentifier}`);

        if (isMounted) {
          setPkg(normalizePackageForClient(response.data));
        }
      } catch (loadError) {
        if (isMounted) {
          setPkg(null);
          setError('Package not found or unavailable right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPackage();

    return () => {
      isMounted = false;
    };
  }, [packageIdentifier]);

  useEffect(() => {
    let isMounted = true;

    const loadRelatedPackages = async () => {
      if (!pkg?.category) {
        setRelatedPackages([]);
        return;
      }

      try {
        const response = await api.get('/api/packages');
        const packageList = Array.isArray(response.data) ? response.data : [];
        const normalizedPackages = packageList.map(normalizePackageForClient);
        const related = normalizedPackages
          .filter((item) => item._id !== pkg._id && item.category === pkg.category)
          .slice(0, 3);

        if (isMounted) {
          setRelatedPackages(related);
        }
      } catch (loadError) {
        if (isMounted) {
          setRelatedPackages([]);
        }
      }
    };

    loadRelatedPackages();

    return () => {
      isMounted = false;
    };
  }, [pkg?._id, pkg?.category]);

  const formattedPrice = new Intl.NumberFormat('en-IN').format(Number(pkg?.price) || 0);
  const packageOverview = pkg?.overview || pkg?.description || '';
  const ctaText = pkg?.ctaText || 'Book Now / Enquire';
  const ctaPhone = pkg?.ctaPhone || CONTACT_PHONE_DISPLAY;
  const galleryImages = useMemo(() => pkg?.images || [], [pkg?.images]);

  const sectionMotionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.45, ease: 'easeOut' }
      };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
        <h2 className="mb-4 text-2xl font-bold">Package not found</h2>
        <p className="mb-6 text-sm text-slate-500">{error}</p>
        <Link to="/packages" className="inline-flex items-center font-bold text-brand-green">
          <ArrowLeft size={20} className="mr-2" />
          Back to All Packages
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden">
        <img
          src={pkg.heroImage || pkg.images[0]}
          alt={pkg.title}
          className="h-[520px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.15),rgba(15,23,42,0.75))]"></div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="site-shell pb-10 pt-32 text-white">
            <Link
              to="/packages"
              className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-sm transition hover:bg-white/15"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Packages
            </Link>

            <div className="max-w-4xl">
              <span className="inline-flex rounded-full bg-brand-red px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-lg">
                {pkg.category} Package
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white md:text-6xl">
                {pkg.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/80 md:text-lg">
                {pkg.description || packageOverview}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
                <HeroChip icon={<Clock size={16} />} label={pkg.duration || 'Flexible duration'} />
                <HeroChip icon={<MapPin size={16} />} label={pkg.location || 'Destination available'} />
                <HeroChip icon={<IndianRupee size={16} />} label={`From Rs ${formattedPrice} per person`} />
                <HeroChip icon={<ShieldCheck size={16} />} label="Guided booking support" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="site-shell section-space">
        <div className="grid gap-10 lg:grid-cols-[1.02fr,0.98fr]">
          <div className="space-y-10 lg:pr-4">
            <motion.section className="section-card p-8 md:p-10" {...sectionMotionProps}>
              <SectionHeading
                eyebrow="Package overview"
                title="A clearer look at what this journey is designed to offer."
                description="We organize each route with attention to destination experience, planning comfort, and practical on-ground coordination."
              />
              <p className="mt-8 text-base leading-8 text-slate-600">{packageOverview}</p>
            </motion.section>

            {galleryImages.length ? (
              <motion.section className="section-card p-8 md:p-10" {...sectionMotionProps}>
                <SectionHeading
                  eyebrow="Journey gallery"
                  title="A visual glimpse of the destination and travel mood."
                  description="Image presentation stays connected to the current package data and updates automatically when package images change."
                />
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {galleryImages.slice(0, 4).map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className={`overflow-hidden rounded-[1.5rem] ${
                        index === 0 ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${pkg.title} gallery ${index + 1}`}
                        className={`w-full object-cover ${
                          index === 0 ? 'h-72 md:h-80' : 'h-56'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </motion.section>
            ) : null}

            {pkg.itinerary?.length ? (
              <motion.section className="section-card p-8 md:p-10" {...sectionMotionProps}>
                <SectionHeading
                  eyebrow="Detailed itinerary"
                  title="A cleaner day-wise travel flow for easier planning."
                  description="The timeline remains fully dynamic and uses the itinerary data already stored with this package."
                />
                <div className="mt-8">
                  <ItineraryTimeline
                    itinerary={pkg.itinerary}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </div>
              </motion.section>
            ) : null}

            <motion.div className="grid gap-8 md:grid-cols-2" {...sectionMotionProps}>
              <InfoListCard
                title="What's Included"
                icon={<CheckCircle className="mr-2 text-green-500" size={24} />}
                items={pkg.inclusions || []}
                bulletClassName="bg-green-500"
              />
              <InfoListCard
                title="What's Excluded"
                icon={<XCircle className="mr-2 text-red-500" size={24} />}
                items={pkg.exclusions || []}
                bulletClassName="bg-red-500"
              />
            </motion.div>

            {pkg.pricingNotes?.length ? (
              <motion.section className="soft-panel p-8 md:p-10" {...sectionMotionProps}>
                <SectionHeading
                  eyebrow="Pricing notes"
                  title="Useful points to keep in mind before confirming the package."
                />
                <ul className="mt-8 space-y-4">
                  {pkg.pricingNotes.map((note, index) => (
                    <li key={index} className="flex items-start text-sm leading-7 text-slate-600">
                      <span className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand-red"></span>
                      {note}
                    </li>
                  ))}
                </ul>
              </motion.section>
            ) : null}

            <motion.section className="section-card p-8 md:p-10" {...sectionMotionProps}>
              <SectionHeading
                eyebrow="Why book this with us"
                title="Support that goes beyond simply sharing a package."
                description="Travellers often choose us because they want clearer guidance, practical communication, and help that feels reliable."
              />
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {TRUST_PILLARS.slice(0, 4).map((pillar) => (
                  <div
                    key={pillar}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium leading-7 text-slate-700"
                  >
                    {pillar}
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#14532d_0%,#1f6a3a_50%,#cc2121_100%)] p-8 text-white md:p-10" {...sectionMotionProps}>
              <SectionHeading
                eyebrow="Need customization?"
                title="Travel assistance, family comfort planning, and route adjustments are available."
                description="If you want changes in stay preference, travel pacing, pickup planning, or route suitability, our team can help you discuss the practical options."
                light
              />
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to={`/contact?package=${encodeURIComponent(pkg.title)}`}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Request Custom Assistance
                </Link>
                <a
                  href={CONTACT_PHONE_HREF}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
                >
                  Talk to Our Team
                </a>
              </div>
            </motion.section>
          </div>

          <div className="space-y-8">
            <motion.aside className="sticky top-28 space-y-6" {...sectionMotionProps}>
              <div className="section-card p-8">
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Starting from
                </div>
                <div className="mt-3 flex items-center text-4xl font-extrabold text-slate-900">
                  <IndianRupee size={32} />
                  <span>{formattedPrice}</span>
                  <span className="ml-2 text-sm font-medium text-slate-400">/ per person</span>
                </div>

                <div className="mt-8 space-y-4">
                  <SummaryRow icon={<Clock size={18} />} label="Trip duration" value={pkg.duration || 'Flexible'} />
                  <SummaryRow icon={<MapPin size={18} />} label="Destination" value={pkg.location || 'Available on request'} />
                  <SummaryRow icon={<Calendar size={18} />} label="Enquiry support" value="Fast response and planning help" />
                  <SummaryRow icon={<ShieldCheck size={18} />} label="Travel assistance" value="Guidance before and during travel" />
                </div>

                <Link
                  to={`/contact?package=${encodeURIComponent(pkg.title)}`}
                  className="mt-8 flex w-full items-center justify-center rounded-full bg-brand-green py-4 font-semibold text-white shadow-lg shadow-brand-green/15 transition hover:bg-green-800"
                >
                  {ctaText}
                </Link>

                <a
                  href={CONTACT_PHONE_HREF}
                  className="mt-4 flex w-full items-center justify-center rounded-full border border-brand-green/20 bg-white py-4 font-semibold text-slate-900 transition hover:bg-green-50"
                >
                  <Phone className="mr-2" size={18} />
                  Call {ctaPhone}
                </a>

                <p className="mt-5 text-center text-xs leading-6 text-slate-400">
                  Prices may vary based on travel date, final occupancy, stay preference,
                  and seasonal availability.
                </p>
              </div>

              <div className="soft-panel p-7">
                <h3 className="text-xl font-bold text-slate-900">
                  Why this page feels clearer now
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The package details, itinerary, inclusions, exclusions, gallery, and CTA
                  actions all still come from the current dynamic package setup. We have
                  only improved how the information is presented for travellers.
                </p>
              </div>
            </motion.aside>
          </div>
        </div>
      </div>

      {relatedPackages.length ? (
        <section className="section-space bg-slate-50">
          <div className="site-shell">
            <SectionHeading
              eyebrow="Related journeys"
              title="Similar packages travellers often review alongside this one."
              description="These packages are based on the same category and are still pulled from the live package data."
            />
            <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {relatedPackages.map((relatedPackage) => (
                <PackageCard key={relatedPackage._id} pkg={relatedPackage} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

const SummaryRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-[1.25rem] bg-slate-50 px-4 py-4">
    <span className="mt-0.5 text-brand-red">{icon}</span>
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-700">{value}</div>
    </div>
  </div>
);

const HeroChip = ({ icon, label }) => (
  <span className="inline-flex items-center rounded-full bg-white/12 px-4 py-2 backdrop-blur-sm">
    <span className="mr-2 text-white">{icon}</span>
    {label}
  </span>
);

const InfoListCard = ({ title, icon, items, bulletClassName }) => (
  <section className="section-card p-8">
    <h2 className="flex items-center text-xl font-bold text-brand-green">
      {icon}
      {title}
    </h2>
    {items.length ? (
      <ul className="mt-6 space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-start text-sm leading-7 text-slate-600">
            <span
              className={`mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full ${bulletClassName}`}
            ></span>
            {item}
          </li>
        ))}
      </ul>
    ) : (
      <p className="mt-6 text-sm leading-7 text-slate-500">
        Details will be shared at the time of enquiry.
      </p>
    )}
  </section>
);

const ItineraryTimeline = ({ itinerary, prefersReducedMotion }) => (
  <div className="relative">
    <div className="absolute bottom-4 left-6 top-4 hidden w-px bg-gradient-to-b from-brand-red/15 via-brand-red/55 to-brand-red/10 sm:block"></div>
    <div className="space-y-6">
      {itinerary.map((item, index) => {
        const dayLabel = item.day || index + 1;

        return (
          <motion.div
            key={`${item.day}-${index}`}
            className="group relative grid gap-4 sm:grid-cols-[72px,1fr]"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : index * 0.05 }}
          >
            <div className="relative z-10 flex sm:justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-brand-red text-base font-bold text-white shadow-lg shadow-brand-red/20 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-brand-red/30">
                {dayLabel}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-5 shadow-sm transition duration-300 group-hover:border-brand-red/20 group-hover:shadow-md">
              <div className="mb-2 flex items-center gap-3">
                <span className="inline-flex rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-red">
                  Day {dayLabel}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {item.title || `Day ${dayLabel}`}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {item.details ||
                  'Detailed itinerary information will be shared at the time of confirmation.'}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default PackageDetails;
