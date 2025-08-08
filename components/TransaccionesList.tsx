// components/TransaccionesList.tsx

import React, { useState, useMemo } from "react";
import {
  Transaccion,
  Plato,
  ProductoBase,
  UnidadMedida,
  Configuracion,
  TipoTransaccion,
  EstadoPago,
} from "../types.js";
import {
  SortIcon,
  DocumentArrowDownIcon,
  EditIcon,
  DeleteIcon,
} from "../constants.js";
import * as DataManager from "../DataManager.js";

interface TransaccionesListProps {
  transacciones: Transaccion[];
  platos: Plato[];
  productosBase: ProductoBase[];
  ums: UnidadMedida[];
  configuracion: Configuracion;
  itemsPerPage?: number;
  showPagination?: boolean;
  onExportPdf: (
    filteredTransacciones: Transaccion[],
    filters: {
      fechaDesde: string;
      fechaHasta: string;
      tipo: TipoTransaccion | "TODAS";
    }
  ) => Promise<void>;
  onEdit?: (transaccion: Transaccion) => void;
  onDelete?: (id_transaccion: string) => void;
}

type SortableTransaccionKeys =
  | "fecha"
  | "tipo_transaccion"
  | "producto_plato_nombre"
  | "importe_total"
  | "costo_total_transaccion"
  | "utilidad_transaccion"
  | "servicio_proveedor_nombre"
  | "estado_pago"
  | "descripcion_pago_deuda_o_notas";

const TransaccionesListComponent: React.FC<TransaccionesListProps> = ({
  transacciones,
  platos,
  productosBase,
  ums,
  configuracion,
  itemsPerPage = 20,
  showPagination = true,
  onExportPdf,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortableTransaccionKeys;
    direction: "ascending" | "descending";
  } | null>({ key: "fecha", direction: "descending" });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [tipoTransaccionFilter, setTipoTransaccionFilter] = useState<
    TipoTransaccion | "TODAS"
  >("TODAS");

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

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return `N/A`;
    return `${value.toFixed(2)}`;
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: undefined,
    });
  };

  const formatTimeForDisplay = (dateString: string): string => {
    if (!dateString || !dateString.includes("T")) return "N/A";
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: undefined,
    });
  };

  const filteredAndSortedTransacciones = useMemo(() => {
    let items = [...transacciones];

    const dateFrom = new Date(`${fechaDesde}T00:00:00.000Z`);
    const dateTo = new Date(`${fechaHasta}T23:59:59.999Z`);

    items = items.filter((t) => {
      if (!t.fecha) return false;
      const tDate = new Date(t.fecha); // t.fecha is already an ISO string
      return tDate >= dateFrom && tDate <= dateTo;
    });

    if (tipoTransaccionFilter !== "TODAS") {
      items = items.filter((t) => t.tipo_transaccion === tipoTransaccionFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      items = items.filter(
        (t) =>
          (t.producto_plato_nombre &&
            t.producto_plato_nombre.toLowerCase().includes(lowerSearchTerm)) ||
          (t.servicio_proveedor_nombre &&
            t.servicio_proveedor_nombre
              .toLowerCase()
              .includes(lowerSearchTerm)) ||
          (t.tipo_transaccion &&
            t.tipo_transaccion.toLowerCase().includes(lowerSearchTerm)) ||
          (t.estado_pago &&
            t.estado_pago.toLowerCase().includes(lowerSearchTerm)) ||
          (t.nombre_deudor &&
            t.nombre_deudor.toLowerCase().includes(lowerSearchTerm)) ||
          (t.notas && t.notas.toLowerCase().includes(lowerSearchTerm)) ||
          (t.descripcion_pago_deuda &&
            t.descripcion_pago_deuda.toLowerCase().includes(lowerSearchTerm)) ||
          t.id_transaccion.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (sortConfig !== null) {
      items.sort((a, b) => {
        let valA = a[sortConfig.key as keyof Transaccion];
        let valB = b[sortConfig.key as keyof Transaccion];

        if (sortConfig.key === "descripcion_pago_deuda_o_notas") {
          valA = (a.descripcion_pago_deuda || a.notas || "") as any;
          valB = (b.descripcion_pago_deuda || b.notas || "") as any;
        }

        if (sortConfig.key === "fecha") {
          valA = new Date(valA as string).getTime() as any;
          valB = new Date(valB as string).getTime() as any;
        } else if (typeof valA === "string" && typeof valB === "string") {
          return (
            valA.localeCompare(valB) *
            (sortConfig.direction === "ascending" ? 1 : -1)
          );
        }

        if (typeof valA === "number" && typeof valB === "number") {
          if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
          if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        }

        const strA = String(valA ?? "").toLowerCase();
        const strB = String(valB ?? "").toLowerCase();
        if (strA < strB) return sortConfig.direction === "ascending" ? -1 : 1;
        if (strA > strB) return sortConfig.direction === "ascending" ? 1 : -1;

        return 0;
      });
    }
    return items;
  }, [
    transacciones,
    searchTerm,
    sortConfig,
    tipoTransaccionFilter,
    fechaDesde,
    fechaHasta,
  ]);

  const requestSort = (key: SortableTransaccionKeys) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortDirectionForColumn = (key: SortableTransaccionKeys) => {
    if (!sortConfig || sortConfig.key !== key) return "none";
    return sortConfig.direction;
  };

  const totalPages = Math.ceil(
    filteredAndSortedTransacciones.length / itemsPerPage
  );
  const paginatedTransacciones = showPagination
    ? filteredAndSortedTransacciones.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : filteredAndSortedTransacciones;

  const handleExport = async () => {
    if (filteredAndSortedTransacciones.length === 0) {
      alert("No hay transacciones para exportar con los filtros actuales.");
      return;
    }
    setIsGeneratingPdf(true);
    await onExportPdf(filteredAndSortedTransacciones, {
      fechaDesde,
      fechaHasta,
      tipo: tipoTransaccionFilter,
    });
    setIsGeneratingPdf(false);
  };

  if (
    transacciones.length === 0 &&
    !searchTerm &&
    tipoTransaccionFilter === "TODAS" &&
    fechaDesde === getInitialDateRange().from &&
    fechaHasta === getInitialDateRange().to
  ) {
    return (
      <p className="text-center text-gray-500 dark:text-slate-400 py-10">
        No hay transacciones registradas.
      </p>
    );
  }

  const TableHeaderCell: React.FC<{
    label: string;
    sortKey: SortableTransaccionKeys;
    className?: string;
    textAlignment?: "text-left" | "text-right" | "text-center";
  }> = ({ label, sortKey, className, textAlignment = "text-left" }) => (
    <th
      scope="col"
      className={`px-3 py-2 ${textAlignment} text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 ${
        className || ""
      }`}
      onClick={() => requestSort(sortKey)}
      role="columnheader"
      aria-sort={getSortDirectionForColumn(sortKey)}
    >
      {label} <SortIcon direction={getSortDirectionForColumn(sortKey)} />
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg shadow-sm border dark:border-slate-700">
        <h3 className="text-lg font-medium text-gray-700 dark:text-slate-200 mb-3">
          Filtros y Exportación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label
              htmlFor="fechaDesdeTrans"
              className="block text-sm font-medium text-gray-600 dark:text-slate-300"
            >
              Desde:
            </label>
            <input
              type="date"
              id="fechaDesdeTrans"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 block w-full p-2 border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
              max={getTodayDateString()}
            />
          </div>
          <div>
            <label
              htmlFor="fechaHastaTrans"
              className="block text-sm font-medium text-gray-600 dark:text-slate-300"
            >
              Hasta:
            </label>
            <input
              type="date"
              id="fechaHastaTrans"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 block w-full p-2 border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
              max={getTodayDateString()}
            />
          </div>
          <div>
            <label
              htmlFor="tipoTransaccionFilter"
              className="block text-sm font-medium text-gray-600 dark:text-slate-300"
            >
              Tipo de Transacción:
            </label>
            <select
              id="tipoTransaccionFilter"
              value={tipoTransaccionFilter}
              onChange={(e) => {
                setTipoTransaccionFilter(
                  e.target.value as TipoTransaccion | "TODAS"
                );
                setCurrentPage(1);
              }}
              className="mt-1 block w-full p-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            >
              <option value="TODAS">Todas</option>
              {Object.values(TipoTransaccion).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExport}
            disabled={
              isGeneratingPdf || filteredAndSortedTransacciones.length === 0
            }
            className="w-full sm:w-auto flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-orange-600 dark:hover:bg-orange-700 disabled:opacity-60"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            {isGeneratingPdf ? "Generando..." : "Exportar PDF"}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar en transacciones..."
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Buscar transacciones"
        />
      </div>
      {paginatedTransacciones.length === 0 && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">
          No se encontraron transacciones con los criterios actuales.
        </p>
      )}
      {paginatedTransacciones.length > 0 && (
        <div
          className="overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg"
          style={{ width: "100%" }}
        >
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-100 dark:bg-slate-700/60">
              <tr>
                <TableHeaderCell label="Fecha" sortKey="fecha" />
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider"
                >
                  Hora
                </th>
                <TableHeaderCell label="Tipo" sortKey="tipo_transaccion" />
                <TableHeaderCell
                  label="Producto/Plato/Desc."
                  sortKey="producto_plato_nombre"
                  className="w-1/4"
                />
                <th
                  scope="col"
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider"
                >
                  Cant.
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider"
                >
                  P.Unit.
                </th>
                <TableHeaderCell
                  label="Importe Total"
                  sortKey="importe_total"
                  textAlignment="text-right"
                />
                <TableHeaderCell
                  label="Costo Total"
                  sortKey="costo_total_transaccion"
                  textAlignment="text-right"
                />
                <TableHeaderCell
                  label="Utilidad"
                  sortKey="utilidad_transaccion"
                  textAlignment="text-right"
                />
                <TableHeaderCell
                  label="Servicio/Prov./Cat."
                  sortKey="servicio_proveedor_nombre"
                  className="w-1/6"
                />
                <TableHeaderCell label="Estado Pago" sortKey="estado_pago" />
                <TableHeaderCell
                  label="Deudor/Notas"
                  sortKey="descripcion_pago_deuda_o_notas"
                  className="w-1/4"
                />
                <th
                  scope="col"
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {paginatedTransacciones.map((t) => (
                <tr
                  key={t.id_transaccion}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {formatDateForDisplay(t.fecha)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {formatTimeForDisplay(t.fecha)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {t.tipo_transaccion}
                  </td>
                  <td
                    className="px-3 py-2 whitespace-normal text-sm font-medium text-gray-900 dark:text-slate-100 max-w-xs truncate"
                    title={t.producto_plato_nombre}
                  >
                    {t.producto_plato_nombre}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-right">
                    {t.cantidad.toFixed(2)} {t.unidad_medida_nombre || ""}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-right">
                    {formatCurrency(t.precio_unitario)}
                  </td>
                  <td
                    className={`px-3 py-2 whitespace-nowrap text-sm font-semibold text-right ${
                      t.importe_total < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-700 dark:text-slate-300"
                    }`}
                  >
                    {formatCurrency(t.importe_total)}
                  </td>
                  <td
                    className={`px-3 py-2 whitespace-nowrap text-sm text-right ${
                      t.costo_total_transaccion !== undefined &&
                      t.costo_total_transaccion > 0
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-gray-500 dark:text-slate-400"
                    }`}
                  >
                    {formatCurrency(t.costo_total_transaccion)}
                  </td>
                  <td
                    className={`px-3 py-2 whitespace-nowrap text-sm font-semibold text-right ${
                      t.utilidad_transaccion !== undefined &&
                      t.utilidad_transaccion < 0
                        ? "text-red-600 dark:text-red-400"
                        : t.utilidad_transaccion !== undefined &&
                          t.utilidad_transaccion > 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-slate-400"
                    }`}
                  >
                    {formatCurrency(t.utilidad_transaccion)}
                  </td>
                  <td
                    className="px-3 py-2 whitespace-normal text-sm text-gray-500 dark:text-slate-400 max-w-xs truncate"
                    title={t.servicio_proveedor_nombre}
                  >
                    {t.servicio_proveedor_nombre}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        t.estado_pago === EstadoPago.PENDIENTE
                          ? "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100"
                          : t.estado_pago === EstadoPago.PAGADO ||
                            t.estado_pago === EstadoPago.EFECTIVO ||
                            t.estado_pago === EstadoPago.TRANSFERENCIA ||
                            t.estado_pago === EstadoPago.ZELLE
                          ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
                          : "bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-200"
                      }`}
                    >
                      {t.estado_pago || "N/A"}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2 whitespace-normal text-xs text-gray-500 dark:text-slate-400 max-w-xs truncate"
                    title={
                      t.nombre_deudor || t.descripcion_pago_deuda || t.notas
                    }
                  >
                    {t.nombre_deudor ||
                      t.descripcion_pago_deuda ||
                      t.notas ||
                      "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex space-x-2 justify-end">
                      {onEdit &&
                        t.tipo_transaccion === TipoTransaccion.VENTA && (
                          <button
                            onClick={() => onEdit(t)}
                            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 transition-colors"
                            title="Editar Transacción"
                            aria-label={`Editar transacción ${t.id_transaccion}`}
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                        )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(t.id_transaccion)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Eliminar Transacción"
                          aria-label={`Eliminar transacción ${t.id_transaccion}`}
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPagination && totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700 dark:text-slate-300">
            Página {currentPage} de {totalPages} (Total:{" "}
            {filteredAndSortedTransacciones.length} transacciones)
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default TransaccionesListComponent;
