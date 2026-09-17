import React from 'react';
import { CATEGORIES } from '../../constants/categories';

export function CategoryPills({ selectedCategory, onSelectCategory }) {
  return (
    <div className="categories-wrapper">
      <div className="categories-scroll">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory?.id === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`category-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
