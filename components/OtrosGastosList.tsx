import React, { useState, useMemo, useCallback } from "react";
import { OtroGasto, Configuracion } from "../types.js";
import {
  EditIcon,
  DeleteIcon,
  SortIcon,
  AddIcon,
  DocumentArrowDownIcon,
} from "../constants.js";

interface OtrosGastosListProps {
  otrosGastos: OtroGasto[];
  onAdd: () => void;
  onEdit: (gasto: OtroGasto) => void;
  onDelete: (id: string) => void;
  configuracion: Configuracion;
  onExportPdf: (
    filteredGastos: OtroGasto[],
    filters?: { fechaDesde?: string; fechaHasta?: string }
  ) => Promise<void>;
}

type SortKey = keyof OtroGasto | "importe";

export const OtrosGastosList: React.FC<OtrosGastosListProps> = ({
  otrosGastos,
  onAdd,
  onEdit,
  onDelete,
  configuracion,
  onExportPdf,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>({ key: "fecha", direction: "descending" });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const getTodayDateString = () => new Date().toISOString().split("T")[0];

  const getInitialDateRange = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const currentDay = today.toISOString().split("T")[0];
    return { from: firstDayOfMonth, to: currentDay };
  };
  const [fechaDesde, setFechaDesde] = useState(getInitialDateRange().from);
  const [fechaHasta, setFechaHasta] = useState(getInitialDateRange().to);

  const formatCurrency = useCallback(
    (value: number) => {
      return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
    },
    [configuracion.simbolo_moneda]
  );

  const formatDateForDisplay = useCallback((dateString: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(
      dateString.length === 10 ? `${dateString}T00:00:00Z` : dateString
    );
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // getUTCMonth is 0-indexed
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const filteredAndSortedGastos = useMemo(() => {
    let sortableItems = [...otrosGastos];
    const dateFrom = new Date(`${fechaDesde}T00:00:00.000Z`);
    const dateTo = new Date(`${fechaHasta}T23:59:59.999Z`);

    sortableItems = sortableItems.filter((gasto) => {
      if (!gasto.fecha) return false;
      const gastoDate = new Date(gasto.fecha); // gasto.fecha is already an ISO string
      return gastoDate >= dateFrom && gastoDate <= dateTo;
    });

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      sortableItems = sortableItems.filter(
        (gasto) =>
          gasto.descripcion.toLowerCase().includes(lowerSearchTerm) ||
          gasto.categoria.toLowerCase().includes(lowerSearchTerm) ||
          formatDateForDisplay(gasto.fecha).includes(lowerSearchTerm) ||
          (gasto.notas &&
            gasto.notas.toLowerCase().includes(lowerSearchTerm)) ||
          gasto.id.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key as keyof OtroGasto];
        let valB = b[sortConfig.key as keyof OtroGasto];

        if (sortConfig.key === "fecha") {
          const dateA = new Date(a.fecha).getTime();
          const dateB = new Date(b.fecha).getTime();
          valA = dateA as any;
          valB = dateB as any;
        }

        if (typeof valA === "number" && typeof valB === "number") {
          if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
          if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        }

        const strA = String(valA ?? "").toLowerCase();
        const strB = String(valB ?? "").toLowerCase();
        return (
          strA.localeCompare(strB) *
          (sortConfig.direction === "ascending" ? 1 : -1)
        );
      });
    }
    return sortableItems;
  }, [
    otrosGastos,
    searchTerm,
    sortConfig,
    configuracion.simbolo_moneda,
    formatDateForDisplay,
    fechaDesde,
    fechaHasta,
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

  const handleExport = async () => {
    if (filteredAndSortedGastos.length === 0) {
      alert("No hay gastos para exportar con los filtros actuales.");
      return;
    }
    setIsGeneratingPdf(true);
    await onExportPdf(filteredAndSortedGastos, { fechaDesde, fechaHasta });
    setIsGeneratingPdf(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">
          Registro de Otros Gastos
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={onAdd}
            className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            <AddIcon className="w-5 h-5 mr-2" />
            Registrar Nuevo Gasto
          </button>
          <button
            onClick={handleExport}
            disabled={isGeneratingPdf || filteredAndSortedGastos.length === 0}
            className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            {isGeneratingPdf ? "Generando..." : "Exportar a PDF"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md border dark:border-slate-600">
        <div>
          <label
            htmlFor="og-fechaDesde"
            className="block text-sm font-medium text-gray-600 dark:text-slate-300"
          >
            Desde:
          </label>
          <input
            type="date"
            id="og-fechaDesde"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="mt-1 block w-full p-2 border-gray-300 dark:border-slate-500 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-600 dark:text-slate-100"
            max={getTodayDateString()}
          />
        </div>
        <div>
          <label
            htmlFor="og-fechaHasta"
            className="block text-sm font-medium text-gray-600 dark:text-slate-300"
          >
            Hasta:
          </label>
          <input
            type="date"
            id="og-fechaHasta"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="mt-1 block w-full p-2 border-gray-300 dark:border-slate-500 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-600 dark:text-slate-100"
            max={getTodayDateString()}
          />
        </div>
        <div className="md:col-span-1 flex items-end">
          {/* Placeholder for button if needed, or adjust grid for better alignment */}
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por descripción, categoría, fecha..."
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar otros gastos"
        />
      </div>
      {filteredAndSortedGastos.length === 0 && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">
          No se encontraron gastos con los criterios actuales.
        </p>
      )}
      {filteredAndSortedGastos.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-orange-50 dark:bg-orange-900/30">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50"
                  onClick={() => requestSort("fecha")}
                  role="columnheader"
                  aria-sort={getSortDirection("fecha")}
                >
                  Fecha <SortIcon direction={getSortDirection("fecha")} />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50"
                  onClick={() => requestSort("descripcion")}
                  role="columnheader"
                  aria-sort={getSortDirection("descripcion")}
                >
                  Descripción{" "}
                  <SortIcon direction={getSortDirection("descripcion")} />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50"
                  onClick={() => requestSort("categoria")}
                  role="columnheader"
                  aria-sort={getSortDirection("categoria")}
                >
                  Categoría{" "}
                  <SortIcon direction={getSortDirection("categoria")} />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50"
                  onClick={() => requestSort("importe")}
                  role="columnheader"
                  aria-sort={getSortDirection("importe")}
                >
                  Importe <SortIcon direction={getSortDirection("importe")} />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider"
                >
                  Notas
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredAndSortedGastos.map((gasto) => (
                <tr
                  key={gasto.id}
                  className="hover:bg-orange-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {formatDateForDisplay(gasto.fecha)}
                  </td>
                  <td
                    className="px-4 py-3 whitespace-normal text-sm font-medium text-gray-900 dark:text-slate-100 max-w-xs truncate"
                    title={gasto.descripcion}
                  >
                    {gasto.descripcion}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {gasto.categoria}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 text-right">
                    {formatCurrency(gasto.importe)}
                  </td>
                  <td
                    className="px-4 py-3 whitespace-normal text-xs text-gray-500 dark:text-slate-400 max-w-xs truncate"
                    title={gasto.notas}
                  >
                    {gasto.notas || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => onEdit(gasto)}
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 transition-colors"
                        title="Editar Gasto"
                        aria-label={`Editar ${gasto.descripcion}`}
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(gasto.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Eliminar Gasto"
                        aria-label={`Eliminar ${gasto.descripcion}`}
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
