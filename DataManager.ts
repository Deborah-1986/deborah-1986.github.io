// DataManager.ts
import {
  UnidadMedida,
  UnidadMedidaFormData,
  ProductoBase,
  ProductoBaseFormData,
  RestauranteServicio,
  RestauranteServicioFormData,
  Proveedor,
  ProveedorFormData,
  Plato,
  PlatoFormData,
  CartaTecnologica,
  InventarioItem,
  MenuPrecioItem,
  MenuPrecioFormData,
  Transaccion,
  Configuracion,
  AppDatabase,
  DEFAULT_EMPTY_DB,
  VentaFormData,
  CompraFormData,
  CompraEditFormData,
  TipoTransaccion,
  EstadoPago,
  InventarioEditFormData,
  OtroGasto,
  OtroGastoFormData,
  CierreMensual,
  EstadoCuentaData,
  CierreMensualFormData,
  CierreMensualCalculatedData,
  AiPromptDetails,
  AiGeneratedIdea,
  FichaCostoPlatoData,
  FlujoEfectivoData,
  BalanceGeneralData,
  PerformanceAnalyticsData,
  InventarioFaltanteDetalle,
  CostoIngredienteDetalle,
  GastoPorCategoria,
  ConversionUnidad,
  ConversionUnidadFormData,
} from "./types.js";

// Declarations for globally loaded libraries
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

console.log("DataManager.ts script starting execution... v28-pdf-cell-styling");

const DB_KEY = "ladybeer_db";
let db: AppDatabase = DEFAULT_EMPTY_DB;

// --- Utility Functions ---
export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// --- Seeding de conversiones estándar ---
const SEED_CONVERSIONES: Omit<ConversionUnidad, "id">[] = [
  // kg <-> g
  { unidad_origen_id: "", unidad_destino_id: "", factor: 1000 }, // placeholder, se asignan ids reales abajo
  // g <-> kg
  { unidad_origen_id: "", unidad_destino_id: "", factor: 0.001 },
  // L <-> ml
  { unidad_origen_id: "", unidad_destino_id: "", factor: 1000 },
  // ml <-> L
  { unidad_origen_id: "", unidad_destino_id: "", factor: 0.001 },
  // Docena <-> Unidad
  { unidad_origen_id: "", unidad_destino_id: "", factor: 12 },
  // Unidad <-> Docena
  { unidad_origen_id: "", unidad_destino_id: "", factor: 1 / 12 },
];

const seedConversiones = (db: AppDatabase) => {
  // Buscar los ids de las unidades estándar
  const kg = db.ums.find((u) => u.unidad_nombre.toLowerCase() === "kg");
  const g = db.ums.find((u) => u.unidad_nombre.toLowerCase() === "g");
  const l = db.ums.find(
    (u) =>
      u.unidad_nombre.toLowerCase() === "l" ||
      u.unidad_nombre.toLowerCase() === "litro"
  );
  const ml = db.ums.find((u) => u.unidad_nombre.toLowerCase() === "ml");
  const docena = db.ums.find((u) =>
    u.unidad_nombre.toLowerCase().includes("docena")
  );
  const unidad = db.ums.find(
    (u) =>
      u.unidad_nombre.toLowerCase() === "unidad" ||
      u.unidad_nombre.toLowerCase() === "u"
  );
  // Asignar ids reales
  const seeds: Omit<ConversionUnidad, "id">[] = [
    kg && g
      ? { unidad_origen_id: kg.id, unidad_destino_id: g.id, factor: 1000 }
      : null,
    g && kg
      ? { unidad_origen_id: g.id, unidad_destino_id: kg.id, factor: 0.001 }
      : null,
    l && ml
      ? { unidad_origen_id: l.id, unidad_destino_id: ml.id, factor: 1000 }
      : null,
    ml && l
      ? { unidad_origen_id: ml.id, unidad_destino_id: l.id, factor: 0.001 }
      : null,
    docena && unidad
      ? {
          unidad_origen_id: docena.id,
          unidad_destino_id: unidad.id,
          factor: 12,
        }
      : null,
    unidad && docena
      ? {
          unidad_origen_id: unidad.id,
          unidad_destino_id: docena.id,
          factor: 1 / 12,
        }
      : null,
  ].filter(Boolean) as Omit<ConversionUnidad, "id">[];
  // Insertar solo si no existe ya esa conversión
  for (const seed of seeds) {
    const exists = db.conversiones_unidades.some(
      (c) =>
        !c.producto_base_id &&
        c.unidad_origen_id === seed.unidad_origen_id &&
        c.unidad_destino_id === seed.unidad_destino_id
    );
    if (!exists) {
      db.conversiones_unidades.push({ ...seed, id: generateId() });
    }
  }
};

const loadDb = (): AppDatabase => {
  try {
    const storedDb = localStorage.getItem(DB_KEY);
    if (storedDb) {
      const parsedDb = JSON.parse(storedDb) as AppDatabase;
      // Ensure new collections exist if loading an old DB
      if (!parsedDb.conversiones_unidades) {
        parsedDb.conversiones_unidades = [];
      }
      // Seeding automático de conversiones estándar
      seedConversiones(parsedDb);
      return parsedDb;
    }
  } catch (e) {
    console.error("Error loading DB from localStorage:", e);
  }
  // Si no hay DB previa, también seed en la default
  const db = { ...DEFAULT_EMPTY_DB };
  seedConversiones(db);
  return db;
};

const saveDb = (currentDb: AppDatabase): boolean => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(currentDb));
    return true;
  } catch (e) {
    console.error("Error saving DB to localStorage:", e);
    return false;
  }
};

export const refreshDb = (): void => {
  db = loadDb();
};
refreshDb();

// --- Configuration ---
export const DEFAULT_USERNAME = "Admin";
let currentPassword = "Ladybeersaborcubano"; // Updated default

export const getInitialConfig = (): Configuracion => {
  if (db.configuracion.length === 0) {
    const defaultConfig: Configuracion = {
      id: "main_config",
      comision_catauro_pct: 0.1,
      comision_mandado_pct: 0.1,
      zelle_mandado_valor: 1,
      zelle_restaurante_valor: 1,
      nombre_restaurante: "Lady Beer",
      slogan_restaurante: "Sabor que Refresca",
      moneda_principal: "CUP",
      direccion_restaurante: "Calle Falsa 123, Ciudad Ejemplo",
      telefono_restaurante: "+53 5555 5555",
      id_fiscal_restaurante: "NIT 123456789-0",
      default_estado_pago: EstadoPago.EFECTIVO,
      simbolo_moneda: "$",
    };
    db.configuracion.push(defaultConfig);
    saveDb(db);
    return defaultConfig;
  }
  return db.configuracion[0];
};

export const saveConfig = (config: Configuracion): boolean => {
  const configIndex = db.configuracion.findIndex((c) => c.id === config.id);
  if (configIndex > -1) {
    db.configuracion[configIndex] = config;
  } else {
    db.configuracion.push(config);
  }
  return saveDb(db);
};

export const getPassword = (): string => {
  const stored = localStorage.getItem("app_password");
  return stored || currentPassword;
};

export const setPassword = (newPassword: string): boolean => {
  try {
    localStorage.setItem("app_password", newPassword);
    currentPassword = newPassword;
    return true;
  } catch (e) {
    console.error("Error setting password:", e);
    return false;
  }
};

// Unidades de Medida (ums)
export const getUms = (): UnidadMedida[] => [...db.ums];
export const addUm = (data: UnidadMedidaFormData): UnidadMedida | null => {
  const newUm: UnidadMedida = { ...data, id: generateId() };
  db.ums.push(newUm);
  if (saveDb(db)) return newUm;
  return null;
};
export const updateUm = (data: UnidadMedida): boolean => {
  const index = db.ums.findIndex((um) => um.id === data.id);
  if (index > -1) {
    db.ums[index] = data;
    return saveDb(db);
  }
  return false;
};
export const deleteUm = (id: string): void => {
  db.ums = db.ums.filter((um) => um.id !== id);
  // Cascade delete conversions
  db.conversiones_unidades = db.conversiones_unidades.filter(
    (c) => c.unidad_origen_id !== id && c.unidad_destino_id !== id
  );
  saveDb(db);
};

// Conversiones de Unidades
export const getConversiones = (): ConversionUnidad[] => [
  ...db.conversiones_unidades,
];
export const addConversion = (
  data: ConversionUnidadFormData
): ConversionUnidad | null => {
  const newConversion: ConversionUnidad = { ...data, id: generateId() };
  db.conversiones_unidades.push(newConversion);
  if (saveDb(db)) return newConversion;
  return null;
};
export const updateConversion = (data: ConversionUnidad): boolean => {
  const index = db.conversiones_unidades.findIndex((c) => c.id === data.id);
  if (index > -1) {
    db.conversiones_unidades[index] = data;
    return saveDb(db);
  }
  return false;
};
export const deleteConversion = (id: string): boolean => {
  const initialLength = db.conversiones_unidades.length;
  db.conversiones_unidades = db.conversiones_unidades.filter(
    (c) => c.id !== id
  );
  return initialLength > db.conversiones_unidades.length && saveDb(db);
};

// Productos Base
export const getProductosBase = (): ProductoBase[] => {
  // Siempre recargar desde localStorage para reflejar el estado real
  const freshDb = loadDb();
  return [...freshDb.productos_base];
};
export const addProductoBase = (
  data: ProductoBaseFormData
): ProductoBase | null => {
  const newProd: ProductoBase = { ...data, id: generateId() };
  db.productos_base.push(newProd);
  if (saveDb(db)) return newProd;
  return null;
};
export const updateProductoBase = (data: ProductoBase): boolean => {
  const index = db.productos_base.findIndex((pb) => pb.id === data.id);
  if (index > -1) {
    db.productos_base[index] = data;
    const invItemIndex = db.inventario.findIndex(
      (item) => item.producto_base_id === data.id
    );
    if (invItemIndex > -1) {
      db.inventario[invItemIndex].unidad_medida_id = data.um_predeterminada;
    }
    return saveDb(db);
  }
  return false;
};
// Eliminar producto base está deshabilitado para proteger la integridad del sistema
export const deleteProductoBase = async (id: string): Promise<void> => {
  // Forzar recarga de la base de datos antes de eliminar
  await refreshDb();
  // Eliminar todas las transacciones de compra asociadas a este producto base
  db.transacciones = db.transacciones.filter(
    (t) =>
      !(
        t.tipo_transaccion === TipoTransaccion.COMPRA &&
        t.producto_base_relacionado_id === id
      )
  );
  // Eliminar todas las entradas de inventario asociadas
  db.inventario = db.inventario.filter((item) => item.producto_base_id !== id);
  // Eliminar todas las recetas (cartas tecnológicas) que usen este producto base como ingrediente
  db.cartas_tecnologicas = db.cartas_tecnologicas.filter((ct) => {
    if (!ct.ingredientes_receta || !Array.isArray(ct.ingredientes_receta))
      return true;
    return !ct.ingredientes_receta.some((ing) => ing.producto_base_id === id);
  });
  // Eliminar el producto base
  db.productos_base = db.productos_base.filter((pb) => pb.id !== id);
  await saveDb(db);
  // Refrescar el objeto db en memoria para asegurar sincronización
  await refreshDb();
};

// Eliminar solo una entrada de inventario (por producto_base_id)
export const deleteInventarioEntrada = (producto_base_id: string): boolean => {
  const index = db.inventario.findIndex(
    (item) => item.producto_base_id === producto_base_id
  );
  if (index > -1) {
    db.inventario.splice(index, 1);
    return saveDb(db);
  }
  return false;
};

// Platos
export const getPlatos = (): Plato[] => [...db.platos];
export const addPlato = (data: PlatoFormData): Plato | null => {
  const newPlato: Plato = { ...data, id: generateId() };
  db.platos.push(newPlato);
  if (saveDb(db)) return newPlato;
  return null;
};
export const updatePlato = (data: Plato): boolean => {
  const index = db.platos.findIndex((p) => p.id === data.id);
  if (index > -1) {
    db.platos[index] = data;
    return saveDb(db);
  }
  return false;
};
export const deletePlato = (id: string): void => {
  db.platos = db.platos.filter((p) => p.id !== id);
  db.cartas_tecnologicas = db.cartas_tecnologicas.filter(
    (ct) => ct.plato_id !== id
  );
  db.menu_precios = db.menu_precios.filter((mp) => mp.plato_id !== id);
  saveDb(db);
};

// Proveedores
export const getProveedores = (): Proveedor[] => [...db.proveedores];
export const addProveedor = (data: ProveedorFormData): Proveedor | null => {
  const newProv: Proveedor = { ...data, id: generateId() };
  db.proveedores.push(newProv);
  if (saveDb(db)) return newProv;
  return null;
};
export const updateProveedor = (data: Proveedor): boolean => {
  const index = db.proveedores.findIndex((p) => p.id === data.id);
  if (index > -1) {
    db.proveedores[index] = data;
    return saveDb(db);
  }
  return false;
};
export const deleteProveedor = (id: string): void => {
  db.proveedores = db.proveedores.filter((p) => p.id !== id);
  saveDb(db);
};

// RestaurantesServicios
export const getRestaurantesServicios = (): RestauranteServicio[] => [
  ...db.restaurantes_servicios,
];
export const addRestauranteServicio = (
  data: RestauranteServicioFormData
): RestauranteServicio | null => {
  const newServ: RestauranteServicio = { ...data, id: generateId() };
  db.restaurantes_servicios.push(newServ);
  if (saveDb(db)) return newServ;
  return null;
};
export const updateRestauranteServicio = (
  data: RestauranteServicio
): boolean => {
  const index = db.restaurantes_servicios.findIndex((s) => s.id === data.id);
  if (index > -1) {
    db.restaurantes_servicios[index] = data;
    return saveDb(db);
  }
  return false;
};
export const deleteRestauranteServicio = (id: string): void => {
  db.restaurantes_servicios = db.restaurantes_servicios.filter(
    (s) => s.id !== id
  );
  saveDb(db);
};

// CartasTecnologicas
export const getCartasTecnologicas = (): CartaTecnologica[] => [
  ...db.cartas_tecnologicas,
];
export const addCartaTecnologica = (
  data: CartaTecnologica
): CartaTecnologica | null => {
  const newCarta: CartaTecnologica = { ...data, id: data.id || generateId() };
  db.cartas_tecnologicas.push(newCarta);
  if (saveDb(db)) return newCarta;
  return null;
};
export const updateCartaTecnologica = (data: CartaTecnologica): boolean => {
  const index = db.cartas_tecnologicas.findIndex((ct) => ct.id === data.id);
  if (index > -1) {
    db.cartas_tecnologicas[index] = data;
    return saveDb(db);
  }
  return false;
};
export const deleteCartaTecnologica = (id: string): void => {
  db.cartas_tecnologicas = db.cartas_tecnologicas.filter((ct) => ct.id !== id);
  saveDb(db);
};

// MenuPrecios
export const getMenuPrecios = (): MenuPrecioItem[] => [...db.menu_precios];
export const addMenuPrecio = (
  data: MenuPrecioFormData
): MenuPrecioItem | null => {
  const newMp: MenuPrecioItem = { ...data, id: generateId() };
  db.menu_precios.push(newMp);
  if (saveDb(db)) return newMp;
  return null;
};
export const updateMenuPrecio = (data: MenuPrecioItem): boolean => {
  const index = db.menu_precios.findIndex((mp) => mp.id === data.id);
  if (index > -1) {
    db.menu_precios[index] = data;
    return saveDb(db);
  }
  return false;
};
export const deleteMenuPrecio = (id: string): void => {
  db.menu_precios = db.menu_precios.filter((mp) => mp.id !== id);
  saveDb(db);
};

// Inventario
export const getInventarioItems = (): InventarioItem[] => [...db.inventario];
export const updateInventarioItemStockMinimo = (
  producto_base_id: string,
  stock_minimo: number
): boolean => {
  const index = db.inventario.findIndex(
    (item) => item.producto_base_id === producto_base_id
  );
  if (index > -1) {
    db.inventario[index].stock_minimo = stock_minimo;
    return saveDb(db);
  }
  return false;
};
export const updateInventarioItemFull = (
  data: InventarioEditFormData
): boolean => {
  const index = db.inventario.findIndex(
    (item) => item.producto_base_id === data.producto_base_id
  );
  if (index > -1) {
    db.inventario[index].entradas = data.entradas;
    db.inventario[index].stock_minimo = data.stock_minimo;
    if (data.precio_promedio_ponderado !== undefined) {
      db.inventario[index].precio_promedio_ponderado =
        data.precio_promedio_ponderado;
    }
    return saveDb(db);
  }
  return false;
};

export const updateCompraPendiente = (
  data: CompraEditFormData
): { success: boolean; message: string } => {
  const index = db.transacciones.findIndex(
    (t) => t.id_transaccion === data.id_transaccion
  );
  if (index === -1) {
    return {
      success: false,
      message: "La transacción de compra no fue encontrada.",
    };
  }
  const transaccion = db.transacciones[index];
  if (
    transaccion.tipo_transaccion !== TipoTransaccion.COMPRA ||
    transaccion.estado_pago !== EstadoPago.PENDIENTE
  ) {
    return {
      success: false,
      message: "Solo se pueden modificar transacciones de compra pendientes.",
    };
  }
  const producto = db.productos_base.find(
    (p) => p.id === data.producto_base_id
  );
  const proveedor = db.proveedores.find((p) => p.id === data.proveedor_id);
  if (!producto || !proveedor) {
    return { success: false, message: "Producto o proveedor no válido." };
  }
  transaccion.fecha = data.fecha;
  transaccion.servicio_proveedor_nombre = proveedor.nombre_proveedor;
  transaccion.producto_plato_nombre = producto.nombre_producto;
  transaccion.producto_base_relacionado_id = data.producto_base_id;
  transaccion.cantidad = data.cantidad;
  transaccion.precio_unitario = data.precio_unitario;
  transaccion.importe_total = data.cantidad * data.precio_unitario;
  transaccion.costo_total_transaccion = transaccion.importe_total;
  transaccion.referencia_factura_proveedor = data.referencia_factura_proveedor;
  transaccion.notas = data.notas;
  transaccion.unidad_medida_nombre = db.ums.find(
    (u) => u.id === producto.um_predeterminada
  )?.unidad_nombre;
  if (saveDb(db)) {
    return {
      success: true,
      message: "Compra pendiente actualizada exitosamente.",
    };
  }
  return {
    success: false,
    message: "Error al guardar los cambios en la base de datos.",
  };
};

// Transacciones
export const getTransacciones = (): Transaccion[] => {
  refreshDb();
  return [...db.transacciones];
};

// OtrosGastos
export const getOtrosGastos = (): OtroGasto[] => [...db.otros_gastos];
export const registrarOtroGasto = (
  data: OtroGastoFormData
): { success: boolean; message: string } => {
  const newGasto: OtroGasto = { ...data, id: generateId() };
  db.otros_gastos.push(newGasto);
  const transaccion: Transaccion = {
    id_transaccion: generateId(),
    fecha: data.fecha,
    tipo_transaccion: TipoTransaccion.OTRO_GASTO,
    producto_plato_nombre: data.descripcion,
    cantidad: 1,
    precio_unitario: data.importe,
    importe_total: data.importe,
    costo_total_transaccion: data.importe,
    servicio_proveedor_nombre: data.categoria,
    estado_pago: EstadoPago.PAGADO,
    notas: data.notas,
  };
  db.transacciones.push(transaccion);
  if (saveDb(db))
    return { success: true, message: "Gasto registrado exitosamente." };
  return { success: false, message: "Error al guardar el gasto." };
};
export const updateOtroGasto = (
  data: OtroGasto
): { success: boolean; message: string } => {
  const index = db.otros_gastos.findIndex((g) => g.id === data.id);
  if (index > -1) {
    const oldGasto = db.otros_gastos[index];
    db.otros_gastos[index] = data;
    const trIndex = db.transacciones.findIndex(
      (t) =>
        t.tipo_transaccion === TipoTransaccion.OTRO_GASTO &&
        t.producto_plato_nombre === oldGasto.descripcion &&
        t.servicio_proveedor_nombre === oldGasto.categoria &&
        new Date(t.fecha).toISOString().split("T")[0] ===
          new Date(oldGasto.fecha).toISOString().split("T")[0] &&
        t.importe_total === oldGasto.importe
    );
    if (trIndex > -1) {
      db.transacciones[trIndex].fecha = data.fecha;
      db.transacciones[trIndex].producto_plato_nombre = data.descripcion;
      db.transacciones[trIndex].precio_unitario = data.importe;
      db.transacciones[trIndex].importe_total = data.importe;
      db.transacciones[trIndex].costo_total_transaccion = data.importe;
      db.transacciones[trIndex].servicio_proveedor_nombre = data.categoria;
      db.transacciones[trIndex].notas = data.notas;
    } else {
      console.warn(
        "No se encontró la transacción original del gasto para actualizar."
      );
    }
    if (saveDb(db)) return { success: true, message: "Gasto actualizado." };
    return { success: false, message: "Error al actualizar gasto." };
  }
  return { success: false, message: "Gasto no encontrado." };
};
export const deleteOtroGasto = (
  id: string
): { success: boolean; message: string } => {
  const gasto = db.otros_gastos.find((g) => g.id === id);
  if (gasto) {
    db.otros_gastos = db.otros_gastos.filter((g) => g.id !== id);
    const trIndex = db.transacciones.findIndex(
      (t) =>
        t.tipo_transaccion === TipoTransaccion.OTRO_GASTO &&
        t.producto_plato_nombre === gasto.descripcion &&
        t.servicio_proveedor_nombre === gasto.categoria &&
        new Date(t.fecha).toISOString().split("T")[0] ===
          new Date(gasto.fecha).toISOString().split("T")[0] &&
        t.importe_total === gasto.importe
    );
    if (trIndex > -1) {
      db.transacciones.splice(trIndex, 1);
    } else {
      console.warn(
        "No se encontró la transacción original del gasto para eliminar."
      );
    }
    if (saveDb(db)) return { success: true, message: "Gasto eliminado." };
    return { success: false, message: "Error al eliminar gasto." };
  }
  return { success: false, message: "Gasto no encontrado para eliminar." };
};

// CierresMensuales
export const getCierresMensuales = (): CierreMensual[] => [
  ...db.cierres_mensuales,
];
export const addCierreMensual = (
  formData: CierreMensualFormData,
  calculatedData: CierreMensualCalculatedData
): { success: boolean; message: string } => {
  const existing = db.cierres_mensuales.find(
    (c) => c.mes === formData.mes_a_cerrar
  );
  if (existing) {
    return {
      success: false,
      message: `El mes ${formData.mes_a_cerrar} ya ha sido cerrado.`,
    };
  }
  const newCierre: CierreMensual = {
    id: formData.mes_a_cerrar,
    mes: formData.mes_a_cerrar,
    fecha_cierre: new Date().toISOString(),
    impuesto_negocio_pagado: formData.impuesto_negocio_pagado,
    notas_cierre: formData.notas_cierre,
    ...calculatedData,
  };
  db.cierres_mensuales.push(newCierre);
  if (saveDb(db))
    return { success: true, message: "Cierre mensual realizado exitosamente." };
  return { success: false, message: "Error al guardar el cierre mensual." };
};

export const revertirUltimoCierre = (): {
  success: boolean;
  message: string;
} => {
  if (db.cierres_mensuales.length === 0) {
    return {
      success: false,
      message: "No hay cierres mensuales para revertir.",
    };
  }
  // Sort descending to find the latest one
  db.cierres_mensuales.sort((a, b) => b.mes.localeCompare(a.mes));
  const ultimoCierre = db.cierres_mensuales.shift(); // Removes the first (latest) element

  if (saveDb(db)) {
    return {
      success: true,
      message: `El cierre del mes ${ultimoCierre?.mes} ha sido revertido exitosamente.`,
    };
  }
  return {
    success: false,
    message: "Error al guardar los cambios en la base de datos.",
  };
};

// --- Business Logic ---

export const calcularCostoPlato = (platoId: string): number | null => {
  const carta = db.cartas_tecnologicas.find((c) => c.plato_id === platoId);
  if (!carta) return null;

  let costoTotalIngredientes = 0;
  for (const ingrediente of carta.ingredientes_receta) {
    const invItem = db.inventario.find(
      (i) => i.producto_base_id === ingrediente.producto_base_id
    );
    if (!invItem || invItem.precio_promedio_ponderado === undefined) {
      console.warn(
        `Costo no disponible para el ingrediente ID ${ingrediente.producto_base_id}`
      );
      return null;
    }
    costoTotalIngredientes +=
      ingrediente.cantidad * invItem.precio_promedio_ponderado;
  }

  const otrosGastos = carta.otros_gastos || 0;
  const combustible = carta.combustible || 0;
  const salario = carta.salario || 0;

  return costoTotalIngredientes + otrosGastos + combustible + salario;
};

export const hayInventarioSuficiente = (
  platoId: string,
  cantidadVenta: number,
  cartasTecnologicas: CartaTecnologica[],
  inventario: InventarioItem[],
  productosBase: ProductoBase[],
  ums: UnidadMedida[]
): { suficiente: boolean; faltantes: InventarioFaltanteDetalle[] } => {
  const carta = cartasTecnologicas.find((c) => c.plato_id === platoId);
  if (!carta) return { suficiente: true, faltantes: [] };

  const faltantes: InventarioFaltanteDetalle[] = [];
  for (const ingrediente of carta.ingredientes_receta) {
    const invItem = inventario.find(
      (i) => i.producto_base_id === ingrediente.producto_base_id
    );
    const cantidadNecesaria = ingrediente.cantidad * cantidadVenta;
    const stockActual = invItem ? invItem.entradas - invItem.salidas : 0;

    if (!invItem || stockActual < cantidadNecesaria) {
      const producto = productosBase.find(
        (p) => p.id === ingrediente.producto_base_id
      );
      const um = ums.find((u) => u.id === ingrediente.unidad_medida_id);
      faltantes.push({
        nombre: producto?.nombre_producto || "Desconocido",
        cantidadNecesaria: cantidadNecesaria,
        cantidadFaltante: cantidadNecesaria - stockActual,
        unidad: um?.unidad_nombre || "N/A",
      });
    }
  }
  return { suficiente: faltantes.length === 0, faltantes };
};

export const obtenerPrecioVenta = (
  platoId: string,
  servicioId: string,
  restaurantesServicios: RestauranteServicio[],
  menuPrecios: MenuPrecioItem[]
): number | null => {
  const menuPrecio = menuPrecios.find((mp) => mp.plato_id === platoId);
  const servicio = restaurantesServicios.find((s) => s.id === servicioId);

  if (!menuPrecio || !servicio) return null;

  const serviceNameKey = servicio.nombre_servicio
    .toLowerCase()
    .replace(/ /g, "_");
  const priceKey = `precio_${serviceNameKey}` as keyof MenuPrecioItem;
  if (priceKey in menuPrecio) {
    const price = menuPrecio[priceKey];
    if (typeof price === "number") return price;
  }

  const zelleMandadoKey = `precio_zelle_mandado` as keyof MenuPrecioItem;
  if (
    serviceNameKey.includes("zelle") &&
    serviceNameKey.includes("mandado") &&
    zelleMandadoKey in menuPrecio
  ) {
    return menuPrecio[zelleMandadoKey] as number;
  }
  const zelleRestauranteKey =
    `precio_zelle_restaurante` as keyof MenuPrecioItem;
  if (
    serviceNameKey.includes("zelle") &&
    serviceNameKey.includes("restaurante") &&
    zelleRestauranteKey in menuPrecio
  ) {
    return menuPrecio[zelleRestauranteKey] as number;
  }

  return menuPrecio.precio_restaurante ?? null; // Default to restaurante price
};

const findConversionFactor = (
  origenId: string,
  destinoId: string,
  productoId?: string
): number => {
  if (origenId === destinoId) return 1;

  // First, look for a product-specific conversion
  if (productoId) {
    const conversionProducto = db.conversiones_unidades.find(
      (c) =>
        c.producto_base_id === productoId &&
        c.unidad_origen_id === origenId &&
        c.unidad_destino_id === destinoId
    );
    if (conversionProducto) return conversionProducto.factor;
  }
  // Then, look for a generic conversion
  const conversionGenerica = db.conversiones_unidades.find(
    (c) =>
      !c.producto_base_id &&
      c.unidad_origen_id === origenId &&
      c.unidad_destino_id === destinoId
  );
  if (conversionGenerica) return conversionGenerica.factor;

  return 1; // Default to 1 if no rule is found
};

export const registrarCompra = (
  compra: CompraFormData
): { success: boolean; message: string } => {
  const producto = db.productos_base.find(
    (p) => p.id === compra.producto_base_id
  );
  if (!producto) {
    return { success: false, message: "Producto base no encontrado." };
  }

  const umPredeterminadaId = producto.um_predeterminada;
  const umCompraId = compra.unidad_compra_id || umPredeterminadaId;

  let factor = findConversionFactor(
    umCompraId,
    umPredeterminadaId,
    producto.id
  );
  // Si no hay conversión explícita y las unidades son distintas, aplicar factor 1 pero advertir en consola
  if (umCompraId !== umPredeterminadaId && factor === 1) {
    console.warn(
      `No se encontró conversión registrada entre ${umCompraId} y ${umPredeterminadaId} para el producto ${producto.nombre_producto}. Se asume factor 1.`
    );
  }

  // Conversión robusta de cantidad y precio unitario
  const cantidadConvertida = compra.cantidad * factor;
  // El costo total debe mantenerse igual, pero el costo unitario debe ser por la unidad de inventario
  // precioUnitarioConvertido = (precio_unitario_original * cantidad_original) / cantidad_convertida
  const precioUnitarioConvertido =
    cantidadConvertida !== 0
      ? (compra.precio_unitario * compra.cantidad) / cantidadConvertida
      : 0;

  if (compra.estado_pago !== EstadoPago.PENDIENTE) {
    let invItem = db.inventario.find(
      (item) => item.producto_base_id === compra.producto_base_id
    );
    if (!invItem) {
      const newInvItem: InventarioItem = {
        id: producto.id,
        producto_base_id: producto.id,
        unidad_medida_id: producto.um_predeterminada,
        entradas: 0,
        salidas: 0,
        stock_minimo: 0,
        precio_promedio_ponderado: 0,
      };
      db.inventario.push(newInvItem);
      invItem = newInvItem;
    }
    const oldTotalValue =
      (invItem.entradas - invItem.salidas) * invItem.precio_promedio_ponderado;
    const currentStock = invItem.entradas - invItem.salidas;
    const purchaseValue = cantidadConvertida * precioUnitarioConvertido;
    invItem.entradas += cantidadConvertida;
    const newStock = currentStock + cantidadConvertida;
    const newTotalValue = oldTotalValue + purchaseValue;
    invItem.precio_promedio_ponderado =
      newStock > 0 ? newTotalValue / newStock : precioUnitarioConvertido;
  }

  const proveedor = db.proveedores.find((p) => p.id === compra.proveedor_id);
  const umCompra = db.ums.find((u) => u.id === umCompraId);
  const umInventario = db.ums.find((u) => u.id === umPredeterminadaId);

  // Guardar en la transacción tanto los datos originales como los convertidos
  const transaccion: Transaccion = {
    id_transaccion: generateId(),
    fecha: compra.fecha,
    tipo_transaccion: TipoTransaccion.COMPRA,
    producto_plato_nombre: producto?.nombre_producto || "Desconocido",
    // Datos originales
    cantidad: compra.cantidad,
    precio_unitario: compra.precio_unitario,
    importe_total: compra.cantidad * compra.precio_unitario,
    // Datos convertidos (para inventario)
    cantidad_convertida: cantidadConvertida,
    precio_unitario_convertido: precioUnitarioConvertido,
    importe_total_convertido: cantidadConvertida * precioUnitarioConvertido,
    unidad_medida_original: umCompra?.unidad_nombre || "",
    unidad_medida_inventario: umInventario?.unidad_nombre || "",
    costo_total_transaccion: cantidadConvertida * precioUnitarioConvertido,
    servicio_proveedor_nombre: proveedor?.nombre_proveedor || "Desconocido",
    producto_base_relacionado_id: compra.producto_base_id,
    estado_pago: compra.estado_pago,
    referencia_factura_proveedor: compra.referencia_factura_proveedor,
    notas: compra.notas,
    unidad_medida_nombre: umInventario?.unidad_nombre || "",
  } as any; // 'as any' para permitir los nuevos campos si el tipo Transaccion no los tiene aún
  db.transacciones.push(transaccion);
  console.log("Compra registrada:", transaccion); // Añadido log
  if (saveDb(db))
    return { success: true, message: "Compra registrada exitosamente." };
  return { success: false, message: "Error al guardar la compra." };
};

export const registrarVenta = (
  ventaData: VentaFormData
): { success: boolean; message: string; errorReport?: any[] } => {
  const { plato_id, cantidad, servicio_id } = ventaData;
  const check = hayInventarioSuficiente(
    plato_id,
    cantidad,
    db.cartas_tecnologicas,
    db.inventario,
    db.productos_base,
    db.ums
  );
  if (!check.suficiente) {
    return {
      success: false,
      message: "Inventario insuficiente para la venta.",
      errorReport: check.faltantes,
    };
  }
  const costoTotalPlato = calcularCostoPlato(plato_id);
  if (costoTotalPlato === null)
    return {
      success: false,
      message: "No se pudo calcular el costo del plato.",
    };
  const costoTotalVenta = costoTotalPlato * cantidad;
  const precioVentaUnitario = obtenerPrecioVenta(
    plato_id,
    servicio_id,
    db.restaurantes_servicios,
    db.menu_precios
  );
  if (precioVentaUnitario === null)
    return { success: false, message: "Precio de venta no encontrado." };
  const importeTotalVenta = precioVentaUnitario * cantidad;
  const utilidadTotalVenta = importeTotalVenta - costoTotalVenta;
  const carta = db.cartas_tecnologicas.find((c) => c.plato_id === plato_id);
  let ingredientesDescontados: any[] = [];
  if (carta) {
    carta.ingredientes_receta.forEach((ing) => {
      const invItem = db.inventario.find(
        (i) => i.producto_base_id === ing.producto_base_id
      );
      const producto = db.productos_base.find(
        (p) => p.id === ing.producto_base_id
      );
      if (invItem && producto) {
        // Conversión de unidades: de la unidad de receta a la unidad de inventario
        const umRecetaId = ing.unidad_medida_id;
        const umInventarioId = invItem.unidad_medida_id;
        let factor = findConversionFactor(
          umRecetaId,
          umInventarioId,
          producto.id
        );
        if (umRecetaId !== umInventarioId && factor === 1) {
          console.warn(
            `No se encontró conversión registrada entre ${umRecetaId} y ${umInventarioId} para el producto ${producto.nombre_producto}. Se asume factor 1.`
          );
        }
        const cantidadReceta = ing.cantidad * cantidad;
        const cantidadConvertida = cantidadReceta * factor;
        invItem.salidas += cantidadConvertida;
        ingredientesDescontados.push({
          producto_base_id: ing.producto_base_id,
          nombre_producto: producto.nombre_producto,
          cantidad_receta: cantidadReceta,
          unidad_receta:
            db.ums.find((u) => u.id === umRecetaId)?.unidad_nombre || "",
          cantidad_convertida: cantidadConvertida,
          unidad_inventario:
            db.ums.find((u) => u.id === umInventarioId)?.unidad_nombre || "",
        });
      }
    });
  }
  const plato = db.platos.find((p) => p.id === plato_id);
  const servicio = db.restaurantes_servicios.find((s) => s.id === servicio_id);
  const transaccion: Transaccion = {
    id_transaccion: generateId(),
    fecha: ventaData.fecha,
    tipo_transaccion: TipoTransaccion.VENTA,
    producto_plato_nombre: plato?.nombre_plato || "Desconocido",
    cantidad: cantidad,
    precio_unitario: precioVentaUnitario,
    importe_total: importeTotalVenta,
    costo_total_transaccion: costoTotalVenta,
    utilidad_transaccion: utilidadTotalVenta,
    servicio_proveedor_nombre: servicio?.nombre_servicio || "Desconocido",
    plato_relacionado_id: plato_id,
    estado_pago: ventaData.estado_pago,
    nombre_deudor: ventaData.nombre_deudor,
    ingredientes_descontados: ingredientesDescontados,
  } as any;
  db.transacciones.push(transaccion);
  console.log("Venta registrada:", transaccion); // Añadido log
  if (saveDb(db))
    return { success: true, message: "Venta registrada exitosamente." };
  return { success: false, message: "Error al guardar la venta." };
};

export const deleteTransaccion = (
  id_transaccion: string
): { success: boolean; message: string } => {
  const transaccionIndex = db.transacciones.findIndex(
    (t) => t.id_transaccion === id_transaccion
  );
  if (transaccionIndex === -1) {
    return { success: false, message: "Transacción no encontrada." };
  }
  const transaccion = db.transacciones[transaccionIndex];

  if (transaccion.tipo_transaccion === TipoTransaccion.VENTA) {
    // Usar los ingredientes descontados y cantidades convertidas realmente usadas
    if (Array.isArray(transaccion.ingredientes_descontados)) {
      transaccion.ingredientes_descontados.forEach((ing: any) => {
        const invItem = db.inventario.find(
          (i) => i.producto_base_id === ing.producto_base_id
        );
        if (invItem) {
          invItem.salidas -= ing.cantidad_convertida;
          if (invItem.salidas < 0) invItem.salidas = 0;
        }
      });
    }
  } else if (
    transaccion.tipo_transaccion === TipoTransaccion.COMPRA &&
    transaccion.estado_pago !== EstadoPago.PENDIENTE
  ) {
    // Usar la cantidad y precio unitario convertidos realmente usados
    const invItem = db.inventario.find(
      (i) => i.producto_base_id === transaccion.producto_base_relacionado_id
    );
    if (invItem) {
      const cantidadRevertir = transaccion.cantidad_convertida || 0;
      const precioUnitarioConvertido =
        transaccion.precio_unitario_convertido || 0;
      const totalValueBefore =
        (invItem.entradas - invItem.salidas) *
        invItem.precio_promedio_ponderado;
      const currentStock = invItem.entradas - invItem.salidas;
      const purchaseValueToRevert = cantidadRevertir * precioUnitarioConvertido;
      const newEntradas = invItem.entradas - cantidadRevertir;
      const newStock = currentStock - cantidadRevertir;
      const newTotalValue = totalValueBefore - purchaseValueToRevert;
      invItem.entradas = newEntradas < 0 ? 0 : newEntradas;
      if (newStock > 0) {
        invItem.precio_promedio_ponderado = newTotalValue / newStock;
      } else {
        invItem.precio_promedio_ponderado = 0;
      }
      if (invItem.precio_promedio_ponderado < 0)
        invItem.precio_promedio_ponderado = 0;
    }
  } else if (transaccion.tipo_transaccion === TipoTransaccion.OTRO_GASTO) {
    const gastoIndex = db.otros_gastos.findIndex(
      (g) =>
        g.descripcion === transaccion.producto_plato_nombre &&
        g.categoria === transaccion.servicio_proveedor_nombre &&
        g.importe === transaccion.importe_total &&
        new Date(g.fecha).toISOString().split("T")[0] ===
          new Date(transaccion.fecha).toISOString().split("T")[0]
    );
    if (gastoIndex > -1) {
      db.otros_gastos.splice(gastoIndex, 1);
    }
  }
  db.transacciones.splice(transaccionIndex, 1);
  if (saveDb(db))
    return { success: true, message: "Transacción eliminada exitosamente." };
  return {
    success: false,
    message: "Error al guardar los cambios en la base de datos.",
  };
};
// --- End of existing DataManager.ts code ---

// --- Added missing functions ---

export const marcarDeudaComoPagadaConMetodo = (
  transaccionId: string,
  metodoPago: EstadoPago.EFECTIVO | EstadoPago.TRANSFERENCIA | EstadoPago.ZELLE
): { success: boolean; message: string } => {
  const index = db.transacciones.findIndex(
    (t) => t.id_transaccion === transaccionId
  );
  if (index === -1) {
    return { success: false, message: "Transacción no encontrada." };
  }
  const transaccion = db.transacciones[index];
  if (
    transaccion.tipo_transaccion !== TipoTransaccion.VENTA ||
    transaccion.estado_pago !== EstadoPago.PENDIENTE
  ) {
    return {
      success: false,
      message: "Solo se pueden marcar como pagadas las ventas pendientes.",
    };
  }
  transaccion.estado_pago = metodoPago;
  transaccion.descripcion_pago_deuda = `Pagado el ${new Date().toLocaleDateString()}`;
  if (saveDb(db)) {
    return { success: true, message: "Cuenta por cobrar marcada como pagada." };
  }
  return { success: false, message: "Error al guardar los cambios." };
};

export const pagarDeudaProveedor = (
  transaccionId: string,
  metodoPago: EstadoPago.EFECTIVO | EstadoPago.TRANSFERENCIA | EstadoPago.ZELLE
): { success: boolean; message: string } => {
  const index = db.transacciones.findIndex(
    (t) => t.id_transaccion === transaccionId
  );
  if (index === -1)
    return { success: false, message: "Transacción de compra no encontrada." };

  const transaccion = db.transacciones[index];
  if (
    transaccion.tipo_transaccion !== TipoTransaccion.COMPRA ||
    transaccion.estado_pago !== EstadoPago.PENDIENTE
  ) {
    return {
      success: false,
      message: "Esta transacción de compra no está pendiente de pago.",
    };
  }

  let invItem = db.inventario.find(
    (item) => item.producto_base_id === transaccion.producto_base_relacionado_id
  );
  const producto = db.productos_base.find(
    (p) => p.id === transaccion.producto_base_relacionado_id
  );
  if (!producto)
    return {
      success: false,
      message: "El producto de esta compra ya no existe.",
    };

  const umCompra = db.ums.find(
    (u) => u.unidad_nombre === transaccion.unidad_medida_nombre
  );
  if (!umCompra)
    return {
      success: false,
      message: "La unidad de medida de la compra original no se encontró.",
    };

  const factor = findConversionFactor(
    umCompra.id,
    producto.um_predeterminada,
    producto.id
  );
  const cantidadConvertida = transaccion.cantidad * factor;
  const precioUnitarioConvertido = (transaccion.precio_unitario || 0) / factor;

  if (!invItem) {
    const newInvItem: InventarioItem = {
      id: producto.id,
      producto_base_id: producto.id,
      unidad_medida_id: producto.um_predeterminada,
      entradas: 0,
      salidas: 0,
      stock_minimo: 0,
      precio_promedio_ponderado: 0,
    };
    db.inventario.push(newInvItem);
    invItem = newInvItem;
  }

  const oldTotalValue =
    (invItem.entradas - invItem.salidas) * invItem.precio_promedio_ponderado;
  const currentStock = invItem.entradas - invItem.salidas;
  const purchaseValue = cantidadConvertida * precioUnitarioConvertido;
  invItem.entradas += cantidadConvertida;
  const newStock = currentStock + cantidadConvertida;
  const newTotalValue = oldTotalValue + purchaseValue;
  invItem.precio_promedio_ponderado =
    newStock > 0 ? newTotalValue / newStock : precioUnitarioConvertido;

  transaccion.estado_pago = metodoPago;
  transaccion.descripcion_pago_deuda = `Pagado el ${new Date().toLocaleDateString()}`;

  if (saveDb(db)) {
    return {
      success: true,
      message:
        "Cuenta por pagar marcada como pagada. El inventario ha sido actualizado.",
    };
  }
  return { success: false, message: "Error al guardar los cambios." };
};

export const deshacerPagoCuenta = (
  transaccionId: string
): { success: boolean; message: string } => {
  const index = db.transacciones.findIndex(
    (t) => t.id_transaccion === transaccionId
  );
  if (index === -1) {
    return { success: false, message: "Transacción no encontrada." };
  }
  db.transacciones[index].estado_pago = EstadoPago.PENDIENTE;
  db.transacciones[index].descripcion_pago_deuda = undefined;

  if (saveDb(db)) {
    return {
      success: true,
      message: "El pago ha sido deshecho. La cuenta está pendiente nuevamente.",
    };
  }
  return { success: false, message: "Error al guardar los cambios." };
};

export const borrarNombreDeudor = (
  transaccionId: string
): { success: boolean; message: string } => {
  const index = db.transacciones.findIndex(
    (t) => t.id_transaccion === transaccionId
  );
  if (index === -1) {
    return { success: false, message: "Transacción no encontrada." };
  }
  db.transacciones[index].nombre_deudor = undefined;
  if (saveDb(db)) {
    return { success: true, message: "Nombre del deudor borrado." };
  }
  return { success: false, message: "Error al guardar los cambios." };
};

export const updateCuentaPendiente = (
  transaccionId: string,
  updates: { nombre_deudor?: string; estado_pago: EstadoPago; notas?: string }
): { success: boolean; message: string } => {
  const index = db.transacciones.findIndex(
    (t) => t.id_transaccion === transaccionId
  );
  if (index === -1) {
    return { success: false, message: "Transacción no encontrada." };
  }
  const tx = db.transacciones[index];
  tx.nombre_deudor = updates.nombre_deudor || tx.nombre_deudor;
  tx.estado_pago = updates.estado_pago;
  tx.notas = updates.notas || tx.notas;

  if (saveDb(db)) {
    return { success: true, message: "Cuenta pendiente actualizada." };
  }
  return { success: false, message: "Error al guardar los cambios." };
};

export const exportDb = (restaurantName: string): void => {
  try {
    const dbString = JSON.stringify(db, null, 2);
    const blob = new Blob([dbString], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeRestaurantName = restaurantName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const date = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `ladybeer_db_backup_${safeRestaurantName}_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Error exporting DB:", e);
    alert("Error al exportar la base de datos.");
  }
};

export const importDb = (jsonString: string): boolean => {
  try {
    const newDb = JSON.parse(jsonString) as AppDatabase;
    // Basic validation: check for some key properties
    if (
      newDb &&
      Array.isArray(newDb.ums) &&
      Array.isArray(newDb.productos_base) &&
      Array.isArray(newDb.transacciones) &&
      Array.isArray(newDb.configuracion)
    ) {
      db = newDb; // Update in-memory DB
      return saveDb(newDb); // Save to localStorage
    }
    return false;
  } catch (e) {
    console.error("Error importing DB:", e);
    return false;
  }
};

// --- PDF & Calculation Stubs (to be implemented) ---

const pdfStub = async (name: string, data: any) => {
  console.log(`(STUB) Generando PDF: ${name}`, data);
  alert(
    `(STUB) La función de generar PDF para "${name}" no está implementada.`
  );
};

export const generarCuentasPorCobrarPDF = async (
  cuentas: Transaccion[],
  configuracion: Configuracion,
  tipo: "Pendientes" | "PagadasRecientemente"
): Promise<void> => pdfStub(`Cuentas por Cobrar ${tipo}`, { cuentas, tipo });
export const generarListadoRecetasPDF = async (
  selectedRecetas: CartaTecnologica[],
  platos: Plato[],
  productosBase: ProductoBase[],
  ums: UnidadMedida[],
  configuracion: Configuracion
): Promise<void> => pdfStub("Listado de Recetas", { selectedRecetas });
export const generarTransaccionesPDF = async (
  filteredTransacciones: Transaccion[],
  filters: {
    fechaDesde: string;
    fechaHasta: string;
    tipo: TipoTransaccion | "TODAS";
  },
  configuracion: Configuracion
): Promise<void> =>
  pdfStub("Listado de Transacciones", { filteredTransacciones, filters });
export const generarOtrosGastosPDF = async (
  filteredGastos: OtroGasto[],
  configuracion: Configuracion,
  filters?: { fechaDesde?: string; fechaHasta?: string }
): Promise<void> =>
  pdfStub("Listado de Otros Gastos", { filteredGastos, filters });
export const generarEstadoCuentaPDF = async (
  data: EstadoCuentaData,
  configuracion: Configuracion
): Promise<void> => pdfStub("Estado de Cuenta", data);
export const generarFlujoEfectivoPDF = async (
  data: FlujoEfectivoData,
  configuracion: Configuracion
): Promise<void> => pdfStub("Flujo de Efectivo", data);
export const generarBalanceGeneralPDF = async (
  data: BalanceGeneralData,
  configuracion: Configuracion
): Promise<void> => pdfStub("Balance General", data);
export const generarPDFCierreMensual = async (
  cierre: CierreMensual,
  configuracion: Configuracion
): Promise<void> => pdfStub("Cierre Mensual", cierre);
export const generarPDFCierreTrimestral = async (
  year: string,
  quarter: number,
  cierres: CierreMensual[],
  configuracion: Configuracion
): Promise<void> =>
  pdfStub(`Cierre Trimestral ${year}-Q${quarter}`, { year, quarter });
export const generarPDFCierreAnual = async (
  year: string,
  cierres: CierreMensual[],
  configuracion: Configuracion
): Promise<void> => pdfStub("Cierre Anual", { year });
export const generarMenuPDF = async (
  selectedItems: MenuPrecioItem[],
  platos: Plato[],
  restaurantesServicios: RestauranteServicio[],
  configuracion: Configuracion
): Promise<void> => pdfStub("Menú de Precios", { selectedItems });
export const generarInventarioPDF = async (
  inventarioData: any[],
  configuracion: Configuracion
): Promise<void> => pdfStub("Reporte de Inventario", { inventarioData });
export const generarPerformancePDF = async (
  performanceData: PerformanceAnalyticsData,
  configuracion: Configuracion
): Promise<void> => pdfStub("Reporte de Rendimiento", { performanceData });
export const generarListadoPlatosPDF = async (
  platosData: Plato[],
  configuracion: Configuracion
): Promise<void> => pdfStub("Listado de Platos", { platosData });
export const generarFichaCostoPlatoPDF = async (
  fichaData: FichaCostoPlatoData,
  configuracion: Configuracion
): Promise<void> => pdfStub("Ficha de Costo de Plato", { fichaData });
export const generarCuentasPorPagarPDF = async (
  cuentas: Transaccion[],
  configuracion: Configuracion,
  tipo: "Pendientes" | "PagadasRecientemente"
): Promise<void> => pdfStub(`Cuentas por Pagar ${tipo}`, { cuentas, tipo });
export const reiniciarInventarioYPrecios = (): void => {
  db.inventario = [];
  db.menu_precios = [];
  saveDb(db);
};
// --- NEWLY IMPLEMENTED FUNCTIONS ---

export const getSuggestedNextMonthForCierre = (
  cierres: CierreMensual[]
): string => {
  if (cierres.length === 0) {
    const today = new Date();
    today.setDate(1); // Go to first day of current month
    today.setMonth(today.getMonth() - 1); // Go to previous month
    return today.toISOString().slice(0, 7);
  }
  const sorted = [...cierres].sort((a, b) => b.mes.localeCompare(a.mes));
  const lastMonth = sorted[0].mes;
  const [year, month] = lastMonth.split("-").map(Number);
  const nextDate = new Date(year, month, 1);
  return nextDate.toISOString().slice(0, 7);
};

export const calculateCierreMensualData = (
  mesACerrar: string,
  allTransacciones: Transaccion[],
  allOtrosGastos: OtroGasto[],
  cierresMensuales: CierreMensual[]
): CierreMensualCalculatedData => {
  const [year, month] = mesACerrar.split("-").map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const transaccionesDelMes = allTransacciones.filter((t) => {
    const fecha = new Date(t.fecha);
    return fecha >= startDate && fecha <= endDate;
  });
  const otrosGastosDelMes = allOtrosGastos.filter((g) => {
    const fecha = new Date(g.fecha);
    return fecha >= startDate && fecha <= endDate;
  });
  const ventasDelMes = transaccionesDelMes.filter(
    (t) => t.tipo_transaccion === TipoTransaccion.VENTA
  );
  const totalIngresos = ventasDelMes.reduce(
    (sum, t) => sum + (t.importe_total || 0),
    0
  );
  const costoMercanciaVendida = ventasDelMes.reduce(
    (sum, t) => sum + (t.costo_total_transaccion || 0),
    0
  );
  const utilidadBruta = totalIngresos - costoMercanciaVendida;
  const comprasDelMes = transaccionesDelMes.filter(
    (t) =>
      t.tipo_transaccion === TipoTransaccion.COMPRA &&
      t.estado_pago !== EstadoPago.PENDIENTE
  );
  const totalComprasInventario = comprasDelMes.reduce(
    (sum, t) => sum + (t.importe_total || 0),
    0
  );
  const config = getInitialConfig();
  let totalComisionesServicioVentas = 0;
  ventasDelMes.forEach((venta) => {
    if (venta.servicio_proveedor_nombre.toLowerCase().includes("catauro")) {
      totalComisionesServicioVentas +=
        (venta.importe_total || 0) * config.comision_catauro_pct;
    } else if (
      venta.servicio_proveedor_nombre.toLowerCase().includes("mandado")
    ) {
      totalComisionesServicioVentas +=
        (venta.importe_total || 0) * config.comision_mandado_pct;
    }
  });
  const gastosPorCategoria: GastoPorCategoria[] = [];
  const gastosMap = new Map<string, number>();
  otrosGastosDelMes.forEach((gasto) => {
    gastosMap.set(
      gasto.categoria,
      (gastosMap.get(gasto.categoria) || 0) + gasto.importe
    );
  });
  gastosMap.forEach((total, categoria) => {
    gastosPorCategoria.push({ categoria, total });
  });
  gastosPorCategoria.sort((a, b) => a.categoria.localeCompare(b.categoria));
  const totalOtrosGastosDirectos = otrosGastosDelMes.reduce(
    (sum, g) => sum + g.importe,
    0
  );
  const totalImpuestosTercerosVentas = ventasDelMes.reduce(
    (sum, t) => sum + (t.impuesto_terceros || 0),
    0
  );
  const gastosOperativosTotales =
    totalComisionesServicioVentas + totalOtrosGastosDirectos;
  const utilidadAntesImpuestoNegocio =
    utilidadBruta - gastosOperativosTotales - totalComprasInventario;

  const previousMonthDate = new Date(startDate);
  previousMonthDate.setUTCDate(0);
  const previousMonthYYYYMM = previousMonthDate.toISOString().slice(0, 7);
  const cierreAnterior = cierresMensuales.find(
    (c) => c.mes === previousMonthYYYYMM
  );
  const saldoInicial = cierreAnterior ? cierreAnterior.saldo_final_mes : 0;
  const utilidadNetaMes = utilidadAntesImpuestoNegocio;
  const saldoFinalMes =
    saldoInicial +
    totalIngresos -
    totalComprasInventario -
    totalOtrosGastosDirectos -
    totalComisionesServicioVentas;

  return {
    saldo_inicial: saldoInicial,
    total_ingresos: totalIngresos,
    total_costo_ventas: costoMercanciaVendida,
    utilidad_bruta: utilidadBruta,
    total_compras_inventario: totalComprasInventario,
    total_comisiones_servicio_ventas: totalComisionesServicioVentas,
    gastos_por_categoria: gastosPorCategoria,
    total_otros_gastos_directos: totalOtrosGastosDirectos,
    total_impuestos_terceros_ventas: totalImpuestosTercerosVentas,
    gastos_operativos_totales: gastosOperativosTotales,
    utilidad_antes_impuesto_negocio: utilidadAntesImpuestoNegocio,
    utilidad_neta_mes: utilidadNetaMes,
    saldo_final_mes: saldoFinalMes,
  };
};

export const calculateEstadoCuentaData = (
  startDateISO: string,
  endDateISO: string,
  allTransacciones: Transaccion[],
  allOtrosGastos: OtroGasto[],
  allCierresMensuales: CierreMensual[],
  periodoLabel: string
): EstadoCuentaData => {
  const startDate = new Date(startDateISO + "T00:00:00Z");
  const endDate = new Date(endDateISO + "T23:59:59.999Z");

  const mesAConsultar = startDateISO.slice(0, 7);
  const cierreDelMes = allCierresMensuales.find((c) => c.mes === mesAConsultar);

  const previousMonthDate = new Date(startDate);
  previousMonthDate.setUTCDate(0);
  const previousMonthYYYYMM = previousMonthDate.toISOString().slice(0, 7);
  const cierreAnterior = allCierresMensuales.find(
    (c) => c.mes === previousMonthYYYYMM
  );
  const saldoInicial = cierreDelMes
    ? cierreDelMes.saldo_inicial
    : cierreAnterior
    ? cierreAnterior.saldo_final_mes
    : 0;

  const transaccionesDelPeriodo = allTransacciones.filter((t) => {
    const d = new Date(t.fecha);
    return d >= startDate && d <= endDate;
  });
  const otrosGastosDelPeriodo = allOtrosGastos.filter((g) => {
    const d = new Date(g.fecha);
    return d >= startDate && d <= endDate;
  });
  const ventasDelPeriodo = transaccionesDelPeriodo.filter(
    (t) => t.tipo_transaccion === TipoTransaccion.VENTA
  );
  const comprasDelPeriodo = transaccionesDelPeriodo.filter(
    (t) =>
      t.tipo_transaccion === TipoTransaccion.COMPRA &&
      t.estado_pago !== EstadoPago.PENDIENTE
  );

  const totalIngresos = ventasDelPeriodo.reduce(
    (sum, t) => sum + (t.importe_total || 0),
    0
  );
  const costoMercanciaVendida = ventasDelPeriodo.reduce(
    (sum, t) => sum + (t.costo_total_transaccion || 0),
    0
  );
  const utilidadBruta = totalIngresos - costoMercanciaVendida;
  const totalCompras = comprasDelPeriodo.reduce(
    (sum, t) => sum + t.importe_total,
    0
  );

  const config = getInitialConfig();
  const totalComisiones = ventasDelPeriodo.reduce((sum, venta) => {
    if (venta.servicio_proveedor_nombre.toLowerCase().includes("catauro"))
      return sum + (venta.importe_total || 0) * config.comision_catauro_pct;
    if (venta.servicio_proveedor_nombre.toLowerCase().includes("mandado"))
      return sum + (venta.importe_total || 0) * config.comision_mandado_pct;
    return sum;
  }, 0);

  const gastosPorCategoria: GastoPorCategoria[] = [];
  const gastosMap = new Map<string, number>();
  otrosGastosDelPeriodo.forEach((gasto) => {
    gastosMap.set(
      gasto.categoria,
      (gastosMap.get(gasto.categoria) || 0) + gasto.importe
    );
  });
  gastosMap.forEach((total, categoria) =>
    gastosPorCategoria.push({ categoria, total })
  );
  const totalOtrosGastos = otrosGastosDelPeriodo.reduce(
    (sum, g) => sum + g.importe,
    0
  );
  const totalGastosOperativos = totalComisiones + totalOtrosGastos;
  const utilidadNetaPeriodo = utilidadBruta - totalGastosOperativos;
  const saldoFinalPeriodoEstimado =
    saldoInicial +
    totalIngresos -
    totalCompras -
    totalOtrosGastos -
    totalComisiones;

  return {
    periodoSeleccionado: periodoLabel,
    saldoInicialMesEstimado: saldoInicial,
    ingresosTotalesVentas: totalIngresos,
    costoMercanciaVendida,
    utilidadBruta,
    totalComprasInventario: totalCompras,
    totalComisionesServicioVentas: totalComisiones,
    gastosPorCategoria,
    total_otros_gastos_directos: totalOtrosGastos,
    totalGastosOperativos,
    utilidadNetaPeriodo,
    saldoFinalPeriodoEstimado,
    ventasDelPeriodo,
    comprasDelPeriodo,
    otrosGastosDelPeriodo,
  };
};

export const getFichaCostoPlatoData = (
  platoId: string
): FichaCostoPlatoData | null => {
  const plato = db.platos.find((p) => p.id === platoId);
  if (!plato) return null;
  const carta = db.cartas_tecnologicas.find((c) => c.plato_id === platoId);
  if (!carta) return null;

  const detallesIngredientes: CostoIngredienteDetalle[] = [];
  let costoTotalIngredientes = 0;

  for (const ingrediente of carta.ingredientes_receta) {
    const productoBase = db.productos_base.find(
      (p) => p.id === ingrediente.producto_base_id
    );
    const invItem = db.inventario.find(
      (i) => i.producto_base_id === ingrediente.producto_base_id
    );
    const um = db.ums.find((u) => u.id === ingrediente.unidad_medida_id);

    const costoUnitario = invItem?.precio_promedio_ponderado ?? 0;
    const costoTotal = ingrediente.cantidad * costoUnitario;

    detallesIngredientes.push({
      nombre_producto: productoBase?.nombre_producto || "Desconocido",
      cantidad_receta: ingrediente.cantidad,
      unidad_nombre: um?.unidad_nombre || "N/A",
      costo_unitario_promedio: costoUnitario,
      costo_total_ingrediente: costoTotal,
    });
    costoTotalIngredientes += costoTotal;
  }

  const otrosGastos = carta.otros_gastos || 0;
  const combustible = carta.combustible || 0;
  const salario = carta.salario || 0;
  const costoTotalProduccion =
    costoTotalIngredientes + otrosGastos + combustible + salario;

  return {
    platoId: plato.id,
    nombrePlato: plato.nombre_plato,
    ingredientes: detallesIngredientes,
    costo_total_ingredientes: costoTotalIngredientes,
    otros_gastos_receta: otrosGastos,
    combustible_receta: combustible,
    salario_receta: salario,
    costo_total_produccion_unitario: costoTotalProduccion,
    notas_preparacion: carta.notas_preparacion,
  };
};

export const calculateEstadoFlujoEfectivoData = (
  startDateISO: string,
  endDateISO: string,
  allTransacciones: Transaccion[],
  allOtrosGastos: OtroGasto[],
  periodoLabel: string
): FlujoEfectivoData => {
  const startDate = new Date(startDateISO + "T00:00:00Z");
  const endDate = new Date(endDateISO + "T23:59:59.999Z");

  const transaccionesContado = allTransacciones.filter((t) => {
    const fecha = new Date(t.fecha);
    return (
      fecha >= startDate &&
      fecha <= endDate &&
      t.estado_pago !== EstadoPago.PENDIENTE &&
      t.estado_pago !== EstadoPago.NA &&
      t.estado_pago !== EstadoPago.PROMOCION
    );
  });

  const ventasContado = transaccionesContado.filter(
    (t) => t.tipo_transaccion === TipoTransaccion.VENTA
  );
  const ingresosPorVentasContado = ventasContado.reduce(
    (sum, t) => sum + (t.importe_total || 0),
    0
  );

  const comprasContado = transaccionesContado.filter(
    (t) => t.tipo_transaccion === TipoTransaccion.COMPRA
  );
  const salidasPorComprasContado = comprasContado.reduce(
    (sum, t) => sum + (t.importe_total || 0),
    0
  );

  const otrosGastosDelPeriodo = allOtrosGastos.filter((g) => {
    const fecha = new Date(g.fecha);
    return fecha >= startDate && fecha <= endDate;
  });
  const salidasPorOtrosGastos = otrosGastosDelPeriodo.reduce(
    (sum, g) => sum + g.importe,
    0
  );

  const totalIngresos = ingresosPorVentasContado;
  const totalSalidas = salidasPorComprasContado + salidasPorOtrosGastos;
  const flujoNetoOperativo = totalIngresos - totalSalidas;

  return {
    periodoSeleccionado: periodoLabel,
    ingresosPorVentasContado,
    totalIngresos,
    salidasPorComprasContado,
    salidasPorOtrosGastos,
    totalSalidas,
    flujoNetoOperativo,
    ventasContado,
    comprasContado,
    otrosGastos: otrosGastosDelPeriodo,
  };
};

export const calculateBalanceGeneralData = (
  mes: string
): BalanceGeneralData | null => {
  const [year, month] = mes.split("-").map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // Calculate saldo inicial from previous month's closing
  const previousMonthDate = new Date(startDate);
  previousMonthDate.setUTCDate(0); // Go to the last day of the previous month
  const previousMonthYYYYMM = previousMonthDate.toISOString().slice(0, 7);
  const cierreAnterior = db.cierres_mensuales.find(
    (c) => c.mes === previousMonthYYYYMM
  );

  // Calculate cash flow for the current month
  const flujoDelMes = calculateEstadoFlujoEfectivoData(
    startDate.toISOString().slice(0, 10),
    endDate.toISOString().slice(0, 10),
    db.transacciones,
    db.otros_gastos,
    mes
  );

  const saldoInicial = cierreAnterior ? cierreAnterior.saldo_final_mes : 0;
  const efectivo = saldoInicial + flujoDelMes.flujoNetoOperativo;

  const allTransactionsToDate = db.transacciones.filter(
    (t) => new Date(t.fecha) <= endDate
  );
  const cuentasPorCobrar = allTransactionsToDate
    .filter(
      (t) =>
        t.tipo_transaccion === TipoTransaccion.VENTA &&
        t.estado_pago === EstadoPago.PENDIENTE
    )
    .reduce((sum, t) => sum + t.importe_total, 0);

  const valorInventario = db.inventario.reduce((total, item) => {
    const { entradas, salidas } = allTransactionsToDate.reduce(
      (acc, t) => {
        if (
          t.producto_base_relacionado_id === item.producto_base_id &&
          t.tipo_transaccion === TipoTransaccion.COMPRA &&
          t.estado_pago !== EstadoPago.PENDIENTE
        ) {
          acc.entradas += t.cantidad;
        } else if (
          t.tipo_transaccion === TipoTransaccion.VENTA &&
          t.plato_relacionado_id
        ) {
          const carta = db.cartas_tecnologicas.find(
            (c) => c.plato_id === t.plato_relacionado_id
          );
          const ingrediente = carta?.ingredientes_receta.find(
            (i) => i.producto_base_id === item.producto_base_id
          );
          if (ingrediente) {
            acc.salidas += ingrediente.cantidad * t.cantidad;
          }
        }
        return acc;
      },
      { entradas: 0, salidas: 0 }
    );

    const stockFinDeMes = entradas - salidas;
    return total + stockFinDeMes * item.precio_promedio_ponderado;
  }, 0);

  const totalActivos = efectivo + cuentasPorCobrar + valorInventario;

  const cuentasPorPagar = allTransactionsToDate
    .filter(
      (t) =>
        t.tipo_transaccion === TipoTransaccion.COMPRA &&
        t.estado_pago === EstadoPago.PENDIENTE
    )
    .reduce((sum, t) => sum + t.importe_total, 0);

  const totalPasivos = cuentasPorPagar;
  const patrimonio = totalActivos - totalPasivos;

  return {
    mes,
    fechaCierre: endDate.toISOString(),
    totalActivos,
    efectivo,
    cuentasPorCobrar,
    inventario: valorInventario,
    totalPasivos,
    cuentasPorPagar,
    patrimonio,
  };
};

export const generateRecipeIdeas = async (
  details: AiPromptDetails
): Promise<AiGeneratedIdea[]> => {
  // This is a stub. In a real application, you would make an API call to a generative AI model.
  console.log("Generating ideas with:", details);
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network latency

  const idea: AiGeneratedIdea = {
    nombre_plato: "Pollo a la jardinera (Ejemplo)",
    descripcion_corta:
      "Un clásico plato de pollo con vegetales frescos, perfecto para una comida completa y nutritiva.",
    ingredientes_detallados: [
      { nombre: "Pechuga de Pollo", cantidad: "200 g" },
      { nombre: "Papa", cantidad: "150 g" },
      { nombre: "Zanahoria", cantidad: "80 g" },
      { nombre: "Guisantes", cantidad: "50 g" },
      { nombre: "Cebolla", cantidad: "50 g" },
      { nombre: "Ajo", cantidad: "2 dientes" },
      { nombre: "Vino Blanco", cantidad: "30 ml" },
      { nombre: "Aceite", cantidad: "15 ml" },
      { nombre: "Sal", cantidad: "al gusto" },
      { nombre: "Pimienta", cantidad: "al gusto" },
    ],
    instrucciones_preparacion: [
      "Cortar el pollo en cubos y sazonar con sal y pimienta.",
      "Picar la cebolla y el ajo finamente. Cortar las papas y zanahorias en cubos medianos.",
      "En una sartén grande, calentar el aceite y dorar el pollo. Retirar y reservar.",
      "En la misma sartén, sofreír la cebolla y el ajo hasta que estén transparentes.",
      "Añadir las papas y zanahorias, y cocinar por 5 minutos.",
      "Verter el vino blanco y dejar que se evapore el alcohol.",
      "Incorporar el pollo de nuevo a la sartén, añadir los guisantes y un poco de agua o caldo hasta casi cubrir.",
      "Cocinar a fuego lento hasta que los vegetales estén tiernos y la salsa haya espesado.",
      "Rectificar de sal y pimienta antes de servir.",
    ],
    tiempo_preparacion: "15 minutos",
    tiempo_coccion: "30 minutos",
    tiempo_total: "45 minutos",
    porciones_sugeridas: "1 persona",
    consejos_chef: [
      "Para un sabor más intenso, puedes marinar el pollo previamente.",
      "Añade otras hierbas como tomillo o romero para variar el aroma.",
    ],
  };

  return Array(details.numberOfSuggestions)
    .fill(idea)
    .map((item, index) => ({
      ...item,
      nombre_plato: `${item.nombre_plato} #${index + 1}`,
    }));
};
