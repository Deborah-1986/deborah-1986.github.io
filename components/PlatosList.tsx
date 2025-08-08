

import React, { useState, useMemo } from 'react';
import { Plato } from '../types.js';
import { EditIcon, DeleteIcon, SortIcon, AddIcon, DocumentArrowDownIcon } from '../constants.js';

interface PlatosListProps {
  platos: Plato[];
  onEdit: (plato: Plato) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onExportPdf: (selectedPlatos: Plato[]) => Promise<void>;
  isGeneratingPdf: boolean;
}

type SortKey = keyof Plato;

const PlatosList: React.FC<PlatosListProps> = ({ platos, onEdit, onDelete, onAdd, onExportPdf, isGeneratingPdf }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const [selectedPlatos, setSelectedPlatos] = useState<Set<string>>(new Set());

  const filteredAndSortedPlatos = useMemo(() => {
    let sortableItems = [...platos];

    if (searchTerm) {
      sortableItems = sortableItems.filter(plato =>
        plato.nombre_plato.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plato.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [platos, searchTerm, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return 'none';
    }
    return sortConfig.direction;
  };
  
  const handleSelectPlato = (platoId: string) => {
    setSelectedPlatos(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(platoId)) {
            newSelection.delete(platoId);
        } else {
            newSelection.add(platoId);
        }
        return newSelection;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedPlatos(new Set(filteredAndSortedPlatos.map(p => p.id)));
    } else {
        setSelectedPlatos(new Set());
    }
  };

  const handleExportClick = () => {
    const platosToExport = platos.filter(p => selectedPlatos.has(p.id));
    onExportPdf(platosToExport);
  };
  
  const isAllSelectedInView = selectedPlatos.size > 0 && filteredAndSortedPlatos.length > 0 && filteredAndSortedPlatos.every(p => selectedPlatos.has(p.id));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">Platos</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
                onClick={onAdd}
                className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
                <AddIcon className="w-5 h-5 mr-2" />
                Añadir Plato
            </button>
             <button
                onClick={handleExportClick}
                disabled={isGeneratingPdf || selectedPlatos.size === 0}
                className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60"
                title="Exportar Platos Seleccionados a PDF"
            >
                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                {isGeneratingPdf ? 'Generando...' : `Exportar PDF (${selectedPlatos.size})`}
            </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o ID..."
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar platos"
        />
      </div>
      
      {platos.length === 0 && !searchTerm && (
         <p className="text-center text-gray-500 dark:text-slate-400 py-10">No hay platos definidos. Comience agregando uno.</p>
      )}
      {filteredAndSortedPlatos.length === 0 && searchTerm && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">No se encontraron platos con los criterios actuales.</p>
      )}

      {filteredAndSortedPlatos.length > 0 && (
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
                        aria-label="Seleccionar todos los platos"
                    />
                 </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50 transition-colors"
                  onClick={() => requestSort('nombre_plato')}
                  role="columnheader"
                  aria-sort={getSortDirection('nombre_plato')}
                >
                  Nombre Plato
                  <SortIcon direction={getSortDirection('nombre_plato')} />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50 transition-colors"
                  onClick={() => requestSort('id')}
                  role="columnheader"
                  aria-sort={getSortDirection('id')}
                >
                  ID (Interno)
                  <SortIcon direction={getSortDirection('id')} />
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredAndSortedPlatos.map((plato) => (
                <tr key={plato.id} className="hover:bg-orange-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <input 
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-slate-500 text-orange-600 focus:ring-orange-500 dark:bg-slate-700"
                        checked={selectedPlatos.has(plato.id)}
                        onChange={() => handleSelectPlato(plato.id)}
                        aria-label={`Seleccionar plato ${plato.nombre_plato}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{plato.nombre_plato}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{plato.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex space-x-3 justify-end">
                      <button 
                        onClick={() => onEdit(plato)} 
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 transition-colors" 
                        title="Editar Plato"
                        aria-label={`Editar ${plato.nombre_plato}`}
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onDelete(plato.id)} 
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" 
                        title="Eliminar Plato"
                        aria-label={`Eliminar ${plato.nombre_plato}`}
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

export default PlatosList;
