import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, Mail, MapPin, Phone, Send, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import { api, getApiErrorMessage } from '../lib/api';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  OFFICE_ADDRESS,
  OFFICE_MAP_DIRECTIONS_HREF,
  OFFICE_MAP_EMBED_SRC
} from '../constants/site';
import { PACKAGE_OPTIONS } from '../data/packageCatalog';
import { CONTACT_REASSURANCE_POINTS } from '../data/brandContent';
import { normalizePackageForClient } from '../utils/packages';
import { validateEnquiryFormData } from '../utils/enquiries';

const Contact = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialPackage = queryParams.get('package') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    message: '',
    package: initialPackage
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [availablePackages, setAvailablePackages] = useState(PACKAGE_OPTIONS);

  useEffect(() => {
    let isMounted = true;

    const loadPackages = async () => {
      try {
        const response = await api.get('/api/packages');
        const packageList = Array.isArray(response.data) ? response.data : [];

        if (isMounted && packageList.length > 0) {
          setAvailablePackages(
            packageList.map(normalizePackageForClient).map((pkg) => pkg.title)
          );
        }
      } catch (loadError) {
        if (isMounted) {
          setAvailablePackages(PACKAGE_OPTIONS);
        }
      }
    };

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, []);

  const packageOptions = useMemo(() => {
    if (!initialPackage || availablePackages.includes(initialPackage)) {
      return availablePackages;
    }

    return [initialPackage, ...availablePackages];
  }, [availablePackages, initialPackage]);

  const handleChange = (event) => {
    setFormData((currentValue) => ({
      ...currentValue,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const validationErrors = validateEnquiryFormData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/enquiries', formData);

      if (response.status === 201) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          travelDate: '',
          message: '',
          package: ''
        });
      }
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Something went wrong. Please try again or contact us via phone.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <section className="section-space overflow-hidden bg-[linear-gradient(180deg,#f8f4ef_0%,#ffffff_100%)]">
        <div className="site-shell">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr,0.98fr]">
            <div>
              <SectionHeading
                eyebrow="Plan your journey with guidance"
                title="Tell us what kind of trip you want to take, and we will help you shape it properly."
                description="Whether you are planning a spiritual route, a family holiday, or a customized trip, our team can guide you with package clarity, route suggestions, and practical support."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <MiniAssurance icon={<Clock3 size={18} />} title="Responsive support" description="We aim to respond quickly to new travel enquiries." />
                <MiniAssurance icon={<ShieldCheck size={18} />} title="Clear guidance" description="Packages and trip options are explained simply and honestly." />
                <MiniAssurance icon={<Phone size={18} />} title="Personal assistance" description="Talk to a real person for route and package help." />
              </div>
            </div>

            <div className="section-card overflow-hidden p-3">
              <img
                src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
                alt="Travel support in India"
                className="h-[420px] w-full rounded-[1.5rem] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-white pt-0">
        <div className="site-shell">
          <div className="grid gap-12 xl:grid-cols-[0.92fr,1.08fr]">
            <div className="space-y-6">
              <div className="section-card p-8">
                <SectionHeading
                  eyebrow="Contact details"
                  title="Speak with us for package guidance, route planning, and travel support."
                  description="We are happy to help if you are choosing between packages, planning a custom route, or coordinating family travel."
                />
                <div className="mt-8 space-y-5">
                  <ContactInfoCard
                    icon={<Phone size={22} />}
                    title="Phone Support"
                    content={
                      <a href={CONTACT_PHONE_HREF} className="hover:text-brand-green">
                        {CONTACT_PHONE_DISPLAY}
                      </a>
                    }
                  />
                  <ContactInfoCard
                    icon={<Mail size={22} />}
                    title="Email Address"
                    content={
                      <a href={`mailto:${CONTACT_EMAIL}`} className="break-all hover:text-brand-green">
                        {CONTACT_EMAIL}
                      </a>
                    }
                  />
                  <ContactInfoCard
                    icon={<MapPin size={22} />}
                    title="Office Address"
                    content={<span>{OFFICE_ADDRESS}</span>}
                  />
                </div>
              </div>

              <div className="soft-panel p-7">
                <h3 className="text-xl font-bold text-slate-900">Why contact us first?</h3>
                <div className="mt-5 space-y-4">
                  {CONTACT_REASSURANCE_POINTS.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
                        <ShieldCheck size={14} />
                      </span>
                      <p className="text-sm leading-7 text-slate-600">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-card overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h3 className="text-2xl font-bold text-slate-900">Visit our office</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    You can also reach us directly for travel discussions and route guidance.
                  </p>
                </div>
                <div className="h-72">
                  <iframe
                    title="Rituu Saarthhii Office Location"
                    src={OFFICE_MAP_EMBED_SRC}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <div className="px-6 py-5">
                  <a
                    href={OFFICE_MAP_DIRECTIONS_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-button-secondary"
                  >
                    <MapPin size={18} className="mr-2" />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>

            <div className="section-card p-8 md:p-10">
              <SectionHeading
                eyebrow="Send an enquiry"
                title="Share your travel requirement and let us help you with the next step."
                description="Fill in the form below and our team will connect with you regarding package suitability, travel dates, and customized planning options."
              />

              <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                Suitable for spiritual tours, family holidays, small groups, and custom
                trip requests. Date selection is optional, so you can enquire even if your
                plan is still flexible.
              </div>

              {submitted ? (
                <div className="mt-8 rounded-[1.75rem] bg-green-50 p-8 text-center text-green-800">
                  <h3 className="text-2xl font-bold text-green-900">Thank you for reaching out.</h3>
                  <p className="mt-3 text-base leading-7">
                    Your enquiry has been received. Our team will contact you shortly with
                    the next steps.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 font-semibold text-brand-green hover:underline"
                  >
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField label="Full Name">
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </FormField>

                    <FormField label="Phone Number">
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                        placeholder="+91 00000 00000"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </FormField>
                  </div>

                  <FormField label="Email Address">
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </FormField>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField label="Preferred Travel Date">
                      <input
                        type="date"
                        name="travelDate"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                        value={formData.travelDate}
                        onChange={handleChange}
                      />
                    </FormField>

                    <FormField label="Preferred Package">
                      <select
                        name="package"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                        value={formData.package}
                        onChange={handleChange}
                      >
                        <option value="">Select Package</option>
                        {packageOptions.map((packageName) => (
                          <option key={packageName} value={packageName}>
                            {packageName}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Your Message">
                    <textarea
                      name="message"
                      rows="5"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                      placeholder="Tell us about your destination, group size, route preference, or any custom requirement."
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </FormField>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                    Personalized planning support is available for pilgrimage routes,
                    family travel, and custom packages. If you are unsure which package
                    fits you best, just mention your requirement in the message field.
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-full bg-brand-green py-4 font-semibold text-white shadow-lg shadow-brand-green/15 transition hover:bg-green-800 disabled:opacity-50"
                  >
                    {loading ? (
                      'Processing...'
                    ) : (
                      <>
                        Send Enquiry
                        <Send size={18} className="ml-2" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ContactInfoCard = ({ icon, title, content }) => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-red shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <div className="mt-2 text-sm leading-7 text-slate-600">{content}</div>
      </div>
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    {children}
  </div>
);

const MiniAssurance = ({ icon, title, description }) => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
      {icon}
    </div>
    <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
  </div>
);

export default Contact;
