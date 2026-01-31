import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { CategoryTree } from "./api/queries/use-get-category-tree";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively finds all leaf categories (categories with no children) in a category tree
 */
export function findLeafCategories(category: CategoryTree): CategoryTree[] {
  const leafCategories: CategoryTree[] = [];
  
  if (category.children.length === 0) {
    // This is a leaf category
    leafCategories.push(category);
  } else {
    // Recursively find leaf categories in children
    category.children.forEach(child => {
      leafCategories.push(...findLeafCategories(child));
    });
  }
  
  return leafCategories;
}
