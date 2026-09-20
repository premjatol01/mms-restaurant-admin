import { Star } from "lucide-react";

export default function StarRating({ rating, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
      ))}
    </span>
  );
}
