import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Landmark, ShieldCheck, Target, Users } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import {
  ABOUT_SPECIALIZATIONS,
  ABOUT_VALUES,
  TRUST_PILLARS
} from '../data/brandContent';

const About = () => {
  return (
    <div className="bg-white">
      <section className="section-space overflow-hidden bg-[linear-gradient(180deg,#14532d_0%,#0f3e25_100%)] text-white">
        <div className="site-shell">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr,0.95fr]">
            <div>
              <SectionHeading
                eyebrow="About the brand"
                title="A Bhopal-based travel company built around trust, comfort, and meaningful journeys."
                description="Rituu Saarthhii Tour & Travels was created to help travellers plan spiritual tours, family holidays, and customized trips with practical guidance and warm service."
                light
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <StatCard value="Bhopal" label="Planning base" />
                <StatCard value="Temple + Holiday" label="Travel focus" />
                <StatCard value="Personal Support" label="Planning style" />
              </div>
            </div>
            <div className="section-card overflow-hidden border-white/10 bg-white/10 p-3 backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80"
                alt="Indian travel destination"
                className="h-[420px] w-full rounded-[1.5rem] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="site-shell">
          <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Our story"
                title="We believe a good trip should feel organized, honest, and genuinely supportive."
                description="From spiritual routes to family travel, we focus on helping people move with confidence rather than confusion."
              />
              <div className="mt-8 space-y-5 text-base leading-8 text-slate-600">
                <p>
                  Rituu Saarthhii Tour & Travels grew from a simple idea: travellers need
                  a reliable planning partner who understands both the emotional side of a
                  journey and the practical side of making it work well.
                </p>
                <p>
                  We work especially closely with people planning spiritual travel, family
                  vacations, and customized routes across India. Many travellers come to us
                  looking for clarity, not just a booking. That is why our process focuses
                  on route practicality, stay comfort, communication, and support before
                  and during the trip.
                </p>
                <p>
                  As a Bhopal-based travel business, we aim to stay approachable, grounded,
                  and realistic in the way we plan journeys. We would rather suggest a
                  workable trip than promise something flashy that does not serve the
                  traveller well.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="section-card p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                    <Target size={26} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      To plan journeys that feel clear, comfortable, and trustworthy for
                      spiritual travellers, holidaymakers, families, and groups.
                    </p>
                  </div>
                </div>
              </div>

              <div className="section-card p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
                    <Users size={26} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      To be known as a dependable Indian travel partner that combines
                      responsive service, honest planning, and practical on-ground support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-slate-50">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Our values"
            title="The principles that guide how we speak, plan, and support every trip."
            description="We keep our work grounded in honesty, care, and service that feels useful in real travel situations."
            align="center"
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {ABOUT_VALUES.map((value, index) => (
              <div key={value.title} className="soft-panel h-full p-7">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  {index === 0 ? (
                    <ShieldCheck size={24} className="text-brand-red" />
                  ) : index === 1 ? (
                    <HeartHandshake size={24} className="text-brand-green" />
                  ) : index === 2 ? (
                    <Landmark size={24} className="text-blue-600" />
                  ) : (
                    <Users size={24} className="text-amber-600" />
                  )}
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{value.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="site-shell">
          <div className="grid gap-10 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
            <div className="section-card overflow-hidden p-3">
              <video
                controls
                className="aspect-video w-full rounded-[1.5rem] bg-black object-cover"
                poster="/assets/logo.png"
              >
                <source src="/assets/opening_video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div>
              <SectionHeading
                eyebrow="Service philosophy"
                title="We plan travel with the mindset of a support partner, not just a seller."
                description="That means explaining options clearly, being realistic about logistics, and helping travellers choose what genuinely suits them."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {ABOUT_SPECIALIZATIONS.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium leading-7 text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-[1.75rem] bg-brand-green p-6 text-white">
                <h3 className="text-2xl font-bold text-white">
                  Planning commitment you can rely on
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/80">
                  We support travellers with route suggestions, package clarity, response
                  on calls and messages, and thoughtful help for family and spiritual
                  journeys where comfort and timing matter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-slate-50">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Why travellers stay with us"
            title="Trust is built through the details people actually remember."
            description="The most valued parts of a journey are often the ones that reduce stress and make the trip feel smoother."
            align="center"
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {TRUST_PILLARS.map((pillar) => (
              <div key={pillar} className="section-card px-6 py-5 text-sm font-medium text-slate-700">
                {pillar}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="site-shell">
          <div className="overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,#14532d_0%,#1f6a3a_52%,#cc2121_100%)] p-8 text-white md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
              <div>
                <SectionHeading
                  eyebrow="Talk to our team"
                  title="If you want a journey planned with clarity and genuine support, we would be happy to help."
                  description="Reach out for temple tours, holiday packages, and customized travel planning across India."
                  light
                />
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm leading-7 text-white/80">
                  We are especially happy to guide travellers who want a more practical
                  understanding of itinerary comfort, route planning, and package
                  suitability before making a decision.
                </p>
                <div className="mt-6">
                  <Link to="/contact" className="inline-flex items-center rounded-full bg-white px-6 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-100">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ value, label }) => (
  <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
    <div className="text-2xl font-extrabold text-white">{value}</div>
    <div className="mt-1 text-sm leading-6 text-white/75">{label}</div>
  </div>
);

export default About;
