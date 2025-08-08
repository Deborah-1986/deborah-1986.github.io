
// components/FichaCostoPlato.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plato, FichaCostoPlatoData, Configuracion } from '../types.js';
import * as DataManager from '../DataManager.js';
import { DocumentArrowDownIcon, ScaleIcon } from '../constants.js';

interface FichaCostoPlatoProps {
  platos: Plato[];
  configuracion: Configuracion;
  onExportPdf: (data: FichaCostoPlatoData) => Promise<void>;
  isGeneratingPdf: boolean;
}

const FichaCostoPlato: React.FC<FichaCostoPlatoProps> = ({ platos, configuracion, onExportPdf, isGeneratingPdf }) => {
  const [selectedPlatoId, setSelectedPlatoId] = useState<string>('');
  const [costoData, setCostoData] = useState<FichaCostoPlatoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) return `N/A`;
    return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
  }, [configuracion.simbolo_moneda]);

  useEffect(() => {
    if (selectedPlatoId) {
      setIsLoading(true);
      // Use a timeout to allow UI to update before blocking for calculation
      setTimeout(() => {
        const data = DataManager.getFichaCostoPlatoData(selectedPlatoId);
        setCostoData(data);
        setIsLoading(false);
      }, 50);
    } else {
      setCostoData(null);
    }
  }, [selectedPlatoId]);

  const handleExport = async () => {
    if (costoData) {
        try {
            await onExportPdf(costoData);
        } catch(e) {
            // Error is handled in App.tsx
        }
    }
  };

  const sortedPlatos = useMemo(() => [...platos].sort((a, b) => a.nombre_plato.localeCompare(b.nombre_plato)), [platos]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
          <ScaleIcon className="w-6 h-6 mr-3 text-orange-500" />
          Ficha de Costo de Plato
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="platoSelect" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Seleccione un Plato
            </label>
            <select
              id="platoSelect"
              value={selectedPlatoId}
              onChange={(e) => setSelectedPlatoId(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">-- Elija un plato para ver su costo --</option>
              {sortedPlatos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre_plato}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={handleExport}
              disabled={!costoData || isGeneratingPdf}
              className="w-full flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              {isGeneratingPdf ? 'Generando...' : 'Exportar Ficha'}
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow">
            <p className="text-orange-500">Calculando costos...</p>
        </div>
      )}

      {costoData ? (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">{costoData.nombrePlato}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">Costo de Producción Unitario Estimado</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-2 border-b dark:border-slate-600 pb-2">Ingredientes</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-slate-300">Ingrediente</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-slate-300">Cantidad</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-slate-300">UM</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-slate-300">Costo Unit. Promedio</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-slate-300">Costo Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {costoData.ingredientes.map(ing => (
                    <tr key={ing.nombre_producto}>
                      <td className="px-4 py-2 whitespace-nowrap">{ing.nombre_producto}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">{ing.cantidad_receta.toFixed(3)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{ing.unidad_nombre}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">{formatCurrency(ing.costo_unitario_promedio)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">{formatCurrency(ing.costo_total_ingrediente)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 dark:bg-slate-700 font-bold">
                    <td colSpan={4} className="px-4 py-2 text-right text-gray-800 dark:text-slate-100">Subtotal Ingredientes</td>
                    <td className="px-4 py-2 text-right text-gray-800 dark:text-slate-100">{formatCurrency(costoData.costo_total_ingredientes)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-2 border-b dark:border-slate-600 pb-2">Costos Adicionales y Totales</h4>
            <div className="max-w-md ml-auto space-y-2 text-sm">
               <div className="flex justify-between"><span>Otros Gastos (Receta):</span> <span className="font-medium">{formatCurrency(costoData.otros_gastos_receta)}</span></div>
               <div className="flex justify-between"><span>Combustible (Receta):</span> <span className="font-medium">{formatCurrency(costoData.combustible_receta)}</span></div>
               <div className="flex justify-between"><span>Salario (Receta):</span> <span className="font-medium">{formatCurrency(costoData.salario_receta)}</span></div>
               <div className="flex justify-between border-t dark:border-slate-600 mt-2 pt-2 text-base font-bold text-orange-600 dark:text-orange-400">
                   <span>Costo Total de Producción Unitario:</span>
                   <span>{formatCurrency(costoData.costo_total_produccion_unitario)}</span>
               </div>
            </div>
          </div>

           {costoData.notas_preparacion && (
                <div>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-2 border-b dark:border-slate-600 pb-2">Notas de Preparación</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-300 whitespace-pre-wrap">{costoData.notas_preparacion}</p>
                </div>
            )}

        </div>
      ) : selectedPlatoId ? (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-slate-400">No se encontró una receta (carta tecnológica) para el plato seleccionado. No se pueden calcular los costos.</p>
        </div>
      ) : (
         <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-slate-400">Seleccione un plato para comenzar.</p>
        </div>
      )}
    </div>
  );
};
export default FichaCostoPlato;