import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, IndianRupee, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const PackageCard = ({ pkg }) => {
  const prefersReducedMotion = useReducedMotion();
  const formattedPrice = new Intl.NumberFormat('en-IN').format(Number(pkg.price) || 0);

  return (
    <motion.article
      whileHover={
        prefersReducedMotion ? undefined : { y: -6, transition: { duration: 0.2 } }
      }
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.2)] transition duration-300 hover:shadow-[0_28px_70px_-28px_rgba(15,23,42,0.28)]"
    >
      <div className="relative h-60 overflow-hidden">
        <img
          src={
            pkg.image ||
            'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          }
          alt={pkg.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/15 to-transparent"></div>
        <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-green shadow-sm">
            {pkg.category}
          </span>
          <span className="rounded-full bg-brand-red px-3 py-1 text-sm font-bold text-white shadow-md">
            From Rs {formattedPrice}
          </span>
        </div>
        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-white/80">
            <span className="rounded-full bg-white/12 px-3 py-1 backdrop-blur-sm">
              Flexible support
            </span>
            <span className="rounded-full bg-white/12 px-3 py-1 backdrop-blur-sm">
              Real travel assistance
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-wrap gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
            <Clock size={15} className="mr-2 text-brand-red" />
            {pkg.duration}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
            <MapPin size={15} className="mr-2 text-brand-red" />
            {pkg.location}
          </span>
        </div>

        <h3 className="text-2xl font-bold leading-tight text-slate-900">{pkg.title}</h3>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">
          {pkg.description || 'Contact us for itinerary details, stay options, and trip support.'}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <div>
            <div className="text-sm font-medium text-slate-400">Starting from</div>
            <div className="mt-1 flex items-center text-2xl font-extrabold text-slate-900">
              <IndianRupee size={20} />
              <span>{formattedPrice}</span>
            </div>
          </div>

          <Link
            to={`/package/${pkg.slug || pkg._id}`}
            className="inline-flex items-center rounded-full bg-brand-green px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-green/15 transition hover:bg-green-800"
          >
            View Details
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default PackageCard;
