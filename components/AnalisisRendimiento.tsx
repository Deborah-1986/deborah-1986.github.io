// components/AnalisisRendimiento.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Transaccion,
  Plato,
  Configuracion,
  RestauranteServicio,
  TipoTransaccion,
  PerformanceAnalyticsData,
} from "../types.js"; // Added PerformanceAnalyticsData
import {
  Chart,
  registerables,
  ChartConfiguration,
  ChartOptions,
  TooltipItem,
  ChartTypeRegistry,
  Plugin,
} from "chart.js";
Chart.register(...registerables);

interface AnalisisRendimientoProps {
  allTransacciones: Transaccion[];
  platos: Plato[];
  configuracion: Configuracion;
  restaurantesServicios: RestauranteServicio[];
  onExportPdf: (data: PerformanceAnalyticsData) => Promise<void>; // Added
  isGeneratingPdf: boolean; // Added
}

interface VentasPorDia {
  fecha: string;
  ingresos: number;
  items: number;
  costo: number;
  utilidad: number;
}

interface VentasPorDiaSemana {
  diaNombre: string;
  ingresos: number;
  items: number;
  utilidad: number;
}

interface TopPlato {
  id: string;
  nombre: string;
  cantidad: number;
  ingresos: number;
  costo: number;
  utilidad: number;
}

interface VentasPorServicio {
  servicio: string;
  ingresos: number;
  items: number;
  costo: number;
  utilidad: number;
}

interface ReportData {
  periodo: string;
  totalIngresos: number;
  totalItemsVendidos: number;
  totalCostoVentas: number;
  totalUtilidad: number;
  numeroTransacciones: number;
  ticketPromedio: number;
  ventasPorDia: VentasPorDia[];
  topPlatosCantidad: TopPlato[];
  topPlatosIngresos: TopPlato[];
  topPlatosUtilidad: TopPlato[];
  ventasPorServicio: VentasPorServicio[];
  ventasPorDiaSemana: VentasPorDiaSemana[];
}

type TopProductMetric = "cantidad" | "ingresos" | "utilidad";

export const AnalisisRendimiento: React.FC<AnalisisRendimientoProps> = ({
  allTransacciones,
  platos,
  configuracion,
  restaurantesServicios,
  onExportPdf, // Added
  isGeneratingPdf, // Added
}) => {
  const getTodayDateString = () => new Date().toISOString().split("T")[0];
  const getFirstDayOfMonthString = (date: Date = new Date()) =>
    new Date(date.getFullYear(), date.getMonth(), 1)
      .toISOString()
      .split("T")[0];

  const [fechaDesde, setFechaDesde] = useState<string>(
    getFirstDayOfMonthString()
  );
  const [fechaHasta, setFechaHasta] = useState<string>(getTodayDateString());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [topProductMetric, setTopProductMetric] =
    useState<TopProductMetric>("cantidad");

  const salesTrendChartRef = useRef<HTMLCanvasElement>(null);
  const topProductsChartRef = useRef<HTMLCanvasElement>(null);
  const salesByServiceChartRef = useRef<HTMLCanvasElement>(null);
  const incomeVsCostChartRef = useRef<HTMLCanvasElement>(null);
  const salesByDayOfWeekChartRef = useRef<HTMLCanvasElement>(null);

  const chartInstancesRef = useRef<{ [key: string]: Chart | undefined }>({});

  const isDarkMode = useCallback(
    () =>
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark"),
    []
  );

  const formatCurrency = useCallback(
    (value?: number): string => {
      if (value === undefined || value === null || isNaN(value))
        return `0.00 ${configuracion.simbolo_moneda}`;
      return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
    },
    [configuracion.simbolo_moneda]
  );

  const formatDate = useCallback((dateString: string): string => {
    try {
      const [year, month, day] = dateString.split("-");
      if (!year || !month || !day) return dateString;
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  }, []);

  const calculateReportData = useCallback((): ReportData | null => {
    if (!fechaDesde || !fechaHasta) return null;

    const startDate = new Date(`${fechaDesde}T00:00:00.000Z`);
    const endDate = new Date(`${fechaHasta}T23:59:59.999Z`);

    const ventasPeriodo = allTransacciones.filter((t) => {
      if (t.tipo_transaccion !== TipoTransaccion.VENTA) return false;
      const tDate = new Date(t.fecha);
      return tDate >= startDate && tDate <= endDate;
    });

    const initialReport: ReportData = {
      periodo: `${formatDate(fechaDesde)} - ${formatDate(fechaHasta)}`,
      totalIngresos: 0,
      totalItemsVendidos: 0,
      totalCostoVentas: 0,
      totalUtilidad: 0,
      numeroTransacciones: 0,
      ticketPromedio: 0,
      ventasPorDia: [],
      topPlatosCantidad: [],
      topPlatosIngresos: [],
      topPlatosUtilidad: [],
      ventasPorServicio: [],
      ventasPorDiaSemana: [
        { diaNombre: "Domingo", ingresos: 0, items: 0, utilidad: 0 },
        { diaNombre: "Lunes", ingresos: 0, items: 0, utilidad: 0 },
        { diaNombre: "Martes", ingresos: 0, items: 0, utilidad: 0 },
        { diaNombre: "Miércoles", ingresos: 0, items: 0, utilidad: 0 },
        { diaNombre: "Jueves", ingresos: 0, items: 0, utilidad: 0 },
        { diaNombre: "Viernes", ingresos: 0, items: 0, utilidad: 0 },
        { diaNombre: "Sábado", ingresos: 0, items: 0, utilidad: 0 },
      ],
    };

    if (ventasPeriodo.length === 0) {
      return initialReport;
    }

    let totalIngresos = 0;
    let totalItemsVendidos = 0;
    let totalCostoVentas = 0;
    let totalUtilidad = 0;

    const platoMetrics: Record<string, TopPlato> = {};
    platos.forEach((p) => {
      platoMetrics[p.id] = {
        id: p.id,
        nombre: p.nombre_plato,
        cantidad: 0,
        ingresos: 0,
        utilidad: 0,
        costo: 0,
      };
    });

    const ventasPorDiaMap: Record<string, VentasPorDia> = {};
    const ventasPorServicioMap: Record<string, VentasPorServicio> = {};
    restaurantesServicios.forEach((s) => {
      ventasPorServicioMap[s.nombre_servicio] = {
        servicio: s.nombre_servicio,
        ingresos: 0,
        items: 0,
        costo: 0,
        utilidad: 0,
      };
    });

    const ventasPorDiaSemanaMap: VentasPorDiaSemana[] = [
      ...initialReport.ventasPorDiaSemana.map((d) => ({ ...d })),
    ];

    ventasPeriodo.forEach((v) => {
      totalIngresos += v.importe_total || 0;
      totalItemsVendidos += v.cantidad || 0;
      totalCostoVentas += v.costo_total_transaccion || 0;
      totalUtilidad += v.utilidad_transaccion || 0;

      const fechaVenta = new Date(v.fecha);
      const diaKey = fechaVenta.toISOString().split("T")[0];
      if (!ventasPorDiaMap[diaKey])
        ventasPorDiaMap[diaKey] = {
          fecha: diaKey,
          ingresos: 0,
          items: 0,
          costo: 0,
          utilidad: 0,
        };
      ventasPorDiaMap[diaKey].ingresos += v.importe_total || 0;
      ventasPorDiaMap[diaKey].items += v.cantidad || 0;
      ventasPorDiaMap[diaKey].costo += v.costo_total_transaccion || 0;
      ventasPorDiaMap[diaKey].utilidad += v.utilidad_transaccion || 0;

      const dayOfWeek = fechaVenta.getDay(); // 0 for Sunday, 1 for Monday, etc.
      ventasPorDiaSemanaMap[dayOfWeek].ingresos += v.importe_total || 0;
      ventasPorDiaSemanaMap[dayOfWeek].items += v.cantidad || 0;
      ventasPorDiaSemanaMap[dayOfWeek].utilidad += v.utilidad_transaccion || 0;

      if (v.plato_relacionado_id && platoMetrics[v.plato_relacionado_id]) {
        platoMetrics[v.plato_relacionado_id].cantidad += v.cantidad || 0;
        platoMetrics[v.plato_relacionado_id].ingresos += v.importe_total || 0;
        platoMetrics[v.plato_relacionado_id].costo +=
          v.costo_total_transaccion || 0;
        platoMetrics[v.plato_relacionado_id].utilidad +=
          v.utilidad_transaccion || 0;
      } else if (v.producto_plato_nombre) {
        // Handle cases where plato_relacionado_id might be missing but name is present (e.g. old data)
        const genericKey = `generic-${v.producto_plato_nombre}`;
        if (!platoMetrics[genericKey])
          platoMetrics[genericKey] = {
            id: genericKey,
            nombre: v.producto_plato_nombre,
            cantidad: 0,
            ingresos: 0,
            utilidad: 0,
            costo: 0,
          };
        platoMetrics[genericKey].cantidad += v.cantidad || 0;
        platoMetrics[genericKey].ingresos += v.importe_total || 0;
        platoMetrics[genericKey].costo += v.costo_total_transaccion || 0;
        platoMetrics[genericKey].utilidad += v.utilidad_transaccion || 0;
      }

      const servicioNombre = v.servicio_proveedor_nombre || "Desconocido";
      if (!ventasPorServicioMap[servicioNombre])
        ventasPorServicioMap[servicioNombre] = {
          servicio: servicioNombre,
          ingresos: 0,
          items: 0,
          costo: 0,
          utilidad: 0,
        };
      ventasPorServicioMap[servicioNombre].ingresos += v.importe_total || 0;
      ventasPorServicioMap[servicioNombre].items += v.cantidad || 0;
      ventasPorServicioMap[servicioNombre].costo +=
        v.costo_total_transaccion || 0;
      ventasPorServicioMap[servicioNombre].utilidad +=
        v.utilidad_transaccion || 0;
    });

    const platoMetricsArray = Object.values(platoMetrics).filter(
      (p) => p.cantidad > 0 || p.ingresos > 0 || p.utilidad > 0
    );

    return {
      ...initialReport,
      totalIngresos,
      totalItemsVendidos,
      totalCostoVentas,
      totalUtilidad,
      numeroTransacciones: ventasPeriodo.length,
      ticketPromedio:
        ventasPeriodo.length > 0 ? totalIngresos / ventasPeriodo.length : 0,
      ventasPorDia: Object.values(ventasPorDiaMap).sort((a, b) =>
        a.fecha.localeCompare(b.fecha)
      ),
      topPlatosCantidad: [...platoMetricsArray]
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10),
      topPlatosIngresos: [...platoMetricsArray]
        .sort((a, b) => b.ingresos - a.ingresos)
        .slice(0, 10),
      topPlatosUtilidad: [...platoMetricsArray]
        .sort((a, b) => b.utilidad - a.utilidad)
        .slice(0, 10),
      ventasPorServicio: Object.values(ventasPorServicioMap).filter(
        (s) => s.items > 0 || s.ingresos > 0
      ),
      ventasPorDiaSemana: ventasPorDiaSemanaMap,
    };
  }, [
    fechaDesde,
    fechaHasta,
    allTransacciones,
    platos,
    configuracion.simbolo_moneda,
    restaurantesServicios,
    formatDate,
  ]);

  const handleGenerarReporte = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const data = calculateReportData();
      setReportData(data);
      setIsLoading(false);
    }, 100); // Simulate async operation
  }, [calculateReportData]);

  useEffect(() => {
    handleGenerarReporte();
  }, [handleGenerarReporte, allTransacciones]); // Re-calculate when transactions change

  const destroyChart = useCallback((chartKey: string) => {
    if (chartInstancesRef.current[chartKey]) {
      chartInstancesRef.current[chartKey]?.destroy();
      chartInstancesRef.current[chartKey] = undefined;
    }
  }, []);

  const createChart = useCallback(
    (
      canvasRef: React.RefObject<HTMLCanvasElement>,
      chartKey: string,
      config: ChartConfiguration
    ) => {
      destroyChart(chartKey);
      if (canvasRef.current) {
        chartInstancesRef.current[chartKey] = new Chart(
          canvasRef.current,
          config
        );
      }
    },
    [destroyChart]
  );

  const CHART_COLORS = {
    dark: {
      grid: "rgba(100, 116, 139, 0.3)",
      ticks: "#CBD5E1",
      labels: "#E2E8F0",
      title: "#F1F5F9",
      dataset1: "rgba(234, 88, 12, 0.8)",
      dataset1Bg: "rgba(234, 88, 12, 0.3)",
      dataset2: "rgba(34, 197, 94, 0.8)",
      dataset2Bg: "rgba(34, 197, 94, 0.3)",
      dataset3: "rgba(239, 68, 68, 0.8)",
      dataset3Bg: "rgba(239, 68, 68, 0.3)",
    },
    light: {
      grid: "rgba(203, 213, 225, 0.5)",
      ticks: "#475569",
      labels: "#334155",
      title: "#1E293B",
      dataset1: "rgba(234, 88, 12, 1)",
      dataset1Bg: "rgba(234, 88, 12, 0.2)",
      dataset2: "rgba(34, 197, 94, 1)",
      dataset2Bg: "rgba(34, 197, 94, 0.2)",
      dataset3: "rgba(239, 68, 68, 1)",
      dataset3Bg: "rgba(239, 68, 68, 0.2)",
    },
  };

  const getCurrentThemeColors = useCallback(
    () => (isDarkMode() ? CHART_COLORS.dark : CHART_COLORS.light),
    [isDarkMode]
  );

  const commonChartOptions = useCallback(
    (
      titleText: string,
      isCurrency: boolean = false,
      chartType: keyof ChartTypeRegistry = "bar"
    ): ChartOptions<keyof ChartTypeRegistry> => {
      const themeColors = getCurrentThemeColors();
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { color: themeColors.labels } },
          title: {
            display: true,
            text: titleText,
            font: { size: 16 },
            color: themeColors.title,
          },
          tooltip: {
            backgroundColor: isDarkMode()
              ? "rgba(30, 41, 59, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
            titleColor: isDarkMode() ? "#F1F5F9" : "#1E293B",
            bodyColor: isDarkMode() ? "#CBD5E1" : "#334155",
            borderColor: isDarkMode() ? "#475569" : "#E2E8F0",
            borderWidth: 1,
            callbacks: {
              label: function (context: TooltipItem<any>) {
                let label = context.dataset.label || context.label || "";
                if (label) label += ": ";
                const value = context.parsed.y ?? context.parsed;
                if (value !== null && typeof value === "number") {
                  label += isCurrency
                    ? formatCurrency(value)
                    : value.toLocaleString();
                }
                return label;
              },
            },
          },
        },
        scales:
          chartType === "pie" || chartType === "doughnut"
            ? undefined
            : {
                y: {
                  beginAtZero: true,
                  ticks: { color: themeColors.ticks },
                  grid: { color: themeColors.grid },
                },
                x: {
                  ticks: { color: themeColors.ticks },
                  grid: { color: themeColors.grid },
                },
              },
      };
    },
    [formatCurrency, isDarkMode, getCurrentThemeColors]
  );

  useEffect(() => {
    if (reportData?.ventasPorDia && salesTrendChartRef.current) {
      const themeColors = getCurrentThemeColors();
      const labels = reportData.ventasPorDia.map((d) => formatDate(d.fecha));
      const ingresosData = reportData.ventasPorDia.map((d) => d.ingresos);
      createChart(salesTrendChartRef, "salesTrend", {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: `Ingresos (${configuracion.simbolo_moneda})`,
              data: ingresosData,
              borderColor: themeColors.dataset1,
              backgroundColor: themeColors.dataset1Bg,
              fill: true,
              tension: 0.1,
            },
          ],
        },
        options: commonChartOptions("Tendencia de Ingresos", true, "line"),
      } as ChartConfiguration);
    }
    return () => destroyChart("salesTrend");
  }, [
    reportData,
    commonChartOptions,
    createChart,
    configuracion.simbolo_moneda,
    formatDate,
    getCurrentThemeColors,
    destroyChart,
  ]);

  useEffect(() => {
    if (reportData?.ventasPorDia && incomeVsCostChartRef.current) {
      const themeColors = getCurrentThemeColors();
      const labels = reportData.ventasPorDia.map((d) => formatDate(d.fecha));
      createChart(incomeVsCostChartRef, "incomeVsCost", {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: `Ingresos (${configuracion.simbolo_moneda})`,
              data: reportData.ventasPorDia.map((d) => d.ingresos),
              backgroundColor: themeColors.dataset1,
            },
            {
              label: `Costo (${configuracion.simbolo_moneda})`,
              data: reportData.ventasPorDia.map((d) => d.costo),
              backgroundColor: themeColors.dataset3,
            },
            {
              label: `Utilidad (${configuracion.simbolo_moneda})`,
              data: reportData.ventasPorDia.map((d) => d.utilidad),
              backgroundColor: themeColors.dataset2,
            },
          ],
        },
        options: commonChartOptions(
          "Ingresos vs. Costo vs. Utilidad por Día",
          true
        ),
      } as ChartConfiguration);
    }
    return () => destroyChart("incomeVsCost");
  }, [
    reportData,
    commonChartOptions,
    createChart,
    formatDate,
    configuracion.simbolo_moneda,
    getCurrentThemeColors,
    destroyChart,
  ]);

  useEffect(() => {
    if (reportData?.topPlatosCantidad && topProductsChartRef.current) {
      const themeColors = getCurrentThemeColors();
      let dataToShow;
      let labelSuffix = "";
      let title = "Top Platos por ";

      switch (topProductMetric) {
        case "ingresos":
          dataToShow = reportData.topPlatosIngresos;
          labelSuffix = ` (${configuracion.simbolo_moneda})`;
          title += "Ingresos";
          break;
        case "utilidad":
          dataToShow = reportData.topPlatosUtilidad;
          labelSuffix = ` (${configuracion.simbolo_moneda})`;
          title += "Utilidad";
          break;
        case "cantidad":
        default:
          dataToShow = reportData.topPlatosCantidad;
          title += "Cantidad Vendida";
          break;
      }
      const labels = dataToShow.map((p) => p.nombre);
      const values = dataToShow.map((p) => {
        if (topProductMetric === "ingresos") return p.ingresos;
        if (topProductMetric === "utilidad") return p.utilidad;
        return p.cantidad;
      });

      createChart(topProductsChartRef, "topProducts", {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: title + labelSuffix,
              data: values,
              backgroundColor: themeColors.dataset1,
            },
          ],
        },
        options: commonChartOptions(title, topProductMetric !== "cantidad"),
      } as ChartConfiguration);
    }
    return () => destroyChart("topProducts");
  }, [
    reportData,
    topProductMetric,
    commonChartOptions,
    createChart,
    configuracion.simbolo_moneda,
    getCurrentThemeColors,
    destroyChart,
  ]);

  useEffect(() => {
    if (reportData?.ventasPorServicio && salesByServiceChartRef.current) {
      const themeColors = getCurrentThemeColors();
      const labels = reportData.ventasPorServicio.map((s) => s.servicio);
      createChart(salesByServiceChartRef, "salesByService", {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              label: `Ingresos por Canal (${configuracion.simbolo_moneda})`,
              data: reportData.ventasPorServicio.map((s) => s.ingresos),
              backgroundColor: [
                themeColors.dataset1,
                themeColors.dataset2,
                themeColors.dataset3,
                "#f59e0b",
                "#10b981",
                "#6366f1",
                "#ec4899",
              ],
            },
          ],
        },
        options: commonChartOptions("Ingresos por Canal de Venta", true, "pie"),
      } as ChartConfiguration);
    }
    return () => destroyChart("salesByService");
  }, [
    reportData,
    commonChartOptions,
    createChart,
    configuracion.simbolo_moneda,
    getCurrentThemeColors,
    destroyChart,
  ]);

  useEffect(() => {
    if (reportData?.ventasPorDiaSemana && salesByDayOfWeekChartRef.current) {
      const themeColors = getCurrentThemeColors();
      const labels = reportData.ventasPorDiaSemana.map((d) => d.diaNombre);
      createChart(salesByDayOfWeekChartRef, "salesByDayOfWeek", {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: `Ingresos por Día de la Semana (${configuracion.simbolo_moneda})`,
              data: reportData.ventasPorDiaSemana.map((d) => d.ingresos),
              backgroundColor: themeColors.dataset2,
            },
          ],
        },
        options: commonChartOptions(
          "Ingresos por Día de la Semana (Período Seleccionado)",
          true
        ),
      } as ChartConfiguration);
    }
    return () => destroyChart("salesByDayOfWeek");
  }, [
    reportData,
    commonChartOptions,
    createChart,
    configuracion.simbolo_moneda,
    getCurrentThemeColors,
    destroyChart,
  ]);

  // Placeholder for handleExportPdf function that would use the onExportPdf prop
  const handleExportClick = async () => {
    if (reportData && onExportPdf) {
      // TODO: This reportData is local. Need to transform it into PerformanceAnalyticsData if they are different.
      // For now, let's assume the local ReportData structure can be part of PerformanceAnalyticsData or is compatible.
      // This part needs more info on the full PerformanceAnalyticsData structure.
      // As a placeholder, I'll create a simplified PerformanceAnalyticsData object.
      const performanceDataToExport: PerformanceAnalyticsData = {
        resumenGeneral: {
          totalIngresos: reportData.totalIngresos,
          totalVentas: reportData.totalItemsVendidos,
          totalCostoVentas: reportData.totalCostoVentas,
          totalUtilidad: reportData.totalUtilidad,
          ticketPromedio: reportData.ticketPromedio,
          availableYears: [new Date(fechaDesde).getFullYear().toString()], // Simplification
        },
        platosMasVendidos: reportData.topPlatosCantidad.map((p) => ({
          platoId: p.id,
          nombrePlato: p.nombre,
          cantidadVendida: p.cantidad,
          ingresosTotales: p.ingresos,
          costoTotal: p.costo,
          utilidadTotal: p.utilidad,
        })),
        platosMayoresIngresos: reportData.topPlatosIngresos.map((p) => ({
          platoId: p.id,
          nombrePlato: p.nombre,
          cantidadVendida: p.cantidad,
          ingresosTotales: p.ingresos,
          costoTotal: p.costo,
          utilidadTotal: p.utilidad,
        })),
        platosMayorUtilidad: reportData.topPlatosUtilidad.map((p) => ({
          platoId: p.id,
          nombrePlato: p.nombre,
          cantidadVendida: p.cantidad,
          ingresosTotales: p.ingresos,
          costoTotal: p.costo,
          utilidadTotal: p.utilidad,
        })),
        ventasMensuales: [], // Needs proper aggregation
        ventasTrimestrales: [], // Needs proper aggregation
        ventasSemestrales: [], // Needs proper aggregation
        ventasAnuales: [], // Needs proper aggregation
        salesByDayOfWeek_CurrentWeek: reportData.ventasPorDiaSemana.map(
          (s) => ({
            dayName: s.diaNombre,
            dayIndex: 0,
            cantidadVendida: s.items,
            utilidadTotal: s.utilidad,
            ingresosTotales: s.ingresos,
          })
        ), // dayIndex is simplified
        salesByServiceChannel: reportData.ventasPorServicio.map((s) => ({
          servicioNombre: s.servicio,
          ingresos: s.ingresos,
          costoTotal: s.costo,
          utilidadTotal: s.utilidad,
          cantidadItems: s.items,
          numeroTransacciones: 0,
          utilidadPromedioPorTransaccion: 0,
        })), // numeroTransacciones and utilidadPromedioPorTransaccion are simplified
        ventasPorDia: reportData.ventasPorDia.map((d) => ({
          fecha: d.fecha,
          ingresos: d.ingresos,
          cantidadVentas: d.items,
          costoTotal: d.costo,
          utilidadTotal: d.utilidad,
        })),
      };
      await onExportPdf(performanceDataToExport);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-850">
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-4">
          Análisis de Rendimiento de Ventas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="fechaDesde"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300"
            >
              Desde:
            </label>
            <input
              type="date"
              id="fechaDesde"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
              max={getTodayDateString()}
            />
          </div>
          <div>
            <label
              htmlFor="fechaHasta"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300"
            >
              Hasta:
            </label>
            <input
              type="date"
              id="fechaHasta"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
              max={getTodayDateString()}
            />
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleGenerarReporte}
            disabled={isLoading}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-orange-600 dark:hover:bg-orange-700 disabled:opacity-70"
          >
            {isLoading ? "Generando..." : "Generar Reporte"}
          </button>
          <button
            onClick={handleExportClick}
            disabled={isGeneratingPdf || !reportData}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-70"
          >
            {isGeneratingPdf ? "Exportando..." : "Exportar PDF"}
          </button>
        </div>
      </div>

      {isLoading && (
        <p className="text-center text-orange-600 dark:text-orange-400 py-10">
          Cargando datos del reporte...
        </p>
      )}

      {!isLoading && reportData && (
        <>
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-3">
              Resumen del Período: {reportData.periodo}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-sky-50 dark:bg-sky-800/30 rounded-lg">
                <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                  Ingresos Totales
                </p>
                <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">
                  {formatCurrency(reportData.totalIngresos)}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-800/30 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Utilidad Total
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(reportData.totalUtilidad)}
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-800/30 rounded-lg">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Items Vendidos
                </p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {reportData.totalItemsVendidos.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-800/30 rounded-lg">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Ticket Promedio
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {formatCurrency(reportData.ticketPromedio)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
              <canvas
                ref={salesTrendChartRef}
                style={{ height: "300px" }}
                aria-label="Tendencia de Ingresos"
                role="img"
              ></canvas>
            </div>
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
              <canvas
                ref={incomeVsCostChartRef}
                style={{ height: "300px" }}
                aria-label="Ingresos vs. Costo vs. Utilidad por Día"
                role="img"
              ></canvas>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
                Top Platos
              </h3>
              <select
                value={topProductMetric}
                onChange={(e) =>
                  setTopProductMetric(e.target.value as TopProductMetric)
                }
                className="p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="cantidad">Por Cantidad</option>
                <option value="ingresos">Por Ingresos</option>
                <option value="utilidad">Por Utilidad</option>
              </select>
            </div>
            <div style={{ height: "400px" }}>
              <canvas
                ref={topProductsChartRef}
                aria-label="Top Platos"
                role="img"
              ></canvas>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
              <canvas
                ref={salesByServiceChartRef}
                style={{ height: "300px" }}
                aria-label="Ingresos por Canal de Venta"
                role="img"
              ></canvas>
            </div>
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
              <canvas
                ref={salesByDayOfWeekChartRef}
                style={{ height: "300px" }}
                aria-label="Ingresos por Día de la Semana"
                role="img"
              ></canvas>
            </div>
          </div>
        </>
      )}
      {!isLoading && !reportData && (
        <p className="text-center text-gray-500 dark:text-slate-400 py-10">
          Seleccione un rango de fechas y presione "Generar Reporte" para ver el
          análisis.
        </p>
      )}
    </div>
  );
};
