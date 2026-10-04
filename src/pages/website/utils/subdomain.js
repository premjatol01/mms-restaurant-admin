import { websiteApi } from "../../../api/website.api";

export async function checkSubdomainAvailability(slug, currentSlug) {
  if (slug === currentSlug) return true;
  try {
    const res = await websiteApi.checkSubdomain(slug);
    return res.data?.data?.available === true;
  } catch {
    return false;
  }
}
