// components/EstadoFlujoEfectivo.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Transaccion, OtroGasto, Configuracion, FlujoEfectivoData, CierreMensual } from '../types.js';
import * as DataManager from '../DataManager.js';
import { DocumentArrowDownIcon, DocumentTextIcon } from '../constants.js';

interface EstadoFlujoEfectivoProps {
  allTransacciones: Transaccion[];
  allOtrosGastos: OtroGasto[];
  allCierresMensuales: CierreMensual[];
  configuracion: Configuracion;
  onExportPdf: (data: FlujoEfectivoData) => Promise<void>;
  isGeneratingPdf: boolean;
}

const getInitialDateRange = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return {
      from: firstDayOfMonth.toISOString().split('T')[0],
      to: currentDay.toISOString().split('T')[0],
      month: today.toISOString().split('T')[0].substring(0, 7)
    };
};

const EstadoFlujoEfectivo: React.FC<EstadoFlujoEfectivoProps> = ({
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
  const [reporteData, setReporteData] = useState<FlujoEfectivoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formatCurrency = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) return `0.00 ${configuracion.simbolo_moneda}`;
    return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
  }, [configuracion.simbolo_moneda]);

  const formatDateForDisplay = useCallback((dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
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
      const [year, month] = mesSeleccionado.split('-').map(Number);
      startDateISO = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
      endDateISO = new Date(Date.UTC(year, month, 0)).toISOString().split('T')[0]; 
      const dateLabel = new Date(Date.UTC(year, month - 1, 1));
      periodoLabel = `${dateLabel.toLocaleString('es-CU', { month: 'long', year: 'numeric', timeZone: 'UTC' })}`;
    } else {
      startDateISO = fechaDesde;
      endDateISO = fechaHasta;
      periodoLabel = `${formatDateForDisplay(startDateISO)} - ${formatDateForDisplay(endDateISO)}`;
    }

    setTimeout(() => {
        try {
            const data = DataManager.calculateEstadoFlujoEfectivoData(
                startDateISO, 
                endDateISO,   
                allTransacciones,
                allOtrosGastos,
                periodoLabel
            );
            setReporteData(data);
        } catch (error) {
            console.error("Error al calcular el flujo de efectivo:", error);
            alert("Error al generar el reporte.");
        } finally {
            setIsLoading(false);
        }
    }, 50);
  }, [tipoPeriodo, mesSeleccionado, fechaDesde, fechaHasta, allTransacciones, allOtrosGastos, formatDateForDisplay]);

  useEffect(() => {
    handleGenerarReporte();
  }, [handleGenerarReporte, allCierresMensuales]); 

  const renderSummaryItem = (label: string, value: number | undefined, isPositive: boolean = true, isBold: boolean = false, indent: boolean = false) => (
    <div className={`flex justify-between py-1.5 ${indent ? 'pl-4' : ''} ${isBold ? 'border-t dark:border-slate-600 pt-2 mt-1' : 'border-b border-dotted dark:border-slate-700'}`}>
      <span className={`text-sm ${isBold ? 'font-semibold' : ''} text-gray-600 dark:text-slate-300`}>{label}:</span>
      <span className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
              <DocumentTextIcon className="w-6 h-6 mr-3 text-orange-500" />
              Estado de Flujo de Efectivo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
                 <div>
                    <label htmlFor="ec-tipoPeriodo" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tipo de Período:</label>
                    <select id="ec-tipoPeriodo" value={tipoPeriodo} onChange={(e) => setTipoPeriodo(e.target.value as 'mes' | 'rango')}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                        <option value="mes">Mes Específico</option>
                        <option value="rango">Rango de Fechas</option>
                    </select>
                </div>
                {tipoPeriodo === 'mes' ? (
                    <div className="md:col-span-2">
                        <label htmlFor="ec-mesSeleccionado" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Mes:</label>
                        <input type="month" id="ec-mesSeleccionado" value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100" />
                    </div>
                ) : (
                    <>
                    <div>
                        <label htmlFor="ec-fechaDesde" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Desde:</label>
                        <input type="date" id="ec-fechaDesde" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"/>
                    </div>
                    <div>
                        <label htmlFor="ec-fechaHasta" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Hasta:</label>
                        <input type="date" id="ec-fechaHasta" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
                             className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"/>
                    </div>
                    </>
                )}
            </div>
             <div className="flex justify-end">
                <button
                    onClick={() => reporteData && onExportPdf(reporteData)}
                    disabled={isGeneratingPdf || !reporteData}
                    className="flex items-center bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60"
                >
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    {isGeneratingPdf ? 'Generando PDF...' : 'Exportar a PDF'}
                </button>
            </div>
        </div>
      {isLoading && <p className="text-center text-orange-500 dark:text-orange-400 py-4">Generando reporte...</p>}
      {!isLoading && reporteData && (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6 space-y-4">
             <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-2">
                    Resumen de Flujo de Efectivo: {reporteData.periodoSeleccionado}
                </h3>
                {renderSummaryItem("(+) Total Entradas de Efectivo", reporteData.totalIngresos, true, false)}
                {renderSummaryItem("(-) Total Salidas de Efectivo", reporteData.totalSalidas, false, false)}
                {renderSummaryItem("(=) Flujo Neto de Efectivo de Operaciones", reporteData.flujoNetoOperativo, reporteData.flujoNetoOperativo >= 0, true)}
            </div>
        </div>
      )}
    </div>
  );
};
export default EstadoFlujoEfectivo;