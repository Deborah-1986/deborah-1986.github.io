import React, { useState, useEffect, useCallback } from 'react';
import { 
    VentaFormData, Plato, RestauranteServicio, EstadoPago, Configuracion, 
    UnidadMedida, ProductoBase, CartaTecnologica, InventarioItem, MenuPrecioItem,
    PlatoDisponibleVenta, InventarioFaltanteDetalle
} from '../types.js';
import * as DataManager from '../DataManager.js';

interface VentaFormProps {
  onSuccessfulSubmit: () => void;
  onClose: () => void;
  platos: Plato[];
  servicios: RestauranteServicio[];
  config: Configuracion;
  ums: UnidadMedida[];
  productosBase: ProductoBase[];
  cartasTecnologicas: CartaTecnologica[];
  inventario: InventarioItem[];
  menuPrecios: MenuPrecioItem[];
}

const VentaForm: React.FC<VentaFormProps> = ({ 
    onSuccessfulSubmit, onClose, platos, servicios, config, 
    ums, productosBase, cartasTecnologicas, inventario, menuPrecios 
}) => {
  
  const getInitialDateString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<VentaFormData>({
    fecha: getInitialDateString(),
    servicio_id: servicios.length > 0 ? servicios[0].id : '',
    plato_id: '',
    cantidad: 1,
    estado_pago: config.default_estado_pago || EstadoPago.EFECTIVO,
    nombre_deudor: '',
  });

  const [showDebtorField, setShowDebtorField] = useState(formData.estado_pago === EstadoPago.PENDIENTE);
  const [platosDisponibles, setPlatosDisponibles] = useState<PlatoDisponibleVenta[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [faltantesReport, setFaltantesReport] = useState<InventarioFaltanteDetalle[] | null>(null);

  const formatCurrencyDisplay = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(2)} ${config.simbolo_moneda}`;
  };

  const updateAvailableDishes = useCallback(() => {
    if (!formData.servicio_id) {
      setPlatosDisponibles([]);
      return;
    }

    const disponibles: PlatoDisponibleVenta[] = platos.map(plato => {
      const checkInventario = DataManager.hayInventarioSuficiente(
        plato.id, 1, cartasTecnologicas, inventario, productosBase, ums
      );
      let precio: number | undefined = undefined;
      if (checkInventario.suficiente) {
        const precioVenta = DataManager.obtenerPrecioVenta(plato.id, formData.servicio_id, servicios, menuPrecios);
        if (precioVenta !== null) {
            precio = precioVenta;
        }
      }
      return {
        platoId: plato.id,
        nombrePlato: plato.nombre_plato,
        precio: precio,
        isAvailable: checkInventario.suficiente && precio !== undefined,
      };
    });
    setPlatosDisponibles(disponibles);
    
    const currentPlatoStillAvailable = disponibles.find(p => p.platoId === formData.plato_id && p.isAvailable);
    if (!currentPlatoStillAvailable) {
        const firstTrulyAvailable = disponibles.find(p => p.isAvailable);
        setFormData(prev => ({ ...prev, plato_id: firstTrulyAvailable ? firstTrulyAvailable.platoId : '' }));
    } else if (!formData.plato_id && disponibles.some(p => p.isAvailable)) {
        const firstTrulyAvailable = disponibles.find(p => p.isAvailable);
        setFormData(prev => ({ ...prev, plato_id: firstTrulyAvailable ? firstTrulyAvailable.platoId : '' }));
    }

  }, [platos, servicios, cartasTecnologicas, inventario, productosBase, ums, menuPrecios, formData.servicio_id, formData.plato_id]);


  useEffect(() => {
    updateAvailableDishes();
  }, [updateAvailableDishes]);


  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        servicio_id: servicios.find(s => s.id === prev.servicio_id) ? prev.servicio_id : (servicios.length > 0 ? servicios[0].id : ''),
        estado_pago: config.default_estado_pago || prev.estado_pago || EstadoPago.EFECTIVO
    }));
  }, [config.default_estado_pago, servicios]);


  useEffect(() => {
    setShowDebtorField(formData.estado_pago === EstadoPago.PENDIENTE);
  }, [formData.estado_pago]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;

    setErrorMessage(null); 
    setFaltantesReport(null);

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };
  
  const handleSelectPlatoFromTable = (platoId: string) => {
    setFormData(prev => ({...prev, plato_id: platoId, cantidad: 1})); 
    setErrorMessage(null);
    setFaltantesReport(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setFaltantesReport(null);

    if (platos.length === 0) {
      setErrorMessage("No hay platos definidos. Agregue platos en la sección 'Platos'."); return;
    }
    if (servicios.length === 0) {
      setErrorMessage("No hay servicios/canales definidos. Agregue en 'Servicios/Canales'."); return;
    }
    if (!formData.plato_id || !formData.servicio_id) {
      setErrorMessage("Debe seleccionar un plato y un servicio."); return;
    }
    if (formData.cantidad <= 0) {
      setErrorMessage("La cantidad debe ser mayor que cero."); return;
    }
    if (formData.estado_pago === EstadoPago.PENDIENTE && !formData.nombre_deudor?.trim()) {
      setErrorMessage("Debe ingresar el nombre del deudor para pagos pendientes."); return;
    }
    
    const submissionData: VentaFormData = { ...formData };

    const inputDate = new Date(submissionData.fecha);
    const today = new Date();
    if (inputDate > today) {
      setErrorMessage("La fecha y hora de la venta no puede ser futura."); return;
    }

    const result = DataManager.registrarVenta(submissionData);
    if (result.success) {
      alert(result.message); 
      onSuccessfulSubmit(); 
    } else {
      setErrorMessage(result.message);
      if (result.errorReport) {
        setFaltantesReport(result.errorReport as InventarioFaltanteDetalle[]);
      }
    }
  };

  const selectedServicio = servicios.find(s => s.id === formData.servicio_id);
  let commissionInfo = "";
  if (selectedServicio) {
    if (selectedServicio.nombre_servicio.toLowerCase() === 'catauro' && config.comision_catauro_pct > 0) {
      commissionInfo = `Comisión Catauro: ${(config.comision_catauro_pct * 100).toFixed(0)}%`;
    } else if (selectedServicio.nombre_servicio.toLowerCase() === 'mandado' && config.comision_mandado_pct > 0) {
      commissionInfo = `Comisión Mandado: ${(config.comision_mandado_pct * 100).toFixed(0)}%`;
    }
  }
  
  const filteredPlatosDisponibles = platosDisponibles.filter(p => p.isAvailable);

  return (
    <div className="space-y-4">
        <div className="border rounded-lg p-3 bg-gray-50 dark:bg-slate-700/30 max-h-60 overflow-y-auto">
            <h4 className="text-md font-semibold text-gray-700 dark:text-slate-200 mb-2">
                Platos Disponibles para Venta ({selectedServicio?.nombre_servicio || 'Seleccione Servicio'})
            </h4>
            {filteredPlatosDisponibles.length > 0 ? (
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-slate-600">
                        <tr>
                            <th className="py-2 px-3 text-left font-medium text-gray-600 dark:text-slate-300">Plato</th>
                            <th className="py-2 px-3 text-right font-medium text-gray-600 dark:text-slate-300">Precio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                        {filteredPlatosDisponibles.map(p => (
                            <tr 
                                key={p.platoId} 
                                onClick={() => handleSelectPlatoFromTable(p.platoId)}
                                className={`cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-700/50 ${formData.plato_id === p.platoId ? 'bg-orange-200 dark:bg-orange-600/50' : ''}`}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectPlatoFromTable(p.platoId);}}
                                aria-pressed={formData.plato_id === p.platoId}
                            >
                                <td className="py-1.5 px-3 text-gray-800 dark:text-slate-100">{p.nombrePlato}</td>
                                <td className="py-1.5 px-3 text-right text-gray-600 dark:text-slate-300">{formatCurrencyDisplay(p.precio)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-gray-500 dark:text-slate-400 text-center py-3">
                    {formData.servicio_id ? 'No hay platos disponibles para este servicio con el inventario actual, o no tienen precio definido.' : 'Seleccione un servicio para ver platos disponibles.'}
                </p>
            )}
        </div>
        
        {errorMessage && (
            <div className="p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-800/20 text-red-700 dark:text-red-300 rounded-md">
                <p className="font-medium">Error al registrar venta:</p>
                <p className="text-sm">{errorMessage}</p>
                {faltantesReport && faltantesReport.length > 0 && (
                    <div className="mt-2 text-xs">
                        <p className="font-semibold">Ingredientes faltantes:</p>
                        <ul className="list-disc list-inside ml-2">
                            {faltantesReport.map(f => (
                                <li key={f.nombre}>{f.nombre} (Necesita: {f.cantidadNecesaria.toFixed(2)}, Falta: {f.cantidadFaltante.toFixed(2)} {f.unidad})</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label htmlFor="servicio_id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Servicio/Canal <span className="text-red-500">*</span>
            </label>
            <select
                id="servicio_id"
                name="servicio_id"
                value={formData.servicio_id}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                required
                disabled={servicios.length === 0}
            >
                <option value="" disabled>Seleccione un servicio...</option>
                {servicios.map(s => (
                <option key={s.id} value={s.id}>{s.nombre_servicio}</option>
                ))}
            </select>
            {servicios.length === 0 && <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">No hay servicios. Añada en Configuración.</p>}
            {commissionInfo && <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{commissionInfo}</p>}
            </div>

            <div>
            <label htmlFor="plato_id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Plato Seleccionado <span className="text-red-500">*</span>
            </label>
            <select
                id="plato_id"
                name="plato_id"
                value={formData.plato_id}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                required
                disabled={filteredPlatosDisponibles.length === 0}
            >
                <option value="" disabled>Seleccione un plato de la tabla...</option>
                {filteredPlatosDisponibles.map(p => (
                <option key={p.platoId} value={p.platoId}>{p.nombrePlato} ({formatCurrencyDisplay(p.precio)})</option>
                ))}
            </select>
             {platos.length > 0 && filteredPlatosDisponibles.length === 0 && formData.servicio_id && <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Ningún plato disponible para el servicio seleccionado o con inventario.</p>}
             {platos.length === 0 && <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">No hay platos. Añada en Configuración.</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Cantidad <span className="text-red-500">*</span>
            </label>
            <input
                type="number"
                id="cantidad"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
                required
                min="1"
                step="1"
            />
            </div>
            <div>
            <label htmlFor="estado_pago" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Estado del Pago <span className="text-red-500">*</span>
            </label>
            <select
                id="estado_pago"
                name="estado_pago"
                value={formData.estado_pago}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                required
            >
                {Object.values(EstadoPago).filter(s => s !== EstadoPago.NA).map(estado => (
                <option key={estado} value={estado}>{estado}</option>
                ))}
            </select>
            </div>
        </div>
        
        {showDebtorField && (
            <div>
            <label htmlFor="nombre_deudor" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Nombre del Deudor <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                id="nombre_deudor"
                name="nombre_deudor"
                value={formData.nombre_deudor || ''}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
                required={formData.estado_pago === EstadoPago.PENDIENTE}
            />
            </div>
        )}

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
            disabled={platos.length === 0 || servicios.length === 0 || filteredPlatosDisponibles.length === 0 && !formData.plato_id}
            >
            Registrar Venta
            </button>
        </div>
        </form>
    </div>
  );
};

export default VentaForm;