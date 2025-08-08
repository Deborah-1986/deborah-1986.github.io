// components/BalanceGeneral.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CierreMensual, BalanceGeneralData, Configuracion, Transaccion, OtroGasto } from '../types.js';
import * as DataManager from '../DataManager.js';
import { DocumentArrowDownIcon, DocumentTextIcon } from '../constants.js';

interface BalanceGeneralProps {
  cierresMensuales: CierreMensual[];
  allTransacciones: Transaccion[];
  allOtrosGastos: OtroGasto[];
  configuracion: Configuracion;
  onExportPdf: (data: BalanceGeneralData) => Promise<void>;
  isGeneratingPdf: boolean;
}

const BalanceGeneral: React.FC<BalanceGeneralProps> = ({ 
    cierresMensuales, 
    allTransacciones, 
    allOtrosGastos, 
    configuracion, 
    onExportPdf, 
    isGeneratingPdf 
}) => {
  const [selectedMes, setSelectedMes] = useState<string>('');
  const [balanceData, setBalanceData] = useState<BalanceGeneralData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    allTransacciones.forEach(t => months.add(t.fecha.substring(0, 7)));
    allOtrosGastos.forEach(g => months.add(g.fecha.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [allTransacciones, allOtrosGastos]);

  useEffect(() => {
    // Set default selected month to the most recent one with activity
    if (availableMonths.length > 0 && !selectedMes) {
      setSelectedMes(availableMonths[0]);
    }
  }, [availableMonths, selectedMes]);
  
  useEffect(() => {
    if (selectedMes) {
      setIsLoading(true);
      setTimeout(() => {
        const data = DataManager.calculateBalanceGeneralData(selectedMes);
        setBalanceData(data);
        setIsLoading(false);
      }, 50); // Timeout to allow UI to update to loading state
    } else {
      setBalanceData(null);
    }
  }, [selectedMes, allTransacciones, allOtrosGastos, cierresMensuales]);
  
  const formatCurrency = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) return `N/A`;
    return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
  }, [configuracion.simbolo_moneda]);

  const handleExport = async () => {
    if (balanceData) {
      await onExportPdf(balanceData);
    }
  };

  const renderDataRow = (label: string, value: number, isTotal = false, isSub = false, isFinal=false) => (
    <div className={`flex justify-between py-1.5 ${isTotal ? 'font-bold border-t pt-2' : ''} ${isFinal ? 'text-lg font-bold text-orange-600 dark:text-orange-400' : ''} ${isSub ? 'pl-4' : ''}`}>
      <span>{label}:</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
          <DocumentTextIcon className="w-6 h-6 mr-3 text-orange-500" />
          Balance General
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="mesSelect" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Seleccione un Mes
            </label>
            <select
              id="mesSelect"
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
              disabled={availableMonths.length === 0}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">-- Elija un mes --</option>
              {availableMonths.map(mes => (
                <option key={mes} value={mes}>{mes}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={handleExport}
              disabled={!balanceData || isGeneratingPdf}
              className="w-full flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              {isGeneratingPdf ? 'Generando...' : 'Exportar Balance'}
            </button>
          </div>
        </div>
      </div>
      
      {isLoading && (
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow">
            <p className="text-orange-500">Reconstruyendo estado financiero del mes...</p>
        </div>
      )}

      {balanceData ? (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6 space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Balance General</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Al final del mes {balanceData.mes}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Activos */}
                <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 border-b-2 border-green-200 dark:border-green-700 pb-1">Activos</h4>
                    {renderDataRow("Efectivo y Equivalentes", balanceData.efectivo, false, true)}
                    {renderDataRow("Cuentas por Cobrar", balanceData.cuentasPorCobrar, false, true)}
                    {renderDataRow("Inventario", balanceData.inventario, false, true)}
                    {renderDataRow("Total Activos", balanceData.totalActivos, true)}
                </div>
                 {/* Pasivos y Patrimonio */}
                <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-red-700 dark:text-red-400 border-b-2 border-red-200 dark:border-red-700 pb-1">Pasivos y Patrimonio</h4>
                    {renderDataRow("Cuentas por Pagar", balanceData.cuentasPorPagar, false, true)}
                    {renderDataRow("Total Pasivos", balanceData.totalPasivos, true)}
                    <div className="pt-4 mt-4 border-t dark:border-slate-600">
                        {renderDataRow("Patrimonio Neto", balanceData.patrimonio, false, false, true)}
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-slate-400">
                {availableMonths.length > 0 ? "Seleccione un mes para ver el balance." : "No hay datos de transacciones para generar un balance."}
            </p>
        </div>
      )}
    </div>
  );
};
export default BalanceGeneral;