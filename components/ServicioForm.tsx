
import React, { useState, useEffect } from 'react';
import { RestauranteServicio, RestauranteServicioFormData } from '../types.js';

interface ServicioFormProps {
  onSubmit: (data: RestauranteServicioFormData | RestauranteServicio) => void;
  onClose: () => void;
  initialData?: RestauranteServicio;
}

const ServicioForm: React.FC<ServicioFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState<RestauranteServicioFormData | RestauranteServicio>(
    initialData || {
      nombre_servicio: '',
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ nombre_servicio: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.nombre_servicio.trim()) {
      alert("El nombre del servicio/canal no puede estar vacío.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="nombre_servicio" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Nombre del Servicio/Canal <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nombre_servicio"
          name="nombre_servicio"
          value={formData.nombre_servicio}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          required
          autoFocus
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Ej: Restaurante, Mandado, Bar, Promoción Especial</p>
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
          {initialData ? 'Actualizar Servicio' : 'Crear Servicio'}
        </button>
      </div>
    </form>
  );
};

export default ServicioForm;