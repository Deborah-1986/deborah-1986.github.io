// components/CuentasPorPagarList.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Transaccion, Configuracion, EstadoPago, TipoTransaccion, Proveedor } from '../types.js';
import { SortIcon, DocumentArrowDownIcon, EditIcon, DeleteIcon } from '../constants.js';

interface CuentasPorPagarListProps {
  transaccionesPendientes: Transaccion[];
  proveedores: Proveedor[];
  configuracion: Configuracion;
  onMarcarPagado: (transaccionId: string, metodoPago: EstadoPago.EFECTIVO | EstadoPago.TRANSFERENCIA | EstadoPago.ZELLE) => void;
  onExportPdf: (data: Transaccion[]) => Promise<void>;
  onEdit: (transaccion: Transaccion) => void;
  onDelete: (id: string) => void;
}

type SortKey = 'fecha' | 'servicio_proveedor_nombre' | 'importe_total' | 'referencia_factura_proveedor';

export const CuentasPorPagarList: React.FC<CuentasPorPagarListProps> = ({
  transaccionesPendientes,
  proveedores,
  configuracion,
  onMarcarPagado,
  onExportPdf,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'fecha', direction: 'descending' });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const formatCurrency = useCallback((value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
  }, [configuracion.simbolo_moneda]);

  const formatDateForDisplay = useCallback((dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
  }, []);

  const filteredAndSorted = useMemo(() => {
    let items = transaccionesPendientes.filter(t => t.tipo_transaccion === TipoTransaccion.COMPRA && t.estado_pago === EstadoPago.PENDIENTE);
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      items = items.filter(t =>
        t.servicio_proveedor_nombre.toLowerCase().includes(lowerSearchTerm) ||
        (t.referencia_factura_proveedor && t.referencia_factura_proveedor.toLowerCase().includes(lowerSearchTerm))
      );
    }
    if (sortConfig !== null) {
      items.sort((a, b) => {
        let valA = a[sortConfig.key as keyof Transaccion] as any;
        let valB = b[sortConfig.key as keyof Transaccion] as any;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * (sortConfig.direction === 'ascending' ? 1 : -1);
        }
        return String(valA).localeCompare(String(valB)) * (sortConfig.direction === 'ascending' ? 1 : -1);
      });
    }
    return items;
  }, [transaccionesPendientes, searchTerm, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortDirection = (key: SortKey) => (sortConfig && sortConfig.key === key) ? sortConfig.direction : 'none';

  const handleExport = async () => {
    setIsGeneratingPdf(true);
    await onExportPdf(filteredAndSorted);
    setIsGeneratingPdf(false);
  };
  
  const totalDeuda = filteredAndSorted.reduce((sum, t) => sum + t.importe_total, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">Cuentas por Pagar a Proveedores</h2>
          <button
            onClick={handleExport}
            disabled={isGeneratingPdf || filteredAndSorted.length === 0}
            className="w-full sm:w-auto flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            {isGeneratingPdf ? 'Generando...' : 'Exportar PDF'}
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por proveedor o referencia..."
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar cuentas por pagar"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('fecha')}>Fecha <SortIcon direction={getSortDirection('fecha')} /></th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('servicio_proveedor_nombre')}>Proveedor <SortIcon direction={getSortDirection('servicio_proveedor_nombre')} /></th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Ref. Factura</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('importe_total')}>Importe <SortIcon direction={getSortDirection('importe_total')} /></th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Pagar</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredAndSorted.map((t) => (
                <tr key={t.id_transaccion} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{formatDateForDisplay(t.fecha)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{t.servicio_proveedor_nombre}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{t.referencia_factura_proveedor || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 text-right">{formatCurrency(t.importe_total)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center space-x-1">
                    <button onClick={() => onMarcarPagado(t.id_transaccion, EstadoPago.EFECTIVO)} className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm transition-colors" title="Pagar con Efectivo">Efectivo</button>
                    <button onClick={() => onMarcarPagado(t.id_transaccion, EstadoPago.TRANSFERENCIA)} className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors" title="Pagar con Transferencia">Transf.</button>
                    <button onClick={() => onMarcarPagado(t.id_transaccion, EstadoPago.ZELLE)} className="px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-black rounded-md shadow-sm transition-colors" title="Pagar con Zelle">Zelle</button>
                  </td>
                   <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex space-x-2 justify-end">
                      <button onClick={() => onEdit(t)} className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 transition-colors" title="Modificar Compra">
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(t.id_transaccion)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Eliminar Compra">
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 dark:bg-slate-700">
                <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-slate-200">Total Deuda Pendiente:</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(totalDeuda)}</td>
                    <td colSpan={2}></td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
