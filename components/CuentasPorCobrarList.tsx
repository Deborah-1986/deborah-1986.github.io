

import React, { useState, useMemo } from 'react';
import { Transaccion, Configuracion, EstadoPago, TipoTransaccion } from '../types.js';
import { SortIcon, EditIcon, DocumentArrowDownIcon, PowerIcon as UndoIcon, UserMinusIcon as DeleteDebtorIcon } from '../constants.js'; 
import * as DataManager from '../DataManager.js';

interface CuentasPorCobrarListProps {
  transaccionesPendientes: Transaccion[]; 
  transaccionesPagadasRecientemente: Transaccion[]; 
  configuracion: Configuracion;
  onMarcarPagadoConMetodo: (transaccionId: string, metodoPago: EstadoPago.EFECTIVO | EstadoPago.TRANSFERENCIA | EstadoPago.ZELLE) => void;
  onModificarCuentaPendiente: (transaccion: Transaccion) => void;
  onDeshacerPago: (transaccionId: string) => void; 
  onBorrarDeudor: (transaccionId: string) => void; 
  onExportPendientesPdf: () => Promise<void>; 
  isGeneratingPendientesPdf: boolean; 
}

type SortableCuentasKey = 'fecha' | 'nombre_deudor' | 'producto_plato_nombre' | 'importe_total' | 'descripcion_pago_deuda';

export const CuentasPorCobrarList: React.FC<CuentasPorCobrarListProps> = ({
  transaccionesPendientes,
  transaccionesPagadasRecientemente,
  configuracion,
  onMarcarPagadoConMetodo, 
  onModificarCuentaPendiente,
  onDeshacerPago,
  onBorrarDeudor,
  onExportPendientesPdf, 
  isGeneratingPendientesPdf 
}) => {
  const getInitialDateRange = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const currentDay = today.toISOString().split('T')[0];
    return { from: firstDayOfMonth, to: currentDay };
  };

  const [fechaDesdePendientes, setFechaDesdePendientes] = useState(getInitialDateRange().from);
  const [fechaHastaPendientes, setFechaHastaPendientes] = useState(getInitialDateRange().to);
  const [fechaDesdePagadas, setFechaDesdePagadas] = useState(getInitialDateRange().from);
  const [fechaHastaPagadas, setFechaHastaPagadas] = useState(getInitialDateRange().to);

  const [searchTermPendientes, setSearchTermPendientes] = useState('');
  const [searchTermPagadas, setSearchTermPagadas] = useState('');
  const [sortConfigPendientes, setSortConfigPendientes] = useState<{ key: SortableCuentasKey; direction: 'ascending' | 'descending' } | null>({ key: 'fecha', direction: 'descending' });
  const [sortConfigPagadas, setSortConfigPagadas] = useState<{ key: SortableCuentasKey; direction: 'ascending' | 'descending' } | null>({ key: 'fecha', direction: 'descending' });
  const [isGeneratingPdfPagadas, setIsGeneratingPdfPagadas] = useState(false); 


  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z'); 
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); 
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const sortItems = (items: Transaccion[], sortConfig: { key: SortableCuentasKey; direction: 'ascending' | 'descending' } | null) => {
    let localItems = [...items];
    if (sortConfig !== null) {
      localItems.sort((a, b) => {
        let valA = a[sortConfig.key as keyof Transaccion];
        let valB = b[sortConfig.key as keyof Transaccion];

        if (sortConfig.key === 'fecha') {
          valA = new Date(valA as string).getTime();
          valB = new Date(valB as string).getTime();
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * (sortConfig.direction === 'ascending' ? 1 : -1);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          // Standard number comparison
        } else { 
           valA = String(valA ?? ''); 
           valB = String(valB ?? '');
        }
        
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return localItems;
  };

  const filterByDate = (transactions: Transaccion[], fromStr: string, toStr: string) => {
    const dateFrom = new Date(fromStr + "T00:00:00.000Z"); 
    const dateTo = new Date(toStr + "T23:59:59.999Z");   
    
    return transactions.filter(t => {
      if (!t.fecha) return false;
      const tDate = new Date(t.fecha); 
      return tDate >= dateFrom && tDate <= dateTo;
    });
  };

  const filteredAndSortedPendientes = useMemo(() => {
    let items = filterByDate(transaccionesPendientes, fechaDesdePendientes, fechaHastaPendientes)
                    .filter(t => t.tipo_transaccion === TipoTransaccion.VENTA && t.estado_pago === EstadoPago.PENDIENTE);
    if (searchTermPendientes) {
      const lowerSearchTerm = searchTermPendientes.toLowerCase();
      items = items.filter(t =>
        (t.nombre_deudor && t.nombre_deudor.toLowerCase().includes(lowerSearchTerm)) ||
        t.producto_plato_nombre.toLowerCase().includes(lowerSearchTerm) ||
        formatDateForDisplay(t.fecha).includes(lowerSearchTerm)
      );
    }
    return sortItems(items, sortConfigPendientes);
  }, [transaccionesPendientes, searchTermPendientes, sortConfigPendientes, fechaDesdePendientes, fechaHastaPendientes, formatDateForDisplay]);

  const filteredAndSortedPagadas = useMemo(() => {
     let items = filterByDate(transaccionesPagadasRecientemente, fechaDesdePagadas, fechaHastaPagadas)
                    .filter(t => t.tipo_transaccion === TipoTransaccion.VENTA && (t.estado_pago === EstadoPago.EFECTIVO || t.estado_pago === EstadoPago.TRANSFERENCIA || t.estado_pago === EstadoPago.ZELLE));
    if (searchTermPagadas) {
      const lowerSearchTerm = searchTermPagadas.toLowerCase();
      items = items.filter(t =>
        (t.nombre_deudor && t.nombre_deudor.toLowerCase().includes(lowerSearchTerm)) ||
        t.producto_plato_nombre.toLowerCase().includes(lowerSearchTerm) ||
        formatDateForDisplay(t.fecha).includes(lowerSearchTerm) ||
        (t.descripcion_pago_deuda && t.descripcion_pago_deuda.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return sortItems(items, sortConfigPagadas);
  }, [transaccionesPagadasRecientemente, searchTermPagadas, sortConfigPagadas, fechaDesdePagadas, fechaHastaPagadas, formatDateForDisplay]);


  const requestSort = (listType: 'pendientes' | 'pagadas', key: SortableCuentasKey) => {
    const currentSortConfig = listType === 'pendientes' ? sortConfigPendientes : sortConfigPagadas;
    const setSortFn = listType === 'pendientes' ? setSortConfigPendientes : setSortConfigPagadas;
    
    let direction: 'ascending' | 'descending' = 'ascending';
    if (currentSortConfig && currentSortConfig.key === key && currentSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortFn({ key, direction });
  };

  const getSortDirectionForColumn = (listType: 'pendientes' | 'pagadas', key: SortableCuentasKey) => {
    const currentSortConfig = listType === 'pendientes' ? sortConfigPendientes : sortConfigPagadas;
    if (!currentSortConfig || currentSortConfig.key !== key) return 'none';
    return currentSortConfig.direction;
  };

  const handleExportSpecificPDF = async (listType: 'pendientes' | 'pagadas') => {
    const dataToExport = listType === 'pendientes' ? filteredAndSortedPendientes : filteredAndSortedPagadas;
    
    if (dataToExport.length === 0) {
        alert("No hay datos para exportar en el rango de fechas seleccionado.");
        return;
    }
    if (listType === 'pendientes') {
        await onExportPendientesPdf();
    } else {
        setIsGeneratingPdfPagadas(true);
        await DataManager.generarCuentasPorCobrarPDF(dataToExport, configuracion, 'PagadasRecientemente');
        setIsGeneratingPdfPagadas(false);
    }
  };


  const renderTablaCuentas = (
    title: string,
    listType: 'pendientes' | 'pagadas',
    data: Transaccion[],
    searchTerm: string,
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>,
    currentFechaDesde: string,
    setCurrentFechaDesde: React.Dispatch<React.SetStateAction<string>>,
    currentFechaHasta: string,
    setCurrentFechaHasta: React.Dispatch<React.SetStateAction<string>>,
    isGeneratingPdfFlag: boolean,
    emptyMessage: string
  ): JSX.Element => {
    const isPendientes = listType === 'pendientes';
    const themeColor = isPendientes ? 'pink' : 'green';
    const headerBg = isPendientes ? `bg-${themeColor}-500 dark:bg-${themeColor}-700` : `bg-${themeColor}-500 dark:bg-${themeColor}-700`;
    const headerText = `text-white dark:text-${themeColor}-100`;
    const headerHoverBg = isPendientes ? `hover:bg-${themeColor}-600 dark:hover:bg-${themeColor}-800` : `hover:bg-${themeColor}-600 dark:hover:bg-${themeColor}-800`;
    const titleColor = isPendientes ? `text-${themeColor}-700 dark:text-${themeColor}-400` : `text-${themeColor}-700 dark:text-${themeColor}-400`;
        
    return (
      <div className={`bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 sm:p-6 mt-8 border-t-4 border-${themeColor}-500 dark:border-${themeColor}-500`}>
        <h2 className={`text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-4 ${titleColor}`}>{title} ({data.length})</h2>
        
        <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md border border-gray-200 dark:border-slate-600">
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Filtrar por Fecha y Exportar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
                <div>
                    <label htmlFor={`fechaDesde-${listType}`} className="block text-xs font-medium text-gray-600 dark:text-slate-300">Desde:</label>
                    <input 
                        type="date" 
                        id={`fechaDesde-${listType}`}
                        value={currentFechaDesde}
                        onChange={(e) => setCurrentFechaDesde(e.target.value)}
                        className={`mt-1 w-full p-2 border border-gray-300 dark:border-slate-500 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-600 dark:text-slate-100`}
                    />
                </div>
                <div>
                    <label htmlFor={`fechaHasta-${listType}`} className="block text-xs font-medium text-gray-600 dark:text-slate-300">Hasta:</label>
                    <input 
                        type="date" 
                        id={`fechaHasta-${listType}`}
                        value={currentFechaHasta}
                        onChange={(e) => setCurrentFechaHasta(e.target.value)}
                        className={`mt-1 w-full p-2 border border-gray-300 dark:border-slate-500 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-600 dark:text-slate-100`}
                    />
                </div>
                <button
                    onClick={() => handleExportSpecificPDF(listType)}
                    disabled={isGeneratingPdfFlag || data.length === 0}
                    className={`w-full sm:w-auto flex items-center justify-center bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60`}
                >
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    {isGeneratingPdfFlag ? 'Generando...' : `Exportar ${isPendientes ? 'Pendientes' : 'Pagadas'}`}
                </button>
            </div>
        </div>

        <div className="mb-4">
            <input
            type="text"
            placeholder={`Buscar en ${isPendientes ? 'pendientes' : 'pagadas'}...`}
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={`Buscar en cuentas ${isPendientes ? 'pendientes' : 'pagadas'}`}
            />
        </div>
        {data.length === 0 && (
            <p className="text-center text-gray-500 dark:text-slate-400 py-8">{emptyMessage}</p>
        )}
        {data.length > 0 && (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className={`${headerBg}`}>
                <tr>
                    <th scope="col" className={`px-3 py-2 text-left text-xs font-medium ${headerText} uppercase tracking-wider cursor-pointer ${headerHoverBg}`} onClick={() => requestSort(listType, 'fecha')} role="columnheader" aria-sort={getSortDirectionForColumn(listType, 'fecha')}>Fecha <SortIcon direction={getSortDirectionForColumn(listType, 'fecha')} /></th>
                    <th scope="col" className={`px-3 py-2 text-left text-xs font-medium ${headerText} uppercase tracking-wider cursor-pointer ${headerHoverBg}`} onClick={() => requestSort(listType, 'nombre_deudor')} role="columnheader" aria-sort={getSortDirectionForColumn(listType, 'nombre_deudor')}>Cliente/Deudor <SortIcon direction={getSortDirectionForColumn(listType, 'nombre_deudor')} /></th>
                    <th scope="col" className={`px-3 py-2 text-left text-xs font-medium ${headerText} uppercase tracking-wider cursor-pointer ${headerHoverBg}`} onClick={() => requestSort(listType, 'producto_plato_nombre')} role="columnheader" aria-sort={getSortDirectionForColumn(listType, 'producto_plato_nombre')}>Concepto <SortIcon direction={getSortDirectionForColumn(listType, 'producto_plato_nombre')} /></th>
                    <th scope="col" className={`px-3 py-2 text-right text-xs font-medium ${headerText} uppercase tracking-wider cursor-pointer ${headerHoverBg}`} onClick={() => requestSort(listType, 'importe_total')} role="columnheader" aria-sort={getSortDirectionForColumn(listType, 'importe_total')}>Importe <SortIcon direction={getSortDirectionForColumn(listType, 'importe_total')} /></th>
                    {isPendientes ? (
                        <th scope="col" className={`px-3 py-2 text-left text-xs font-medium ${headerText} uppercase tracking-wider`}>Notas</th>
                    ) : (
                         <th scope="col" className={`px-3 py-2 text-left text-xs font-medium ${headerText} uppercase tracking-wider cursor-pointer ${headerHoverBg}`} onClick={() => requestSort(listType, 'descripcion_pago_deuda')} role="columnheader" aria-sort={getSortDirectionForColumn(listType, 'descripcion_pago_deuda')}>Descripción Pago <SortIcon direction={getSortDirectionForColumn(listType, 'descripcion_pago_deuda')} /></th>
                    )}
                    <th scope="col" className={`px-3 py-2 text-right text-xs font-medium ${headerText} uppercase tracking-wider`}>Acciones</th>
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {data.map((t) => (
                    <tr key={t.id_transaccion} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors`}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{formatDateForDisplay(t.fecha)}</td>
                    <td className="px-3 py-2 whitespace-normal text-sm font-medium text-gray-900 dark:text-slate-100 max-w-xs truncate" title={t.nombre_deudor}>{t.nombre_deudor || '-'}</td>
                    <td className="px-3 py-2 whitespace-normal text-sm text-gray-500 dark:text-slate-400 max-w-xs truncate" title={t.producto_plato_nombre}>{t.producto_plato_nombre}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 text-right">{formatCurrency(t.importe_total)}</td>
                    <td className="px-3 py-2 whitespace-normal text-xs text-gray-500 dark:text-slate-400 max-w-xs truncate" title={t.notas || t.descripcion_pago_deuda}>{isPendientes ? (t.notas || '-') : (t.descripcion_pago_deuda || '-')}</td>

                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-right">
                        <div className="flex space-x-1 justify-end">
                        {isPendientes ? (
                            <>
                                <button onClick={() => onMarcarPagadoConMetodo(t.id_transaccion, EstadoPago.EFECTIVO)} className="p-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm transition-colors" title="Marcar Pagado (Efectivo)">EF</button>
                                <button onClick={() => onMarcarPagadoConMetodo(t.id_transaccion, EstadoPago.TRANSFERENCIA)} className="p-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors" title="Marcar Pagado (Transferencia)">TR</button>
                                <button onClick={() => onMarcarPagadoConMetodo(t.id_transaccion, EstadoPago.ZELLE)} className="p-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-black rounded-md shadow-sm transition-colors" title="Marcar Pagado (Zelle)">ZL</button>
                                <button onClick={() => onModificarCuentaPendiente(t)} className="p-1.5 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 transition-colors" title="Modificar Cuenta"><EditIcon className="w-4 h-4" /></button>
                                <button onClick={() => onBorrarDeudor(t.id_transaccion)} className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" title="Borrar Nombre Deudor"><DeleteDebtorIcon className="w-4 h-4" /></button>
                            </>
                        ) : (
                             <button onClick={() => onDeshacerPago(t.id_transaccion)} className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Deshacer Pago"><UndoIcon className="w-4 h-4" /></button>
                        )}
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderTablaCuentas(
        "Cuentas por Cobrar Pendientes",
        'pendientes',
        filteredAndSortedPendientes,
        searchTermPendientes,
        setSearchTermPendientes,
        fechaDesdePendientes,
        setFechaDesdePendientes,
        fechaHastaPendientes,
        setFechaHastaPendientes,
        isGeneratingPendientesPdf,
        "No hay cuentas pendientes de cobro para el rango de fechas seleccionado."
      )}

      {renderTablaCuentas(
        "Cuentas Pagadas Recientemente",
        'pagadas',
        filteredAndSortedPagadas,
        searchTermPagadas,
        setSearchTermPagadas,
        fechaDesdePagadas,
        setFechaDesdePagadas,
        fechaHastaPagadas,
        setFechaHastaPagadas,
        isGeneratingPdfPagadas,
        "No hay cuentas pagadas recientemente para el rango de fechas seleccionado."
      )}
    </div>
  );
};
