// types.ts

// 1. ums.json (Unidades de Medida)
export interface UnidadMedida {
  id: string; // Unique identifier
  unidad_nombre: string; // e.g., "ml", "g", "U", "RACION", "CAJA", "Pesos", "TROZO"
}

// NEW: For unit conversions
export interface ConversionUnidad {
  id: string;
  unidad_origen_id: string; // FK to UnidadMedida.id
  unidad_destino_id: string; // FK to UnidadMedida.id
  factor: number; // e.g., 1000 for kg to g
  producto_base_id?: string; // Optional FK to ProductoBase.id for specific conversions
}

export type ConversionUnidadFormData = Omit<ConversionUnidad, 'id'>;


// 2. productos_base.json (Lista de Productos/Ingredientes Base)
export interface ProductoBase {
  id: string; // Unique identifier, nombre_producto can be an alternative PK
  nombre_producto: string; // PK, e.g., "ACEITE", "AJÖ"
  um_predeterminada: string; // FK to UnidadMedida.id (or unidad_nombre if that's the key)
}

// 3. restaurantes_servicios.json (Canales de Venta/Servicios)
export interface RestauranteServicio {
  id: string; // Unique identifier
  nombre_servicio: string; // PK, e.g., "Mandado", "Catauro", "Restaurante"
}

// 4. proveedores.json (Lista de Proveedores de Alimentos)
export interface Proveedor {
  id: string; // Unique identifier
  nombre_proveedor: string; // PK, e.g., "CARRETILLERO"
}

// 5. platos.json (Lista de Platos Elaborados/Vendibles)
export interface Plato {
  id: string; // Unique identifier
  nombre_plato: string; // PK, e.g., "JUGO DE TOMATE"
}

// 6. cartas_tecnologicas.json (Recetas de los Platos)
export interface IngredienteReceta {
  id: string; // Unique identifier for the ingredient line item in a recipe
  producto_base_id: string; // FK to ProductoBase.id
  cantidad: number;
  unidad_medida_id: string; // FK to UnidadMedida.id
}

export interface CartaTecnologica {
  id: string; // Unique identifier for the recipe
  plato_id: string; // FK to Plato.id
  ingredientes_receta: IngredienteReceta[];
  otros_gastos?: number;
  combustible?: number;
  salario?: number;
  notas_preparacion?: string; // Added for AI generated instructions
}

// 7. inventario.json (Estado del Inventario)
export interface InventarioItem {
  id: string; // Same as ProductoBase.id for stockable items
  producto_base_id: string; // FK to ProductoBase.id
  unidad_medida_id: string; // FK to UnidadMedida.id (usually from ProductoBase.um_predeterminada)
  entradas: number; // Acumulado
  salidas: number; // Acumulado
  // stock_actual is calculated: entradas - salidas
  stock_minimo: number; // Editable, defaults to 0
  precio_promedio_ponderado: number; // Para costeo, updated by Compras
}

// 8. menu_precios.json (Precios de Venta de Platos por Servicio)
export interface MenuPrecioItem {
  id: string; // Unique identifier
  plato_id: string; // FK to Plato.id, identifies the menu entry
  // precio_costo removed
  precio_cocina?: number;
  precio_bar?: number;
  precio_restaurante?: number;
  precio_mandado?: number;
  precio_catauro?: number;
  precio_zelle_mandado?: number;
  precio_zelle_restaurante?: number;
}

// 9. transacciones.json (Registro de todas las operaciones)
export enum TipoTransaccion {
  COMPRA = "Compra",
  VENTA = "Venta",
  CONSUMO = "Consumo",
  CONSUMO_GASTO = "Consumo Gasto",
  MERMA = "Merma",
  PAGO_DEUDA = "Pago Deuda",
  AJUSTE_INVENTARIO_ENTRADA = "Ajuste Entrada",
  AJUSTE_INVENTARIO_SALIDA = "Ajuste Salida",
  OTRO_GASTO = "Otro Gasto" // Nueva
}

export enum EstadoPago {
  EFECTIVO = "EFECTIVO",
  TRANSFERENCIA = "TRANSFERENCIA",
  PENDIENTE = "PENDIENTE",
  NA = "N/A", // Not Applicable (e.g., for Consumo transactions)
  PROMOCION = "PROMOCION", // For $0 sales under promotion
  PAGADO = "PAGADO", // For Otros Gastos
  ZELLE = "ZELLE" // Added for Zelle payments
}

export interface Transaccion {
  id_transaccion: string;
  fecha: string; // ISO string format e.g. new Date().toISOString()
  tipo_transaccion: TipoTransaccion;
  producto_plato_nombre: string; // Name of the Plato (for Venta/Merma) or ProductoBase (for Compra/Consumo) or Descripcion (OtroGasto)
  cantidad: number;
  precio_unitario?: number; // Sale price for Venta, Purchase price for Compra, Avg Cost for Consumo, Gasto amount for OtroGasto
  importe_total: number; // cantidad * precio_unitario for Venta/Compra. Cost for Consumo/Consumo_gasto/Merma. Gasto amount for OtroGasto
  costo_total_transaccion?: number; // Cost of goods sold for Venta/Merma. For Compra, this is the importe_total. For OtroGasto, it's the importe_total
  utilidad_transaccion?: number; // For Venta: importe_total - costo_total_transaccion
  servicio_proveedor_nombre: string; // RestauranteServicio.nombre_servicio or Proveedor.nombre_proveedor or "Interno" or CategoriaGasto
  plato_relacionado_id?: string; // FK to Plato.id (if transaction is about a specific dish, like a Venta)
  producto_base_relacionado_id?: string; // FK to ProductoBase.id (if transaction is about a specific ingredient, like Compra/Consumo)
  estado_pago?: EstadoPago;
  nombre_deudor?: string;
  descripcion_pago_deuda?: string;
  impuesto_terceros?: number; // e.g., commission amount
  unidad_medida_nombre?: string; // For display/reporting, e.g. "g", "ml", "U"
  referencia_factura_proveedor?: string;
  notas?: string;
  id_venta_origen?: string; // FK to Transaccion.id_transaccion (for Consumo/Consumo_gasto linked to a Venta)
}

// 10. configuracion.json (Parámetros Generales)
export interface Configuracion {
  id: string; // Should be a single, known ID like 'main_config'
  comision_catauro_pct: number;
  comision_mandado_pct: number;
  zelle_mandado_valor: number;
  zelle_restaurante_valor: number;
  nombre_restaurante: string;
  slogan_restaurante?: string;
  moneda_principal: string;
  direccion_restaurante?: string;
  telefono_restaurante?: string;
  id_fiscal_restaurante?: string;
  default_estado_pago: EstadoPago;
  simbolo_moneda: string;
}

// 11. otros_gastos.json (Nuevo)
export enum CategoriasGasto {
  IMPUESTOS = "Impuestos",
  SERVICIOS_PUBLICOS = "Servicios (Luz, Agua, Teléfono, Gas)",
  ALQUILER = "Alquiler",
  MANTENIMIENTO = "Mantenimiento y Reparaciones",
  SALARIOS_ADMIN = "Salarios (Administrativos/Otros)",
  SUMINISTROS_OFICINA_LIMPIEZA = "Suministros (Oficina/Limpieza)",
  MARKETING = "Marketing y Publicidad",
  TRANSPORTE_NO_RECETA = "Transporte (No Receta)",
  COMPRA_ACTIVOS = "Compra de Activos Fijos",
  MATERIA_PRIMA_NO_RECETA = "Materia Prima (No Receta)",
  GASTOS_FINANCIEROS = "Gastos Financieros",
  OTROS_VARIOS = "Otros Gastos Varios"
}

export const ALL_CATEGORIAS_GASTO: string[] = Object.values(CategoriasGasto);


export interface OtroGasto {
  id: string;
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  categoria: string; // Free text for now, e.g., "Impuestos", "Electricidad", "Alquiler"
  importe: number;
  notas?: string;
}

// Helper types for forms or operations
export type UnidadMedidaFormData = Omit<UnidadMedida, 'id'>;
export type ProductoBaseFormData = Omit<ProductoBase, 'id'>;
export type PlatoFormData = Omit<Plato, 'id'>;
export type ProveedorFormData = Omit<Proveedor, 'id'>;
export type RestauranteServicioFormData = Omit<RestauranteServicio, 'id'>;

export type IngredienteRecetaFormData = Omit<IngredienteReceta, 'id'>;

export type CartaTecnologicaFormState = Omit<CartaTecnologica, 'id' | 'ingredientes_receta' | 'otros_gastos' | 'combustible' | 'salario' | 'notas_preparacion'> & {
  id?: string; // Present if editing
  ingredientes_receta: (Omit<IngredienteReceta, 'id'> & { id?: string; temp_id?: string })[];
  otros_gastos?: number;
  combustible?: number;
  salario?: number;
  notas_preparacion?: string; // Added
};

export type MenuPrecioFormData = Omit<MenuPrecioItem, 'id'>;

export type InventarioFormData = {
  producto_base_id: string; // Read-only in form, identifies the item
  stock_minimo: number;
};

// New type for full inventory editing
export type InventarioEditFormData = {
  producto_base_id: string;
  entradas: number;
  stock_minimo: number;
  precio_promedio_ponderado: number;
};


export interface VentaFormData {
  fecha: string; // ISO date string
  servicio_id: string;
  plato_id: string;
  cantidad: number;
  estado_pago: EstadoPago;
  nombre_deudor?: string;
}

export interface CompraFormData {
  fecha: string; // ISO date string
  proveedor_id: string;
  producto_base_id: string;
  cantidad: number;
  precio_unitario: number;
  unidad_compra_id?: string;
  // importe_total is calculated
  referencia_factura_proveedor?: string;
  notas?: string;
  estado_pago: EstadoPago;
}

// Type for editing a pending purchase transaction
export type CompraEditFormData = Omit<CompraFormData, 'estado_pago' | 'unidad_compra_id'> & {
  id_transaccion: string;
};


export type ConfiguracionFormData = Omit<Configuracion, 'id'>;

export type OtroGastoFormData = Omit<OtroGasto, 'id'>;

export interface GastoPorCategoria {
  categoria: string;
  total: number;
}

export interface CierreMensual {
  id: string; // YYYY-MM format
  mes: string; // YYYY-MM
  saldo_inicial: number;
  total_ingresos: number;
  total_costo_ventas: number;
  total_compras_inventario: number;
  total_otros_gastos_directos: number; // Sum of all OtroGasto.importe from OtrosGastos collection for the month
  gastos_por_categoria: GastoPorCategoria[]; // Detailed breakdown for display/PDF
  total_impuestos_terceros_ventas: number;
  total_comisiones_servicio_ventas: number; // Added this field
  utilidad_bruta: number;
  gastos_operativos_totales: number;
  utilidad_antes_impuesto_negocio: number;
  impuesto_negocio_pagado: number;
  utilidad_neta_mes: number;
  saldo_final_mes: number;
  fecha_cierre: string; // ISO date string
  notas_cierre?: string;
}

export interface CierreMensualFormData {
  mes_a_cerrar: string; // YYYY-MM
  saldo_inicial_manual?: number; // Only for the very first closing
  impuesto_negocio_pagado: number;
  notas_cierre?: string;
}

// Represents the entire database stored in localStorage
export interface AppDatabase {
  ums: UnidadMedida[];
  productos_base: ProductoBase[];
  restaurantes_servicios: RestauranteServicio[];
  proveedores: Proveedor[];
  platos: Plato[];
  cartas_tecnologicas: CartaTecnologica[];
  inventario: InventarioItem[];
  menu_precios: MenuPrecioItem[];
  transacciones: Transaccion[];
  configuracion: Configuracion[];
  otros_gastos: OtroGasto[];
  cierres_mensuales: CierreMensual[];
  conversiones_unidades: ConversionUnidad[]; // New
}

export const DEFAULT_EMPTY_DB: AppDatabase = {
  ums: [],
  productos_base: [],
  restaurantes_servicios: [],
  proveedores: [],
  platos: [],
  cartas_tecnologicas: [],
  inventario: [],
  menu_precios: [],
  transacciones: [],
  configuracion: [],
  otros_gastos: [],
  cierres_mensuales: [],
  conversiones_unidades: [], // New
};

// --- Performance Analytics Types ---
export interface PlatoPerformance {
  platoId: string;
  nombrePlato: string;
  cantidadVendida: number;
  ingresosTotales: number;
  costoTotal: number;
  utilidadTotal: number;
}

export interface SalesByPeriodData {
  periodo: string; // e.g., "2023-01", "2023-Q1", "2023-S1", "2023", or "Semana Actual"
  ingresos: number;
  cantidadVentas: number; // total items sold in period
  costoTotal: number;
  utilidadTotal: number;
  numeroTransacciones?: number; // number of sale transactions in period
}

export interface QuickSalesReport {
    ingresos: number;
    cantidadVentas: number; // total items sold
    utilidad: number;
    numeroTransacciones: number;
}

export interface SalesByDayOfWeekData {
    dayName: string; // 'Domingo', 'Lunes', etc.
    dayIndex: number; // 0 for Sunday, 1 for Monday, etc.
    cantidadVendida: number;
    utilidadTotal: number;
    ingresosTotales: number;
}

export interface WeeklySalesData {
    weekLabel: string; // e.g., "Semana Actual", "Semana Anterior 1"
    startDate: string; // ISO Date string
    endDate: string; // ISO Date string
    cantidadVendida: number;
    utilidadTotal: number;
    ingresosTotales: number;
}

export interface SalesByServiceChannelData {
  servicioNombre: string;
  ingresos: number;
  costoTotal: number;
  utilidadTotal: number;
  cantidadItems: number;
  numeroTransacciones: number;
  utilidadPromedioPorTransaccion: number;
}

export interface SalesByDateData { // For daily view where multiple days might be listed in a table
  fecha: string; // YYYY-MM-DD
  ingresos: number;
  cantidadVentas: number;
  costoTotal: number;
  utilidadTotal: number;
  numeroTransacciones?: number;
}

export interface PerformanceAnalyticsData {
  resumenGeneral: {
    totalIngresos: number;
    totalVentas: number; // total items sold
    totalCostoVentas: number;
    totalUtilidad: number;
    ticketPromedio: number; // totalIngresos / numeroTotalTransaccionesVenta
    availableYears: string[];
    // Quick reports
    ventasHoy?: QuickSalesReport;
    ventasAyer?: QuickSalesReport;
    ventasSemanaActual?: QuickSalesReport;
    ventasSemanaAnterior?: QuickSalesReport;
  };
  platosMasVendidos: PlatoPerformance[]; // Sorted by cantidadVendida
  platosMayoresIngresos: PlatoPerformance[]; // Sorted by ingresosTotales
  platosMayorUtilidad: PlatoPerformance[]; // Sorted by utilidadTotal
  ventasMensuales: SalesByPeriodData[];
  ventasTrimestrales: SalesByPeriodData[];
  ventasSemestrales: SalesByPeriodData[];
  ventasAnuales: SalesByPeriodData[];
  // New detailed analytics
  salesByDayOfWeek_CurrentWeek?: SalesByDayOfWeekData[];
  salesByLast4Weeks?: WeeklySalesData[];
  salesByServiceChannel?: SalesByServiceChannelData[];
  ventasPorDia?: SalesByDateData[]; // For future daily chart/table listing multiple days
  // ventasDiaSeleccionado will be handled on-demand by AnalisisRendimiento, not stored here
}

// --- VentaForm Specific Types ---
export interface PlatoDisponibleVenta {
  platoId: string;
  nombrePlato: string;
  precio?: number; // Price for the current service
  isAvailable: boolean; // Based on inventory
}

export interface InventarioFaltanteDetalle {
    nombre: string;
    cantidadNecesaria: number;
    cantidadFaltante: number;
    unidad: string;
}

// --- Estado de Cuenta (Income Statement) Types ---
export interface EstadoCuentaData {
  periodoSeleccionado: string;
  saldoInicialMesEstimado: number;
  ingresosTotalesVentas: number;
  costoMercanciaVendida: number;
  utilidadBruta: number;
  totalComprasInventario: number;
  totalComisionesServicioVentas: number;
  gastosPorCategoria: GastoPorCategoria[];
  total_otros_gastos_directos: number; // Added this line
  totalGastosOperativos: number;
  utilidadNetaPeriodo: number;
  saldoFinalPeriodoEstimado: number;

  ventasDelPeriodo: Transaccion[];
  comprasDelPeriodo: Transaccion[];
  otrosGastosDelPeriodo: OtroGasto[];
}

// For Cierre Mensual calculations, if we need to show a pre-calculation screen
// saldo_inicial is now part of CierreMensual, and NOT Omitted here, so it will be included.
export interface CierreMensualCalculatedData extends Omit<CierreMensual, 'id' | 'mes' | 'fecha_cierre' | 'impuesto_negocio_pagado' | 'notas_cierre'> {
}

// --- AI Assistant Types ---
export interface AiPromptDetails {
  dishType: string;
  cuisineStyle: string;
  keyIngredients: string;
  dietaryRestrictions?: string;
  numberOfSuggestions: number;
  model?: string; // Added model field
}

export interface IngredienteDetallado {
  nombre: string;
  cantidad: string; // e.g., "100 gramos", "2 unidades", "1 cucharadita"
}

export interface AiGeneratedIdea {
  nombre_plato: string;
  descripcion_corta: string;
  ingredientes_detallados: IngredienteDetallado[];
  instrucciones_preparacion: string[]; // Array of steps for the recipe
  tiempo_preparacion?: string;    // e.g., "20 minutos"
  tiempo_coccion?: string;        // e.g., "45 minutos"
  tiempo_total?: string;          // e.g., "1 hora 5 minutos"
  porciones_sugeridas?: string;   // e.g., "4 personas"
  consejos_chef?: string[];       // Array of tips or professional advice
}

// --- Ficha de Costo de Plato (Dish Cost Sheet) Types ---
export interface CostoIngredienteDetalle {
    nombre_producto: string;
    cantidad_receta: number;
    unidad_nombre: string;
    costo_unitario_promedio: number;
    costo_total_ingrediente: number;
}

export interface FichaCostoPlatoData {
    platoId: string;
    nombrePlato: string;
    ingredientes: CostoIngredienteDetalle[];
    costo_total_ingredientes: number;
    otros_gastos_receta: number;
    combustible_receta: number;
    salario_receta: number;
    costo_total_produccion_unitario: number;
    notas_preparacion?: string;
}

// --- Estado de Flujo de Efectivo (Cash Flow Statement) Types ---
export interface FlujoEfectivoData {
  periodoSeleccionado: string;
  // Inflows
  ingresosPorVentasContado: number;
  totalIngresos: number;
  // Outflows
  salidasPorComprasContado: number;
  salidasPorOtrosGastos: number;
  totalSalidas: number;
  // Summary
  flujoNetoOperativo: number;
  // Details for PDF
  ventasContado: Transaccion[];
  comprasContado: Transaccion[];
  otrosGastos: OtroGasto[];
}

// --- Balance General (Balance Sheet) Types ---
export interface BalanceGeneralData {
  mes: string;
  fechaCierre: string;
  // Activos
  totalActivos: number;
  efectivo: number;
  cuentasPorCobrar: number;
  inventario: number;
  // Pasivos
  totalPasivos: number;
  cuentasPorPagar: number;
  // Patrimonio
  patrimonio: number;
}