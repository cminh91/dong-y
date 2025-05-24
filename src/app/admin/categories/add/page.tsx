'use client';

import React from 'react';
import CategoryForm, { CategoryData } from '@/components/admin/CategoryForm';

// Placeholder for the server action to create a category
async function createCategory(data: CategoryData) {
  console.log('Creating category:', data);
  // In a real application, you would call your backend API or server action here
  // Example: const result = await createCategoryServerAction(data);
  // return result;
  return { success: true }; // Simulate success
}

export default function AddCategoryPage() {
  // In a real application, you would fetch parent categories here
  const parentCategories: { id: string; name: string }[] = []; // Placeholder

  return (
    <div className="container mx-auto px-2 py-3 sm:px-4 sm:py-5 md:px-6 md:py-6">
      <CategoryForm onSubmit={createCategory} parentCategories={parentCategories} />
    </div>
  );
}