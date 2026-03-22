const DEFAULT_PACKAGE_IMAGE =
  'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

export const FALLBACK_PACKAGES = [
  {
    _id: '6',
    title: 'Kedarnath Yatra',
    description:
      'Witness a sacred Himalayan journey with comfortable planning, travel support, and peaceful darshan experiences.',
    price: 13999,
    duration: '6 Days / 5 Nights',
    location: 'Uttarakhand',
    category: 'Spiritual',
    image:
      'https://www.bontravelindia.com/wp-content/uploads/2021/09/Kedarnath-Mandir.jpg',
    isFeatured: true
  },
  {
    _id: '1',
    title: 'Mahakaleshwar Ujjain',
    description:
      'Experience the divine Mahakal Lok and witness the powerful Bhasma Aarti with a carefully planned short spiritual getaway.',
    price: 8500,
    duration: '2 Days / 1 Night',
    location: 'Ujjain',
    category: 'Spiritual',
    image:
      'https://media.assettype.com/outlooktraveller%2F2024-01%2F28b51af3-4c37-4de9-9ff4-122fe704ec6f%2Fshutterstock_2173332103.jpg?w=1200&ar=40%3A21&auto=format%2Ccompress&ogImage=true&mode=crop&enlarge=true&overlay=false&overlay_position=bottom&overlay_width=100',
    isFeatured: true
  },
  {
    _id: '2',
    title: 'Himalayan Holiday',
    description:
      'Breathtaking views and peaceful stays in the heart of the Himalayas with a comfortable family-friendly plan.',
    price: 25000,
    duration: '5 Days / 4 Nights',
    location: 'Shimla & Manali',
    category: 'Holiday',
    image:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    isFeatured: true
  },
  {
    _id: '3',
    title: 'Royal Rajasthan Experience',
    description:
      'Explore the majestic forts and colorful culture of Jaipur and Udaipur with a premium heritage itinerary.',
    price: 30000,
    duration: '6 Days / 5 Nights',
    location: 'Rajasthan',
    category: 'Group',
    image:
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    _id: '4',
    title: 'Chardham Yatra',
    description:
      'A sacred pilgrimage to Yamunotri, Gangotri, Kedarnath, and Badrinath with coordinated transport and support.',
    price: 55000,
    duration: '12 Days / 11 Nights',
    location: 'Uttarakhand',
    category: 'Spiritual',
    image:
      'https://media.istockphoto.com/id/539105384/photo/kedarnath-in-india.jpg?s=1024x1024&w=is&k=20&c=m_bsZ55eow_uOF4w47A2aRrpqtFQZvNGS4pX-6kZjn0='
  },
  {
    _id: '5',
    title: 'Kerala Backwaters',
    description:
      'Relax in the houseboats of Alleppey and explore the tea gardens of Munnar with a peaceful leisure escape.',
    price: 22000,
    duration: '4 Days / 3 Nights',
    location: 'Kerala',
    category: 'Holiday',
    image:
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
];

const KEDARNATH_DETAIL = {
  title: 'Kedarnath Yatra (Delhi to Delhi)',
  description:
    'Experience a well-planned Kedarnath spiritual journey with comfortable stays, guided support, and a complete Delhi-to-Delhi travel setup. This itinerary is designed to keep the journey smooth and senior-friendly, covering Rishikesh, Guptkashi, and Kedarnath with proper rest, meals, and coordination throughout the trip.',
  duration: '6 Days / 5 Nights (Trip Plan)',
  images: [
    'https://tse3.mm.bing.net/th/id/OIP.bLvq0U0aFWeLW7BigZ6rHQHaEH?rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://media.istockphoto.com/id/539105384/photo/kedarnath-in-india.jpg?s=1024x1024&w=is&k=20&c=m_bsZ55eow_uOF4w47A2aRrpqtFQZvNGS4pX-6kZjn0='
  ],
  itinerary: [
    {
      day: 1,
      title: 'Night Departure',
      details:
        'Departure by sleeper train from your city and overnight journey towards Delhi.'
    },
    {
      day: 2,
      title: 'Delhi Arrival and Rishikesh',
      details:
        'Morning arrival in Delhi, transfer to Rishikesh, local sightseeing, and evening Ganga Aarti.'
    },
    {
      day: 3,
      title: 'Rishikesh to Guptkashi',
      details:
        'Scenic drive towards Guptkashi with river views, mountain landscapes, dinner, and overnight stay.'
    },
    {
      day: 4,
      title: 'Gaurikund to Kedarnath',
      details:
        'Travel to Gaurikund and begin the trek to Kedarnath. Pony or palki support can be arranged at your own cost.'
    },
    {
      day: 5,
      title: 'Temple Darshan and Rest',
      details:
        'Early morning darshan at Kedarnath Temple followed by optional local exploration and rest.'
    },
    {
      day: 6,
      title: 'Return Journey',
      details:
        'Trek down, drive back towards Guptkashi, and continue the onward return journey.'
    }
  ],
  inclusions: [
    '04 Breakfast',
    '04 Dinner',
    'Sleeper Class Train Tickets',
    'Transportation from Delhi to Delhi',
    'Accommodation on quad sharing basis',
    'Trip leaders and support staff'
  ],
  exclusions: [
    'Pony or palki charges',
    'Helicopter tickets',
    'Lunch and personal expenses',
    'VIP darshan tickets',
    'Travel insurance',
    'Any extra services not mentioned above'
  ],
  pricingNotes: [
    'Base price: Rs 13,999 per person on quad sharing.',
    'Departure pricing may vary slightly by pickup city.',
    'Final pricing depends on travel dates and availability.'
  ]
};

export const PACKAGE_OPTIONS = [
  ...FALLBACK_PACKAGES.map((pkg) => pkg.title),
  'Customized Trip'
];

export function normalizePackage(pkg) {
  if (!pkg) {
    return null;
  }

  const primaryImage = pkg.image || pkg.images?.[0] || DEFAULT_PACKAGE_IMAGE;

  return {
    ...pkg,
    image: primaryImage,
    images: Array.isArray(pkg.images) && pkg.images.length ? pkg.images : [primaryImage]
  };
}

export function getFallbackPackageById(id) {
  return FALLBACK_PACKAGES.find((pkg) => String(pkg._id) === String(id)) || null;
}

export function getFallbackPackageDetails(id) {
  const basePackage = getFallbackPackageById(id);

  if (!basePackage) {
    return null;
  }

  if (String(id) === '6') {
    return normalizePackage({
      ...basePackage,
      ...KEDARNATH_DETAIL
    });
  }

  return normalizePackage({
    ...basePackage,
    images: [basePackage.image || DEFAULT_PACKAGE_IMAGE],
    inclusions: [
      'Accommodation as per itinerary',
      'Travel coordination support',
      'Comfortable planned sightseeing'
    ],
    exclusions: [
      'Personal expenses',
      'Meals not specifically mentioned',
      'Optional activities and upgrades'
    ],
    itinerary: [],
    pricingNotes: ['Final pricing depends on travel dates and availability.']
  });
}
