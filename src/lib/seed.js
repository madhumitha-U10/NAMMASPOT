export const categoryNames = [
  "Handmade",
  "Food",
  "Fashion",
  "Accessories",
  "Gifts",
  "Home Decor",
  "Jewellery",
  "Beauty",
  "Services",
];

export const seedSellers = [
  {
    id: "chennai-crochets",
    slug: "chennai-crochets",
    business_name: "Chennai Crochets",
    owner_name: "Local maker",
    email: "hello@chennai-crochets.local",
    phone: "",
    whatsapp_phone: "",
    instagram_url: "https://instagram.com/",
    category: "Handmade",
    location: "Anna Nagar, Chennai",
    location_url: "",
    description: "Handmade crochet accessories made locally with care.",
    verification_status: "approved",
    verified: true,
    opening_time: "10:00",
    closing_time: "19:00",
    products: [
      { id: "cc-1", name: "Crochet Flower Keychain", description: "Colourful handmade keychain.", price: 149, available: true, image_url: "" },
      { id: "cc-2", name: "Mini Crochet Bouquet", description: "A small handmade bouquet for gifting.", price: 299, available: true, image_url: "" },
    ],
  },
  {
    id: "madras-bites",
    slug: "madras-bites",
    business_name: "Madras Bites",
    owner_name: "Local food maker",
    email: "hello@madras-bites.local",
    phone: "",
    whatsapp_phone: "",
    instagram_url: "https://instagram.com/",
    category: "Food",
    location: "T. Nagar, Chennai",
    location_url: "",
    description: "Homemade snacks and treats for local orders.",
    verification_status: "approved",
    verified: true,
    opening_time: "09:00",
    closing_time: "21:00",
    products: [
      { id: "mb-1", name: "Murukku Box", description: "Fresh crunchy murukku.", price: 180, available: true, image_url: "" },
    ],
  },
  {
    id: "tamil-thread",
    slug: "tamil-thread",
    business_name: "Tamil Thread",
    owner_name: "Local creator",
    email: "hello@tamil-thread.local",
    phone: "",
    whatsapp_phone: "",
    instagram_url: "https://instagram.com/",
    category: "Accessories",
    location: "Mylapore, Chennai",
    location_url: "",
    description: "Simple handmade accessories inspired by Chennai.",
    verification_status: "approved",
    verified: true,
    opening_time: "10:00",
    closing_time: "18:00",
    products: [
      { id: "tt-1", name: "Beaded Bracelet", description: "Handmade everyday bracelet.", price: 199, available: true, image_url: "" },
    ],
  },
];

export function normalizeSeller(row) {
  const category = row?.category?.name || row?.category || "Local";
  return {
    ...row,
    category,
    products: (row?.products || []).map((product) => ({
      ...product,
      available: product.available ?? true,
    })),
  };
}
