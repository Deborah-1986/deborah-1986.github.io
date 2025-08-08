// Permitir eliminación real de productos base
const handleDeleteProductoBase = async (id: string) => {
  const advertencia =
    "ADVERTENCIA: Eliminar este producto base eliminará TODAS las compras, inventario y recetas asociadas. Esta acción es irreversible y puede afectar el funcionamiento de la aplicación.\n\n" +
    "¿Está seguro de que desea continuar?";
  if (window.confirm(advertencia)) {
    const dobleConfirmacion =
      "CONFIRMACIÓN FINAL: Esta acción eliminará permanentemente el producto base, todas las compras, inventario y recetas que lo usen.\n\n¿Está absolutamente seguro de eliminarlo?";
    if (window.confirm(dobleConfirmacion)) {
      try {
        await DataManager.deleteProductoBase(id);
        if (typeof refreshAllData === "function") refreshAllData();
        alert(
          "Producto base eliminado correctamente. Todas las compras, inventario y recetas asociadas han sido eliminadas."
        );
      } catch (error) {
        console.error("Error al eliminar producto base:", error);
        alert(
          "Ocurrió un error al eliminar el producto base. Intente de nuevo."
        );
      }
    }
  }
};
// App.tsx

import React, { useState, useCallback, useEffect } from "react";
import {
  UnidadMedida,
  UnidadMedidaFormData,
  ProductoBase,
  ProductoBaseFormData,
  Plato,
  PlatoFormData,
  Proveedor,
  ProveedorFormData,
  RestauranteServicio,
  RestauranteServicioFormData,
  CartaTecnologica,
  CartaTecnologicaFormState,
  MenuPrecioItem,
  MenuPrecioFormData,
  InventarioItem,
  InventarioFormData,
  InventarioEditFormData,
  Transaccion,
  Configuracion,
  VentaFormData,
  CompraFormData,
  CompraEditFormData,
  TipoTransaccion,
  EstadoPago,
  OtroGasto,
  OtroGastoFormData,
  CierreMensual,
  EstadoCuentaData,
  CierreMensualFormData,
  CierreMensualCalculatedData,
  AppDatabase,
  FichaCostoPlatoData,
  FlujoEfectivoData,
  BalanceGeneralData,
  AiPromptDetails,
  AiGeneratedIdea,
  PerformanceAnalyticsData,
  ConversionUnidad,
  ConversionUnidadFormData,
} from "./types.js";
import Modal from "./components/Modal.tsx";
import LoginPage from "./components/LoginPage.tsx";
import {
  APP_TITLE,
  AddIcon,
  MenuIcon,
  HomeIcon,
  SettingsIcon,
  BookOpenIcon,
  PriceTagIcon,
  CloseIcon as MenuCloseIcon,
  BeerIcon,
  ScaleIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ShareIcon,
  ArchiveBoxIcon,
  Cog8ToothIcon,
  ShoppingCartIcon,
  DocumentArrowDownIcon,
  ExportIcon,
  ImportIcon,
  TruckIcon,
  ClipboardCheckIcon,
  ChartBarIcon,
  TableCellsIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  PowerIcon,
  SparklesIcon,
  ArrowUturnLeftIcon,
} from "./constants.js";
import * as DataManager from "./DataManager.js";
import UnidadMedidaForm from "./components/UnidadMedidaForm.tsx";
import ProductosBaseList from "./components/ProductosBaseList.tsx";
import ProductoBaseForm from "./components/ProductoBaseForm.tsx";
import PlatosList from "./components/PlatosList.tsx";
import PlatoForm from "./components/PlatoForm.tsx";
import ProveedoresList from "./components/ProveedoresList.tsx";
import ProveedorForm from "./components/ProveedorForm.tsx";
import ServiciosList from "./components/ServiciosList.tsx";
import ServicioForm from "./components/ServicioForm.tsx";
import CartasTecnologicasList from "./components/CartasTecnologicasList.tsx";
import CartaTecnologicaForm from "./components/CartaTecnologicaForm.tsx";
import MenuPreciosList from "./components/MenuPreciosList.tsx";
import MenuPrecioForm from "./components/MenuPrecioForm.tsx";
import InventarioList from "./components/InventarioList.tsx";
import InventarioForm from "./components/InventarioForm.tsx";
import InventarioEditForm from "./components/InventarioEditForm.tsx";
import VentaForm from "./components/VentaForm.tsx";
import CompraForm from "./components/CompraForm.tsx";
import CompraEditForm from "./components/CompraEditForm.tsx";
import ConfiguracionFormComponent from "./ConfiguracionForm.tsx";
import { AnalisisRendimiento } from "./components/AnalisisRendimiento.tsx";
import { CuentasPorCobrarList } from "./components/CuentasPorCobrarList.tsx";
import { CuentasPorPagarList } from "./components/CuentasPorPagarList.tsx";
import ModificarCuentaPendienteForm from "./components/ModificarCuentaPendienteForm.tsx";
import TransaccionesListComponent from "./components/TransaccionesList.tsx";
import { OtrosGastosList } from "./components/OtrosGastosList.tsx";
import OtroGastoForm from "./components/OtroGastoForm.tsx";
import EstadoCuentaComponent from "./components/EstadoCuenta.tsx";
import EstadoFlujoEfectivo from "./components/EstadoFlujoEfectivo.tsx";
import BalanceGeneral from "./components/BalanceGeneral.tsx";
import CierresMensualesListComponent from "./components/CierresMensualesList.tsx";
import CierreMensualFormComponent from "./components/CierreMensualForm.tsx";
import AiAssistant from "./components/AiAssistant.tsx";
import FichaCostoPlato from "./components/FichaCostoPlato.tsx";
import DisponibilidadPlatos from "./components/DisponibilidadPlatos.tsx";
import UnidadesYConversionesList from "./components/UnidadesYConversionesList.tsx";
import ConversionForm from "./components/ConversionForm.tsx";

const TransaccionEditForm = ModificarCuentaPendienteForm;

type ViewType =
  | "dashboard"
  | "unidades_y_conversiones"
  | "productos_base"
  | "platos"
  | "servicios"
  | "proveedores"
  | "recetas"
  | "inventario"
  | "precios"
  | "transacciones"
  | "configuracion"
  | "compras"
  | "analisis_rendimiento"
  | "cuentas_por_cobrar"
  | "cuentas_por_pagar"
  | "estado_flujo_efectivo"
  | "otros_gastos"
  | "estado_cuenta"
  | "cierres_mensuales"
  | "ai_assistant"
  | "ficha_costo_plato"
  | "balance_general"
  | "disponibilidad_platos";

interface ModalState {
  isOpen: boolean;
  type:
    | "unidadMedida"
    | "productoBase"
    | "plato"
    | "proveedor"
    | "servicio"
    | "cartaTecnologica"
    | "menuPrecio"
    | "inventarioItem"
    | "inventarioItemEdit"
    | "venta"
    | "compra"
    | "compraPendienteEdit"
    | "modificarCuentaPendiente"
    | "otro_gasto"
    | "cierre_mensual"
    | "transaccionEdit"
    | "conversion"
    | null;
  data?:
    | UnidadMedida
    | ProductoBase
    | Plato
    | Proveedor
    | RestauranteServicio
    | CartaTecnologica
    | MenuPrecioItem
    | InventarioItem
    | Transaccion
    | OtroGasto
    | CierreMensualFormData
    | ConversionUnidad;
  preCalculatedData?: CierreMensualCalculatedData;
}

interface SidebarLinkDef {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  view?: ViewType;
  action?: () => void;
  isSeparator?: false;
  colorClass?: string;
}

interface SidebarSeparatorDef {
  id: string;
  label: string;
  isSeparator: true;
  colorClass?: string;
  icon?: never;
  view?: never;
  action?: never;
}

type SidebarItemDef = SidebarLinkDef | SidebarSeparatorDef;

interface QuickAccessLinkDef {
  label: string;
  view?: ViewType;
  action?: () => void;
  icon: React.FC<{ className?: string }>;
  color: string;
  darkColor?: string;
  description?: string;
}

export const App = (): JSX.Element => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ums, setUms] = useState<UnidadMedida[]>([]);
  const [productosBase, setProductosBase] = useState<ProductoBase[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [restaurantesServicios, setRestaurantesServicios] = useState<
    RestauranteServicio[]
  >([]);
  const [cartasTecnologicas, setCartasTecnologicas] = useState<
    CartaTecnologica[]
  >([]);
  const [menuPrecios, setMenuPrecios] = useState<MenuPrecioItem[]>([]);
  const [inventarioItems, setInventarioItems] = useState<InventarioItem[]>([]);
  const [allTransacciones, setAllTransacciones] = useState<Transaccion[]>([]);
  const [configuracion, setConfiguracion] = useState<Configuracion>(() =>
    DataManager.getInitialConfig()
  );
  const [allOtrosGastos, setAllOtrosGastos] = useState<OtroGasto[]>([]);
  const [allCierresMensuales, setAllCierresMensuales] = useState<
    CierreMensual[]
  >([]);
  const [conversiones, setConversiones] = useState<ConversionUnidad[]>([]);
  const [aiGeneratedIdeas, setAiGeneratedIdeas] = useState<AiGeneratedIdea[]>(
    []
  );
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null,
    data: undefined,
    preCalculatedData: undefined,
  });
  const [currentView, _setCurrentView] = useState<ViewType>("dashboard");
  const [viewHistory, setViewHistory] = useState<ViewType[]>(["dashboard"]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // PDF Generation loading states
  const [isGeneratingAllRecetasPdf, setIsGeneratingAllRecetasPdf] =
    useState(false);
  const [isGeneratingMenuPdf, setIsGeneratingMenuPdf] = useState(false);
  const [isGeneratingPerformancePdf, setIsGeneratingPerformancePdf] =
    useState(false);
  const [isGeneratingInventarioPdf, setIsGeneratingInventarioPdf] =
    useState(false);
  const [isGeneratingCuentasPorCobrarPdf, setIsGeneratingCuentasPorCobrarPdf] =
    useState(false);
  const [isGeneratingCuentasPorPagarPdf, setIsGeneratingCuentasPorPagarPdf] =
    useState(false);
  const [isGeneratingPlatosListPdf, setIsGeneratingPlatosListPdf] =
    useState(false);
  const [isGeneratingFichaCostoPdf, setIsGeneratingFichaCostoPdf] =
    useState(false);
  const [isGeneratingFlujoEfectivoPdf, setIsGeneratingFlujoEfectivoPdf] =
    useState(false);
  const [isGeneratingBalancePdf, setIsGeneratingBalancePdf] = useState(false);
  const [isGeneratingCierreAnualPdf, setIsGeneratingCierreAnualPdf] =
    useState(false);
  const [isGeneratingCierreTrimestralPdf, setIsGeneratingCierreTrimestralPdf] =
    useState(false);

  const sortByName = <T extends { [key: string]: any }>(
    items: T[],
    nameField: keyof T
  ): T[] => {
    return [...items]
      .filter((item) => item != null && item[nameField] != null)
      .sort((a, b) => {
        return String(a[nameField]).localeCompare(String(b[nameField]));
      });
  };

  const sortByDate = <T extends Record<string, any>>(
    items: T[],
    dateField: keyof T,
    order: "asc" | "desc" = "desc"
  ): T[] => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a[dateField]).getTime();
      const dateB = new Date(b[dateField]).getTime();
      if (isNaN(dateA) || isNaN(dateB)) {
        if (isNaN(dateA) && !isNaN(dateB)) return order === "asc" ? 1 : -1;
        if (!isNaN(dateA) && isNaN(dateB)) return order === "asc" ? -1 : 1;
        return 0;
      }
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  };

  const formatCurrency = useCallback(
    (value: number | undefined): string => {
      if (value === undefined || value === null)
        return `0.00 ${configuracion.simbolo_moneda}`;
      return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
    },
    [configuracion.simbolo_moneda]
  );

  const refreshAllData = useCallback(() => {
    // Forzar recarga real de la base de datos desde localStorage
    DataManager.refreshDb();
    // Esperar un ciclo de event loop para asegurar que db se recargue (por si hay asincronía interna)
    setTimeout(() => {
      const newConfig = DataManager.getInitialConfig();
      setConfiguracion(newConfig);

      const newUms = sortByName(DataManager.getUms(), "unidad_nombre");
      const newProductosBase = [
        ...sortByName(DataManager.getProductosBase(), "nombre_producto"),
      ];
      console.log("[REFRESH] productos base tras recarga:", newProductosBase);
      const newPlatos = sortByName(DataManager.getPlatos(), "nombre_plato");
      const newProveedores = sortByName(
        DataManager.getProveedores(),
        "nombre_proveedor"
      );
      const newServicios = sortByName(
        DataManager.getRestaurantesServicios(),
        "nombre_servicio"
      );
      const newInventario = DataManager.getInventarioItems();
      const newCartas = DataManager.getCartasTecnologicas();
      const newMenuPreciosList = DataManager.getMenuPrecios();
      const newTransacciones = sortByDate(
        DataManager.getTransacciones(),
        "fecha"
      );
      const newOtrosGastos = sortByDate(DataManager.getOtrosGastos(), "fecha");
      const newCierresMensuales = sortByDate(
        DataManager.getCierresMensuales(),
        "mes",
        "desc"
      );
      const newConversiones = DataManager.getConversiones();

      setUms(newUms);
      setProductosBase(newProductosBase);
      setPlatos(newPlatos);
      setProveedores(newProveedores);
      setRestaurantesServicios(newServicios);
      setInventarioItems(newInventario);
      setCartasTecnologicas(newCartas);
      setMenuPrecios(newMenuPreciosList);
      setAllTransacciones(newTransacciones);
      setAllOtrosGastos(newOtrosGastos);
      setAllCierresMensuales(newCierresMensuales);
      setConversiones(newConversiones);
    }, 0);
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const setCurrentView = (view: ViewType) => {
    if (view !== currentView) {
      setViewHistory((prev) => [...prev, view]);
    }
    _setCurrentView(view);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const navigateBack = () => {
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory];
      newHistory.pop(); // Remove current view
      const previousView = newHistory[newHistory.length - 1]; // Get the new last view
      setViewHistory(newHistory);
      _setCurrentView(previousView);
    } else {
      _setCurrentView("dashboard"); // Fallback to dashboard if history is too short
    }
  };

  const openModal = (
    type: ModalState["type"],
    data?: ModalState["data"],
    preCalculatedData?: ModalState["preCalculatedData"]
  ) => {
    setModalState({ isOpen: true, type, data, preCalculatedData });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      data: undefined,
      preCalculatedData: undefined,
    });
  };

  const handleLogin = (
    usernameAttempt: string,
    passwordAttempt: string
  ): boolean => {
    const storedPassword = DataManager.getPassword();
    if (
      usernameAttempt === DataManager.DEFAULT_USERNAME &&
      passwordAttempt === storedPassword
    ) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    _setCurrentView("dashboard");
    setViewHistory(["dashboard"]);
  };

  // CRUD Handlers
  const handleSaveUnidadMedida = (
    data: UnidadMedidaFormData | UnidadMedida
  ) => {
    let success = false;
    let operation: "add" | "update" = "add";
    if ("id" in data) {
      operation = "update";
      success = DataManager.updateUm(data as UnidadMedida);
    } else {
      operation = "add";
      const newUm = DataManager.addUm(data as UnidadMedidaFormData);
      success = !!newUm;
    }

    if (success) {
      refreshAllData();
      closeModal();
    } else {
      alert(
        `Error al ${
          operation === "add" ? "crear" : "actualizar"
        } la unidad de medida. El almacenamiento podría estar lleno o no disponible.`
      );
    }
  };

  const handleDeleteUnidadMedida = (id: string) => {
    if (
      window.confirm(
        "¿Está seguro de que desea eliminar esta unidad de medida? Se eliminarán también las conversiones asociadas."
      )
    ) {
      DataManager.deleteUm(id);
      refreshAllData();
    }
  };

  const handleSaveConversion = (
    data: ConversionUnidadFormData | ConversionUnidad
  ) => {
    let success = false;
    let operation: "add" | "update" = "add";
    if ("id" in data) {
      operation = "update";
      success = DataManager.updateConversion(data as ConversionUnidad);
    } else {
      operation = "add";
      const newConversion = DataManager.addConversion(
        data as ConversionUnidadFormData
      );
      success = !!newConversion;
    }

    if (success) {
      refreshAllData();
      closeModal();
    } else {
      alert(
        `Error al ${
          operation === "add" ? "crear" : "actualizar"
        } la conversión.`
      );
    }
  };

  const handleDeleteConversion = (id: string) => {
    if (
      window.confirm(
        "¿Está seguro de que desea eliminar esta regla de conversión?"
      )
    ) {
      DataManager.deleteConversion(id);
      refreshAllData();
    }
  };

  const handleSaveProductoBase = (
    data: ProductoBaseFormData | ProductoBase
  ) => {
    let success = false;
    let operation: "add" | "update" = "add";
    if ("id" in data) {
      operation = "update";
      success = DataManager.updateProductoBase(data as ProductoBase);
    } else {
      operation = "add";
      const newProd = DataManager.addProductoBase(data);
      success = !!newProd;
    }
    if (success) {
      refreshAllData();
      closeModal();
    } else {
      alert(
        `Error al ${
          operation === "add" ? "crear" : "actualizar"
        } el producto base. El almacenamiento podría estar lleno.`
      );
    }
  };

  // Eliminar solo entradas de inventario, no productos base
  const handleDeleteInventarioEntrada = (producto_base_id: string) => {
    if (
      window.confirm(
        "¿Está seguro de que desea eliminar esta entrada de inventario?"
      )
    ) {
      DataManager.deleteInventarioEntrada(producto_base_id);
      refreshAllData();
    }
  };

  const handleSavePlato = (data: PlatoFormData | Plato) => {
    let success = false;
    let operation: "add" | "update" = "add";
    if ("id" in data) {
      operation = "update";
      success = DataManager.updatePlato(data as Plato);
    } else {
      operation = "add";
      const newPlato = DataManager.addPlato(data);
      success = !!newPlato;
    }
    if (success) {
      refreshAllData();
      closeModal();
    } else {
      alert(
        `Error al ${
          operation === "add" ? "crear" : "actualizar"
        } el plato. El almacenamiento podría estar lleno.`
      );
    }
  };

  const handleDeletePlato = (id: string) => {
    if (
      window.confirm(
        "¿Está seguro de que desea eliminar este plato? También se eliminarán sus recetas y precios asociados."
      )
    ) {
      DataManager.deletePlato(id);
      refreshAllData();
    }
  };

  const handleSaveProveedor = (data: ProveedorFormData | Proveedor) => {
    let success = false;
    let operation: "add" | "update" = "add";
    if ("id" in data) {
      operation = "update";
      success = DataManager.updateProveedor(data as Proveedor);
    } else {
      operation = "add";
      const newProv = DataManager.addProveedor(data);
      success = !!newProv;
    }
    if (success) {
      refreshAllData();
      closeModal();
    } else {
      alert(
        `Error al ${
          operation === "add" ? "crear" : "actualizar"
        } el proveedor. El almacenamiento podría estar lleno.`
      );
    }
  };

  const handleDeleteProveedor = (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este proveedor?")) {
      DataManager.deleteProveedor(id);
      refreshAllData();
    }
  };

  const handleSaveServicio = (
    data: RestauranteServicioFormData | RestauranteServicio
  ) => {
    let success = false;
    let operation: "add" | "update" = "add";
    if ("id" in data) {
      operation = "update";
      success = DataManager.updateRestauranteServicio(
        data as RestauranteServicio
      );
    } else {
      operation = "add";
      const newServ = DataManager.addRestauranteServicio(data);
      success = !!newServ;
    }
    if (success) {
      refreshAllData();
      closeModal();
    } else {
      alert(
        `Error al ${
          operation === "add" ? "crear" : "actualizar"
        } el servicio/canal. El almacenamiento podría estar lleno.`
      );
    }
  };

  const handleDeleteServicio = (id: string) => {
    if (
      window.confirm("¿Está seguro de que desea eliminar este servicio/canal?")
    ) {
      DataManager.deleteRestauranteServicio(id);
      refreshAllData();
    }
  };

  const handleSaveCartaTecnologica = (data: CartaTecnologica) => {
    if (
      window.confirm(
        "Guardar una receta recalculará el costo de los platos. Esto puede afectar reportes futuros. ¿Desea continuar?"
      )
    ) {
      let success = false;
      let operation: "add" | "update" = "add";
      const existing = cartasTecnologicas.find((c) => c.id === data.id);
      if (existing) {
        operation = "update";
        success = DataManager.updateCartaTecnologica(data);
      } else {
        operation = "add";
        const newCarta = DataManager.addCartaTecnologica(data);
        success = !!newCarta;
      }
      if (success) {
        refreshAllData();
        closeModal();
      } else {
        alert(
          `Error al ${
            operation === "add" ? "crear" : "actualizar"
          } la receta. El almacenamiento podría estar lleno.`
        );
      }
    }
  };

  const handleDeleteCartaTecnologica = (id: string) => {
    if (
      window.confirm(
        "¿Está seguro de que desea eliminar esta carta tecnológica (receta)?"
      )
    ) {
      DataManager.deleteCartaTecnologica(id);
      refreshAllData();
    }
  };

  const handleSaveMenuPrecio = (data: MenuPrecioFormData | MenuPrecioItem) => {
    if (
      window.confirm(
        "Guardar un precio de menú recalculará la rentabilidad en reportes futuros. ¿Desea continuar?"
      )
    ) {
      let success = false;
      let operation: "add" | "update" = "add";
      if ("id" in data) {
        operation = "update";
        success = DataManager.updateMenuPrecio(data as MenuPrecioItem);
      } else {
        operation = "add";
        const newMp = DataManager.addMenuPrecio(data);
        success = !!newMp;
      }
      if (success) {
        refreshAllData();
        closeModal();
      } else {
        alert(
          `Error al ${
            operation === "add" ? "crear" : "actualizar"
          } el precio del menú.`
        );
      }
    }
  };

  const handleDeleteMenuPrecio = (id: string) => {
    if (
      window.confirm(
        "¿Está seguro de que desea eliminar este conjunto de precios del menú?"
      )
    ) {
      DataManager.deleteMenuPrecio(id);
      refreshAllData();
    }
  };

  const handleSaveInventarioItem = (data: InventarioFormData) => {
    DataManager.updateInventarioItemStockMinimo(
      data.producto_base_id,
      data.stock_minimo
    );
    refreshAllData();
    closeModal();
  };

  const handleSaveInventarioItemFull = (data: InventarioEditFormData) => {
    DataManager.updateInventarioItemFull(data);
    refreshAllData();
    closeModal();
  };

  const handleSaveVenta = (data: VentaFormData) => {
    const result = DataManager.registrarVenta(data);
    if (result.success) {
      refreshAllData();
      closeModal();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleSaveCompra = (data: CompraFormData) => {
    const result = DataManager.registrarCompra(data);
    if (result.success) {
      refreshAllData();
      closeModal();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleUpdateCompraPendiente = (data: CompraEditFormData) => {
    const { success, message } = DataManager.updateCompraPendiente(data);
    if (success) {
      refreshAllData();
      closeModal();
    } else {
      alert(`Error: ${message}`);
    }
  };

  const handleSaveConfiguracion = (data: Configuracion) => {
    DataManager.saveConfig(data);
    refreshAllData();
    alert("Configuración guardada exitosamente.");
  };

  const handleReiniciarInventarioYPrecios = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres reiniciar el inventario y los precios? Esta acción eliminará todos los datos de inventario y precios del menú. No se puede deshacer."
      )
    ) {
      DataManager.reiniciarInventarioYPrecios();
      refreshAllData();
      alert("El inventario y los precios se han reiniciado.");
    }
  };

  const handleSaveOtroGasto = (data: OtroGastoFormData | OtroGasto) => {
    let result: { success: boolean; message: string };
    if ("id" in data) {
      result = DataManager.updateOtroGasto(data as OtroGasto);
    } else {
      result = DataManager.registrarOtroGasto(data as OtroGastoFormData);
    }

    if (result.success) {
      refreshAllData();
      closeModal();
    } else {
      alert(result.message);
    }
  };

  const handleDeleteOtroGasto = (id: string) => {
    if (
      window.confirm(
        "¿Está seguro de que desea eliminar este gasto? Esto también eliminará la transacción asociada."
      )
    ) {
      const result = DataManager.deleteOtroGasto(id);
      if (result.success) {
        refreshAllData();
      } else {
        alert(result.message);
      }
    }
  };

  const handleGenerarCierreMensual = (
    formData: CierreMensualFormData,
    calculatedData: CierreMensualCalculatedData
  ) => {
    if (
      window.confirm(
        "Estás a punto de cerrar el mes. Esta acción afectará saldos, reportes y acumulados. ¿Deseas continuar?"
      )
    ) {
      const { success, message } = DataManager.addCierreMensual(
        formData,
        calculatedData
      );
      alert(message);
      if (success) {
        refreshAllData();
        closeModal();
      }
    }
  };

  const handleRevertirUltimoCierre = () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas revertir el último cierre mensual? Esta acción no se puede deshacer."
      )
    ) {
      const { success, message } = DataManager.revertirUltimoCierre();
      alert(message);
      if (success) {
        refreshAllData();
      }
    }
  };

  const handleAiGenerate = async (details: AiPromptDetails) => {
    setAiLoading(true);
    setAiError(null);
    setAiGeneratedIdeas([]);
    try {
      const ideas = await DataManager.generateRecipeIdeas(details);
      setAiGeneratedIdeas(ideas);
    } catch (e: any) {
      setAiError(e.message || "Un error desconocido ocurrió.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiAddToSystem = (idea: AiGeneratedIdea) => {
    if (
      !window.confirm(
        `¿Desea añadir "${idea.nombre_plato}" al sistema? Esto creará un nuevo Plato y una nueva Receta.`
      )
    )
      return;

    const newPlato = DataManager.addPlato({ nombre_plato: idea.nombre_plato });
    if (!newPlato) {
      alert("Error al crear el nuevo plato.");
      return;
    }

    const ingredientes: CartaTecnologica["ingredientes_receta"] = [];
    idea.ingredientes_detallados.forEach((ing) => {
      // Simple logic to parse quantity and unit. This could be improved.
      const match = ing.cantidad.match(/([\d.,]+)\s*(.*)/);
      if (match) {
        const [, cantidadStr, umNombre] = match;
        const cantidad = parseFloat(cantidadStr.replace(",", "."));

        let um = ums.find(
          (u) => u.unidad_nombre.toLowerCase() === umNombre.trim().toLowerCase()
        );
        // Create UM if it doesn't exist? For now, let's assume it should.
        if (!um) {
          console.warn(
            `Unidad de medida '${umNombre}' no encontrada para '${ing.nombre}'. Se omitirá.`
          );
          return; // or create a default UM
        }

        let prodBase = productosBase.find(
          (p) =>
            p.nombre_producto.toLowerCase() === ing.nombre.trim().toLowerCase()
        );
        if (!prodBase) {
          console.warn(
            `Producto base '${ing.nombre}' no encontrado. Se creará uno nuevo.`
          );
          const newProd = DataManager.addProductoBase({
            nombre_producto: ing.nombre.trim().toUpperCase(),
            um_predeterminada: um.id,
          });
          if (newProd) {
            prodBase = newProd;
          } else {
            return; // Failed to create
          }
        }

        if (prodBase && um) {
          ingredientes.push({
            id: DataManager.generateId(),
            producto_base_id: prodBase.id,
            cantidad: cantidad,
            unidad_medida_id: um.id,
          });
        }
      }
    });

    const newCarta: CartaTecnologica = {
      id: DataManager.generateId(),
      plato_id: newPlato.id,
      ingredientes_receta: ingredientes,
      notas_preparacion: [
        `Tiempo de Preparación: ${idea.tiempo_preparacion || "N/A"}`,
        `Tiempo de Cocción: ${idea.tiempo_coccion || "N/A"}`,
        `Tiempo Total: ${idea.tiempo_total || "N/A"}`,
        `Porciones Sugeridas: ${idea.porciones_sugeridas || "N/A"}`,
        "",
        ...idea.instrucciones_preparacion,
        "",
        "Consejos del Chef:",
        ...(idea.consejos_chef || []),
      ].join("\n"),
    };

    DataManager.addCartaTecnologica(newCarta);
    refreshAllData();
    alert(`¡"${idea.nombre_plato}" ha sido añadido exitosamente!`);
    setCurrentView("recetas");
  };

  const handleExportAllRecetasPdf = async (
    selectedRecetas: CartaTecnologica[]
  ) => {
    if (selectedRecetas.length === 0) {
      alert("Por favor, seleccione al menos una receta para exportar.");
      return;
    }
    setIsGeneratingAllRecetasPdf(true);
    try {
      await DataManager.generarListadoRecetasPDF(
        selectedRecetas,
        platos,
        productosBase,
        ums,
        configuracion
      );
    } catch (e: any) {
      alert(`Error al generar el PDF de recetas: ${e.message}`);
    } finally {
      setIsGeneratingAllRecetasPdf(false);
    }
  };

  const handleExportMenuPdf = async (selectedItems: MenuPrecioItem[]) => {
    if (selectedItems.length === 0) {
      alert("Por favor, seleccione al menos un plato del menú para exportar.");
      return;
    }
    setIsGeneratingMenuPdf(true);
    try {
      await DataManager.generarMenuPDF(
        selectedItems,
        platos,
        restaurantesServicios,
        configuracion
      );
    } catch (e: any) {
      alert(`Error al generar el PDF del menú: ${e.message}`);
    } finally {
      setIsGeneratingMenuPdf(false);
    }
  };

  const handleExportPerformancePdf = async (
    performanceData: PerformanceAnalyticsData
  ) => {
    setIsGeneratingPerformancePdf(true);
    try {
      await DataManager.generarPerformancePDF(performanceData, configuracion);
    } catch (e: any) {
      alert(`Error al generar el PDF de rendimiento: ${e.message}`);
    } finally {
      setIsGeneratingPerformancePdf(false);
    }
  };

  const handleExportInventarioPdf = async () => {
    const inventarioData = inventarioItems.map((item) => {
      const producto = productosBase.find(
        (p) => p.id === item.producto_base_id
      );
      const um = ums.find((u) => u.id === item.unidad_medida_id);
      const stock = item.entradas - item.salidas;
      return {
        nombre: producto?.nombre_producto || "Desconocido",
        stock: stock,
        um: um?.unidad_nombre || "N/A",
        stockMinimo: item.stock_minimo,
        costoPromedio: item.precio_promedio_ponderado,
        valorTotal: stock * item.precio_promedio_ponderado,
      };
    });
    setIsGeneratingInventarioPdf(true);
    try {
      await DataManager.generarInventarioPDF(inventarioData, configuracion);
    } catch (e: any) {
      alert(`Error al generar el PDF de inventario: ${e.message}`);
    } finally {
      setIsGeneratingInventarioPdf(false);
    }
  };

  const handleExportCuentasPorCobrarPdf = async (
    cuentas: Transaccion[],
    tipo: "Pendientes" | "PagadasRecientemente"
  ) => {
    setIsGeneratingCuentasPorCobrarPdf(true);
    try {
      await DataManager.generarCuentasPorCobrarPDF(
        cuentas,
        configuracion,
        tipo
      );
    } catch (e: any) {
      alert(`Error al generar PDF de Cuentas por Cobrar: ${e.message}`);
    } finally {
      setIsGeneratingCuentasPorCobrarPdf(false);
    }
  };

  const handleExportCuentasPorPagarPdf = async (cuentas: Transaccion[]) => {
    setIsGeneratingCuentasPorPagarPdf(true);
    try {
      await DataManager.generarCuentasPorPagarPDF(
        cuentas,
        configuracion,
        "Pendientes"
      );
    } catch (e: any) {
      alert(`Error al generar PDF de Cuentas por Pagar: ${e.message}`);
    } finally {
      setIsGeneratingCuentasPorPagarPdf(false);
    }
  };

  const handleExportPlatosListPdf = async (selectedPlatos: Plato[]) => {
    if (selectedPlatos.length === 0) {
      alert("Por favor, seleccione al menos un plato para exportar.");
      return;
    }
    setIsGeneratingPlatosListPdf(true);
    try {
      await DataManager.generarListadoPlatosPDF(selectedPlatos, configuracion);
    } catch (e: any) {
      alert(`Error al generar PDF de listado de platos: ${e.message}`);
    } finally {
      setIsGeneratingPlatosListPdf(false);
    }
  };

  const handleExportFichaCostoPdf = async (data: FichaCostoPlatoData) => {
    setIsGeneratingFichaCostoPdf(true);
    try {
      await DataManager.generarFichaCostoPlatoPDF(data, configuracion);
    } catch (e: any) {
      alert(`Error al generar PDF de Ficha de Costo: ${e.message}`);
    } finally {
      setIsGeneratingFichaCostoPdf(false);
    }
  };

  const handleExportFlujoEfectivoPdf = async (data: FlujoEfectivoData) => {
    setIsGeneratingFlujoEfectivoPdf(true);
    try {
      await DataManager.generarFlujoEfectivoPDF(data, configuracion);
    } catch (e: any) {
      alert(`Error al generar PDF de Flujo de Efectivo: ${e.message}`);
    } finally {
      setIsGeneratingFlujoEfectivoPdf(false);
    }
  };

  const handleExportBalancePdf = async (data: BalanceGeneralData) => {
    setIsGeneratingBalancePdf(true);
    try {
      await DataManager.generarBalanceGeneralPDF(data, configuracion);
    } catch (e: any) {
      alert(`Error al generar PDF de Balance General: ${e.message}`);
    } finally {
      setIsGeneratingBalancePdf(false);
    }
  };

  const handleExportCierrePdf = async (cierre: CierreMensual) => {
    setIsGeneratingMenuPdf(true); // Re-use menu PDF state for simplicity, can be separate
    try {
      await DataManager.generarPDFCierreMensual(cierre, configuracion);
    } catch (e: any) {
      alert(`Error al generar PDF de Cierre Mensual: ${e.message}`);
    } finally {
      setIsGeneratingMenuPdf(false);
    }
  };

  const handleExportCierreAnualPdf = async (year: string) => {
    setIsGeneratingCierreAnualPdf(true);
    try {
      await DataManager.generarPDFCierreAnual(
        year,
        allCierresMensuales,
        configuracion
      );
    } catch (e: any) {
      alert(`Error al generar PDF de Cierre Anual: ${e.message}`);
    } finally {
      setIsGeneratingCierreAnualPdf(false);
    }
  };

  const handleExportCierreTrimestralPdf = async (
    year: string,
    quarter: number
  ) => {
    setIsGeneratingCierreTrimestralPdf(true);
    try {
      await DataManager.generarPDFCierreTrimestral(
        year,
        quarter,
        allCierresMensuales,
        configuracion
      );
    } catch (e: any) {
      alert(`Error al generar PDF de Cierre Trimestral: ${e.message}`);
    } finally {
      setIsGeneratingCierreTrimestralPdf(false);
    }
  };

  const handleMarcarPagado = (
    transaccionId: string,
    metodoPago:
      | EstadoPago.EFECTIVO
      | EstadoPago.TRANSFERENCIA
      | EstadoPago.ZELLE
  ) => {
    const { success, message } = DataManager.marcarDeudaComoPagadaConMetodo(
      transaccionId,
      metodoPago
    );
    if (success) {
      refreshAllData();
    } else {
      alert(`Error: ${message}`);
    }
  };

  const handleMarcarPagadoProveedor = (
    transaccionId: string,
    metodoPago:
      | EstadoPago.EFECTIVO
      | EstadoPago.TRANSFERENCIA
      | EstadoPago.ZELLE
  ) => {
    const { success, message } = DataManager.pagarDeudaProveedor(
      transaccionId,
      metodoPago
    );
    alert(message);
    if (success) {
      refreshAllData();
      closeModal(); // Close if editing from a modal
    }
  };

  const handleDeshacerPago = (transaccionId: string) => {
    if (
      window.confirm(
        "¿Está seguro que desea deshacer este pago y marcar la cuenta como pendiente de nuevo?"
      )
    ) {
      const { success, message } =
        DataManager.deshacerPagoCuenta(transaccionId);
      if (success) {
        refreshAllData();
      } else {
        alert(`Error: ${message}`);
      }
    }
  };

  const handleBorrarDeudor = (transaccionId: string) => {
    if (
      window.confirm(
        "¿Está seguro que desea borrar el nombre del deudor de esta cuenta pendiente?"
      )
    ) {
      const { success, message } =
        DataManager.borrarNombreDeudor(transaccionId);
      if (success) {
        refreshAllData();
      } else {
        alert(`Error: ${message}`);
      }
    }
  };

  const handleModificarCuentaPendiente = (
    transaccionId: string,
    updates: { nombre_deudor?: string; estado_pago: EstadoPago; notas?: string }
  ) => {
    const { success, message } = DataManager.updateCuentaPendiente(
      transaccionId,
      updates
    );
    if (success) {
      refreshAllData();
      closeModal();
    } else {
      alert(`Error: ${message}`);
    }
  };

  const handleDeleteTransaccion = (id: string) => {
    if (
      window.confirm(
        "¿Está seguro que desea eliminar esta transacción? Esta acción no se puede deshacer y ajustará el inventario si es aplicable."
      )
    ) {
      const { success, message } = DataManager.deleteTransaccion(id);
      if (success) {
        refreshAllData();
      } else {
        alert(`Error: ${message}`);
      }
    }
  };

  const handleExportDb = () => {
    DataManager.exportDb(configuracion.nombre_restaurante);
  };

  const handleImportDb = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (
            window.confirm(
              "¿Está seguro de que desea importar esta base de datos? Se sobrescribirán todos los datos actuales."
            )
          ) {
            const success = DataManager.importDb(result);
            if (success) {
              alert(
                "Base de datos importada exitosamente. La aplicación se recargará."
              );
              refreshAllData();
            } else {
              alert(
                "Error: El archivo de la base de datos es inválido o está corrupto."
              );
            }
          }
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  };

  const sidebarItems: SidebarItemDef[] = [
    { id: "dashboard", label: "Dashboard", icon: HomeIcon, view: "dashboard" },
    {
      id: "sep_ops",
      label: "Operaciones del Día",
      isSeparator: true,
      colorClass: "text-sky-500",
    },
    {
      id: "venta",
      label: "Registrar Venta",
      icon: AddIcon,
      action: () => openModal("venta"),
    },
    {
      id: "compra",
      label: "Registrar Compra",
      icon: ShoppingCartIcon,
      view: "compras",
    },
    {
      id: "gasto",
      label: "Registrar Otro Gasto",
      icon: DocumentArrowDownIcon,
      view: "otros_gastos",
    },
    {
      id: "disponibilidad_platos",
      label: "Disponibilidad de Platos",
      icon: ClipboardCheckIcon,
      view: "disponibilidad_platos",
    },
    {
      id: "sep_gestion",
      label: "Gestión de Productos y Menú",
      isSeparator: true,
      colorClass: "text-teal-500",
    },
    {
      id: "platos",
      label: "Gestión de Platos",
      icon: BookOpenIcon,
      view: "platos",
    },
    {
      id: "recetas",
      label: "Gestión de Recetas",
      icon: ClipboardDocumentListIcon,
      view: "recetas",
    },
    {
      id: "precios",
      label: "Gestión de Precios del Menú",
      icon: PriceTagIcon,
      view: "precios",
    },
    {
      id: "sep_inventario",
      label: "Inventario y Abastecimiento",
      isSeparator: true,
      colorClass: "text-amber-500",
    },
    {
      id: "inventario",
      label: "Estado del Inventario",
      icon: ArchiveBoxIcon,
      view: "inventario",
    },
    {
      id: "productos_base",
      label: "Productos Base",
      icon: CubeIcon,
      view: "productos_base",
    },
    {
      id: "proveedores",
      label: "Proveedores",
      icon: TruckIcon,
      view: "proveedores",
    },
    {
      id: "sep_finanzas",
      label: "Finanzas y Análisis",
      isSeparator: true,
      colorClass: "text-indigo-500",
    },
    {
      id: "transacciones",
      label: "Historial de Transacciones",
      icon: TableCellsIcon,
      view: "transacciones",
    },
    {
      id: "cierres_mensuales",
      label: "Cierres Contables",
      icon: DocumentTextIcon,
      view: "cierres_mensuales",
    },
    {
      id: "estado_cuenta",
      label: "Estado de Cuenta",
      icon: DocumentTextIcon,
      view: "estado_cuenta",
    },
    {
      id: "estado_flujo_efectivo",
      label: "Flujo de Efectivo",
      icon: DocumentTextIcon,
      view: "estado_flujo_efectivo",
    },
    {
      id: "balance_general",
      label: "Balance General",
      icon: DocumentTextIcon,
      view: "balance_general",
    },
    {
      id: "cuentas_por_cobrar",
      label: "Cuentas por Cobrar",
      icon: UserGroupIcon,
      view: "cuentas_por_cobrar",
    },
    {
      id: "cuentas_por_pagar",
      label: "Cuentas por Pagar",
      icon: UserGroupIcon,
      view: "cuentas_por_pagar",
    },
    {
      id: "analisis_rendimiento",
      label: "Análisis de Rendimiento",
      icon: ChartBarIcon,
      view: "analisis_rendimiento",
    },
    {
      id: "ficha_costo_plato",
      label: "Ficha de Costo de Plato",
      icon: ScaleIcon,
      view: "ficha_costo_plato",
    },
    {
      id: "sep_config",
      label: "Configuración del Sistema",
      isSeparator: true,
      colorClass: "text-slate-500",
    },
    {
      id: "unidades_y_conversiones",
      label: "Unidades y Conversiones",
      icon: ScaleIcon,
      view: "unidades_y_conversiones",
    },
    {
      id: "servicios",
      label: "Servicios/Canales",
      icon: ShareIcon,
      view: "servicios",
    },
    {
      id: "ai_assistant",
      label: "Asistente de Recetas IA",
      icon: SparklesIcon,
      view: "ai_assistant",
    },
    {
      id: "configuracion",
      label: "Configuración General",
      icon: Cog8ToothIcon,
      view: "configuracion",
    },
    {
      id: "exportar_bd",
      label: "Exportar BD",
      icon: ExportIcon,
      action: handleExportDb,
    },
    {
      id: "importar_bd",
      label: "Importar BD",
      icon: ImportIcon,
      action: handleImportDb,
    },
  ];

  const quickAccessLinks: QuickAccessLinkDef[] = [
    {
      label: "Registrar Venta",
      action: () => openModal("venta"),
      icon: AddIcon,
      color: "bg-green-500",
      darkColor: "dark:bg-green-600",
      description: "Añadir una nueva venta de plato.",
    },
    {
      label: "Registrar Compra",
      view: "compras",
      icon: ShoppingCartIcon,
      color: "bg-blue-500",
      darkColor: "dark:bg-blue-600",
      description: "Ingresar una nueva compra de insumos.",
    },
    {
      label: "Registrar Gasto",
      view: "otros_gastos",
      icon: DocumentArrowDownIcon,
      color: "bg-yellow-500",
      darkColor: "dark:bg-yellow-600",
      description: "Anotar gastos operativos como luz, agua, etc.",
    },
    {
      label: "Ver Inventario",
      view: "inventario",
      icon: ArchiveBoxIcon,
      color: "bg-purple-500",
      darkColor: "dark:bg-purple-600",
      description: "Consultar el stock actual de productos.",
    },
    {
      label: "Cuentas por Cobrar",
      view: "cuentas_por_cobrar",
      icon: UserGroupIcon,
      color: "bg-pink-500",
      darkColor: "dark:bg-pink-600",
      description: "Gestionar deudas de clientes.",
    },
    {
      label: "Análisis de Ventas",
      view: "analisis_rendimiento",
      icon: ChartBarIcon,
      color: "bg-indigo-500",
      darkColor: "dark:bg-indigo-600",
      description: "Visualizar reportes y gráficos de ventas.",
    },
  ];

  const renderModalContent = () => {
    switch (modalState.type) {
      case "unidadMedida":
        return (
          <UnidadMedidaForm
            onSubmit={handleSaveUnidadMedida}
            onClose={closeModal}
            initialData={modalState.data as UnidadMedida}
          />
        );
      case "conversion":
        return (
          <ConversionForm
            onSubmit={handleSaveConversion}
            onClose={closeModal}
            initialData={modalState.data as ConversionUnidad}
            ums={ums}
            productosBase={productosBase}
          />
        );
      case "productoBase":
        return (
          <ProductoBaseForm
            onSubmit={handleSaveProductoBase}
            onClose={closeModal}
            initialData={modalState.data as ProductoBase}
            ums={ums}
          />
        );
      case "plato":
        return (
          <PlatoForm
            onSubmit={handleSavePlato}
            onClose={closeModal}
            initialData={modalState.data as Plato}
          />
        );
      case "proveedor":
        return (
          <ProveedorForm
            onSubmit={handleSaveProveedor}
            onClose={closeModal}
            initialData={modalState.data as Proveedor}
          />
        );
      case "servicio":
        return (
          <ServicioForm
            onSubmit={handleSaveServicio}
            onClose={closeModal}
            initialData={modalState.data as RestauranteServicio}
          />
        );
      case "cartaTecnologica":
        return (
          <CartaTecnologicaForm
            onSubmit={handleSaveCartaTecnologica}
            onClose={closeModal}
            initialData={modalState.data as CartaTecnologica}
            platos={platos}
            productosBase={productosBase}
            ums={ums}
            existingCartaPlatoIds={cartasTecnologicas.map((c) => c.plato_id)}
          />
        );
      case "menuPrecio":
        return (
          <MenuPrecioForm
            onSubmit={handleSaveMenuPrecio}
            onClose={closeModal}
            initialData={modalState.data as MenuPrecioItem}
            platos={platos}
            existingMenuPlatoIds={menuPrecios.map((mp) => mp.plato_id)}
            configuracion={configuracion}
          />
        );
      case "inventarioItem":
        return (
          modalState.data && (
            <InventarioForm
              onSubmit={handleSaveInventarioItem}
              onClose={closeModal}
              initialData={modalState.data as InventarioItem}
              productosBase={productosBase}
            />
          )
        );
      case "inventarioItemEdit":
        return (
          modalState.data && (
            <InventarioEditForm
              onSubmit={handleSaveInventarioItemFull}
              onClose={closeModal}
              initialData={modalState.data as InventarioItem}
              productosBase={productosBase}
            />
          )
        );
      case "venta":
        return (
          <VentaForm
            onSuccessfulSubmit={() => {
              refreshAllData();
              closeModal();
            }}
            onClose={closeModal}
            platos={platos}
            servicios={restaurantesServicios}
            config={configuracion}
            ums={ums}
            productosBase={productosBase}
            cartasTecnologicas={cartasTecnologicas}
            inventario={inventarioItems}
            menuPrecios={menuPrecios}
          />
        );
      case "compra":
        return (
          <CompraForm
            onSubmit={handleSaveCompra}
            onClose={closeModal}
            productosBase={productosBase}
            proveedores={proveedores}
            ums={ums}
            conversiones={conversiones}
          />
        );
      case "compraPendienteEdit":
        return (
          modalState.data && (
            <CompraEditForm
              onSubmit={handleUpdateCompraPendiente}
              onClose={closeModal}
              initialData={modalState.data as Transaccion}
              productosBase={productosBase}
              proveedores={proveedores}
              ums={ums}
            />
          )
        );
      case "modificarCuentaPendiente":
        return (
          modalState.data && (
            <ModificarCuentaPendienteForm
              initialData={modalState.data as Transaccion}
              onSubmit={handleModificarCuentaPendiente}
              onClose={closeModal}
              configuracion={configuracion}
            />
          )
        );
      case "otro_gasto":
        return (
          <OtroGastoForm
            onSubmit={handleSaveOtroGasto}
            onClose={closeModal}
            initialData={modalState.data as OtroGasto}
            configuracion={configuracion}
          />
        );
      case "cierre_mensual":
        return (
          <CierreMensualFormComponent
            onSubmit={handleGenerarCierreMensual}
            onClose={closeModal}
            initialFormData={modalState.data as CierreMensualFormData}
            preCalculatedData={modalState.preCalculatedData}
            configuracion={configuracion}
            allCierresMensuales={allCierresMensuales}
          />
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={handleLogin}
        appTitle={APP_TITLE}
        appConfig={configuracion}
      />
    );
  }

  const PageHeader = ({ title }: { title: string }) => (
    <div className="flex items-center mb-6">
      {viewHistory.length > 1 && (
        <button
          onClick={navigateBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-slate-300" />
        </button>
      )}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">
        {title}
      </h1>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 font-sans text-gray-900 dark:text-slate-200">
      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 w-64 fixed inset-y-0 left-0 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30 shadow-lg md:shadow-none flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center">
            <BeerIcon className="w-8 h-8 text-orange-500 mr-2" />
            <span className="text-xl font-semibold">{APP_TITLE}</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
          >
            <MenuCloseIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-grow p-2 space-y-1 overflow-y-auto min-h-0">
          {sidebarItems.map((item) =>
            item.isSeparator ? (
              <h3
                key={item.id}
                className={`px-3 pt-4 pb-1 text-xs font-bold uppercase ${
                  item.colorClass || "text-slate-500"
                }`}
              >
                {item.label}
              </h3>
            ) : (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  item.view
                    ? setCurrentView(item.view)
                    : item.action && item.action();
                }}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  item.view && currentView === item.view
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-800/50 dark:text-orange-200"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </a>
            )
          )}
        </nav>
        <div className="p-4 border-t dark:border-slate-700 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            <PowerIcon className="w-5 h-5 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-800 shadow-sm md:hidden p-4 flex justify-between items-center">
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <BeerIcon className="w-7 h-7 text-orange-500 mr-2" />
            <span className="text-lg font-semibold">{APP_TITLE}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <Modal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            title={
              modalState.type ? `Gestión de ${modalState.type}` : "Formulario"
            }
          >
            {renderModalContent()}
          </Modal>

          {currentView === "dashboard" && (
            <>
              <PageHeader title="Dashboard" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickAccessLinks.map((link) => (
                  <div
                    key={link.label}
                    onClick={() =>
                      link.view
                        ? setCurrentView(link.view)
                        : link.action && link.action()
                    }
                    className={`${link.color} ${
                      link.darkColor || ""
                    } text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
                  >
                    <div className="flex items-center">
                      <link.icon className="w-8 h-8 mr-4" />
                      <div>
                        <h3 className="text-xl font-bold">{link.label}</h3>
                        {link.description && (
                          <p className="text-sm opacity-90 mt-1">
                            {link.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {currentView === "unidades_y_conversiones" && (
            <div>
              <PageHeader title="Unidades y Conversiones" />
              <UnidadesYConversionesList
                ums={ums}
                conversiones={conversiones}
                productosBase={productosBase}
                onAddUm={() => openModal("unidadMedida")}
                onEditUm={(um) => openModal("unidadMedida", um)}
                onDeleteUm={handleDeleteUnidadMedida}
                onAddConversion={() => openModal("conversion")}
                onEditConversion={(c) => openModal("conversion", c)}
                onDeleteConversion={handleDeleteConversion}
              />
            </div>
          )}
          {currentView === "productos_base" && (
            <div>
              <PageHeader title="Productos Base" />
              <ProductosBaseList
                key={productosBase.length}
                productosBase={productosBase}
                ums={ums}
                onEdit={(p) => openModal("productoBase", p)}
                onDelete={handleDeleteProductoBase}
                onAdd={() => openModal("productoBase")}
              />
            </div>
          )}
          {currentView === "platos" && (
            <div>
              <PageHeader title="Platos" />
              <PlatosList
                platos={platos}
                onEdit={(p) => openModal("plato", p)}
                onDelete={handleDeletePlato}
                onAdd={() => openModal("plato")}
                onExportPdf={handleExportPlatosListPdf}
                isGeneratingPdf={isGeneratingPlatosListPdf}
              />
            </div>
          )}
          {currentView === "proveedores" && (
            <div>
              <PageHeader title="Proveedores" />
              <ProveedoresList
                proveedores={proveedores}
                onEdit={(p) => openModal("proveedor", p)}
                onDelete={handleDeleteProveedor}
                onAdd={() => openModal("proveedor")}
              />
            </div>
          )}
          {currentView === "servicios" && (
            <div>
              <PageHeader title="Servicios / Canales de Venta" />
              <ServiciosList
                servicios={restaurantesServicios}
                onEdit={(s) => openModal("servicio", s)}
                onDelete={handleDeleteServicio}
                onAdd={() => openModal("servicio")}
              />
            </div>
          )}
          {currentView === "recetas" && (
            <div>
              <PageHeader title="Recetas" />
              <CartasTecnologicasList
                cartas={cartasTecnologicas}
                platos={platos}
                productosBase={productosBase}
                ums={ums}
                onEdit={(c) => openModal("cartaTecnologica", c)}
                onDelete={handleDeleteCartaTecnologica}
                onAdd={() => openModal("cartaTecnologica")}
                configuracion={configuracion}
                onExportAllToPdf={handleExportAllRecetasPdf}
                isGeneratingAllRecetasPdf={isGeneratingAllRecetasPdf}
              />
            </div>
          )}
          {currentView === "precios" && (
            <div>
              <PageHeader title="Precios del Menú" />
              <MenuPreciosList
                menuPrecios={menuPrecios}
                platos={platos}
                onEdit={(mp) => openModal("menuPrecio", mp)}
                onDelete={handleDeleteMenuPrecio}
                onAdd={() => openModal("menuPrecio")}
                configuracion={configuracion}
                onExportMenuPdf={handleExportMenuPdf}
                isGeneratingMenuPdf={isGeneratingMenuPdf}
                refreshData={refreshAllData}
              />
            </div>
          )}
          {currentView === "inventario" && (
            <div>
              <PageHeader title="Inventario" />
              <InventarioList
                inventarioItems={inventarioItems}
                productosBase={productosBase}
                ums={ums}
                onEdit={(item) => openModal("inventarioItemEdit", item)}
                onDeleteInventarioEntrada={handleDeleteInventarioEntrada}
                onExportPdf={handleExportInventarioPdf}
                isGeneratingPdf={isGeneratingInventarioPdf}
                configuracion={configuracion}
              />
            </div>
          )}
          {currentView === "compras" && (
            <div>
              <PageHeader title="Registrar Nueva Compra" />
              <CompraForm
                onSubmit={handleSaveCompra}
                onClose={() => navigateBack()}
                productosBase={productosBase}
                proveedores={proveedores}
                ums={ums}
                conversiones={conversiones}
              />
            </div>
          )}
          {currentView === "configuracion" && (
            <div>
              <PageHeader title="Configuración del Sistema" />
              <ConfiguracionFormComponent
                initialConfig={configuracion}
                onSave={handleSaveConfiguracion}
                onReiniciarInventarioYPrecios={
                  handleReiniciarInventarioYPrecios
                }
              />
            </div>
          )}
          {currentView === "analisis_rendimiento" && (
            <AnalisisRendimiento
              allTransacciones={allTransacciones}
              platos={platos}
              configuracion={configuracion}
              restaurantesServicios={restaurantesServicios}
              onExportPdf={handleExportPerformancePdf}
              isGeneratingPdf={isGeneratingPerformancePdf}
            />
          )}
          {currentView === "cuentas_por_cobrar" && (
            <div>
              <PageHeader title="Cuentas por Cobrar" />
              <CuentasPorCobrarList
                transaccionesPendientes={allTransacciones.filter(
                  (t) =>
                    t.estado_pago === EstadoPago.PENDIENTE &&
                    t.tipo_transaccion === TipoTransaccion.VENTA
                )}
                transaccionesPagadasRecientemente={allTransacciones.filter(
                  (t) =>
                    t.estado_pago !== EstadoPago.PENDIENTE &&
                    t.tipo_transaccion === TipoTransaccion.VENTA
                )}
                configuracion={configuracion}
                onMarcarPagadoConMetodo={handleMarcarPagado}
                onModificarCuentaPendiente={(data) =>
                  openModal("modificarCuentaPendiente", data)
                }
                onDeshacerPago={handleDeshacerPago}
                onBorrarDeudor={handleBorrarDeudor}
                onExportPendientesPdf={() =>
                  handleExportCuentasPorCobrarPdf(
                    allTransacciones.filter(
                      (t) => t.estado_pago === EstadoPago.PENDIENTE
                    ),
                    "Pendientes"
                  )
                }
                isGeneratingPendientesPdf={isGeneratingCuentasPorCobrarPdf}
              />
            </div>
          )}
          {currentView === "cuentas_por_pagar" && (
            <div>
              <PageHeader title="Cuentas por Pagar" />
              <CuentasPorPagarList
                transaccionesPendientes={allTransacciones}
                proveedores={proveedores}
                configuracion={configuracion}
                onMarcarPagado={handleMarcarPagadoProveedor}
                onExportPdf={(data) => handleExportCuentasPorPagarPdf(data)}
                onEdit={(data) => openModal("compraPendienteEdit", data)}
                onDelete={handleDeleteTransaccion}
              />
            </div>
          )}
          {currentView === "transacciones" && (
            <div>
              <PageHeader title="Historial de Transacciones" />
              <TransaccionesListComponent
                transacciones={allTransacciones}
                platos={platos}
                productosBase={productosBase}
                ums={ums}
                configuracion={configuracion}
                onExportPdf={(filtered, filters) =>
                  DataManager.generarTransaccionesPDF(
                    filtered,
                    filters,
                    configuracion
                  )
                }
                onDelete={handleDeleteTransaccion}
                onEdit={(data) => openModal("modificarCuentaPendiente", data)}
              />
            </div>
          )}
          {currentView === "otros_gastos" && (
            <div>
              <PageHeader title="Otros Gastos" />
              <OtrosGastosList
                otrosGastos={allOtrosGastos}
                onAdd={() => openModal("otro_gasto")}
                onEdit={(data) => openModal("otro_gasto", data)}
                onDelete={handleDeleteOtroGasto}
                configuracion={configuracion}
                onExportPdf={(gastos, filters) =>
                  DataManager.generarOtrosGastosPDF(
                    gastos,
                    configuracion,
                    filters
                  )
                }
              />
            </div>
          )}
          {currentView === "estado_cuenta" && (
            <EstadoCuentaComponent
              allTransacciones={allTransacciones}
              allOtrosGastos={allOtrosGastos}
              allCierresMensuales={allCierresMensuales}
              configuracion={configuracion}
              onExportPdf={(data) =>
                DataManager.generarEstadoCuentaPDF(data, configuracion)
              }
              isGeneratingPdf={isGeneratingMenuPdf}
            />
          )}
          {currentView === "estado_flujo_efectivo" && (
            <EstadoFlujoEfectivo
              allTransacciones={allTransacciones}
              allOtrosGastos={allOtrosGastos}
              allCierresMensuales={allCierresMensuales}
              configuracion={configuracion}
              onExportPdf={handleExportFlujoEfectivoPdf}
              isGeneratingPdf={isGeneratingFlujoEfectivoPdf}
            />
          )}
          {currentView === "balance_general" && (
            <BalanceGeneral
              allTransacciones={allTransacciones}
              allOtrosGastos={allOtrosGastos}
              cierresMensuales={allCierresMensuales}
              configuracion={configuracion}
              onExportPdf={handleExportBalancePdf}
              isGeneratingPdf={isGeneratingBalancePdf}
            />
          )}
          {currentView === "cierres_mensuales" && (
            <div>
              <PageHeader title="Cierres Contables" />
              <CierresMensualesListComponent
                cierresMensuales={allCierresMensuales}
                onOpenCierreModal={(formData, preCalculated) =>
                  openModal("cierre_mensual", formData, preCalculated)
                }
                onExportPdf={handleExportCierrePdf}
                onExportAnualPdf={handleExportCierreAnualPdf}
                onExportTrimestralPdf={handleExportCierreTrimestralPdf}
                onRevertirUltimoCierre={handleRevertirUltimoCierre}
                isGeneratingPdf={isGeneratingMenuPdf}
                isGeneratingAnualPdf={isGeneratingCierreAnualPdf}
                isGeneratingTrimestralPdf={isGeneratingCierreTrimestralPdf}
                configuracion={configuracion}
                allTransacciones={allTransacciones}
                allOtrosGastos={allOtrosGastos}
              />
            </div>
          )}
          {currentView === "ai_assistant" && (
            <div>
              <PageHeader title="Asistente IA" />
              <AiAssistant
                onGenerate={handleAiGenerate}
                generatedIdeas={aiGeneratedIdeas}
                isLoading={aiLoading}
                error={aiError}
                onAddToSystem={handleAiAddToSystem}
              />
            </div>
          )}
          {currentView === "ficha_costo_plato" && (
            <FichaCostoPlato
              platos={platos}
              configuracion={configuracion}
              onExportPdf={handleExportFichaCostoPdf}
              isGeneratingPdf={isGeneratingFichaCostoPdf}
            />
          )}
          {currentView === "disponibilidad_platos" && (
            <DisponibilidadPlatos
              platos={platos}
              cartasTecnologicas={cartasTecnologicas}
              inventarioItems={inventarioItems}
              productosBase={productosBase}
              ums={ums}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Registrar Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}

/*
  ## Instructions:
  - Update code in `/d:\LADY BEER WEB\workspace\App.tsx`:
    - Remove <div className="min-w-full"> tags around each view in your react app and make sure that they are removed from the file. Make sure to check it after you are done to ensure that you did it correctly

  ## Step 1
  Go to `/d:\LADY BEER WEB\workspace\App.tsx`, find all of the <div className="min-w-full"> tags around each view in your react app and make sure that they are removed from the file. Make sure to check it after you are done to ensure that you did it correctly
*/
