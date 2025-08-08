// components/CompraEditForm.tsx
import React, { useState, useEffect } from 'react';
import { CompraEditFormData, ProductoBase, Proveedor, UnidadMedida, Transaccion } from '../types.js';

interface CompraEditFormProps {
  onSubmit: (data: CompraEditFormData) => void;
  onClose: () => void;
  initialData: Transaccion;
  productosBase: ProductoBase[];
  proveedores: Proveedor[];
  ums: UnidadMedida[];
}

const CompraEditForm: React.FC<CompraEditFormProps> = ({ onSubmit, onClose, initialData, productosBase, proveedores, ums }) => {
  const [formData, setFormData] = useState<CompraEditFormData>({
    id_transaccion: initialData.id_transaccion,
    fecha: initialData.fecha,
    proveedor_id: proveedores.find(p => p.nombre_proveedor === initialData.servicio_proveedor_nombre)?.id || '',
    producto_base_id: initialData.producto_base_relacionado_id || '',
    cantidad: initialData.cantidad,
    precio_unitario: initialData.precio_unitario || 0,
    referencia_factura_proveedor: initialData.referencia_factura_proveedor,
    notas: initialData.notas,
  });
  
  useEffect(() => {
    setFormData({
      id_transaccion: initialData.id_transaccion,
      fecha: initialData.fecha,
      proveedor_id: proveedores.find(p => p.nombre_proveedor === initialData.servicio_proveedor_nombre)?.id || '',
      producto_base_id: initialData.producto_base_relacionado_id || '',
      cantidad: initialData.cantidad,
      precio_unitario: initialData.precio_unitario || 0,
      referencia_factura_proveedor: initialData.referencia_factura_proveedor,
      notas: initialData.notas,
    });
  }, [initialData, proveedores]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.cantidad <= 0 || formData.precio_unitario < 0) {
      alert("La cantidad debe ser positiva y el precio no puede ser negativo.");
      return;
    }
    onSubmit(formData);
  };

  const importeTotal = formData.cantidad * formData.precio_unitario;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="proveedor_id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Proveedor <span className="text-red-500">*</span>
          </label>
          <select id="proveedor_id" name="proveedor_id" value={formData.proveedor_id} onChange={handleChange} required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm">
            {proveedores.map(p => (<option key={p.id} value={p.id}>{p.nombre_proveedor}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="producto_base_id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Producto Base <span className="text-red-500">*</span>
          </label>
          <select id="producto_base_id" name="producto_base_id" value={formData.producto_base_id} onChange={handleChange} required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm">
            {productosBase.map(p => (<option key={p.id} value={p.id}>{p.nombre_producto}</option>))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <input type="number" id="cantidad" name="cantidad" value={formData.cantidad} onChange={handleChange} required min="0.001" step="any"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200" />
        </div>
        <div>
          <label htmlFor="precio_unitario" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Precio Unitario <span className="text-red-500">*</span>
          </label>
          <input type="number" id="precio_unitario" name="precio_unitario" value={formData.precio_unitario} onChange={handleChange} required min="0" step="any"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Importe Total</label>
            <input type="text" value={isNaN(importeTotal) ? '0.00' : importeTotal.toFixed(2)} readOnly
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-gray-100 dark:bg-slate-600 sm:text-sm dark:text-slate-200" />
        </div>
      </div>
      
      <div>
        <label htmlFor="referencia_factura_proveedor" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Referencia Factura (Opcional)
        </label>
        <input type="text" id="referencia_factura_proveedor" name="referencia_factura_proveedor" value={formData.referencia_factura_proveedor || ''} onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200" />
      </div>

       <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Notas (Opcional)
        </label>
        <textarea id="notas" name="notas" rows={2} value={formData.notas || ''} onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200" />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:text-slate-200 dark:bg-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
          Cancelar
        </button>
        <button type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors">
          Guardar Cambios
        </button>
      </div>
    </form>
  );
};
export default CompraEditForm;
