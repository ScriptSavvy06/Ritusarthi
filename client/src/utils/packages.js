export const PACKAGE_CATEGORY_OPTIONS = [
  'Spiritual',
  'Holiday',
  'Customized',
  'Group'
];

export function createPackageSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function normalizePackageForClient(pkg) {
  if (!pkg) {
    return null;
  }

  const heroImage = pkg.heroImage || pkg.image || pkg.images?.[0] || '';
  const images = Array.isArray(pkg.images) ? pkg.images.filter(Boolean) : [];
  const mergedImages = heroImage
    ? Array.from(new Set([heroImage, ...images]))
    : Array.from(new Set(images));

  return {
    ...pkg,
    slug: pkg.slug || createPackageSlug(pkg.title),
    heroImage,
    image: heroImage,
    images: mergedImages,
    overview: pkg.overview || pkg.description || '',
    itinerary: Array.isArray(pkg.itinerary) ? pkg.itinerary : [],
    inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
    exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions : [],
    pricingNotes: Array.isArray(pkg.pricingNotes) ? pkg.pricingNotes : [],
    ctaPhone: pkg.ctaPhone || '',
    ctaText: pkg.ctaText || 'Book Now / Enquire',
    isFeatured: Boolean(pkg.isFeatured),
    isActive: pkg.isActive !== false
  };
}

export function createEmptyPackageForm() {
  return {
    title: '',
    slug: '',
    category: PACKAGE_CATEGORY_OPTIONS[0],
    location: '',
    duration: '',
    price: '',
    description: '',
    overview: '',
    heroImage: '',
    images: [''],
    itinerary: [{ day: '1', title: '', details: '' }],
    inclusions: [''],
    exclusions: [''],
    pricingNotes: [''],
    ctaPhone: '',
    ctaText: 'Book Now / Enquire',
    isFeatured: false,
    isActive: true
  };
}

export function mapPackageToForm(pkg) {
  const normalizedPackage = normalizePackageForClient(pkg);

  return {
    title: normalizedPackage.title || '',
    slug: normalizedPackage.slug || '',
    category: normalizedPackage.category || PACKAGE_CATEGORY_OPTIONS[0],
    location: normalizedPackage.location || '',
    duration: normalizedPackage.duration || '',
    price:
      normalizedPackage.price !== undefined && normalizedPackage.price !== null
        ? String(normalizedPackage.price)
        : '',
    description: normalizedPackage.description || '',
    overview: normalizedPackage.overview || '',
    heroImage: normalizedPackage.heroImage || '',
    images: normalizedPackage.images.length ? normalizedPackage.images : [''],
    itinerary: normalizedPackage.itinerary.length
      ? normalizedPackage.itinerary.map((item, index) => ({
          day: String(item.day || index + 1),
          title: item.title || '',
          details: item.details || ''
        }))
      : [{ day: '1', title: '', details: '' }],
    inclusions: normalizedPackage.inclusions.length ? normalizedPackage.inclusions : [''],
    exclusions: normalizedPackage.exclusions.length ? normalizedPackage.exclusions : [''],
    pricingNotes: normalizedPackage.pricingNotes.length
      ? normalizedPackage.pricingNotes
      : [''],
    ctaPhone: normalizedPackage.ctaPhone || '',
    ctaText: normalizedPackage.ctaText || 'Book Now / Enquire',
    isFeatured: normalizedPackage.isFeatured,
    isActive: normalizedPackage.isActive
  };
}

export function buildPackagePayload(form) {
  const heroImage = form.heroImage.trim();
  const images = form.images.map((item) => item.trim()).filter(Boolean);
  const mergedImages = heroImage
    ? Array.from(new Set([heroImage, ...images]))
    : Array.from(new Set(images));

  return {
    title: form.title.trim(),
    slug: createPackageSlug(form.slug || form.title),
    category: form.category,
    location: form.location.trim(),
    duration: form.duration.trim(),
    price: Number(form.price),
    description: form.description.trim(),
    overview: form.overview.trim(),
    heroImage,
    images: mergedImages,
    itinerary: form.itinerary
      .map((item, index) => ({
        day: Number(item.day) || index + 1,
        title: item.title.trim(),
        details: item.details.trim()
      }))
      .filter((item) => item.title || item.details),
    inclusions: form.inclusions.map((item) => item.trim()).filter(Boolean),
    exclusions: form.exclusions.map((item) => item.trim()).filter(Boolean),
    pricingNotes: form.pricingNotes.map((item) => item.trim()).filter(Boolean),
    ctaPhone: form.ctaPhone.trim(),
    ctaText: form.ctaText.trim(),
    isFeatured: Boolean(form.isFeatured),
    isActive: Boolean(form.isActive)
  };
}
