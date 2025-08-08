

import React, { useState, useEffect, useCallback } from 'react';
import { Transaccion, OtroGasto, CierreMensual, Configuracion, EstadoCuentaData, TipoTransaccion, GastoPorCategoria } from '../types.js';
import * as DataManager from '../DataManager.js';
import { DocumentArrowDownIcon } from '../constants.js';

interface EstadoCuentaProps {
  allTransacciones: Transaccion[];
  allOtrosGastos: OtroGasto[];
  allCierresMensuales: CierreMensual[];
  configuracion: Configuracion;
  onExportPdf: (data: EstadoCuentaData) => Promise<void>;
  isGeneratingPdf: boolean;
}

const getInitialDateRange = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return {
      from: firstDayOfMonth.toISOString().split('T')[0],
      to: currentDay.toISOString().split('T')[0],
      month: today.toISOString().split('T')[0].substring(0, 7) // YYYY-MM
    };
};

const EstadoCuentaComponent: React.FC<EstadoCuentaProps> = ({
  allTransacciones,
  allOtrosGastos,
  allCierresMensuales,
  configuracion,
  onExportPdf,
  isGeneratingPdf
}) => {
  const [tipoPeriodo, setTipoPeriodo] = useState<'mes' | 'rango'>('mes');
  const initialRange = getInitialDateRange();
  const [mesSeleccionado, setMesSeleccionado] = useState<string>(initialRange.month);
  const [fechaDesde, setFechaDesde] = useState<string>(initialRange.from);
  const [fechaHasta, setFechaHasta] = useState<string>(initialRange.to);
  const [reporteData, setReporteData] = useState<EstadoCuentaData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formatCurrency = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) return `0.00 ${configuracion.simbolo_moneda}`;
    return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
  }, [configuracion.simbolo_moneda]);

  const formatDateForDisplay = useCallback((dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z'); // Use Z for UTC
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth is 0-indexed
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }, []);


  const handleGenerarReporte = useCallback(() => {
    setIsLoading(true);
    setReporteData(null);

    let startDateISO: string;
    let endDateISO: string;
    let periodoLabel: string;

    if (tipoPeriodo === 'mes') {
      if (!mesSeleccionado) {
        alert("Por favor, seleccione un mes.");
        setIsLoading(false);
        return;
      }
      const [year, month] = mesSeleccionado.split('-').map(Number);
      startDateISO = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
      endDateISO = new Date(Date.UTC(year, month, 0)).toISOString().split('T')[0]; 
      
      const dateLabel = new Date(Date.UTC(year, month - 1, 1));
      periodoLabel = `${dateLabel.toLocaleString('es-CU', { month: 'long', year: 'numeric', timeZone: 'UTC' })}`;
      periodoLabel = periodoLabel.charAt(0).toUpperCase() + periodoLabel.slice(1);


    } else {
      if (!fechaDesde || !fechaHasta) {
        alert("Por favor, seleccione un rango de fechas válido.");
        setIsLoading(false);
        return;
      }
      if (new Date(fechaDesde) > new Date(fechaHasta)) {
        alert("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.");
        setIsLoading(false);
        return;
      }
      startDateISO = fechaDesde;
      endDateISO = fechaHasta;
      periodoLabel = `${formatDateForDisplay(startDateISO)} - ${formatDateForDisplay(endDateISO)}`;
    }

    try {
        const data = DataManager.calculateEstadoCuentaData(
            startDateISO, 
            endDateISO,   
            allTransacciones,
            allOtrosGastos,
            allCierresMensuales,
            periodoLabel
        );
        setReporteData(data);
    } catch (error) {
        console.error("Error al calcular el estado de cuenta:", error);
        alert("Error al generar el reporte. Verifique las fechas y los datos.");
    } finally {
        setIsLoading(false);
    }
  }, [tipoPeriodo, mesSeleccionado, fechaDesde, fechaHasta, allTransacciones, allOtrosGastos, allCierresMensuales, formatDateForDisplay]);

  useEffect(() => {
    handleGenerarReporte();
  }, [handleGenerarReporte]); 

  const renderSummaryItem = (label: string, value: number | undefined, isPositiveGood: boolean = true, isBold: boolean = false, indent: boolean = false) => (
    <div className={`flex justify-between py-1.5 ${indent ? 'pl-4' : ''} ${isBold ? 'border-t dark:border-slate-600 pt-2 mt-1' : 'border-b border-dotted dark:border-slate-700'}`}>
      <span className={`text-sm ${isBold ? 'font-semibold' : ''} text-gray-600 dark:text-slate-300`}>{label}:</span>
      <span className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} 
        ${value === undefined || value === null || isNaN(value) ? 'text-gray-500 dark:text-slate-400' : 
          (isPositiveGood ? (value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 
                            (value <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'))
        }
      `}>
        {formatCurrency(value)}
      </span>
    </div>
  );

  const renderDetailTable = (title: string, items: (Transaccion | OtroGasto)[], type: 'venta' | 'compra' | 'otro_gasto') => {
    if (!items || items.length === 0) return <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">No hay datos para mostrar.</p>;
    
    const headers = type === 'otro_gasto'
      ? ["Fecha", "Descripción", "Categoría", "Importe"]
      : ["Fecha", "Nombre", "Cantidad", "P.Unitario", "Importe Total", "Costo Total", "Utilidad"];

    return (
      <div className="mt-4">
        <h4 className="text-md font-semibold text-gray-700 dark:text-slate-300 mb-2">{title}</h4>
        <div className="overflow-x-auto max-h-80">
          <table className="min-w-full text-xs divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-100 dark:bg-slate-700 sticky top-0">
              <tr>
                {headers.map(header => (
                  <th key={header} scope="col" className="px-3 py-2 text-left font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {items.map(item => (
                <tr key={'id_transaccion' in item ? item.id_transaccion : item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50">
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-slate-300">{formatDateForDisplay(item.fecha)}</td>
                  <td className="px-3 py-2 whitespace-normal max-w-xs truncate text-gray-800 dark:text-slate-200" title={(item as Transaccion).producto_plato_nombre || (item as OtroGasto).descripcion}>
                    {(item as Transaccion).producto_plato_nombre || (item as OtroGasto).descripcion}
                  </td>
                  {type === 'otro_gasto' && <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-slate-300">{(item as OtroGasto).categoria}</td>}
                  {type !== 'otro_gasto' && <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-slate-300 text-right">{(item as Transaccion).cantidad.toFixed(2)}</td>}
                  {type !== 'otro_gasto' && <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-slate-300 text-right">{formatCurrency((item as Transaccion).precio_unitario)}</td>}
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-slate-300 text-right font-medium">
                    {formatCurrency(type === 'otro_gasto' ? (item as OtroGasto).importe : (item as Transaccion).importe_total)}
                  </td>
                  {type !== 'otro_gasto' && <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-slate-300 text-right">{formatCurrency((item as Transaccion).costo_total_transaccion)}</td>}
                  {type !== 'otro_gasto' && <td className={`px-3 py-2 whitespace-nowrap text-right font-semibold ${((item as Transaccion).utilidad_transaccion || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency((item as Transaccion).utilidad_transaccion)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Estado de Cuenta</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
            <div>
                <label htmlFor="tipoPeriodo" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tipo de Período:</label>
                <select
                id="tipoPeriodo"
                value={tipoPeriodo}
                onChange={(e) => { setTipoPeriodo(e.target.value as 'mes' | 'rango'); setReporteData(null); }}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                >
                <option value="mes">Mes Específico</option>
                <option value="rango">Rango de Fechas</option>
                </select>
            </div>

            {tipoPeriodo === 'mes' ? (
                <div>
                <label htmlFor="mesSeleccionado" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Mes:</label>
                <input
                    type="month"
                    id="mesSeleccionado"
                    value={mesSeleccionado}
                    onChange={(e) => { setMesSeleccionado(e.target.value); setReporteData(null); }}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                />
                </div>
            ) : (
                <>
                <div>
                    <label htmlFor="fechaDesde" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Desde:</label>
                    <input
                    type="date"
                    id="fechaDesde"
                    value={fechaDesde}
                    onChange={(e) => { setFechaDesde(e.target.value); setReporteData(null); }}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                    />
                </div>
                <div>
                    <label htmlFor="fechaHasta" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Hasta:</label>
                    <input
                    type="date"
                    id="fechaHasta"
                    value={fechaHasta}
                    onChange={(e) => { setFechaHasta(e.target.value); setReporteData(null); }}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                    />
                </div>
                </>
            )}
            </div>
            <div className="mt-4 mb-6 text-xs text-gray-500 dark:text-slate-400">
                Nota: El 'Saldo Inicial del Mes (Estimado)' se basa en el saldo final del cierre del mes anterior, si existe. De lo contrario, es 0.
            </div>
        </div>

      {isLoading && <p className="text-center text-orange-600 dark:text-orange-400 py-4">Generando reporte...</p>}

      {!isLoading && reporteData && (
        <React.Fragment>
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6 space-y-4">
            <div className="bg-orange-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-2">
                Resumen: {reporteData.periodoSeleccionado}
              </h3>
              {renderSummaryItem("Saldo Inicial del Mes (Estimado)", reporteData.saldoInicialMesEstimado, true, true)}
              {renderSummaryItem("(+) Ingresos Totales por Ventas", reporteData.ingresosTotalesVentas)}
              {renderSummaryItem("(-) Costo de Mercancía Vendida (CMV)", reporteData.costoMercanciaVendida, false)}
              {renderSummaryItem("(=) Utilidad Bruta", reporteData.utilidadBruta, true, true)}
            </div>

            <div className="bg-red-50 dark:bg-slate-700/50 p-4 rounded-lg">
                 <h4 className="text-md font-semibold text-red-700 dark:text-red-300 mb-2">(-) Gastos Operativos:</h4>
                {renderSummaryItem("Total Compras de Inventario", reporteData.totalComprasInventario, false, false, true)}
                {renderSummaryItem("Total Comisiones por Servicio (Ventas)", reporteData.totalComisionesServicioVentas, false, false, true)}
                {reporteData.gastosPorCategoria.map(gasto =>
                    renderSummaryItem(`${gasto.categoria}`, gasto.total, false, false, true)
                )}
                {renderSummaryItem("Subtotal Otros Gastos Directos", reporteData.total_otros_gastos_directos, false, true)}
                {renderSummaryItem("(=) Total Gastos Operativos", reporteData.totalGastosOperativos, false, true)}
            </div>
            
            <div className="bg-green-50 dark:bg-slate-700/50 p-4 rounded-lg">
              {renderSummaryItem("(=) Utilidad Neta del Período", reporteData.utilidadNetaPeriodo, true, true)}
              {renderSummaryItem("(=) Saldo Final del Período (Estimado)", reporteData.saldoFinalPeriodoEstimado, true, true)}
            </div>
            
            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => onExportPdf(reporteData)}
                    disabled={isGeneratingPdf}
                    className="flex items-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-orange-600 dark:hover:bg-orange-700 disabled:opacity-60"
                >
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    {isGeneratingPdf ? 'Generando PDF...' : 'Exportar a PDF'}
                </button>
            </div>
          </div>
        
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Detalles del Período</h3>
            {renderDetailTable("Ventas", reporteData.ventasDelPeriodo, 'venta')}
            {renderDetailTable("Compras", reporteData.comprasDelPeriodo, 'compra')}
            {renderDetailTable("Otros Gastos", reporteData.otrosGastosDelPeriodo, 'otro_gasto')}
          </div>
        </React.Fragment>
      )}

      {!isLoading && !reporteData && (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6 mt-6">
            <p className="text-center text-gray-500 dark:text-slate-400 py-10">
                El reporte se actualiza automáticamente al cambiar los filtros.
            </p>
        </div>
      )}
    </div>
  );
};

export default EstadoCuentaComponent;