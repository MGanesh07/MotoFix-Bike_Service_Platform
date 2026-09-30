import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PackageSearch, AlertCircle, Plus } from 'lucide-react';

export default function MechanicInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    brand: '',
    productName: '',
    category: 'General',
    quantity: 0,
    unitPrice: 0,
    image: ''
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory');
      setInventory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.brand || !newItem.productName || newItem.quantity < 0 || newItem.unitPrice < 0) {
      alert('Please fill in all required fields correctly. Stock and Price cannot be negative.');
      return;
    }

    setAdding(true);
    try {
      // Backend schema uses name and partNumber. We'll generate a random partNumber if not provided,
      // and combine brand + productName for the name.
      const name = `${newItem.brand} ${newItem.productName}`;
      const partNumber = `PART-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

      await api.post('/inventory', {
        name,
        partNumber,
        category: newItem.category,
        quantity: Number(newItem.quantity),
        unitPrice: Number(newItem.unitPrice),
        image: newItem.image
      });

      alert('Inventory item added successfully!');
      setShowAddModal(false);
      setNewItem({ brand: '', productName: '', category: 'General', quantity: 0, unitPrice: 0, image: '' });
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <PackageSearch className="text-red-600" /> Inventory Management
        </h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-700"
        >
          <Plus className="w-4 h-4"/> Add Inventory Item
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {inventory.map(item => {
          const isLowStock = item.quantity <= item.minQuantity;
          return (
            <div key={item._id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col ${isLowStock ? 'border-amber-300 ring-1 ring-amber-300' : 'border-slate-200'}`}>
              <div className="h-32 bg-slate-100 flex items-center justify-center p-4 border-b border-slate-100">
                {/* Visual Placeholder for Image */}
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-200 text-slate-400">
                  <PackageSearch className="w-8 h-8" />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">{item.category}</span>
                <h3 className="font-bold text-slate-800 line-clamp-1" title={item.name}>{item.name}</h3>
                <p className="text-xs font-mono text-slate-500 mt-1">{item.partNumber}</p>
                
                <div className="mt-auto pt-4 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500">Current Stock</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-lg font-bold ${isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>{item.quantity}</span>
                      {isLowStock && <AlertCircle className="w-4 h-4 text-amber-500" title="Low Stock" />}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Price</p>
                    <p className="text-sm font-bold text-slate-900">₹{item.unitPrice}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl my-8">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Add Inventory Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Motul"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-red-500 focus:border-red-500"
                    value={newItem.brand}
                    onChange={e => setNewItem({...newItem, brand: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product / Part Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 7100 10W-40"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-red-500 focus:border-red-500"
                    value={newItem.productName}
                    onChange={e => setNewItem({...newItem, productName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-red-500 focus:border-red-500"
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                >
                  <option value="Engine">Engine</option>
                  <option value="Brakes">Brakes</option>
                  <option value="Oil & Fluids">Oil & Fluids</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Tyres">Tyres</option>
                  <option value="Transmission/Chain">Transmission/Chain</option>
                  <option value="Body/General">Body/General</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Stock *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-red-500 focus:border-red-500"
                    value={newItem.quantity}
                    onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-red-500 focus:border-red-500"
                    value={newItem.unitPrice}
                    onChange={e => setNewItem({...newItem, unitPrice: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (Optional)</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-red-500 focus:border-red-500"
                  value={newItem.image}
                  onChange={e => setNewItem({...newItem, image: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)} 
                  className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={adding}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
