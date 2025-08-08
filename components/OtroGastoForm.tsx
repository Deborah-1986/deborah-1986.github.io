import React, { useState, useEffect } from 'react';
import { OtroGasto, OtroGastoFormData, Configuracion, ALL_CATEGORIAS_GASTO } from '../types.js';

interface OtroGastoFormProps {
  onSubmit: (data: OtroGastoFormData | OtroGasto) => void;
  onClose: () => void;
  initialData?: OtroGasto;
  configuracion: Configuracion;
}

const OtroGastoForm: React.FC<OtroGastoFormProps> = ({ onSubmit, onClose, initialData, configuracion }) => {
  
  const getInitialDateString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  
  const getDefaultFormState = (): OtroGastoFormData => ({
    fecha: getInitialDateString(),
    descripcion: '',
    categoria: ALL_CATEGORIAS_GASTO[0] || '',
    importe: 0,
    notas: '',
  });

  const [formData, setFormData] = useState<OtroGastoFormData | OtroGasto>(
    initialData ? { ...initialData, fecha: new Date(initialData.fecha).toISOString().slice(0,16) } : getDefaultFormState()
  );

  useEffect(() => {
    if (initialData) {
      const initialDate = new Date(initialData.fecha);
      if (initialData.fecha.length === 10) {
          initialDate.setUTCHours(0,0,0,0);
      }
      const localDate = new Date(initialDate.getTime() - (initialDate.getTimezoneOffset() * 60000));
      setFormData({...initialData, fecha: localDate.toISOString().slice(0,16)});
    } else {
      setFormData(getDefaultFormState());
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.fecha) {
      alert("La fecha es obligatoria.");
      return;
    }
    const submissionData = { ...formData };

    const inputDate = new Date(submissionData.fecha);
    const today = new Date();
    if (inputDate > today) {
        alert("No se puede registrar un gasto con fecha futura. Verifica la fecha ingresada.");
        return;
    }
    if (!formData.descripcion.trim()) {
      alert("La descripción es obligatoria.");
      return;
    }
    if (!formData.categoria.trim()) {
      alert("La categoría es obligatoria.");
      return;
    }
    if (formData.importe <= 0 || isNaN(formData.importe)) {
      alert("El importe debe ser un número positivo.");
      return;
    }
    onSubmit(submissionData);
  };
  
  const formatCurrencyPlaceholder = () => `0.00 ${configuracion.simbolo_moneda}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Fecha y Hora <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          id="fecha"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          max={getInitialDateString()}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          required
        />
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          required
          placeholder="Ej: Pago de factura eléctrica"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            required
          >
            <option value="" disabled>Seleccione una categoría...</option>
            {ALL_CATEGORIAS_GASTO.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="importe" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Importe <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="importe"
            name="importe"
            value={formData.importe === 0 && !initialData ? '' : formData.importe}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            required
            min="0.01"
            step="any"
            placeholder={formatCurrencyPlaceholder()}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Notas (Opcional)
        </label>
        <textarea
          id="notas"
          name="notas"
          value={formData.notas || ''}
          onChange={handleChange}
          rows={2}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          placeholder="Detalles adicionales sobre el gasto..."
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
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          {initialData ? 'Actualizar Gasto' : 'Registrar Gasto'}
        </button>
      </div>
    </form>
  );
};

export default OtroGastoForm;