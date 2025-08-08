
import React, { useState, useEffect } from 'react';
import { ProductoBase, ProductoBaseFormData, UnidadMedida } from '../types.js';

interface ProductoBaseFormProps {
  onSubmit: (data: ProductoBaseFormData | ProductoBase) => void;
  onClose: () => void;
  initialData?: ProductoBase;
  ums: UnidadMedida[]; // For populating the UM dropdown
}

const ProductoBaseForm: React.FC<ProductoBaseFormProps> = ({ onSubmit, onClose, initialData, ums }) => {
  const [formData, setFormData] = useState<ProductoBaseFormData | ProductoBase>(
    initialData || {
      nombre_producto: '',
      um_predeterminada: '', // Default to empty or first UM if available
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ 
        nombre_producto: '', 
        um_predeterminada: ums.length > 0 ? ums[0].id : '' // Pre-select first UM or empty
      });
    }
  }, [initialData, ums]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.nombre_producto.trim()) {
      alert("El nombre del producto no puede estar vacío.");
      return;
    }
    if (!formData.um_predeterminada) {
      alert("Debe seleccionar una unidad de medida predeterminada.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="nombre_producto" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Nombre del Producto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nombre_producto"
          name="nombre_producto"
          value={formData.nombre_producto}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          required
          autoFocus
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Ejemplos: Aceite, Arroz, Tomate Fresco</p>
      </div>

      <div>
        <label htmlFor="um_predeterminada" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Unidad de Medida Predeterminada <span className="text-red-500">*</span>
        </label>
        <select
          id="um_predeterminada"
          name="um_predeterminada"
          value={formData.um_predeterminada}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          required
        >
          <option value="" disabled>Seleccione una unidad...</option>
          {ums.map(um => (
            <option key={um.id} value={um.id}>
              {um.unidad_nombre}
            </option>
          ))}
        </select>
        {ums.length === 0 && (
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">No hay unidades de medida definidas. Por favor, agregue unidades primero.</p>
        )}
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
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          disabled={ums.length === 0 && !initialData} // Disable create if no UMs and not editing
        >
          {initialData ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
};

export default ProductoBaseForm;