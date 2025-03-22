// Meal preferences for the user
export default interface Preferences {
  allergies: string[]; // ["gluten", "dairy", "soy", "peanuts", "tree nuts", "eggs", "fish", "shellfish", "mollusks", "crustaceans"]
  budget: number; // in dollars
  cuisine: string[]; // ["american", "asian", "mexican", "mediterranean", "italian", "french", "german", "spanish", "indian", "japanese", "korean", "thai", "vietnamese", "other"]
  dietaryRestrictions: string[]; // ["vegetarian", "vegan", "pescetarian", "flexitarian", "keto", "paleo", "primal", "whole30", "other"]
  mealDescription?: string; // "I want a quick warm breakfast for tomorrow morning"
  latitude: number; // latitude of the user
  longitude: number; // longitude of the user
  maxDistance: number; // in kilometers
}
