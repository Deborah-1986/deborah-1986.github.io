// DEPURACIÓN: agregar logs y manejo de errores para detectar problemas al renderizar la lista de productos base
import React, { useState, useMemo, useEffect } from "react";
import { ProductoBase, UnidadMedida } from "../types.js";
import { EditIcon, DeleteIcon, SortIcon, AddIcon } from "../constants.js";

interface ProductosBaseListProps {
  productosBase: ProductoBase[];
  ums: UnidadMedida[];
  onEdit: (producto: ProductoBase) => void;
  onDelete: (id: string) => void;
  onAdd: () => void; // New prop
}

type SortKey = keyof ProductoBase | "um_predeterminada_nombre";

const ProductosBaseList: React.FC<ProductosBaseListProps> = ({
  productosBase = [],
  ums = [],
  onEdit,
  onDelete,
  onAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>(null);

  // Protección: si productosBase o ums son undefined, usar array vacío
  const safeProductosBase: ProductoBase[] = Array.isArray(productosBase)
    ? productosBase
    : [];
  const safeUms: UnidadMedida[] = Array.isArray(ums) ? ums : [];

  // Estado para forzar render tras cambios en productosBase
  const [forceUpdate, setForceUpdate] = useState(0);
  useEffect(() => {
    setForceUpdate((n) => n + 1);
    // eslint-disable-next-line
  }, [safeProductosBase.length]);

  const getUmName = React.useCallback(
    (umId: string | undefined): string => {
      if (!umId) return "N/A";
      const um = safeUms.find((u: UnidadMedida) => u.id === umId);
      return um ? um.unidad_nombre : "N/A";
    },
    [safeUms]
  );

  const filteredAndSortedProductos = useMemo(() => {
    let sortableItems = safeProductosBase.map((p: ProductoBase) => ({
      ...p,
      um_predeterminada_nombre: getUmName(p.um_predeterminada),
    }));

    if (searchTerm) {
      sortableItems = sortableItems.filter(
        (producto) =>
          (producto.nombre_producto || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (producto.um_predeterminada_nombre || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (producto.id || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Ensure type safety for direct property access
        const valA = a[sortConfig.key as keyof typeof a] ?? "";
        const valB = b[sortConfig.key as keyof typeof b] ?? "";

        if (valA < valB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
    // forceUpdate como dependencia para forzar recalculo
  }, [
    safeProductosBase,
    safeUms,
    searchTerm,
    sortConfig,
    getUmName,
    forceUpdate,
  ]);

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
          Productos Base (Ingredientes)
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-orange-600 dark:hover:bg-orange-700"
        >
          <AddIcon className="w-5 h-5 mr-2" />
          Añadir Producto Base
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, UM o ID..."
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar productos base"
        />
      </div>

      {productosBase.length === 0 && !searchTerm && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">
          No hay productos base definidos. Comience agregando uno.
        </p>
      )}
      {filteredAndSortedProductos.length === 0 && searchTerm && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">
          No se encontraron productos base con los criterios actuales.
        </p>
      )}

      {filteredAndSortedProductos.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-orange-50 dark:bg-orange-900/30">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50 transition-colors"
                  onClick={() => requestSort("nombre_producto")}
                  role="columnheader"
                  {...(getSortDirection("nombre_producto") === "ascending"
                    ? { "aria-sort": "ascending" }
                    : getSortDirection("nombre_producto") === "descending"
                    ? { "aria-sort": "descending" }
                    : {})}
                >
                  Nombre Producto
                  <SortIcon direction={getSortDirection("nombre_producto")} />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50 transition-colors"
                  onClick={() => requestSort("um_predeterminada_nombre")}
                  role="columnheader"
                  {...(getSortDirection("um_predeterminada_nombre") ===
                  "ascending"
                    ? { "aria-sort": "ascending" }
                    : getSortDirection("um_predeterminada_nombre") ===
                      "descending"
                    ? { "aria-sort": "descending" }
                    : {})}
                >
                  UM Predeterminada
                  <SortIcon
                    direction={getSortDirection("um_predeterminada_nombre")}
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50 transition-colors"
                  onClick={() => requestSort("id")}
                  role="columnheader"
                  {...(getSortDirection("id") === "ascending"
                    ? { "aria-sort": "ascending" }
                    : getSortDirection("id") === "descending"
                    ? { "aria-sort": "descending" }
                    : {})}
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
              {filteredAndSortedProductos.map((producto) => (
                <tr
                  key={producto.id}
                  className="hover:bg-orange-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                    {producto.nombre_producto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {producto.um_predeterminada_nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {producto.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex space-x-3 justify-end">
                      <button
                        onClick={() => {
                          const prod = safeProductosBase.find(
                            (p: ProductoBase) => p.id === producto.id
                          );
                          if (prod) onEdit(prod);
                        }}
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 transition-colors"
                        title="Editar Producto"
                        aria-label={`Editar ${producto.nombre_producto}`}
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(producto.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Eliminar Producto"
                        aria-label={`Eliminar ${producto.nombre_producto}`}
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

export default ProductosBaseList;
