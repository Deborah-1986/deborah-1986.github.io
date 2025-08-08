// components/CartaTecnologicaForm.tsx

import React, { useState, useEffect } from 'react';
import { 
  CartaTecnologica, Plato, ProductoBase, UnidadMedida, 
  IngredienteReceta, CartaTecnologicaFormState 
} from '../types.js';
import * as DataManager from '../DataManager.js'; // For generateId
import { AddIcon, DeleteIcon } from '../constants.js';

interface CartaTecnologicaFormProps {
  onSubmit: (data: CartaTecnologica) => void;
  onClose: () => void;
  initialData?: CartaTecnologica;
  platos: Plato[];
  productosBase: ProductoBase[];
  ums: UnidadMedida[];
  existingCartaPlatoIds: string[]; // Plato IDs that already have a recipe
}

const CartaTecnologicaForm: React.FC<CartaTecnologicaFormProps> = ({ 
  onSubmit, onClose, initialData, platos, productosBase, ums, existingCartaPlatoIds
}) => {
  
  const getInitialFormState = (): CartaTecnologicaFormState => {
    if (initialData) {
      return {
        ...initialData,
        otros_gastos: initialData.otros_gastos ?? 0,
        combustible: initialData.combustible ?? 0,
        salario: initialData.salario ?? 0,
        notas_preparacion: initialData.notas_preparacion || '',
        ingredientes_receta: initialData.ingredientes_receta.map(ing => ({ ...ing, temp_id: DataManager.generateId() })),
      };
    }
    // Find the first available plato that doesn't have a recipe
    const firstAvailablePlato = platos.find(p => !existingCartaPlatoIds.includes(p.id));
    return {
      plato_id: firstAvailablePlato?.id || '',
      ingredientes_receta: [{
        temp_id: DataManager.generateId(),
        producto_base_id: '',
        cantidad: 1,
        unidad_medida_id: ''
      }],
      otros_gastos: 0,
      combustible: 0,
      salario: 0,
      notas_preparacion: '',
    };
  };

  const [formData, setFormData] = useState<CartaTecnologicaFormState>(getInitialFormState());

  useEffect(() => {
    setFormData(getInitialFormState());
  }, [initialData, platos, existingCartaPlatoIds]);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => { // Added HTMLTextAreaElement
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type; // Keep this for number inputs
    
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value 
    }));
  };

  const handleIngredientChange = (temp_id: string, field: keyof Omit<IngredienteReceta, 'id'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      ingredientes_receta: prev.ingredientes_receta.map(ing => 
        ing.temp_id === temp_id ? { ...ing, [field]: field === 'cantidad' ? parseFloat(value as string) : value } : ing
      )
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredientes_receta: [
        ...prev.ingredientes_receta,
        {
          temp_id: DataManager.generateId(),
          producto_base_id: '',
          cantidad: 1,
          unidad_medida_id: ''
        }
      ]
    }));
  };

  const removeIngredient = (temp_id_to_remove: string) => {
    setFormData(prev => ({
      ...prev,
      ingredientes_receta: prev.ingredientes_receta.filter(ing => ing.temp_id !== temp_id_to_remove)
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.plato_id) {
      alert("Debe seleccionar un plato.");
      return;
    }
    if (formData.ingredientes_receta.length === 0) {
      alert("La receta debe tener al menos un ingrediente.");
      return;
    }
    for (const ing of formData.ingredientes_receta) {
      if (!ing.producto_base_id || !ing.unidad_medida_id || ing.cantidad <= 0) {
        alert("Todos los ingredientes deben tener producto, unidad de medida y cantidad válida (>0).");
        return;
      }
    }

    const submissionData: CartaTecnologica = {
      id: formData.id || DataManager.generateId(), // generateId only if new
      plato_id: formData.plato_id,
      ingredientes_receta: formData.ingredientes_receta.map(ing => ({
        id: ing.id || DataManager.generateId(), // generateId only if new ingredient
        producto_base_id: ing.producto_base_id,
        cantidad: Number(ing.cantidad),
        unidad_medida_id: ing.unidad_medida_id,
      })),
      otros_gastos: Number(formData.otros_gastos) || 0,
      combustible: Number(formData.combustible) || 0,
      salario: Number(formData.salario) || 0,
      notas_preparacion: formData.notas_preparacion?.trim() || undefined,
    };
    onSubmit(submissionData);
  };

  const availablePlatos = initialData 
    ? platos.filter(p => p.id === initialData.plato_id || !existingCartaPlatoIds.includes(p.id))
    : platos.filter(p => !existingCartaPlatoIds.includes(p.id));


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="plato_id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Plato <span className="text-red-500">*</span>
        </label>
        <select
          id="plato_id"
          name="plato_id"
          value={formData.plato_id}
          onChange={handleGeneralChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          required
          disabled={!!initialData} // Disable if editing, plato cannot be changed
        >
          <option value="" disabled>Seleccione un plato...</option>
          {availablePlatos.map(plato => (
            <option key={plato.id} value={plato.id}>
              {plato.nombre_plato}
            </option>
          ))}
        </select>
        {availablePlatos.length === 0 && !initialData && (
             <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Todos los platos ya tienen una receta. Edite una existente o cree nuevos platos.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="otros_gastos" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Otros Gastos
          </label>
          <input
            type="number"
            id="otros_gastos"
            name="otros_gastos"
            value={formData.otros_gastos ?? ''}
            onChange={handleGeneralChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            min="0"
            step="any"
            placeholder="0.00"
          />
        </div>
        <div>
          <label htmlFor="combustible" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Combustible
          </label>
          <input
            type="number"
            id="combustible"
            name="combustible"
            value={formData.combustible ?? ''}
            onChange={handleGeneralChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            min="0"
            step="any"
            placeholder="0.00"
          />
        </div>
        <div>
          <label htmlFor="salario" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Salario
          </label>
          <input
            type="number"
            id="salario"
            name="salario"
            value={formData.salario ?? ''}
            onChange={handleGeneralChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            min="0"
            step="any"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700 dark:text-slate-300">Ingredientes</h3>
        {formData.ingredientes_receta.map((ing, index) => (
          <div key={ing.temp_id || ing.id} className="p-3 border border-gray-200 dark:border-slate-700 rounded-md space-y-3 bg-gray-50/50 dark:bg-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label htmlFor={`producto_base_id_${index}`} className="block text-xs font-medium text-gray-600 dark:text-slate-400">Producto Base</label>
                <select
                  id={`producto_base_id_${index}`}
                  value={ing.producto_base_id}
                  onChange={(e) => handleIngredientChange(ing.temp_id!, 'producto_base_id', e.target.value)}
                  className="mt-1 block w-full py-1.5 px-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  required
                >
                  <option value="" disabled>Seleccione producto...</option>
                  {productosBase.map(pb => (
                    <option key={pb.id} value={pb.id}>{pb.nombre_producto}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`cantidad_${index}`} className="block text-xs font-medium text-gray-600 dark:text-slate-400">Cantidad</label>
                <input
                  type="number"
                  id={`cantidad_${index}`}
                  value={ing.cantidad}
                  onChange={(e) => handleIngredientChange(ing.temp_id!, 'cantidad', parseFloat(e.target.value))}
                  className="mt-1 block w-full py-1.5 px-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
                  required
                  min="0.001"
                  step="any"
                />
              </div>
              <div>
                <label htmlFor={`unidad_medida_id_${index}`} className="block text-xs font-medium text-gray-600 dark:text-slate-400">Unidad</label>
                <select
                  id={`unidad_medida_id_${index}`}
                  value={ing.unidad_medida_id}
                  onChange={(e) => handleIngredientChange(ing.temp_id!, 'unidad_medida_id', e.target.value)}
                  className="mt-1 block w-full py-1.5 px-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  required
                >
                  <option value="" disabled>Seleccione unidad...</option>
                  {ums.map(um => (
                    <option key={um.id} value={um.id}>{um.unidad_nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => removeIngredient(ing.temp_id!)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                title="Eliminar ingrediente"
                disabled={formData.ingredientes_receta.length <= 1}
              >
                <DeleteIcon className="w-4 h-4 inline mr-1" /> Quitar
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 flex items-center text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 px-3 py-1.5 border border-orange-300 dark:border-orange-700 rounded-md hover:bg-orange-50 dark:hover:bg-orange-800/50 transition-colors"
        >
          <AddIcon className="w-4 h-4 mr-1" /> Añadir Ingrediente
        </button>
      </div>

      <div>
        <label htmlFor="notas_preparacion" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Notas de Preparación (Instrucciones, Tiempos, etc.)
        </label>
        <textarea
          id="notas_preparacion"
          name="notas_preparacion"
          value={formData.notas_preparacion || ''}
          onChange={handleGeneralChange}
          rows={5}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          placeholder="Ej: Mezclar todos los ingredientes secos. Añadir líquidos y batir..."
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
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
          disabled={availablePlatos.length === 0 && !initialData && !formData.plato_id}
        >
          {initialData ? 'Actualizar Carta' : 'Crear Carta'}
        </button>
      </div>
    </form>
  );
};

export default CartaTecnologicaForm;