import { takenSubdomains } from "../data/subdomains";

// Mock availability check.
// TODO: replace with the real API call, e.g. GET /website/subdomain/check?slug=...
export async function checkSubdomainAvailability(slug, currentSlug) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (slug === currentSlug) return true;
  return !takenSubdomains.includes(slug);
}
