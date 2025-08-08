// components/UnidadMedidaForm.tsx
import React, { useState, useEffect } from 'react';
import { UnidadMedida, UnidadMedidaFormData } from '../types.js';

interface UnidadMedidaFormProps {
  onSubmit: (data: UnidadMedidaFormData | UnidadMedida) => void;
  onClose: () => void;
  initialData?: UnidadMedida;
}

const UnidadMedidaForm: React.FC<UnidadMedidaFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState<UnidadMedidaFormData | UnidadMedida>(
    initialData || {
      unidad_nombre: '',
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ unidad_nombre: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.unidad_nombre.trim()) {
      alert("El nombre de la unidad no puede estar vacío.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="unidad_nombre" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Nombre de la Unidad <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="unidad_nombre"
          name="unidad_nombre"
          value={formData.unidad_nombre}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          required
          autoFocus
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Ejemplos: ml, g, Unidad, Ración, Caja, Pesos</p>
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
        >
          {initialData ? 'Actualizar Unidad' : 'Crear Unidad'}
        </button>
      </div>
    </form>
  );
};

export default UnidadMedidaForm;