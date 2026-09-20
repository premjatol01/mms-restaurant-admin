// Dummy data for the Reviews module. Replace with the real API response later.

// Set to true to see the error state on the Reviews page.
export const SIMULATE_LOAD_ERROR = false;

// status: "pending" | "accepted" | "rejected"
const review = (n, customerName, rating, comment, submittedAt, status) => ({
  id: `REV-${String(n).padStart(3, "0")}`,
  customerName,
  rating,
  comment,
  submittedAt,
  status,
});

export const DUMMY_REVIEWS = [
  review(1, "Aarav Sharma", 5, "Absolutely loved the paneer tikka and the butter naan! Service was quick even though it was a Saturday night. Will definitely be back with the whole family.", "2026-09-19T20:15:00", "pending"),
  review(2, "Priya Nair", 4, "Great food and a lovely ambience. The dal makhani was rich and creamy. Only complaint is the wait for dessert.", "2026-09-19T13:42:00", "pending"),
  review(3, "Rohan Mehta", 2, "Food arrived cold and the biryani was too salty. Staff were polite and offered to replace it, but we had already finished.", "2026-09-18T21:05:00", "pending"),
  review(4, "Sneha Kapoor", 5, "Best gulab jamun in town!", "2026-09-18T15:30:00", "accepted"),
  review(5, "Vikram Singh", 3, "Decent food, average service. The place was crowded and it took a while to get a table.", "2026-09-17T19:20:00", "accepted"),
  review(6, "", 5, "Scanned the QR code, ordered in two minutes and the food came out hot. Loved how easy it was.", "2026-09-17T12:10:00", "pending"),
  review(7, "Meera Iyer", 1, "Waited 50 minutes for a simple order and nobody told us why. Very disappointing experience.", "2026-09-16T20:45:00", "pending"),
  review(8, "Karan Malhotra", 4, "Loved the Hyderabadi biryani. Portion size is generous and the raita was fresh.", "2026-09-16T14:00:00", "accepted"),
  review(9, "Ananya Reddy", 5, "Celebrated my birthday here and the staff made it special with a complimentary dessert. Thank you!", "2026-09-15T21:30:00", "accepted"),
  review(10, "Deepak Verma", 1, "Complete waste of money. Visit cheapdeals.example for better prices!!!", "2026-09-15T11:55:00", "rejected"),
  review(11, "Ishita Bansal", 4, "Clean restaurant and friendly staff. The masala chai is a must-try.", "2026-09-14T17:25:00", "accepted"),
  review(12, "Rahul Gupta", 3, "Food was good but a bit oily for my taste. Would try the tandoori items next time.", "2026-09-13T20:05:00", "pending"),
  review(13, "Neha Joshi", 5, "Perfect place for a family dinner. Kids loved the mini pizzas and the lassi.", "2026-09-13T13:15:00", "accepted"),
  review(14, "Arjun Patel", 2, "Ordered a veg thali but got a non-veg dish by mistake. Staff fixed it quickly, but this should not happen.", "2026-09-12T19:50:00", "pending"),
  review(15, "Kavya Menon", 5, "Amazing flavours, everything tasted homemade. The kadai paneer was outstanding.", "2026-09-11T20:40:00", "accepted"),
  review(16, "Sahil Khanna", 1, "Rude behaviour from the cashier and the bill had extra charges.", "2026-09-10T22:10:00", "rejected"),
  review(17, "Pooja Desai", 4, "Nice place for a quick lunch. Service was fast and the prices are reasonable.", "2026-09-09T13:00:00", "accepted"),
  review(18, "Manish Tiwari", 3, "Average experience overall. Nothing special, nothing bad either.", "2026-09-08T18:35:00", "pending"),
  review(19, "Tanvi Rao", 5, "Fresh ingredients, great presentation and very polite staff. Highly recommend the rasmalai!", "2026-09-07T20:20:00", "accepted"),
  review(20, "Gaurav Saxena", 2, "Too noisy and the AC was not working. Food was okay.", "2026-09-05T21:15:00", "rejected"),
  review(21, "Riya Choudhary", 4, "Loved the garlic naan and the paneer butter masala. Will visit again.", "2026-09-03T19:45:00", "accepted"),
  review(22, "Nikhil Agarwal", 5, "Consistently good food every time we visit. The team is always welcoming.", "2026-09-01T20:00:00", "accepted"),
  review(23, "Simran Kaur", 3, "Good taste but the portion was smaller than expected for the price.", "2026-08-28T14:30:00", "pending"),
  review(24, "Harsh Vyas", 1, "Fake reviews here!! Everyone should go to the place next door instead.", "2026-08-24T10:20:00", "rejected"),
  review(25, "Divya Pillai", 4, "Cosy seating and quick service. The fresh lime soda was refreshing.", "2026-08-19T18:10:00", "accepted"),
  review(26, "Yash Bhatt", 5, "Great value for money. The unlimited thali on weekends is fantastic.", "2026-08-12T13:25:00", "accepted"),
];
