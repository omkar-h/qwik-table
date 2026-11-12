import type { User } from "./types";

const FIRST_NAMES = [
  "Aarav",
  "Ananya",
  "Rohan",
  "Priya",
  "Kabir",
  "Sanya",
  "Aditya",
  "Diya",
  "Rahul",
  "Isha",
  "Vikram",
  "Meera",
  "Arjun",
  "Neha",
  "Yash",
  "Kavya",
  "Siddharth",
  "Pooja",
  "Manish",
  "Sneha",
];

const LAST_NAMES = [
  "Joshi",
  "Sharma",
  "Deshmukh",
  "Patil",
  "Mehta",
  "Verma",
  "Kulkarni",
  "Nair",
  "Singh",
  "Gupta",
  "Shinde",
  "Rao",
  "Chavan",
  "Mishra",
  "Gawde",
  "Sawant",
  "More",
  "Kadam",
  "Jadhav",
  "Bhosale",
];

/**
 * Generates a deterministic array of mock users for stress-testing sorting and filtering.
 * Default count (2,500) represents the comfortable sweet spot for non-virtualized DOM tables.
 */
export function generateMockUsers(count = 2500): User[] {
  return Array.from({ length: count }, (_, index) => {
    const first = FIRST_NAMES[index % FIRST_NAMES.length];
    const last =
      LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
    // Append index suffix so composite rowKey stays 100% unique across thousands of rows
    const suffix =
      Math.floor(index / (FIRST_NAMES.length * LAST_NAMES.length)) + 1;

    return {
      firstName: suffix > 1 ? `${first} ${suffix}` : first,
      lastName: last,
      age: 20 + (index % 45), // Ages 20 to 64
    };
  });
}

// Comfortable sweet spot for unvirtualized DOM rendering (2,500 rows)
export const MOCK_USERS: User[] = generateMockUsers(2500);
