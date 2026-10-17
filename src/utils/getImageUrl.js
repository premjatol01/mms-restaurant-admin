export const getImageUrl = (path) => {
  if (!path) return "";
  if (typeof path === "object" && path !== null) {
    path = path.url || path.imageUrl || path.image || "";
  }
  if (!path || typeof path !== "string") return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  const apiUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};
