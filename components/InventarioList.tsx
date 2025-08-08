import React, { useState, useMemo } from "react";
import {
  InventarioItem,
  ProductoBase,
  UnidadMedida,
  Configuracion,
} from "../types.js";
import {
  EditIcon,
  SortIcon,
  DocumentArrowDownIcon,
  DeleteIcon,
} from "../constants.js";

interface InventarioListProps {
  inventarioItems: InventarioItem[];
  productosBase: ProductoBase[];
  ums: UnidadMedida[];
  onEdit: (inventarioItem: InventarioItem) => void;
  onDeleteInventarioEntrada: (producto_base_id: string) => void;
  onExportPdf: () => Promise<void>;
  isGeneratingPdf: boolean;
  configuracion: Configuracion;
}

type SortableInventarioKey =
  | "nombre_producto"
  | "stock_actual"
  | "stock_minimo"
  | "precio_promedio_ponderado"
  | "valor_total_inventario";

const InventarioList: React.FC<InventarioListProps> = ({
  inventarioItems,
  productosBase,
  ums,
  onEdit,
  onDeleteInventarioEntrada,
  onExportPdf,
  isGeneratingPdf,
  configuracion,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortableInventarioKey;
    direction: "ascending" | "descending";
  } | null>({ key: "nombre_producto", direction: "ascending" });

  const getProductoName = React.useCallback(
    (producto_base_id: string): string => {
      const producto = productosBase.find((p) => p.id === producto_base_id);
      return producto ? producto.nombre_producto : "Desconocido";
    },
    [productosBase]
  );

  const getUmName = React.useCallback(
    (unidad_medida_id: string): string => {
      const um = ums.find((u) => u.id === unidad_medida_id);
      return um ? um.unidad_nombre : "N/A";
    },
    [ums]
  );

  const processedInventario = useMemo(() => {
    return inventarioItems.map((item) => {
      const stock_actual = item.entradas - item.salidas;
      return {
        ...item,
        nombre_producto: getProductoName(item.producto_base_id),
        stock_actual,
        valor_total_inventario: stock_actual * item.precio_promedio_ponderado,
      };
    });
  }, [inventarioItems, getProductoName]);

  const filteredAndSortedInventario = useMemo(() => {
    let sortableItems = [...processedInventario];

    if (searchTerm) {
      sortableItems = sortableItems.filter((item) =>
        item.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof typeof a];
        const valB = b[sortConfig.key as keyof typeof b];

        if (typeof valA === "string" && typeof valB === "string") {
          return (
            valA.localeCompare(valB) *
            (sortConfig.direction === "ascending" ? 1 : -1)
          );
        }
        if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [processedInventario, searchTerm, sortConfig]);

  const requestSort = (key: SortableInventarioKey) => {
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

  const getSortDirectionForColumn = (key: SortableInventarioKey) => {
    if (!sortConfig || sortConfig.key !== key) return "none";
    return sortConfig.direction;
  };

  if (inventarioItems.length === 0 && !searchTerm) {
    return (
      <p className="text-center text-gray-500 dark:text-slate-400 py-10">
        El inventario está vacío o no hay productos configurados para
        seguimiento. Agregue productos base primero.
      </p>
    );
  }

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) return `N/A`;
    return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">
          Gestión de Inventario
        </h2>
        <button
          onClick={onExportPdf}
          disabled={isGeneratingPdf || inventarioItems.length === 0}
          className="flex items-center bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60"
          title="Exportar Inventario a PDF"
        >
          <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
          {isGeneratingPdf ? "Generando..." : "Exportar PDF"}
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre de producto..."
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar en inventario"
        />
      </div>
      {filteredAndSortedInventario.length === 0 && searchTerm && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">
          No se encontraron productos en el inventario con los criterios
          actuales.
        </p>
      )}
      {filteredAndSortedInventario.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-amber-500 dark:bg-amber-700">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white dark:text-amber-100 uppercase tracking-wider cursor-pointer hover:bg-amber-600 dark:hover:bg-amber-800"
                  onClick={() => requestSort("nombre_producto")}
                  role="columnheader"
                  aria-sort={getSortDirectionForColumn("nombre_producto")}
                >
                  Producto{" "}
                  <SortIcon
                    direction={getSortDirectionForColumn("nombre_producto")}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white dark:text-amber-100 uppercase tracking-wider"
                >
                  Unidad
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-white dark:text-amber-100 uppercase tracking-wider cursor-pointer hover:bg-amber-600 dark:hover:bg-amber-800"
                  onClick={() => requestSort("stock_actual")}
                  role="columnheader"
                  aria-sort={getSortDirectionForColumn("stock_actual")}
                >
                  Stock Actual{" "}
                  <SortIcon
                    direction={getSortDirectionForColumn("stock_actual")}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-white dark:text-amber-100 uppercase tracking-wider cursor-pointer hover:bg-amber-600 dark:hover:bg-amber-800"
                  onClick={() => requestSort("stock_minimo")}
                  role="columnheader"
                  aria-sort={getSortDirectionForColumn("stock_minimo")}
                >
                  Stock Mínimo{" "}
                  <SortIcon
                    direction={getSortDirectionForColumn("stock_minimo")}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-white dark:text-amber-100 uppercase tracking-wider cursor-pointer hover:bg-amber-600 dark:hover:bg-amber-800"
                  onClick={() => requestSort("precio_promedio_ponderado")}
                  role="columnheader"
                  aria-sort={getSortDirectionForColumn(
                    "precio_promedio_ponderado"
                  )}
                >
                  Precio Prom.{" "}
                  <SortIcon
                    direction={getSortDirectionForColumn(
                      "precio_promedio_ponderado"
                    )}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-white dark:text-amber-100 uppercase tracking-wider cursor-pointer hover:bg-amber-600 dark:hover:bg-amber-800"
                  onClick={() => requestSort("valor_total_inventario")}
                  role="columnheader"
                  aria-sort={getSortDirectionForColumn(
                    "valor_total_inventario"
                  )}
                >
                  Valor Total{" "}
                  <SortIcon
                    direction={getSortDirectionForColumn(
                      "valor_total_inventario"
                    )}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-white dark:text-amber-100 uppercase tracking-wider"
                >
                  Alerta
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-white dark:text-amber-100 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredAndSortedInventario.map((item) => {
                const alerta = item.stock_actual < item.stock_minimo;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-amber-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150 ${
                      alerta
                        ? "bg-red-100 dark:bg-red-900/30 hover:bg-red-200/50 dark:hover:bg-red-800/40"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                      {item.nombre_producto}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {getUmName(item.unidad_medida_id)}
                    </td>
                    <td
                      className={`px-4 py-3 whitespace-nowrap text-sm text-right ${
                        item.stock_actual < 0
                          ? "text-red-600 dark:text-red-400 font-semibold"
                          : "text-gray-700 dark:text-slate-300"
                      }`}
                    >
                      {item.stock_actual.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 text-right">
                      {item.stock_minimo.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 text-right">
                      {formatCurrency(item.precio_promedio_ponderado)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 font-semibold text-right">
                      {formatCurrency(item.valor_total_inventario)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      {alerta ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100">
                          BAJO STOCK
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() =>
                            onEdit(
                              inventarioItems.find((i) => i.id === item.id)!
                            )
                          }
                          className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
                          title="Editar Inventario"
                          aria-label={`Editar inventario de ${item.nombre_producto}`}
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            onDeleteInventarioEntrada(item.producto_base_id)
                          }
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Eliminar entrada de inventario"
                          aria-label={`Eliminar entrada de inventario de ${item.nombre_producto}`}
                        >
                          <DeleteIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventarioList;
