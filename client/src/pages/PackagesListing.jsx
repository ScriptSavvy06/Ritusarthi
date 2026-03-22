import React, { useEffect, useMemo, useState } from 'react';
import { Filter, PhoneCall, Search, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import PackageCard from '../components/PackageCard';
import SectionHeading from '../components/SectionHeading';
import { api } from '../lib/api';
import { PACKAGE_PAGE_FAQS, SERVICE_CATEGORIES } from '../data/brandContent';
import { CONTACT_PHONE_HREF } from '../constants/site';
import { normalizePackageForClient } from '../utils/packages';

const PackagesListing = () => {
  const prefersReducedMotion = useReducedMotion();
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPackages = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/api/packages');
        const packageList = Array.isArray(response.data) ? response.data : [];

        if (isMounted) {
          setPackages(packageList.map(normalizePackageForClient));
        }
      } catch (loadError) {
        if (isMounted) {
          setError('Unable to load packages right now.');
          setPackages([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    return ['All', ...new Set(packages.map((pkg) => pkg.category).filter(Boolean))];
  }, [packages]);

  const filteredPackages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return packages.filter((pkg) => {
      const matchesCategory = category === 'All' || pkg.category === category;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        pkg.title,
        pkg.location,
        pkg.category,
        pkg.slug,
        pkg.description,
        pkg.overview,
        ...(pkg.inclusions || []),
        ...(pkg.exclusions || []),
        ...(pkg.pricingNotes || []),
        ...(pkg.itinerary || []).flatMap((item) => [item.title, item.details])
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [category, searchTerm, packages]);

  const introMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: 'easeOut' }
      };

  return (
    <div className="min-h-screen bg-white">
      <section className="section-space overflow-hidden bg-[linear-gradient(180deg,#14532d_0%,#0f3e25_100%)] text-white">
        <div className="site-shell">
          <motion.div className="mx-auto max-w-4xl text-center" {...introMotion}>
            <SectionHeading
              eyebrow="Explore our journeys"
              title="Packages designed for spiritual travel, holidays, group movement, and customized trips across India."
              description="Search by destination, package type, category, or itinerary keyword to find a journey that suits your route and comfort preferences."
              align="center"
              light
            />
          </motion.div>

          <motion.div
            className="mt-10 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm md:p-6"
            {...introMotion}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),220px]">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by package, location, category, or itinerary keywords..."
                  className="w-full rounded-full border border-white/10 bg-white/10 py-3.5 pl-12 pr-4 text-white placeholder:text-white/55 focus:outline-none focus:ring-2 focus:ring-white/20"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <Filter size={20} className="text-white/75" />
                <select
                  className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categories.map((categoryOption) => (
                    <option key={categoryOption} value={categoryOption} className="text-slate-900">
                      {categoryOption === 'All' ? 'All Categories' : categoryOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-white/75">
              Showing {filteredPackages.length} of {packages.length} packages
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-space bg-white pb-10">
        <div className="site-shell">
          <div className="grid gap-6 lg:grid-cols-4">
            {SERVICE_CATEGORIES.map((categoryItem) => (
              <div key={categoryItem.title} className="soft-panel h-full p-6">
                <h3 className="text-xl font-bold text-slate-900">{categoryItem.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {categoryItem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="site-shell">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-600 md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-brand-green" />
              Transparent package guidance, personalized support, and practical travel assistance.
            </div>
            <a href={CONTACT_PHONE_HREF} className="mt-3 inline-flex items-center font-semibold text-brand-green md:mt-0">
              <PhoneCall size={16} className="mr-2" />
              Need help choosing a package?
            </a>
          </div>

          <div className="mt-12">
            {loading ? (
              <div className="rounded-[2rem] bg-white py-20 text-center shadow-sm ring-1 ring-slate-200/80">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
                <p className="mt-4 text-sm text-slate-500">Loading packages...</p>
              </div>
            ) : error ? (
              <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-center text-red-700">
                {error}
              </div>
            ) : filteredPackages.length > 0 ? (
              <motion.div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3" {...introMotion}>
                {filteredPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg._id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.18 }}
                    transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : index * 0.03 }}
                  >
                    <PackageCard pkg={pkg} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="rounded-[2rem] bg-slate-50 px-6 py-20 text-center shadow-sm ring-1 ring-slate-200/80">
                <h3 className="text-2xl font-bold text-slate-800">No packages match your search right now.</h3>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Try clearing the category or broadening the search term. If you are
                  looking for a route not listed here, contact us for a customized package.
                </p>
                <button
                  onClick={() => {
                    setCategory('All');
                    setSearchTerm('');
                  }}
                  className="mt-6 brand-button-secondary"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-space bg-slate-50">
        <div className="site-shell">
          <div className="grid gap-8 lg:grid-cols-[1.08fr,0.92fr]">
            <div className="section-card p-8 md:p-10">
              <SectionHeading
                eyebrow="Need help deciding?"
                title="If you are confused between destinations or package styles, we can guide you."
                description="Many travellers reach out before they know which route or package is best for their family, budget, or travel month. That is completely fine."
              />
              <p className="mt-6 text-base leading-8 text-slate-600">
                Tell us your destination preference, group size, travel month, and whether
                you want a spiritual, holiday, or customized trip. We will help you narrow
                the options in a practical way.
              </p>
              <a href={CONTACT_PHONE_HREF} className="mt-8 brand-button">
                Contact Our Travel Team
              </a>
            </div>

            <div className="space-y-4">
              {PACKAGE_PAGE_FAQS.map((faq) => (
                <div key={faq.question} className="soft-panel p-6">
                  <h3 className="text-lg font-bold text-slate-900">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PackagesListing;
