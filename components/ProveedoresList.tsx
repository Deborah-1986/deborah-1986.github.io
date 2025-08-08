import React, { useState, useMemo } from "react";
import { Proveedor } from "../types.js";
import { EditIcon, DeleteIcon, SortIcon, AddIcon } from "../constants.js";

interface ProveedoresListProps {
  proveedores: Proveedor[];
  onEdit: (proveedor: Proveedor) => void;
  onDelete: (id: string) => void;
  onAdd: () => void; // New prop
}

type SortKey = keyof Proveedor;

const ProveedoresList: React.FC<ProveedoresListProps> = ({
  proveedores,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>(null);

  const filteredAndSortedProveedores = useMemo(() => {
    let sortableItems = [...proveedores];

    if (searchTerm) {
      sortableItems = sortableItems.filter(
        (proveedor) =>
          proveedor.nombre_proveedor
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proveedor.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [proveedores, searchTerm, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return "none";
    }
    return sortConfig.direction;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">
          Proveedores
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-orange-600 dark:hover:bg-orange-700"
        >
          <AddIcon className="w-5 h-5 mr-2" />
          Añadir Proveedor
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o ID..."
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar proveedores"
        />
      </div>

      {proveedores.length === 0 && !searchTerm && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">
          No hay proveedores definidos. Comience agregando uno.
        </p>
      )}
      {filteredAndSortedProveedores.length === 0 && searchTerm && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">
          No se encontraron proveedores con los criterios actuales.
        </p>
      )}

      {filteredAndSortedProveedores.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-orange-50 dark:bg-orange-900/30">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50 transition-colors"
                  onClick={() => requestSort("nombre_proveedor")}
                  role="columnheader"
                  aria-sort={getSortDirection("nombre_proveedor")}
                >
                  Nombre Proveedor
                  <SortIcon direction={getSortDirection("nombre_proveedor")} />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50 transition-colors"
                  onClick={() => requestSort("id")}
                  role="columnheader"
                  aria-sort={getSortDirection("id")}
                >
                  ID (Interno)
                  <SortIcon direction={getSortDirection("id")} />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredAndSortedProveedores.map((proveedor) => (
                <tr
                  key={proveedor.id}
                  className="hover:bg-orange-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                    {proveedor.nombre_proveedor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {proveedor.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex space-x-3 justify-end">
                      <button
                        onClick={() => onEdit(proveedor)}
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 transition-colors"
                        title="Editar Proveedor"
                        aria-label={`Editar ${proveedor.nombre_proveedor}`}
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(proveedor.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Eliminar Proveedor"
                        aria-label={`Eliminar ${proveedor.nombre_proveedor}`}
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

export default ProveedoresList;
