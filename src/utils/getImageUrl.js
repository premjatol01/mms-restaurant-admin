export const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  
  // VITE_API_URL is typically "http://localhost:5000/api"
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const baseUrl = apiUrl.replace('/api', '');
  
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
