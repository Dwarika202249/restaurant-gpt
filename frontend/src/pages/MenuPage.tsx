import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { useAPIError } from '@/hooks/useAPIError';
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  displayOrder: number;
  icon?: string;
  createdAt?: string;
}

interface MenuItem {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  tags: string[];
  allergens: string[];
  isAvailable: boolean;
  ordersCount: number;
  createdAt?: string;
}

interface Menu {
  items: MenuItem[];
}

/**
 * Admin Menu Management Page
 * Route: /menu
 * Manage restaurant menu: categories and items with full CRUD
 */
export const MenuPage = () => {
  // Correct Redux Usage
  const auth = useAppSelector((state) => state.auth);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dispatch = useAppDispatch(); 

  // Custom Error Hook
  const { getErrorMessage } = useAPIError();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // State
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('items');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Category management
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' });

  // Item management
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    tags: '',
    allergens: ''
  });


  // Hydrate user if accessToken exists but user is null
  useEffect(() => {
    if (!auth.user && auth.accessToken) {
      dispatch(fetchAdminUser());
    }
  }, [auth.user, auth.accessToken, dispatch]);

  // Fetch menu and categories when user is loaded
  useEffect(() => {
    if (auth.user?.restaurantId && auth.accessToken) {
      fetchMenu();
      fetchCategories();
    }
  }, [auth.user?.restaurantId, auth.accessToken]);

  const fetchMenu = async () => {
    if (!auth.user?.restaurantId) {
      toast.error('Restaurant ID not found');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/menu/${auth.user.restaurantId}`,
        {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        }
      );
      if (response.data.data) {
        setMenu(response.data.data);
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/menu/category`,
        {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        }
      );
      if (response.data && response.data.data) {
        setCategories(response.data.data);
      } else {
        console.log("[fetchCategories] no data in response:", response.data);
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  // ===== CATEGORY OPERATIONS =====

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, icon: category.icon || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', icon: '' });
    }
    setShowCategoryModal(true);
  };

  const saveCategoryModal = async () => {
    
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }



    try {
      if (editingCategory) {
        // Update category
        await axios.put(`${API_URL}/menu/category/${editingCategory._id}`, {
          ...categoryForm
        }, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        toast.success('Category updated successfully');
      } else {
        // Create category
        await axios.post(`${API_URL}/menu/category`, {
          ...categoryForm
        }, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        toast.success('Category created successfully');
      }

      setShowCategoryModal(false);
      await fetchCategories();
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to save category');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure? Items in this category cannot be deleted with category.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/menu/category/${categoryId}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      toast.success('Category deleted successfully');
      await fetchMenu();
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to delete category');
    }
  };

  // ===== ITEM OPERATIONS =====

  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        imageUrl: item.imageUrl || '',
        tags: item.tags.join(', '),
        allergens: item.allergens.join(', ')
      });
    } else {
      setEditingItem(null);
      setItemForm({
        categoryId: categories[0]?._id || '',
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        tags: '',
        allergens: ''
      });
    }
    setShowItemModal(true);
  };

  const saveItemModal = async () => {
    if (!itemForm.categoryId || !itemForm.name.trim() || !itemForm.price) {
      toast.error('Category, name, and price are required');
      return;
    }

    try {
      const payload = {
        categoryId: itemForm.categoryId,
        name: itemForm.name,
        description: itemForm.description,
        price: parseFloat(itemForm.price),
        imageUrl: itemForm.imageUrl || undefined,
        tags: itemForm.tags.split(',').map(t => t.trim()).filter(t => t),
        allergens: itemForm.allergens.split(',').map(a => a.trim()).filter(a => a)
      };

      if (editingItem) {
        // Update item
        await axios.put(`${API_URL}/menu/item/${editingItem._id}`, payload, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        toast.success('Item updated successfully');
      } else {
        // Create item
        await axios.post(`${API_URL}/menu/item`, payload, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        toast.success('Item created successfully');
      }

      setShowItemModal(false);
      await fetchMenu();
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to save item');
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/menu/item/${itemId}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      toast.success('Item deleted successfully');
      await fetchMenu();
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to delete item');
    }
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    try {
      await axios.put(`${API_URL}/menu/item/${item._id}`, {
        isAvailable: !item.isAvailable
      }, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      // We don't necessarily need a toast here for every toggle, but we can add one if desired
      // toast.success(`Item marked as ${!item.isAvailable ? 'Available' : 'Unavailable'}`);
      await fetchMenu();
    } catch (error: any) {
      toast.error('Failed to update availability');
    }
  };


  if (!auth.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        <span className="ml-4 text-slate-600">Loading user...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        <span className="ml-4 text-slate-600">Loading menu...</span>
      </div>
    );
  }

  const itemsByCategory = menu?.items.reduce((acc, item) => {
    if (!acc[item.categoryId]) acc[item.categoryId] = [];
    acc[item.categoryId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>) || {};


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-900">Menu Management</h1>
            <button
              onClick={() => {
                setActiveTab('items');
                openItemModal();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'items'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Items ({menu?.items.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'categories'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Categories ({categories.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <button
              onClick={() => openCategoryModal()}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <Plus size={18} />
              Add Category
            </button>

            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category._id} className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{category.name}</h3>
                      {category.icon && <p className="text-sm text-slate-500">Icon: {category.icon}</p>}
                      <p className="text-xs text-slate-400 mt-1">
                        Items: {itemsByCategory[category._id]?.length || 0}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openCategoryModal(category)}
                        className="p-2 hover:bg-slate-100 rounded transition-colors"
                        title="Edit category"
                      >
                        <Edit2 size={18} className="text-slate-600" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category._id)}
                        className="p-2 hover:bg-red-100 rounded transition-colors"
                        title="Delete category"
                        aria-label="Delete category"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div>
            {categories.map((category) => {
              const items = itemsByCategory[category._id] || [];
              if (items.length === 0) return null;

              return (
                <div key={category._id} className="mb-8">
                  <button
                    onClick={() =>
                      setExpandedCategory(expandedCategory === category._id ? null : category._id)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors mb-4"
                  >
                    <h2 className="text-lg font-semibold text-slate-900">{category.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm font-medium">
                        {items.length}
                      </span>
                      {expandedCategory === category._id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </button>

                  {expandedCategory === category._id && (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item._id}
                          className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex gap-4">
                            {/* Item Image */}
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-24 h-24 object-cover rounded"
                              />
                            )}

                            {/* Item Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                                </div>
                                <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
                              </div>

                              {/* Tags */}
                              {item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {item.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Allergens */}
                              {item.allergens.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {item.allergens.map((allergen) => (
                                    <span
                                      key={allergen}
                                      className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded"
                                    >
                                      Allergen: {allergen}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Stats */}
                              <p className="text-xs text-slate-500">
                                Orders: {item.ordersCount} | Status:{' '}
                                <span
                                  className={
                                    item.isAvailable
                                      ? 'text-green-600 font-semibold'
                                      : 'text-red-600 font-semibold'
                                  }
                                >
                                  {item.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => openItemModal(item)}
                                className="p-2 hover:bg-slate-100 rounded transition-colors"
                                title="Edit item"
                              >
                                <Edit2 size={18} className="text-slate-600" />
                              </button>
                              <button
                                onClick={() => toggleItemAvailability(item)}
                                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                  item.isAvailable
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                {item.isAvailable ? 'Available' : 'Unavailable'}
                              </button>
                              <button
                                onClick={() => deleteItem(item._id)}
                                className="p-2 hover:bg-red-100 rounded transition-colors"
                                title="Delete item"
                                aria-label="Delete item"
                              >
                                <Trash2 size={18} className="text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {(!menu?.items || menu.items.length === 0) && (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">No items yet</p>
                <p className="text-slate-500">Create a category first, then add items</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
                title="Close"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g., Pizza, Starters, Desserts"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Icon (optional)
                </label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  placeholder="e.g., 🍕, 🥗, 🍰"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCategoryModal}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingItem ? 'Edit Item' : 'Add Item'}
              </h2>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
                title="Close"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Category *
                  </label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-label="Category"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    placeholder="299"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g., Margherita Pizza"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Description
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Item description..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={itemForm.imageUrl}
                  onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={itemForm.tags}
                  onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value })}
                  placeholder="veg, spicy, gluten-free"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Allergens (comma-separated)
                </label>
                <input
                  type="text"
                  value={itemForm.allergens}
                  onChange={(e) => setItemForm({ ...itemForm, allergens: e.target.value })}
                  placeholder="peanuts, dairy, shellfish"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowItemModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveItemModal}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;