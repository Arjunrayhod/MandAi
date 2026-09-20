'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Product } from '@/lib/types';
import { getTranslation, t } from '@/lib/translations';
import { formatIndianCurrency } from '@/lib/gstUtils';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Wheat, 
  ArrowUpDown, 
  Trash2, 
  Check, 
  X,
  Edit2
} from 'lucide-react';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock, language } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockAdjustModal, setShowStockAdjustModal] = useState(false);
  const [selectedProd, setSelectedProd] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustBags, setAdjustBags] = useState<number>(0);

  // New Product Form
  const [formData, setFormData] = useState({
    name: '',
    hindiName: '',
    sku: '',
    hsnSac: '12119011',
    category: 'Herbal Seeds / Krishi Upaj',
    unit: 'Kg' as Product['unit'],
    purchasePrice: 0,
    sellingPrice: 0,
    gstRate: 5,
    currentStock: 1000,
    bagCount: 20,
    bagWeightKg: 50,
    minStockLevel: 200,
    qualityGrade: 'FAQ Machine Clean',
  });

  const filteredProducts = products.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hindiName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hsnSac.includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name: formData.name,
      hindiName: formData.hindiName,
      sku: formData.sku || 'SKU-' + Date.now().toString().slice(-4),
      hsnSac: formData.hsnSac,
      category: formData.category,
      unit: formData.unit,
      purchasePrice: Number(formData.purchasePrice || 0),
      sellingPrice: Number(formData.sellingPrice || 0),
      gstRate: Number(formData.gstRate || 0),
      currentStock: Number(formData.currentStock || 0),
      bagCount: Number(formData.bagCount || 0),
      bagWeightKg: Number(formData.bagWeightKg || 50),
      minStockLevel: Number(formData.minStockLevel || 0),
      qualityGrade: formData.qualityGrade,
    });
    setShowAddModal(false);
    setFormData({
      name: '',
      hindiName: '',
      sku: '',
      hsnSac: '12119011',
      category: 'Herbal Seeds / Krishi Upaj',
      unit: 'Kg',
      purchasePrice: 0,
      sellingPrice: 0,
      gstRate: 5,
      currentStock: 1000,
      bagCount: 20,
      bagWeightKg: 50,
      minStockLevel: 200,
      qualityGrade: 'FAQ Machine Clean',
    });
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProd) {
      adjustStock(selectedProd.id, Number(adjustQty), Number(adjustBags));
      setShowStockAdjustModal(false);
      setSelectedProd(null);
    }
  };

  const totalStockValuation = products.reduce(
    (sum, p) => sum + p.currentStock * p.purchasePrice,
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-600" />
            {t('inventory_title', language)}
          </h1>
          <p className="text-xs text-slate-500">
            {t('inventory_subtitle', language)}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('add_commodity', language)}
        </button>
      </div>

      {/* Stock Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">{t('card_total_commodities', language)}</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {products.length} <span className="text-xs font-medium text-slate-400">{language === 'hi' ? 'जिंस' : 'Items'}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'hi' ? 'मंडी यार्ड व गोडाउन में' : language === 'en' ? 'In yard & warehouse' : 'Mandi yard & godown me'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">{t('card_total_bags', language)}</span>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">
            {products.reduce((sum, p) => sum + (p.bagCount || 0), 0)} <span className="text-xs font-medium text-slate-400">{t('bags_count', language)}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'hi' ? 'कट्टा / बोरी स्टॉक' : language === 'en' ? 'Bags stock count' : 'Bori stock ginti'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">{t('card_stock_value', language)}</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {formatIndianCurrency(totalStockValuation)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'hi' ? 'खरीद भाव आधार पर' : language === 'en' ? 'Based on purchase rate' : 'Kharid bhaav aadhar par'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_placeholder', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-indigo-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">{t('col_item_name', language)}</th>
                <th className="py-3 px-4">{t('col_hsn', language)}</th>
                <th className="py-3 px-4">{language === 'hi' ? 'कैटेगरी' : language === 'en' ? 'Category' : 'Category'}</th>
                <th className="py-3 px-4 text-right">{t('col_avg_cost', language)}</th>
                <th className="py-3 px-4 text-right">{t('rate_price', language)}</th>
                <th className="py-3 px-4 text-center">{t('col_tax_rate', language)}</th>
                <th className="py-3 px-4 text-right">{t('col_bags_stock', language)}</th>
                <th className="py-3 px-4 text-right">{t('col_current_stock_qtl', language)}</th>
                <th className="py-3 px-4 text-right">{t('actions', language)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredProducts.map((prod) => {
                const isLow = prod.currentStock <= prod.minStockLevel;
                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                          🌾
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{prod.name}</p>
                          {prod.hindiName && (
                            <p className="text-[10px] text-slate-500 font-medium">{prod.hindiName}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 font-medium">
                      {prod.hsnSac}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {prod.category}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-600 dark:text-slate-400">
                      ₹{prod.purchasePrice.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-indigo-600">
                      ₹{prod.sellingPrice.toFixed(2)} /{prod.unit}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {prod.gstRate}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {prod.bagCount !== undefined ? `${prod.bagCount}` : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-black ${isLow ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                        {prod.currentStock.toLocaleString('en-IN')} {prod.unit}
                      </span>
                      {isLow && (
                        <span className="block text-[9px] text-rose-500 font-bold uppercase">
                          {t('low_stock_warning', language)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedProd(prod);
                            setAdjustQty(0);
                            setAdjustBags(0);
                            setShowStockAdjustModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-[11px] transition"
                        >
                          {t('stock_in_out', language)}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t('confirm_delete', language))) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('modal_add_commodity_title', language)}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('modal_comm_name_en', language)}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Musakadana"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('modal_comm_name_hi', language)}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. मुसकादाना (कस्तूरी दाना)"
                    value={formData.hindiName}
                    onChange={(e) => setFormData({ ...formData, hindiName: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('modal_hsn_code', language)}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hsnSac}
                    onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                    className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('unit', language)}
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-2 py-2"
                  >
                    <option value="Kg">{language === 'hi' ? 'Kg (किलो)' : language === 'en' ? 'Kg' : 'Kg (Kilo)'}</option>
                    <option value="Quintal">{language === 'hi' ? 'Quintal (क्विंटल)' : language === 'en' ? 'Quintal' : 'Quintal'}</option>
                    <option value="Bags / Bori">{language === 'hi' ? 'Bags (बोरी)' : language === 'en' ? 'Bags' : 'Bori (Bags)'}</option>
                    <option value="Metric Ton">{language === 'hi' ? 'Metric Ton (टन)' : language === 'en' ? 'Metric Ton' : 'Metric Ton'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('gst_rate', language)}
                  </label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-2 py-2"
                  >
                    <option value={0}>0% (Tax Exempt)</option>
                    <option value={5}>5% (2.5% + 2.5%)</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('modal_purchase_rate', language)}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('modal_selling_rate', language)}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('modal_initial_stock', language)}
                  </label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('modal_bag_count', language)}
                  </label>
                  <input
                    type="number"
                    value={formData.bagCount}
                    onChange={(e) => setFormData({ ...formData, bagCount: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('modal_min_alert', language)}
                  </label>
                  <input
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                >
                  {t('modal_save_commodity', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockAdjustModal && selectedProd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t('modal_stock_in_out_title', language)}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedProd.name} • {t('modal_current_stock_label', language)} {selectedProd.currentStock} {selectedProd.unit} ({selectedProd.bagCount || 0} {language === 'hi' ? 'बोरी' : language === 'en' ? 'Bags' : 'Bori'})
            </p>

            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('modal_weight_change_label', language)}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder={language === 'hi' ? '+500 या -200' : language === 'en' ? '+500 or -200' : '+500 ya -200'}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full text-base font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('modal_bags_change_label', language)}
                </label>
                <input
                  type="number"
                  placeholder={language === 'hi' ? '+10 या -4' : language === 'en' ? '+10 or -4' : '+10 ya -4'}
                  value={adjustBags}
                  onChange={(e) => setAdjustBags(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowStockAdjustModal(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                >
                  {t('modal_update_stock_btn', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
