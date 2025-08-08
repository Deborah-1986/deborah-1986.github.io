// components/InventarioEditForm.tsx
import React, { useState, useEffect } from 'react';
import { InventarioItem, InventarioEditFormData, ProductoBase } from '../types.js';

interface InventarioEditFormProps {
  onSubmit: (data: InventarioEditFormData) => void;
  onClose: () => void;
  initialData: InventarioItem;
  productosBase: ProductoBase[];
}

const InventarioEditForm: React.FC<InventarioEditFormProps> = ({ onSubmit, onClose, initialData, productosBase }) => {
  const [formData, setFormData] = useState<InventarioEditFormData>({
    producto_base_id: initialData.producto_base_id,
    entradas: initialData.entradas,
    stock_minimo: initialData.stock_minimo,
    precio_promedio_ponderado: initialData.precio_promedio_ponderado,
  });

  useEffect(() => {
    setFormData({
      producto_base_id: initialData.producto_base_id,
      entradas: initialData.entradas,
      stock_minimo: initialData.stock_minimo,
      precio_promedio_ponderado: initialData.precio_promedio_ponderado,
    });
  }, [initialData]);

  const getProductName = (producto_base_id: string): string => {
    const product = productosBase.find(p => p.id === producto_base_id);
    return product ? product.nombre_producto : "Producto Desconocido";
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.entradas < 0 || formData.stock_minimo < 0 || formData.precio_promedio_ponderado < 0) {
      alert("Los valores no pueden ser negativos.");
      return;
    }
    onSubmit(formData as InventarioEditFormData);
  };
  
  const stockActual = formData.entradas - initialData.salidas;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-slate-100">
          Editando Inventario para: <span className="font-semibold text-amber-600 dark:text-amber-400">{getProductName(initialData.producto_base_id)}</span>
        </h3>
         <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
          Atención: Está modificando directamente los valores acumulados de inventario. Use esta función con cuidado para corregir errores.
        </p>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Total Salidas (no editable): <span className="font-semibold">{initialData.salidas.toFixed(2)}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Stock Actual Calculado: <span className="font-semibold">{stockActual.toFixed(2)}</span>
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="entradas" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Total Entradas <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="entradas"
            name="entradas"
            value={formData.entradas}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            required
            min="0"
            step="any"
          />
        </div>
        <div>
          <label htmlFor="stock_minimo" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Stock Mínimo <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="stock_minimo"
            name="stock_minimo"
            value={formData.stock_minimo}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            required
            min="0"
            step="any"
          />
        </div>
      </div>

       <div>
          <label htmlFor="precio_promedio_ponderado" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Precio Unitario (Costo Promedio Ponderado) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="precio_promedio_ponderado"
            name="precio_promedio_ponderado"
            value={formData.precio_promedio_ponderado}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            required
            min="0"
            step="any"
          />
        </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:text-slate-200 dark:bg-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
        >
          Actualizar Inventario
        </button>
      </div>
    </form>
  );
};
export default InventarioEditForm;