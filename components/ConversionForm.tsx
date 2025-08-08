// components/ConversionForm.tsx
import React, { useState, useEffect } from 'react';
import { ConversionUnidad, ConversionUnidadFormData, UnidadMedida, ProductoBase } from '../types.js';

interface ConversionFormProps {
  onSubmit: (data: ConversionUnidadFormData | ConversionUnidad) => void;
  onClose: () => void;
  initialData?: ConversionUnidad;
  ums: UnidadMedida[];
  productosBase: ProductoBase[];
}

const ConversionForm: React.FC<ConversionFormProps> = ({ onSubmit, onClose, initialData, ums, productosBase }) => {
  const [formData, setFormData] = useState<ConversionUnidadFormData | ConversionUnidad>(
    initialData || {
      unidad_origen_id: '',
      unidad_destino_id: '',
      factor: 1,
      producto_base_id: undefined,
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        unidad_origen_id: '',
        unidad_destino_id: '',
        factor: 1,
        producto_base_id: undefined,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'factor' ? parseFloat(value) : (value === '' ? undefined : value)
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.unidad_origen_id || !formData.unidad_destino_id) {
      alert("Debe seleccionar una unidad de origen y una de destino.");
      return;
    }
    if (formData.unidad_origen_id === formData.unidad_destino_id) {
      alert("Las unidades de origen y destino no pueden ser las mismas.");
      return;
    }
    if (isNaN(formData.factor) || formData.factor <= 0) {
      alert("El factor de conversión debe ser un número positivo.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="unidad_origen_id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Unidad de Origen <span className="text-red-500">*</span>
          </label>
          <select id="unidad_origen_id" name="unidad_origen_id" value={formData.unidad_origen_id} onChange={handleChange} required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500">
            <option value="">Seleccione...</option>
            {ums.map(um => <option key={um.id} value={um.id}>{um.unidad_nombre}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="unidad_destino_id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Unidad de Destino <span className="text-red-500">*</span>
          </label>
          <select id="unidad_destino_id" name="unidad_destino_id" value={formData.unidad_destino_id} onChange={handleChange} required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500">
            <option value="">Seleccione...</option>
            {ums.map(um => <option key={um.id} value={um.id}>{um.unidad_nombre}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="factor" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Factor de Conversión <span className="text-red-500">*</span>
        </label>
        <input type="number" id="factor" name="factor" value={formData.factor} onChange={handleChange} required min="0.000001" step="any"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Ej: 1 Kg a g, el factor es 1000. (1 Origen = X Destinos)</p>
      </div>

      <div>
        <label htmlFor="producto_base_id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Producto Específico (Opcional)
        </label>
        <select id="producto_base_id" name="producto_base_id" value={formData.producto_base_id || ''} onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500">
          <option value="">Para cualquier producto (Genérica)</option>
          {productosBase.map(p => <option key={p.id} value={p.id}>{p.nombre_producto}</option>)}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Asocie esta regla a un producto si la conversión es única para él (Ej: 1 Caja de Tomates).</p>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:text-slate-200 dark:bg-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500">
          Cancelar
        </button>
        <button type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
          {initialData ? 'Actualizar' : 'Crear'} Conversión
        </button>
      </div>
    </form>
  );
};

export default ConversionForm;