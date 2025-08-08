

import React, { useState, useMemo } from 'react';
import { CartaTecnologica, Plato, ProductoBase, UnidadMedida, Configuracion } from '../types.js';
import { EditIcon, DeleteIcon, SortIcon, DocumentArrowDownIcon, AddIcon } from '../constants.js';

interface CartasTecnologicasListProps {
  cartas: CartaTecnologica[];
  platos: Plato[]; 
  productosBase: ProductoBase[]; 
  ums: UnidadMedida[]; 
  configuracion: Configuracion; 
  onAdd: () => void;
  onEdit: (carta: CartaTecnologica) => void;
  onDelete: (id: string) => void;
  onExportAllToPdf: (selected: CartaTecnologica[]) => Promise<void>; 
  isGeneratingAllRecetasPdf: boolean; 
}

type SortableCartaKey = 'nombre_plato' | 'num_ingredientes';

const CartasTecnologicasList: React.FC<CartasTecnologicasListProps> = ({ 
    cartas, platos, productosBase, ums, configuracion, 
    onAdd, onEdit, onDelete, onExportAllToPdf, isGeneratingAllRecetasPdf 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableCartaKey; direction: 'ascending' | 'descending' } | null>(null);
  const [selectedCartas, setSelectedCartas] = useState<Set<string>>(new Set());

  const getPlatoName = React.useCallback((platoId: string): string => {
    const plato = platos.find(p => p.id === platoId);
    return plato ? plato.nombre_plato : 'Plato Desconocido';
  }, [platos]);

  const processedCartas = useMemo(() => {
    return cartas.map(carta => ({
      ...carta,
      nombre_plato: getPlatoName(carta.plato_id),
      num_ingredientes: carta.ingredientes_receta.length,
    }));
  }, [cartas, getPlatoName]);

  const filteredAndSortedCartas = useMemo(() => {
    let sortableItems = [...processedCartas];

    if (searchTerm) {
      sortableItems = sortableItems.filter(carta =>
        carta.nombre_plato.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof typeof a];
        const valB = b[sortConfig.key as keyof typeof b];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * (sortConfig.direction === 'ascending' ? 1 : -1);
        }
        if (sortConfig.key === 'num_ingredientes') {
            const numA = Number(valA);
            const numB = Number(valB);
            if (numA < numB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (numA > numB) return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    } else {
        sortableItems.sort((a, b) => a.nombre_plato.localeCompare(b.nombre_plato));
    }
    return sortableItems;
  }, [processedCartas, searchTerm, sortConfig]);

  const requestSort = (key: SortableCartaKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirectionForColumn = (key: SortableCartaKey) => {
    if (!sortConfig || sortConfig.key !== key) return 'none';
    return sortConfig.direction;
  };
  
  const handleSelectCarta = (cartaId: string) => {
    setSelectedCartas(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(cartaId)) {
            newSelection.delete(cartaId);
        } else {
            newSelection.add(cartaId);
        }
        return newSelection;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedCartas(new Set(filteredAndSortedCartas.map(c => c.id)));
    } else {
        setSelectedCartas(new Set());
    }
  };

  const handleExportClick = () => {
    const cartasToExport = cartas.filter(c => selectedCartas.has(c.id));
    onExportAllToPdf(cartasToExport);
  };
  
  const isAllSelectedInView = selectedCartas.size > 0 && filteredAndSortedCartas.length > 0 && filteredAndSortedCartas.every(c => selectedCartas.has(c.id));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">Gestión de Recetas (Cartas Tecnológicas)</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
                onClick={onAdd}
                className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-orange-600 dark:hover:bg-orange-700"
                disabled={platos.length === 0}
                title={platos.length === 0 ? "Debe crear platos primero" : "Añadir nueva receta"}
            >
                <AddIcon className="w-5 h-5 mr-2" />
                Nueva Receta
            </button>
            <button
                onClick={handleExportClick}
                disabled={isGeneratingAllRecetasPdf || selectedCartas.size === 0}
                className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60"
                title="Exportar recetas seleccionadas a PDF"
            >
                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                {isGeneratingAllRecetasPdf ? 'Generando...' : `Exportar Seleccionadas (${selectedCartas.size})`}
            </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre de plato..."
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar recetas"
        />
      </div>
      
      {cartas.length === 0 && !searchTerm && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">
            No hay cartas tecnológicas (recetas) definidas. 
            {platos.length > 0 ? " Comience agregando una." : " Primero debe agregar platos en la sección 'Platos'."}
        </p>
      )}
      {filteredAndSortedCartas.length === 0 && searchTerm && (
         <p className="text-center text-gray-500 dark:text-slate-400 py-10">No se encontraron recetas con los criterios actuales.</p>
      )}

      {filteredAndSortedCartas.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-orange-50 dark:bg-orange-900/30">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">
                    <input 
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-slate-500 text-orange-600 focus:ring-orange-500 dark:bg-slate-700"
                        checked={isAllSelectedInView}
                        onChange={handleSelectAll}
                        aria-label="Seleccionar todas las recetas"
                    />
                 </th>
                <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50"
                    onClick={() => requestSort('nombre_plato')}
                    role="columnheader"
                    aria-sort={getSortDirectionForColumn('nombre_plato')}
                >
                  Plato
                  <SortIcon direction={getSortDirectionForColumn('nombre_plato')} />
                </th>
                <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50"
                    onClick={() => requestSort('num_ingredientes')}
                    role="columnheader"
                    aria-sort={getSortDirectionForColumn('num_ingredientes')}
                >
                  Nº de Ingredientes
                  <SortIcon direction={getSortDirectionForColumn('num_ingredientes')} />
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredAndSortedCartas.map((carta) => (
                <tr key={carta.id} className="hover:bg-orange-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <input 
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-slate-500 text-orange-600 focus:ring-orange-500 dark:bg-slate-700"
                        checked={selectedCartas.has(carta.id)}
                        onChange={() => handleSelectCarta(carta.id)}
                        aria-label={`Seleccionar receta para ${carta.nombre_plato}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                    {carta.nombre_plato}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {carta.num_ingredientes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex space-x-3 justify-end">
                      <button 
                        onClick={() => onEdit(cartas.find(c => c.id === carta.id)!)} 
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 transition-colors" 
                        title="Editar Carta Tecnológica"
                        aria-label={`Editar receta de ${carta.nombre_plato}`}
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onDelete(carta.id)} 
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" 
                        title="Eliminar Carta Tecnológica"
                        aria-label={`Eliminar receta de ${carta.nombre_plato}`}
                      >
                        <DeleteIcon className="w-5 h-5" />
                      </button>
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

export default CartasTecnologicasList;
