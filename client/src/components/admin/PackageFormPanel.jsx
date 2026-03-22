import React from 'react';
import { Plus, Sparkles, Trash2, X } from 'lucide-react';
import { PACKAGE_CATEGORY_OPTIONS } from '../../utils/packages';

const PackageFormPanel = ({
  form,
  mode,
  saving,
  error,
  onClose,
  onSubmit,
  onFieldChange,
  onToggleChange,
  onGenerateSlug,
  onListChange,
  onListAdd,
  onListRemove,
  onItineraryChange,
  onItineraryAdd,
  onItineraryRemove
}) => {
  return (
    <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'create' ? 'Create Package' : 'Edit Package'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage the content shown on the package cards and details page.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <X size={16} className="mr-2" />
          Close
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-8 px-6 py-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            label="Title"
            value={form.title}
            onChange={(value) => onFieldChange('title', value)}
            placeholder="Kedarnath Yatra"
            required
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Slug</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={form.slug}
                onChange={(event) => onFieldChange('slug', event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                placeholder="kedarnath-yatra"
                required
              />
              <button
                type="button"
                onClick={onGenerateSlug}
                className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Sparkles size={16} className="mr-2" />
                Generate
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
            <select
              value={form.category}
              onChange={(event) => onFieldChange('category', event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              {PACKAGE_CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Location"
            value={form.location}
            onChange={(value) => onFieldChange('location', value)}
            placeholder="Uttarakhand"
            required
          />

          <InputField
            label="Duration"
            value={form.duration}
            onChange={(value) => onFieldChange('duration', value)}
            placeholder="6 Days / 5 Nights"
            required
          />

          <InputField
            label="Price"
            value={form.price}
            onChange={(value) => onFieldChange('price', value)}
            placeholder="13999"
            type="number"
            required
          />

          <InputField
            label="Hero Image URL"
            value={form.heroImage}
            onChange={(value) => onFieldChange('heroImage', value)}
            placeholder="https://example.com/hero.jpg"
          />

          <InputField
            label="CTA Phone"
            value={form.ctaPhone}
            onChange={(value) => onFieldChange('ctaPhone', value)}
            placeholder="+91 92388 47850"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <TextareaField
            label="Short Description"
            value={form.description}
            onChange={(value) => onFieldChange('description', value)}
            placeholder="Shown on package cards and summary sections."
            required
          />

          <TextareaField
            label="Overview"
            value={form.overview}
            onChange={(value) => onFieldChange('overview', value)}
            placeholder="Full package overview for the details page."
          />
        </div>

        <TextareaField
          label="CTA Text"
          value={form.ctaText}
          onChange={(value) => onFieldChange('ctaText', value)}
          placeholder="Book Now / Enquire"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <ToggleField
            label="Featured Package"
            description="Show this package in featured/public sections."
            checked={form.isFeatured}
            onChange={(checked) => onToggleChange('isFeatured', checked)}
          />

          <ToggleField
            label="Active Package"
            description="Inactive packages stay hidden on the public website."
            checked={form.isActive}
            onChange={(checked) => onToggleChange('isActive', checked)}
          />
        </div>

        <ListEditor
          title="Gallery Images"
          items={form.images}
          placeholder="https://example.com/gallery-image.jpg"
          onChange={(index, value) => onListChange('images', index, value)}
          onAdd={() => onListAdd('images')}
          onRemove={(index) => onListRemove('images', index)}
        />

        <ListEditor
          title="Included Items"
          items={form.inclusions}
          placeholder="Accommodation on quad sharing"
          onChange={(index, value) => onListChange('inclusions', index, value)}
          onAdd={() => onListAdd('inclusions')}
          onRemove={(index) => onListRemove('inclusions', index)}
        />

        <ListEditor
          title="Excluded Items"
          items={form.exclusions}
          placeholder="Personal expenses"
          onChange={(index, value) => onListChange('exclusions', index, value)}
          onAdd={() => onListAdd('exclusions')}
          onRemove={(index) => onListRemove('exclusions', index)}
        />

        <ListEditor
          title="Pricing Notes"
          items={form.pricingNotes}
          placeholder="Final pricing depends on travel dates and availability."
          onChange={(index, value) => onListChange('pricingNotes', index, value)}
          onAdd={() => onListAdd('pricingNotes')}
          onRemove={(index) => onListRemove('pricingNotes', index)}
        />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Itinerary</h3>
              <p className="text-sm text-slate-500">
                Build the day-wise plan shown on the details page.
              </p>
            </div>

            <button
              type="button"
              onClick={onItineraryAdd}
              className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Plus size={16} className="mr-2" />
              Add Day
            </button>
          </div>

          <div className="space-y-4">
            {form.itinerary.map((item, index) => (
              <div
                key={`itinerary-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="grid gap-4 md:grid-cols-[120px,1fr,auto]">
                  <InputField
                    label="Day"
                    value={item.day}
                    onChange={(value) => onItineraryChange(index, 'day', value)}
                    type="number"
                  />

                  <InputField
                    label="Title"
                    value={item.title}
                    onChange={(value) => onItineraryChange(index, 'title', value)}
                    placeholder="Arrival and Rishikesh"
                  />

                  <button
                    type="button"
                    onClick={() => onItineraryRemove(index)}
                    className="mt-7 inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Remove
                  </button>
                </div>

                <div className="mt-4">
                  <TextareaField
                    label="Details"
                    value={item.details}
                    onChange={(value) => onItineraryChange(index, 'details', value)}
                    placeholder="Describe the travel plan for this day."
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? 'Saving...'
              : mode === 'create'
                ? 'Create Package'
                : 'Update Package'}
          </button>
        </div>
      </form>
    </section>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
    />
  </div>
);

const TextareaField = ({ label, value, onChange, placeholder, required = false }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      rows={4}
      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
    />
  </div>
);

const ToggleField = ({ label, description, checked, onChange }) => (
  <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
    />
    <div>
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="text-sm text-slate-500">{description}</div>
    </div>
  </label>
);

const ListEditor = ({ title, items, placeholder, onChange, onAdd, onRemove }) => (
  <section>
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        <Plus size={16} className="mr-2" />
        Add Item
      </button>
    </div>

    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${title}-${index}`} className="flex gap-3">
          <input
            type="text"
            value={item}
            onChange={(event) => onChange(index, event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  </section>
);

export default PackageFormPanel;
