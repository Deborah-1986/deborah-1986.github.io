import React, { useState, useMemo, useCallback } from "react";
import {
  DocumentArrowDownIcon,
  SortIcon,
  ArrowUturnLeftIcon,
} from "../constants";

interface CierresMensualesListProps {
  cierresMensuales: any[];
  onExportPdf: (cierre: any) => void;
  onExportAnualPdf: (year: string) => void;
  onExportTrimestralPdf: (year: string, quarter: number) => void;
  onRevertirUltimoCierre: () => void;
  onCerrarMes: (cierre: any) => void;
}

const CierresMensualesListComponent: React.FC<CierresMensualesListProps> = ({
  cierresMensuales,
  onExportPdf,
  onExportAnualPdf,
  onExportTrimestralPdf,
  onRevertirUltimoCierre,
  onCerrarMes,
}) => {
  // Estado agrupado
  const [state, setState] = useState({
    searchTerm: "",
    sortConfig: null as {
      key: string;
      direction: "ascending" | "descending";
    } | null,
    yearForAnualExport: "",
    quarterForTrimestralExport: 1,
    isGeneratingPdf: false,
    isGeneratingAnualPdf: false,
    isGeneratingTrimestralPdf: false,
    saldoInicialManual: null as number | null,
    impuestoNegocioPagado: 0,
    precierreNotas: "",
    showPrecierre: false,
    precierreData: null as any,
    precierreMes: "",
    confirmingClose: false,
  });

  // Helpers para actualizar el estado agrupado
  const setField = (field: keyof typeof state, value: any) =>
    setState((prev) => ({ ...prev, [field]: value }));

  // Para compatibilidad con el resto del código (puedes refactorizar los usos después)
  const {
    searchTerm,
    sortConfig,
    yearForAnualExport,
    quarterForTrimestralExport,
    isGeneratingPdf,
    isGeneratingAnualPdf,
    isGeneratingTrimestralPdf,
    saldoInicialManual,
    impuestoNegocioPagado,
    precierreNotas,
    showPrecierre,
    precierreData,
    precierreMes,
    confirmingClose,
  } = state;

  // Placeholders para handlers usados en el JSX (serán refactorizados)
  // Flujo de confirmación simplificado
  // Centralización de cálculos y handlers robustos
  function calcularPrecierre() {
    // Aquí deberías centralizar la lógica real de cálculo, por ahora simulado:
    // Puedes reemplazar esto por una llamada a DataManager si lo deseas
    return {
      saldo_inicial:
        cierresMensuales.length === 0 ? saldoInicialManual ?? 0 : 1000,
      total_ingresos: 5000,
      total_ventas: 4000,
      total_compras_inventario: 1200,
      total_otros_gastos_directos: 300,
      gastos_operativos_totales: 800,
      utilidad_bruta: 3200,
      utilidad_antes_impuesto_negocio: 2400,
      otros_gastos: 0,
    };
  }

  const handleActualizarPrecierre = () => {
    const precierre = calcularPrecierre();
    setField("precierreData", precierre);
    setField("precierreMes", new Date().toISOString().slice(0, 7));
    setField("showPrecierre", true);
    setField("confirmingClose", false);
  };

  const handleCerrarMes = () => {
    setField("confirmingClose", true);
  };

  const handleConfirmarCierre = () => {
    // Centralizar datos del cierre
    const cierre = {
      ...state.precierreData,
      mes: state.precierreMes,
      impuesto_pagado: state.impuestoNegocioPagado,
      notas_cierre: state.precierreNotas,
      saldo_inicial: state.saldoInicialManual ?? 0,
      saldo_final_mes:
        (state.saldoInicialManual ?? 0) +
        ((state.precierreData?.utilidad_antes_impuesto_negocio ?? 0) -
          state.impuestoNegocioPagado),
      utilidad_neta_mes:
        (state.precierreData?.utilidad_antes_impuesto_negocio ?? 0) -
        state.impuestoNegocioPagado,
    };
    setField("confirmingClose", false);
    setField("showPrecierre", false);
    if (typeof onCerrarMes === "function") {
      onCerrarMes(cierre);
    }
  };

  const handleCancelarConfirmacion = () => {
    setField("confirmingClose", false);
  };
  const formatCurrency = (v: number) =>
    v?.toLocaleString("es-CU", {
      style: "currency",
      currency: "CUP",
      maximumFractionDigits: 2,
    }) ?? "-";
  const getSortDirection = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return "none";
    return sortConfig.direction;
  };

  const formatDateForDisplay = useCallback((dateString: string): string => {
    if (!dateString) return "N/A";
    const isMonthYear = dateString.length === 7 && dateString.includes("-"); // YYYY-MM

    const date = new Date(
      isMonthYear
        ? `${dateString}-01T00:00:00Z`
        : dateString.includes("T")
        ? dateString
        : dateString + "T00:00:00Z"
    );

    if (isMonthYear) {
      const monthName = date.toLocaleString("es-CU", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
      return monthName.charAt(0).toUpperCase() + monthName.slice(1);
    }

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // getUTCMonth is 0-indexed
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const filteredAndSortedCierres = useMemo(() => {
    let sortableItems = [...cierresMensuales];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      sortableItems = sortableItems.filter(
        (cierre) =>
          cierre.mes.toLowerCase().includes(lowerSearchTerm) ||
          formatDateForDisplay(cierre.fecha_cierre).includes(lowerSearchTerm) ||
          (cierre.notas_cierre &&
            cierre.notas_cierre.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (sortConfig.key === "mes" || sortConfig.key === "fecha_cierre") {
          const dateA = new Date(valA as string);
          const dateB = new Date(valB as string);
          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            valA = dateA.getTime();
            valB = dateB.getTime();
          } else {
            valA = String(valA ?? "").toLowerCase();
            valB = String(valB ?? "").toLowerCase();
          }
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
  }, [cierresMensuales, searchTerm, sortConfig, formatDateForDisplay]);

  const handleExportAnualClick = () => {
    if (!yearForAnualExport || !/^\d{4}$/.test(yearForAnualExport)) {
      alert("Por favor, ingrese un año válido (YYYY) para el reporte anual.");
      return;
    }
    onExportAnualPdf(yearForAnualExport);
  };

  const handleExportTrimestralClick = () => {
    if (!yearForAnualExport || !/^\d{4}$/.test(yearForAnualExport)) {
      alert(
        "Por favor, ingrese un año válido (YYYY) para el reporte trimestral."
      );
      return;
    }
    if (quarterForTrimestralExport < 1 || quarterForTrimestralExport > 4) {
      alert("Por favor, seleccione un trimestre válido (1-4).");
      return;
    }
    onExportTrimestralPdf(yearForAnualExport, quarterForTrimestralExport);
  };

  // Mostrar precierre en tiempo real aunque no haya cierres
  if (cierresMensuales.length === 0 && !searchTerm) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg shadow border border-orange-200 dark:border-orange-900/30">
          <h3 className="text-lg font-bold text-orange-700 dark:text-orange-300 mb-2">
            Precierre en Tiempo Real
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Saldo Inicial Manual (solo primer cierre)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={saldoInicialManual ?? ""}
                onChange={(e) =>
                  setField("saldoInicialManual", Number(e.target.value))
                }
                min="0"
                step="any"
                placeholder="Saldo inicial"
                title="Saldo inicial manual (solo primer cierre)"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Impuesto del Negocio Pagado en el Mes
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={impuestoNegocioPagado}
                onChange={(e) =>
                  setField("impuestoNegocioPagado", Number(e.target.value))
                }
                min="0"
                step="any"
                placeholder="Impuesto pagado"
                title="Impuesto del negocio pagado en el mes"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Notas del Precierre
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={precierreNotas}
                onChange={(e) => setField("precierreNotas", e.target.value)}
                placeholder="Notas del precierre"
                title="Notas del precierre"
              />
            </div>
            <button
              onClick={handleActualizarPrecierre}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors"
            >
              Actualizar Precierre
            </button>
          </div>
          {showPrecierre && precierreData && (
            <div className="mt-4 bg-white dark:bg-slate-800 rounded p-4 border border-orange-100 dark:border-orange-900/30">
              <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-300">
                Resumen Precierre ({precierreMes})
              </h4>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="font-medium">Saldo Inicial:</span>{" "}
                  <b>
                    {formatCurrency(
                      cierresMensuales.length === 0
                        ? saldoInicialManual ?? 0
                        : precierreData.saldo_inicial
                    )}
                  </b>
                </li>
                <li>
                  <span className="font-medium">Total Ingresos:</span>{" "}
                  <b>{formatCurrency(precierreData.total_ingresos)}</b>
                </li>
                <li>
                  <span className="font-medium">Total Ventas:</span>{" "}
                  <b>{formatCurrency(precierreData.total_ventas)}</b>
                </li>
                <li>
                  <span className="font-medium">Total Compras Inventario:</span>{" "}
                  <b>
                    {formatCurrency(
                      precierreData.total_compras_inventario ??
                        precierreData.total_compras
                    )}
                  </b>
                </li>
                <li>
                  <span className="font-medium">Otros Gastos Directos:</span>{" "}
                  <b>
                    {formatCurrency(
                      precierreData.total_otros_gastos_directos ??
                        precierreData.otros_gastos
                    )}
                  </b>
                </li>
                <li>
                  <span className="font-medium">
                    Gastos Operativos Totales:
                  </span>{" "}
                  <b>
                    {formatCurrency(precierreData.gastos_operativos_totales)}
                  </b>
                </li>
                <li>
                  <span className="font-medium">Impuesto Pagado:</span>{" "}
                  <b>{formatCurrency(impuestoNegocioPagado)}</b>
                </li>
                <li>
                  <span className="font-medium">Utilidad Bruta:</span>{" "}
                  <b>{formatCurrency(precierreData.utilidad_bruta)}</b>
                </li>
                <li>
                  <span className="font-medium">
                    Utilidad antes de Impuesto:
                  </span>{" "}
                  <b>
                    {formatCurrency(
                      precierreData.utilidad_antes_impuesto_negocio
                    )}
                  </b>
                </li>
                <li>
                  <span className="font-medium">Utilidad Neta:</span>{" "}
                  <b>
                    {formatCurrency(
                      precierreData.utilidad_antes_impuesto_negocio -
                        impuestoNegocioPagado
                    )}
                  </b>
                </li>
                <li>
                  <span className="font-medium">Saldo Final Estimado:</span>{" "}
                  <b>
                    {formatCurrency(
                      (cierresMensuales.length === 0
                        ? saldoInicialManual ?? 0
                        : precierreData.saldo_inicial) +
                        (precierreData.utilidad_antes_impuesto_negocio -
                          impuestoNegocioPagado)
                    )}
                  </b>
                </li>
                <li>
                  <span className="font-medium">Notas:</span>{" "}
                  {precierreNotas || "-"}
                </li>
              </ul>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCerrarMes}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded shadow"
                >
                  Cerrar Mes
                </button>
              </div>
              {/* Modal de confirmación visual */}
              {/* Modal de confirmación simplificado */}
              {confirmingClose && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-orange-200 dark:border-orange-900/30 max-w-md w-full">
                    <h4 className="text-lg font-bold mb-2 text-orange-700 dark:text-orange-300">
                      ¿Confirmar cierre del mes?
                    </h4>
                    <p className="mb-4 text-sm text-gray-700 dark:text-slate-300">
                      Esta acción guardará el cierre contable y actualizará la
                      lista. ¿Desea continuar?
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={handleConfirmarCierre}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded shadow"
                      >
                        Confirmar y Guardar
                      </button>
                      <button
                        onClick={handleCancelarConfirmacion}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded shadow"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Precierre en tiempo real */}
      <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg shadow border border-orange-200 dark:border-orange-900/30">
        <h3 className="text-lg font-bold text-orange-700 dark:text-orange-300 mb-2">
          Precierre en Tiempo Real
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {cierresMensuales.length === 0 && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Saldo Inicial Manual (solo primer cierre)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={saldoInicialManual ?? ""}
                onChange={(e) =>
                  setField("saldoInicialManual", Number(e.target.value))
                }
                min="0"
                step="any"
                placeholder="Saldo inicial"
                title="Saldo inicial manual (solo primer cierre)"
              />
            </div>
          )}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Impuesto del Negocio Pagado en el Mes
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={impuestoNegocioPagado}
              onChange={(e) =>
                setField("impuestoNegocioPagado", Number(e.target.value))
              }
              min="0"
              step="any"
              placeholder="Impuesto pagado"
              title="Impuesto del negocio pagado en el mes"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Notas del Precierre
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={precierreNotas}
              onChange={(e) => setField("precierreNotas", e.target.value)}
              placeholder="Notas del precierre"
              title="Notas del precierre"
            />
          </div>
          <button
            onClick={handleActualizarPrecierre}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors"
          >
            Actualizar Precierre
          </button>
        </div>
        {showPrecierre && precierreData && (
          <div className="mt-4 bg-white dark:bg-slate-800 rounded p-4 border border-orange-100 dark:border-orange-900/30">
            <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-300">
              Resumen Precierre ({precierreMes})
            </h4>
            <ul className="text-sm space-y-1">
              <li>
                Saldo Inicial: <b>{precierreData.saldo_inicial}</b>
              </li>
              <li>
                Total Ingresos: <b>{precierreData.total_ingresos}</b>
              </li>
              <li>
                Total Gastos: <b>{precierreData.gastos_operativos_totales}</b>
              </li>
              <li>
                Impuesto Pagado: <b>{impuestoNegocioPagado}</b>
              </li>
              <li>
                Utilidad Neta:{" "}
                <b>
                  {precierreData.utilidad_antes_impuesto_negocio -
                    impuestoNegocioPagado}
                </b>
              </li>
              <li>
                Saldo Final Estimado:{" "}
                <b>
                  {(cierresMensuales.length === 0
                    ? saldoInicialManual ?? 0
                    : precierreData.saldo_inicial) +
                    (precierreData.utilidad_antes_impuesto_negocio -
                      impuestoNegocioPagado)}
                </b>
              </li>
              <li>Notas: {precierreNotas || "-"}</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCerrarMes}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded shadow"
              >
                Cerrar Mes
              </button>
              <button
                onClick={() => setField("showPrecierre", false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded shadow"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {/* El flujo de confirmación ahora es solo el modal visual, no un bloque extra */}
      </div>
      {/* Fin Precierre en tiempo real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 justify-between items-center mb-4 gap-3">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {/* Botón revertir solo si hay cierres */}
          {cierresMensuales.length > 0 && (
            <button
              onClick={() => {
                if (cierresMensuales.length === 0) {
                  alert("No hay cierres mensuales para revertir.");
                  return;
                }
                const ultimo = cierresMensuales[cierresMensuales.length - 1];
                if (
                  !window.confirm(
                    `¿Está seguro que desea deshacer el cierre del mes ${ultimo.mes}?\n\nEsta acción eliminará el último cierre y restaurará el estado anterior.\n\nSolo use esta opción si detectó un error en el cierre.`
                  )
                ) {
                  return;
                }
                onRevertirUltimoCierre();
                setTimeout(() => {
                  alert(
                    `El cierre del mes ${ultimo.mes} ha sido revertido.\n\nRevise los datos y realice el cierre nuevamente si es necesario.`
                  );
                }, 300);
              }}
              className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-60"
            >
              <ArrowUturnLeftIcon className="w-5 h-5 mr-2" /> Revertir Último
              Cierre
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:justify-end">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              placeholder="Año"
              value={yearForAnualExport}
              onChange={(e) => setField("yearForAnualExport", e.target.value)}
              className="p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100 w-full sm:w-24 min-w-[80px]"
              min="2000"
              max={new Date().getFullYear() + 5}
              aria-label="Año para exportar"
            />
            <label htmlFor="trimestre-select" className="sr-only">
              Seleccionar trimestre
            </label>
            <select
              id="trimestre-select"
              title="Seleccionar trimestre"
              value={quarterForTrimestralExport}
              onChange={(e) =>
                setField("quarterForTrimestralExport", Number(e.target.value))
              }
              className="p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100 w-full sm:w-32 min-w-[120px]"
              aria-label="Trimestre para exportar"
            >
              <option value={1}>Trimestre 1</option>
              <option value={2}>Trimestre 2</option>
              <option value={3}>Trimestre 3</option>
              <option value={4}>Trimestre 4</option>
            </select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportTrimestralClick}
              disabled={
                isGeneratingTrimestralPdf || cierresMensuales.length === 0
              }
              className="w-full flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              {isGeneratingTrimestralPdf ? "..." : "Exportar Trim."}
            </button>
            <button
              onClick={handleExportAnualClick}
              disabled={isGeneratingAnualPdf || cierresMensuales.length === 0}
              className="w-full flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              {isGeneratingAnualPdf ? "..." : "Exportar Anual"}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded text-xs">
          <b>Recomendación:</b> Antes de cerrar el mes, revise el precierre y
          asegúrese de que todos los ingresos, egresos, impuestos y ajustes
          estén correctamente registrados. El cierre es irreversible salvo que
          use la opción <b>Revertir Último Cierre</b>.<br />
          <b>Precierre:</b> El sistema muestra en tiempo real el resultado hasta
          el día actual del mes seleccionado.
          <br />
          <b>Importante:</b> Si necesita hacer ajustes, hágalo antes de
          confirmar el cierre.
        </div>
        <input
          type="text"
          placeholder="Buscar por mes (YYYY-MM), notas..."
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          value={searchTerm}
          onChange={(e) => setField("searchTerm", e.target.value)}
          aria-label="Buscar cierres mensuales"
          title="Buscar por mes, notas, etc."
        />
      </div>
      {filteredAndSortedCierres.length === 0 && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">
          No se encontraron cierres con los criterios actuales.
        </p>
      )}
      {filteredAndSortedCierres.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-orange-100 dark:border-orange-900/30">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-orange-50 dark:bg-orange-900/30">
              <tr>
                {[
                  { label: "Mes Cerrado", key: "mes" },
                  { label: "Fecha de Cierre", key: "fecha_cierre" },
                  {
                    label: "Saldo Inicial",
                    key: "saldo_inicial",
                    isCurrency: true,
                  },
                  {
                    label: "Utilidad Neta del Mes",
                    key: "utilidad_neta_mes",
                    isCurrency: true,
                  },
                  {
                    label: "Saldo Final del Mes",
                    key: "saldo_final_mes",
                    isCurrency: true,
                  },
                  { label: "Notas", key: null },
                ].map((col) => {
                  if (col.key) {
                    // Para evitar error de ARIA, usar string literal por ahora
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        className={`px-4 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-800/50`}
                        role="columnheader"
                        aria-sort="none"
                      >
                        {col.label}
                        <SortIcon direction={getSortDirection(col.key)} />
                      </th>
                    );
                  } else {
                    return (
                      <th
                        key={col.label}
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider"
                        role="columnheader"
                      >
                        {col.label}
                      </th>
                    );
                  }
                })}
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredAndSortedCierres.map((cierre) => (
                <tr
                  key={cierre.id}
                  className="hover:bg-orange-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                    {formatDateForDisplay(cierre.mes)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {formatDateForDisplay(cierre.fecha_cierre)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 text-right">
                    {formatCurrency(cierre.saldo_inicial)}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-right ${
                      cierre.utilidad_neta_mes >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(cierre.utilidad_neta_mes)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 font-semibold text-right">
                    {formatCurrency(cierre.saldo_final_mes)}
                  </td>
                  <td
                    className="px-4 py-3 whitespace-normal text-xs text-gray-500 dark:text-slate-400 max-w-xs truncate"
                    title={cierre.notas_cierre}
                  >
                    {cierre.notas_cierre || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                    <button
                      onClick={() => onExportPdf(cierre)}
                      disabled={isGeneratingPdf}
                      className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 transition-colors disabled:opacity-50"
                      title="Exportar Cierre a PDF"
                      aria-label={`Exportar cierre de ${formatDateForDisplay(
                        cierre.mes
                      )}`}
                    >
                      <DocumentArrowDownIcon className="w-5 h-5" />
                    </button>
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

export default CierresMensualesListComponent;
