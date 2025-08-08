
import React, { useState, useEffect } from 'react';
import { Transaccion, EstadoPago, Configuracion } from '../types';

interface ModificarCuentaPendienteFormProps {
  initialData: Transaccion;
  onSubmit: (transaccionId: string, updates: { nombre_deudor?: string; estado_pago: EstadoPago; notas?: string }) => void;
  onClose: () => void;
  configuracion: Configuracion;
}

const ModificarCuentaPendienteForm: React.FC<ModificarCuentaPendienteFormProps> = ({ 
  initialData, 
  onSubmit, 
  onClose,
  configuracion
}) => {
  const [nombreDeudor, setNombreDeudor] = useState(initialData.nombre_deudor || '');
  const [estadoPago, setEstadoPago] = useState<EstadoPago>(initialData.estado_pago || EstadoPago.PENDIENTE);
  const [notas, setNotas] = useState(initialData.notas || '');
  
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
  };

  useEffect(() => {
    setNombreDeudor(initialData.nombre_deudor || '');
    setEstadoPago(initialData.estado_pago || EstadoPago.PENDIENTE);
    setNotas(initialData.notas || '');
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (estadoPago === EstadoPago.PENDIENTE && !nombreDeudor.trim()) {
      alert("El nombre del deudor es obligatorio si el estado es PENDIENTE.");
      return;
    }
    onSubmit(initialData.id_transaccion, {
      nombre_deudor: nombreDeudor.trim() || undefined, // Send undefined if empty to potentially clear it
      estado_pago: estadoPago,
      notas: notas.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-1">
          Modificando Cuenta de: <span className="font-semibold text-pink-600">{initialData.nombre_deudor || 'Cliente Desconocido'}</span>
        </h3>
        <p className="text-sm text-gray-500">
          Fecha: {new Date(initialData.fecha).toLocaleDateString()} | Plato/Producto: {initialData.producto_plato_nombre}
        </p>
        <p className="text-sm text-gray-500 font-semibold">
          Importe Total: {formatCurrency(initialData.importe_total)}
        </p>
      </div>
      
      <hr/>

      <div>
        <label htmlFor="nombre_deudor" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Cliente (Deudor) {estadoPago === EstadoPago.PENDIENTE && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          id="nombre_deudor"
          value={nombreDeudor}
          onChange={(e) => setNombreDeudor(e.target.value)}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          required={estadoPago === EstadoPago.PENDIENTE}
        />
      </div>

      <div>
        <label htmlFor="estado_pago" className="block text-sm font-medium text-gray-700 mb-1">
          Estado del Pago <span className="text-red-500">*</span>
        </label>
        <select
          id="estado_pago"
          value={estadoPago}
          onChange={(e) => setEstadoPago(e.target.value as EstadoPago)}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          required
        >
          <option value={EstadoPago.PENDIENTE}>Pendiente</option>
          <option value={EstadoPago.EFECTIVO}>Efectivo</option>
          <option value={EstadoPago.TRANSFERENCIA}>Transferencia</option>
        </select>
      </div>

      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
          Notas (Opcional)
        </label>
        <textarea
          id="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          placeholder="Añada notas adicionales sobre la cuenta o el pago..."
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-2 border-t mt-6 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
};

export default ModificarCuentaPendienteForm;
