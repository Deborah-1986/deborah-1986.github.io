// components/UnidadesYConversionesList.tsx
import React, { useCallback } from 'react';
import { UnidadMedida, ConversionUnidad, ProductoBase } from '../types.js';
import { EditIcon, DeleteIcon, AddIcon } from '../constants.js';

interface UnidadesYConversionesListProps {
  ums: UnidadMedida[];
  conversiones: ConversionUnidad[];
  productosBase: ProductoBase[];
  onAddUm: () => void;
  onEditUm: (um: UnidadMedida) => void;
  onDeleteUm: (id: string) => void;
  onAddConversion: () => void;
  onEditConversion: (conversion: ConversionUnidad) => void;
  onDeleteConversion: (id: string) => void;
}

const UnidadesYConversionesList: React.FC<UnidadesYConversionesListProps> = ({
  ums, conversiones, productosBase,
  onAddUm, onEditUm, onDeleteUm,
  onAddConversion, onEditConversion, onDeleteConversion
}) => {

  const getUmName = useCallback((umId: string): string => ums.find(u => u.id === umId)?.unidad_nombre || 'N/A', [ums]);
  const getProductoName = useCallback((prodId?: string): string => prodId ? (productosBase.find(p => p.id === prodId)?.nombre_producto || 'N/A') : 'Genérica', [productosBase]);

  return (
    <div className="space-y-8">
      {/* Unidades de Medida Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Unidades de Medida</h3>
          <button onClick={onAddUm} className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors">
            <AddIcon className="w-5 h-5 mr-2" /> Añadir Unidad
          </button>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-orange-50 dark:bg-orange-900/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {ums.map(um => (
                <tr key={um.id} className="hover:bg-orange-50/50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{um.unidad_nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex space-x-3 justify-end">
                      <button onClick={() => onEditUm(um)} className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"><EditIcon /></button>
                      <button onClick={() => onDeleteUm(um.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><DeleteIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversiones Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Reglas de Conversión</h3>
          <button onClick={onAddConversion} className="flex items-center bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors">
            <AddIcon className="w-5 h-5 mr-2" /> Añadir Conversión
          </button>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-teal-50 dark:bg-teal-900/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 dark:text-teal-300 uppercase tracking-wider">Descripción de la Conversión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 dark:text-teal-300 uppercase tracking-wider">Producto (Si aplica)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-teal-700 dark:text-teal-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {conversiones.map(c => (
                <tr key={c.id} className="hover:bg-teal-50/50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                    1 {getUmName(c.unidad_origen_id)} = {c.factor} {getUmName(c.unidad_destino_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{getProductoName(c.producto_base_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex space-x-3 justify-end">
                      <button onClick={() => onEditConversion(c)} className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200"><EditIcon /></button>
                      <button onClick={() => onDeleteConversion(c.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><DeleteIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UnidadesYConversionesList;