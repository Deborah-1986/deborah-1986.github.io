
import React, { useState, useEffect } from 'react';
import { InventarioItem, InventarioFormData, ProductoBase } from '../types.js';

interface InventarioFormProps {
  onSubmit: (data: InventarioFormData) => void;
  onClose: () => void;
  initialData: InventarioItem; // Expect full InventarioItem
  productosBase: ProductoBase[]; // To get product name
}

const InventarioForm: React.FC<InventarioFormProps> = ({ onSubmit, onClose, initialData, productosBase }) => {
  const [stockMinimo, setStockMinimo] = useState<number>(initialData.stock_minimo);

  useEffect(() => {
    setStockMinimo(initialData.stock_minimo);
  }, [initialData]);

  const getProductName = (producto_base_id: string): string => {
    const product = productosBase.find(p => p.id === producto_base_id);
    return product ? product.nombre_producto : "Producto Desconocido";
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (stockMinimo < 0) {
      alert("El stock mínimo no puede ser negativo.");
      return;
    }
    onSubmit({
      producto_base_id: initialData.producto_base_id,
      stock_minimo: stockMinimo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-slate-100">
          Editando Stock Mínimo para: <span className="font-semibold text-amber-600 dark:text-amber-400">{getProductName(initialData.producto_base_id)}</span>
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          El stock actual es <span className="font-medium">{initialData.entradas - initialData.salidas}</span>. Este formulario solo modifica el <span className="font-semibold">stock mínimo</span> para alertas.
        </p>
      </div>

      <div>
        <label htmlFor="stock_minimo" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Stock Mínimo <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="stock_minimo"
          name="stock_minimo"
          value={stockMinimo}
          onChange={(e) => setStockMinimo(parseFloat(e.target.value))}
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
          Actualizar Stock Mínimo
        </button>
      </div>
    </form>
  );
};

export default InventarioForm;