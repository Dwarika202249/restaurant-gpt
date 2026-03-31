import { useEffect, useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { useTabTitle } from '@/hooks';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { useAPIError } from '@/hooks/useAPIError';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Utensils, 
  Tag, 
  AlertCircle, 
  Layers, 
  Settings2,
  Trash,
  Check,
  Package,
  Image as ImageIcon,
  Search,
  Settings, 
  HelpCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
 * MenuPage
 * High-performance management interface for Restaurant Menus.
 */
export const MenuPage = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch(); 
  const { getErrorMessage } = useAPIError();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // State
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('items');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useTabTitle('Menu Studio');

  // Category management
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' });

  // Item management
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [itemForm, setItemForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    tags: '',
    allergens: ''
  });

  // Deletion confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'category' | 'item' } | null>(null);

  // Rehydrate user
  useEffect(() => {
    if (!auth.user && auth.accessToken) {
      dispatch(fetchAdminUser());
    }
  }, [auth.user, auth.accessToken, dispatch]);

  // Fetch data
  useEffect(() => {
    if (auth.user?.restaurantId && auth.accessToken) {
      fetchMenu();
      fetchCategories();
    }
  }, [auth.user?.restaurantId, auth.accessToken]);

  const fetchMenu = async () => {
    if (!auth.user?.restaurantId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/menu/${auth.user.restaurantId}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      if (response.data.data) setMenu(response.data.data);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/menu/category`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      if (response.data?.data) setCategories(response.data.data);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  // CATEGORY OPS
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
        await axios.put(`${API_URL}/menu/category/${editingCategory._id}`, categoryForm, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        toast.success('Category updated');
      } else {
        await axios.post(`${API_URL}/menu/category`, categoryForm, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        toast.success('Category created');
      }
      setShowCategoryModal(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to save category');
    }
  };

  const deleteCategory = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    if (category) {
      setDeleteTarget({ id: categoryId, name: category.name, type: 'category' });
      setShowDeleteModal(true);
    }
  };

  const deleteItem = (itemId: string) => {
    const item = menu?.items.find(i => i._id === itemId);
    if (item) {
      setDeleteTarget({ id: itemId, name: item.name, type: 'item' });
      setShowDeleteModal(true);
    }
  };

  const handleFinalDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'category') {
        await axios.delete(`${API_URL}/menu/category/${deleteTarget.id}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        toast.success(<span>Category deleted. Items moved to <b>Others</b></span>);
        fetchCategories();
        fetchMenu();
      } else {
        await axios.delete(`${API_URL}/menu/item/${deleteTarget.id}?restaurantId=${auth.user?.restaurantId}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        toast.success('Item removed');
        fetchMenu();
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(getErrorMessage(error) || `Failed to delete ${deleteTarget.type}`);
    }
  };

  // ITEM OPS
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

  const handleMagicWrite = async () => {
    if (!itemForm.name) return;
    
    setAiLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const category = categories.find(c => c._id === itemForm.categoryId)?.name;
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/describe-item`,
        { 
          name: itemForm.name, 
          description: itemForm.description,
          category,
          tags: itemForm.tags.split(',').map((t: string) => t.trim()) 
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setItemForm({ ...itemForm, description: response.data.data });
    } catch (error) {
      console.error('Magic write failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const saveItemModal = async () => {
    if (!itemForm.categoryId || !itemForm.name.trim() || !itemForm.price) {
      toast.error('Required fields missing');
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
        await axios.put(`${API_URL}/menu/item/${editingItem._id}`, payload, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        toast.success('Item updated');
      } else {
        await axios.post(`${API_URL}/menu/item`, payload, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        toast.success('Item created');
      }
      setShowItemModal(false);
      fetchMenu();
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to save item');
    }
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    try {
      await axios.patch(`${API_URL}/menu/item/${item._id}/availability`, { isAvailable: !item.isAvailable }, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      fetchMenu();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };


  const filteredMenuData = useMemo(() => {
    return menu?.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];
  }, [menu, searchTerm]);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const itemsByCategory = useMemo(() => {
    return (searchTerm ? filteredMenuData : (menu?.items || [])).reduce((acc, item) => {
      if (!acc[item.categoryId]) acc[item.categoryId] = [];
      acc[item.categoryId].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menu, filteredMenuData, searchTerm]);

  if (!auth.user || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto scrollbar-hide">
      {/* Header section with Tabs and Search */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-brand-500 font-bold text-sm tracking-widest uppercase mb-2">
            <span className="w-8 h-[2px] bg-brand-500" />
            <span>Inventory</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Menu Studio</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Design and manage your digital dining experience.</p>
          
          <div className="flex items-center space-x-1 mt-8 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl w-fit">
            <button 
              onClick={() => { setActiveTab('items'); setSearchTerm(''); }}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'items' ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Menu Items
            </button>
            <button 
              onClick={() => { setActiveTab('categories'); setSearchTerm(''); }}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'categories' ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Categories
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white w-full lg:w-64"
            />
          </div>
          <button 
            onClick={() => activeTab === 'items' ? openItemModal() : openCategoryModal()}
            className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-500/20 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Add {activeTab === 'items' ? 'Item' : 'Category'}</span>
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'categories' ? (
          <motion.div
            key="categories-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={filteredCategories.length > 0 ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "w-full"}
          >
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <motion.div 
                  key={category._id}
                  whileHover={{ y: -4 }}
                  className="glass dark:glass-dark p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-2xl">
                      {category.icon || '🍴'}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openCategoryModal(category)} 
                        title="Edit Category"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Edit2 size={16} className="text-slate-400" />
                      </button>
                      <button 
                        onClick={() => deleteCategory(category._id)} 
                        title="Delete Category"
                        className="p-2 hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <Trash size={16} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{category.name}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Package size={12} className="text-brand-500" />
                      {itemsByCategory[category._id]?.length || 0} Registered Items
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] bg-slate-50/30 dark:bg-slate-900/10">
                <Layers size={48} className="text-slate-300 mb-4 opacity-50" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">No categories found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-8">Organize your menu by adding your first category.</p>
                <button 
                  onClick={() => openCategoryModal()}
                  className="px-8 py-3.5 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Create Category
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="items-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            {filteredMenuData.length > 0 ? (
              categories.map((category) => {
                const items = itemsByCategory[category._id] || [];
                if (items.length === 0) return null;

                return (
                  <div key={category._id}>
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{category.name}</h2>
                      <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
                      <span className="px-3 py-1 bg-brand-500/10 text-brand-500 text-[10px] font-black rounded-full uppercase tracking-widest">{items.length} Items</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {items.map((item) => (
                        <motion.div
                          key={item._id}
                          whileHover={{ y: -2 }}
                          className="glass dark:glass-dark p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex gap-6"
                        >
                          <div className="relative w-32 h-32 rounded-3xl bg-slate-50 dark:bg-slate-900 overflow-hidden flex-shrink-0 group">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-800">
                                <Utensils size={40} />
                              </div>
                            )}
                            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${item.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                              <div className="flex items-start justify-between mb-1">
                                <h3 className="font-black text-slate-900 dark:text-white truncate pr-2 uppercase tracking-tight">{item.name}</h3>
                                <span className="text-brand-500 font-black tracking-tight">₹{item.price}</span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">{item.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {item.tags.map(t => (
                                  <span key={t} className="px-2 py-0.5 bg-brand-500/5 text-brand-500 text-[9px] font-bold uppercase rounded-lg border border-brand-500/10">#{t}</span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                               <div className="flex gap-1">
                                 <button 
                                   onClick={() => openItemModal(item)} 
                                   title="Edit Item"
                                   className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                 >
                                   <Edit2 size={16} className="text-slate-400" />
                                 </button>
                                 <button 
                                   onClick={() => toggleItemAvailability(item)} 
                                   title={item.isAvailable ? "Set Unavailable" : "Set Available"}
                                   className={`p-2 rounded-xl transition-colors ${item.isAvailable ? 'hover:bg-rose-500/10 text-emerald-500' : 'hover:bg-emerald-500/10 text-rose-500'}`}
                                 >
                                   <AlertCircle size={16} />
                                 </button>
                                 <button 
                                   onClick={() => deleteItem(item._id)} 
                                   title="Delete Item"
                                   className="p-2 hover:bg-rose-500/10 rounded-xl transition-colors"
                                 >
                                   <Trash2 size={16} className="text-rose-400" />
                                 </button>
                               </div>
                               <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{item.ordersCount} Orders</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] bg-slate-50/30 dark:bg-slate-900/10">
                <Utensils size={48} className="text-slate-300 mb-4 opacity-50" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{searchTerm ? 'No items match your search' : 'Your menu is empty'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-8">{searchTerm ? 'Try adjusting your filters or search term.' : 'Begin your journey by adding your first signature dish.'}</p>
                <button 
                  onClick={() => openItemModal()}
                  className="px-8 py-3.5 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {searchTerm ? 'Show All Items' : 'Add Menu Item'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Modal */}
      <AnimatePresence>
        {showItemModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowItemModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{editingItem ? 'Edit Item' : 'New Dish Entry'}</h2>
                <button 
                  onClick={() => setShowItemModal(false)} 
                  title="Close Modal"
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"
                >
                  <X />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catalogue Category *</label>
                    <select
                      value={itemForm.categoryId}
                      title="Select Category"
                      onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none dark:text-white appearance-none"
                    >
                      {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Market Price (₹) *</label>
                    <input
                      type="number"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none dark:text-white"
                      placeholder="Pricing value"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dish Name *</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none dark:text-white"
                    placeholder="e.g. Signature Truffle Pizza"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience Description</label>
                    <button 
                      type="button"
                      onClick={handleMagicWrite}
                      disabled={aiLoading || !itemForm.name}
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-600 disabled:opacity-30 transition-all group"
                    >
                      {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />}
                      {aiLoading ? 'Brewing Magic...' : 'Magic Write'}
                    </button>
                  </div>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none dark:text-white"
                    placeholder="Whet their appetites..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={itemForm.imageUrl}
                      onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                      className="w-full pl-14 pr-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none dark:text-white"
                      placeholder="https://cloud.storage/dish.png"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Metadata Tags</label>
                    <div className="relative">
                      <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        value={itemForm.tags}
                        onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value })}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none dark:text-white"
                        placeholder="spicy, vegan"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Allergens</label>
                    <div className="relative">
                      <Settings2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        value={itemForm.allergens}
                        onChange={(e) => setItemForm({ ...itemForm, allergens: e.target.value })}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none dark:text-white"
                        placeholder="nuts, dairy"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                <button onClick={saveItemModal} className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all">Save Asset</button>
                <button onClick={() => setShowItemModal(false)} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs">Discard</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Modal (Simplified for design consistency) */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{editingCategory ? 'Edit Node' : 'New Category'}</h2>
                <button 
                  onClick={() => setShowCategoryModal(false)} 
                  title="Close Modal"
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400"
                >
                  <X />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Module Name *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none dark:text-white"
                    placeholder="e.g. Starters"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Icon Multiplier</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none dark:text-white"
                    placeholder="e.g. 🥗"
                  />
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                <button onClick={saveCategoryModal} className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20 hover:scale-[1.02] transition-all">Persist</button>
                <button onClick={() => setShowCategoryModal(false)} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deleteTarget && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={36} className="text-rose-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Delete {deleteTarget.type === 'category' ? 'Category' : 'Menu Item'}?</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Are you sure you want to delete <span className="text-slate-900 dark:text-white font-black italic">"{deleteTarget.name}"</span>? 
                  {deleteTarget.type === 'category' && (
                    <span className="block mt-2 text-brand-500 text-xs font-black uppercase tracking-widest bg-brand-500/5 py-2 rounded-xl">
                      Items will be moved to "Others" category
                    </span>
                  )}
                </p>
              </div>

              <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                <button 
                  onClick={handleFinalDelete}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuPage;