import { supabase } from '../lib/supabase';

const DEFAULT_MAIN_CATEGORIES = [
  'Transport Equipment',
  'Warehouse Equipment',
  'IT & Tracking Devices',
  'Tools & Machinery',
  'Other',
];

const getCategoryName = (category) =>
  category?.name || category?.category_name || category?.label || '';

const matchesName = (category, name) =>
  getCategoryName(category).toLowerCase() === String(name || '').toLowerCase();

const sortWithDefaultsFirst = (names) => {
  const uniqueNames = [...new Set(names.filter(Boolean))];
  return uniqueNames.sort((a, b) => {
    const aIndex = DEFAULT_MAIN_CATEGORIES.indexOf(a);
    const bIndex = DEFAULT_MAIN_CATEGORIES.indexOf(b);

    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }

    return a.localeCompare(b);
  });
};

export const fetchAssetCategories = async () => {
  try {
    const { data, error } = await supabase.from('asset_categories').select('*').order('name');

    if (error) throw error;
    return data || [];
  } catch (err) {
    return [];
  }
};

export const getMainCategories = (categories = []) => {
  const mainCategories = categories.filter((category) => !category.parent_id).map(getCategoryName);

  return sortWithDefaultsFirst(
    mainCategories.length > 0 ? mainCategories : DEFAULT_MAIN_CATEGORIES
  );
};

export const getSubCategories = (categories = [], categoryName) => {
  const parent = categories.find(
    (category) => !category.parent_id && matchesName(category, categoryName)
  );
  if (!parent?.id) return [];

  return categories
    .filter((category) => category.parent_id === parent.id)
    .map(getCategoryName)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
};

export const getAssetTypes = (categories = [], categoryName, subCategoryName) => {
  const category = categories.find((item) => !item.parent_id && matchesName(item, categoryName));
  const subCategory = categories.find(
    (item) => item.parent_id === category?.id && matchesName(item, subCategoryName)
  );

  if (!subCategory?.id) return [];

  return categories
    .filter((item) => item.parent_id === subCategory.id)
    .map(getCategoryName)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
};

export const getCategoryId = (categories = [], categoryName, subCategoryName, assetTypeName) => {
  const category = categories.find((item) => !item.parent_id && matchesName(item, categoryName));
  const subCategory = categories.find(
    (item) => item.parent_id === category?.id && matchesName(item, subCategoryName)
  );
  const assetType = categories.find(
    (item) => item.parent_id === subCategory?.id && matchesName(item, assetTypeName)
  );

  return assetType?.id || subCategory?.id || category?.id || null;
};

export const getDynamicFields = () => [];

export const getCategoryPath = (categories = [], categoryId) => {
  const path = [];
  let current = categories.find((category) => category.id === categoryId);

  while (current) {
    path.unshift(getCategoryName(current));
    current = categories.find((category) => category.id === current.parent_id);
  }

  return path.join(' > ');
};

export const fetchLocations = async () => {
  try {
    const { data, error } = await supabase.from('locations').select('*').order('name');

    if (error) throw error;
    return data || [];
  } catch (err) {
    return [];
  }
};
