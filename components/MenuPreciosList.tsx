import React, { useState, useMemo, useCallback } from "react";
import { MenuPrecioItem, Plato, Configuracion } from "../types";
import {
  EditIcon,
  DeleteIcon,
  DocumentArrowDownIcon,
  AddIcon,
  SortIcon,
} from "../constants";

interface MenuPreciosListProps {
  menuPrecios: MenuPrecioItem[];
  platos: (Plato & { nombre_plato: string })[];
  onAdd: () => void;
  onEdit: (menuPrecio: MenuPrecioItem) => void;
  onDelete: (id: string) => void;
  // configuracion: Configuracion; // Eliminada porque no se usa
  onExportMenuPdf: (selectedItems: MenuPrecioItem[]) => Promise<void>;
  isGeneratingMenuPdf: boolean;
}

type SortableMenuKey =
  | "nombre_plato"
  | "precio_cocina"
  | "precio_bar"
  | "precio_restaurante"
  | "precio_mandado"
  | "precio_catauro"
  | "precio_zelle_mandado"
  | "precio_zelle_restaurante";

function formatPrice(value?: number) {
  if (typeof value !== "number" || isNaN(value)) return "N/A";
  return value.toLocaleString("es-VE", {
    style: "currency",
    currency: "VES",
    minimumFractionDigits: 2,
  });
}

const MenuPreciosList: React.FC<MenuPreciosListProps> = ({
  menuPrecios,
  platos,
  onAdd,
  onDelete,
  onEdit,
  // configuracion, // Eliminada porque no se usa
  onExportMenuPdf,
  isGeneratingMenuPdf,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: SortableMenuKey;
    direction: "ascending" | "descending";
  } | null>(null);

  const platoNames = useMemo(() => {
    return platos.reduce((acc: { [key: string]: string }, plato) => {
      acc[plato.id] = plato.nombre_plato;
      return acc;
    }, {});
  }, [platos]);

  const getPlatoName = useCallback(
    (platoId: string): string => platoNames[platoId] || "Plato Desconocido",
    [platoNames]
  );

  const filteredAndSortedMenuPrecios = useMemo(() => {
    const processedMenuPrecios = menuPrecios.map((mp) => ({
      ...mp,
      nombre_plato: getPlatoName(mp.plato_id),
    }));
    let sortableItems = [...processedMenuPrecios];
    if (searchTerm) {
      sortableItems = sortableItems.filter((item) =>
        item.nombre_plato.toLowerCase().includes(searchTerm.toLowerCase())
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
        if (typeof valA === "number" && typeof valB === "number") {
          return (
            (valA - valB) * (sortConfig.direction === "ascending" ? 1 : -1)
          );
        }
        return 0;
      });
    }
    return sortableItems;
  }, [menuPrecios, getPlatoName, searchTerm, sortConfig]);

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(new Set(filteredAndSortedMenuPrecios.map((p) => p.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleExportClick = () => {
    const itemsToExport = menuPrecios.filter((p) => selectedItems.has(p.id));
    onExportMenuPdf(itemsToExport);
  };

  const isAllSelectedInView =
    selectedItems.size > 0 &&
    filteredAndSortedMenuPrecios.length > 0 &&
    filteredAndSortedMenuPrecios.every((p) => selectedItems.has(p.id));

  const columns: {
    label: string;
    key: SortableMenuKey | null;
    isPrice?: boolean;
    className?: string;
  }[] = [
    { label: "Plato", key: "nombre_plato", className: "w-1/4" },
    { label: "P. Cocina", key: "precio_cocina", isPrice: true },
    { label: "P. Bar", key: "precio_bar", isPrice: true },
    { label: "P. Restaurante", key: "precio_restaurante", isPrice: true },
    { label: "P. Mandado", key: "precio_mandado", isPrice: true },
    { label: "P. Catauro", key: "precio_catauro", isPrice: true },
    { label: "P. Zelle Rest.", key: "precio_zelle_restaurante", isPrice: true },
    { label: "P. Zelle Mand.", key: "precio_zelle_mandado", isPrice: true },
  ];

  function requestSort(key: SortableMenuKey) {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return {
          key,
          direction:
            prev.direction === "ascending" ? "descending" : "ascending",
        };
      }
      return { key, direction: "ascending" };
    });
  }

  function getSortDirectionForColumn(key: SortableMenuKey) {
    if (!sortConfig || sortConfig.key !== key) return undefined;
    return sortConfig.direction;
  }

  const handleDeleteClick = (id: string) => {
    onDelete(id);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">
          Gestión de Precios del Menú
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={onAdd}
            disabled={platos.length === 0}
            className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 dark:bg-amber-600 dark:hover:bg-amber-700 disabled:opacity-50"
            title={
              platos.length === 0
                ? "Debe crear platos primero"
                : "Añadir nuevo precio a un plato"
            }
          >
            <AddIcon className="w-5 h-5 mr-2" />
            Añadir Precio
          </button>
          <button
            onClick={handleExportClick}
            disabled={isGeneratingMenuPdf || selectedItems.size === 0}
            className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60"
            title="Exportar Menú a PDF"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            {isGeneratingMenuPdf
              ? "Generando..."
              : `Exportar Seleccionados (${selectedItems.size})`}
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
          aria-label="Buscar precios de plato"
        />
      </div>

      {menuPrecios.length === 0 && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">
          No hay precios de menú definidos. Use el botón 'Añadir Precio' para
          agregar nuevos precios.
        </p>
      )}
      {menuPrecios.length > 0 && (
        <div
          className="overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg max-h-[65vh] scroll-bottom webkit-overflow-touch scrollbar-gutter"
          id="scroll-bottom"
        >
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 table-fixed w-full auto-table-layout">
            <thead className="bg-amber-500 dark:bg-amber-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-slate-500 text-orange-600 focus:ring-orange-500 dark:bg-slate-700"
                    checked={isAllSelectedInView}
                    onChange={handleSelectAll}
                    aria-label="Seleccionar todos los precios"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.label}
                    scope="col"
                    className={`px-3 py-3 text-left text-xs font-medium text-white dark:text-amber-100 uppercase tracking-wider ${
                      col.className || ""
                    } ${
                      col.key
                        ? "cursor-pointer hover:bg-amber-600 dark:hover:bg-amber-800"
                        : ""
                    }`}
                    onClick={() => col.key && requestSort(col.key)}
                    role="columnheader"
                    aria-sort={
                      col.key && sortConfig && sortConfig.key === col.key
                        ? sortConfig.direction === "ascending"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    // Agrega estas clases a tu CSS global o tailwind.css si no existen:
                    // .webkit-overflow-touch { -webkit-overflow-scrolling: touch; }
                    // .scrollbar-gutter { scrollbar-gutter: stable both-edges; }
                    // .auto-table-layout { table-layout: auto; }
                  >
                    {col.label}
                    {col.key && (
                      <SortIcon
                        direction={getSortDirectionForColumn(col.key)}
                      />
                    )}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-white dark:text-amber-100 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredAndSortedMenuPrecios.map((mp) => (
                <tr
                  key={mp.id}
                  className="hover:bg-amber-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-slate-500 text-orange-600 focus:ring-orange-500 dark:bg-slate-700"
                      checked={selectedItems.has(mp.id)}
                      onChange={() => handleSelectItem(mp.id)}
                      aria-label={`Seleccionar precios para ${mp.nombre_plato}`}
                    />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key || col.label}
                      className="px-3 py-4 text-sm text-gray-500 dark:text-slate-400 break-words"
                    >
                      {col.key === "nombre_plato" ? (
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          {mp.nombre_plato}
                        </span>
                      ) : col.isPrice && col.key ? (
                        formatPrice(
                          mp[col.key as keyof typeof mp] as number | undefined
                        )
                      ) : col.key &&
                        mp[col.key as keyof typeof mp] !== undefined ? (
                        String(mp[col.key as keyof typeof mp])
                      ) : (
                        "N/A"
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex space-x-3 justify-end">
                      <button
                        onClick={() => onEdit(mp)}
                        className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
                        title="Editar Precios"
                        aria-label={`Editar precios de ${mp.nombre_plato}`}
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(mp.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Eliminar Precios del Menú"
                        aria-label={`Eliminar precios de ${mp.nombre_plato}`}
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

export default MenuPreciosList;
