import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from '../constants/site';
import { HOME_TRUST_STATS } from '../data/brandContent';

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const introMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: 'easeOut' }
      };

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbf7_0%,#ffffff_48%,#f8f6f3_100%)]">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand-green/8 to-transparent"></div>
      <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-brand-red/8 blur-3xl"></div>
      <div className="absolute -right-16 top-12 h-72 w-72 rounded-full bg-brand-green/10 blur-3xl"></div>

      <div className="site-shell section-space relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr,0.92fr]">
          <motion.div {...introMotion}>
            <span className="inline-flex rounded-full bg-brand-red/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">
              Spiritual journeys and practical holiday planning
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Trusted Indian travel planning for{' '}
              <span className="text-brand-green">spiritual tours</span>, family holidays,
              and customized journeys.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Rituu Saarthhii Tour & Travels helps you plan meaningful travel with clear
              guidance, comfortable arrangements, and responsive support from enquiry to
              return journey.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/packages" className="brand-button">
                Explore Packages
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <a href={CONTACT_PHONE_HREF} className="brand-button-secondary">
                <PhoneCall size={18} className="mr-2" />
                Speak to Us
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200/70">
                Bhopal-based travel assistance
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200/70">
                Real phone support: {CONTACT_PHONE_DISPLAY}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.98 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
            className="relative"
          >
            <div className="section-card overflow-hidden bg-white p-3">
              <div className="relative overflow-hidden rounded-[1.5rem]">
                <img
                  className="h-[420px] w-full object-cover sm:h-[500px]"
                  src="https://images.pexels.com/photos/35960311/pexels-photo-35960311.jpeg"
                  alt="Spiritual travel destination in India"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/10 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 rounded-[1.5rem] border border-white/15 bg-white/12 p-5 backdrop-blur-md">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                    Carefully planned journeys
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-white">
                    Spiritual routes, holiday comfort, and personalized assistance
                  </div>
                </div>
              </div>
            </div>

            <div className="soft-panel absolute -bottom-10 left-4 right-4 grid gap-4 bg-white p-5 sm:grid-cols-3">
              {HOME_TRUST_STATS.map((item) => (
                <div key={item.value}>
                  <div className="text-lg font-extrabold text-brand-green">{item.value}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
