import React, { useState, useEffect } from "react";
import {
  CompraFormData,
  ProductoBase,
  Proveedor,
  UnidadMedida,
  EstadoPago,
  ConversionUnidad,
} from "../types.js";

interface CompraFormProps {
  onSubmit: (data: CompraFormData) => void;
  onClose: () => void;
  productosBase: ProductoBase[];
  proveedores: Proveedor[];
  ums: UnidadMedida[];
  conversiones: ConversionUnidad[];
}

const CompraForm: React.FC<CompraFormProps> = ({
  onSubmit,
  onClose,
  productosBase,
  proveedores,
  ums,
  conversiones,
}) => {
  // Ahora mostramos TODOS los productos base, pero marcamos los inválidos
  const [productosConEstado, setProductosConEstado] = useState<
    (ProductoBase & { umInvalida: boolean; umEsPesos: boolean })[]
  >([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const getInitialDateString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    try {
      // DEPURACIÓN: mostrar datos de entrada
      console.log("[CompraForm] productosBase:", productosBase);
      console.log("[CompraForm] ums:", ums);
      const pesosUmId = ums.find(
        (um) => um.unidad_nombre.toLowerCase() === "pesos"
      )?.id;
      const productos = productosBase.map((pb) => {
        const umInvalida =
          !pb.um_predeterminada ||
          !ums.some((um) => um.id === pb.um_predeterminada);
        const umEsPesos = pb.um_predeterminada === pesosUmId;
        return { ...pb, umInvalida, umEsPesos };
      });
      setProductosConEstado(productos);
      // DEPURACIÓN: mostrar productos con estado
      console.log("[CompraForm] productosConEstado:", productos);
      if (productosBase.length === 0) {
        console.warn("[CompraForm] productosBase está vacío");
      }
      if (ums.length === 0) {
        console.warn("[CompraForm] ums está vacío");
      }
      if (productos.length === 0) {
        console.warn("[CompraForm] productosConEstado está vacío");
      }
    } catch (error) {
      console.error(
        "[CompraForm] Error en useEffect productosBase/ums:",
        error
      );
      setProductosConEstado([]);
    }
  }, [productosBase, ums]);

  const [formData, setFormData] = useState<CompraFormData>({
    fecha: getInitialDateString(),
    proveedor_id: proveedores.length > 0 ? proveedores[0].id : "",
    producto_base_id: "",
    cantidad: 1,
    precio_unitario: 0,
    referencia_factura_proveedor: "",
    notas: "",
    estado_pago: EstadoPago.PENDIENTE,
    unidad_compra_id: "",
  });

  useEffect(() => {
    // Seleccionar automáticamente el primer producto base válido
    if (productosConEstado.length > 0) {
      const exists = productosConEstado.some(
        (p) => p.id === formData.producto_base_id
      );
      if (!exists) {
        // Buscar el primer producto base válido (no inválido ni 'Pesos')
        const primerValido = productosConEstado.find(
          (p) => !p.umInvalida && !p.umEsPesos
        );
        setFormData((prev) => ({
          ...prev,
          producto_base_id: primerValido ? primerValido.id : "",
        }));
      }
    } else if (formData.producto_base_id) {
      setFormData((prev) => ({ ...prev, producto_base_id: "" }));
    }
  }, [productosConEstado, formData.producto_base_id]);

  useEffect(() => {
    // Auto-seleccionar la unidad de medida predeterminada del producto
    if (formData.producto_base_id) {
      const productoSeleccionado = productosBase.find(
        (p) => p.id === formData.producto_base_id
      );
      if (productoSeleccionado && productoSeleccionado.um_predeterminada) {
        setFormData((prev) => ({
          ...prev,
          unidad_compra_id: productoSeleccionado.um_predeterminada,
        }));
      }
    }
  }, [formData.producto_base_id, productosBase]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.proveedor_id) {
      alert("Debe seleccionar un proveedor.");
      return;
    }
    if (!formData.producto_base_id) {
      alert("Debe seleccionar un producto base.");
      return;
    }
    //
    if (!formData.unidad_compra_id) {
      alert("Debe seleccionar una unidad de compra.");
      return;
    }
    if (formData.cantidad <= 0) {
      alert("La cantidad debe ser mayor que cero.");
      return;
    }
    if (formData.precio_unitario < 0) {
      alert("El precio unitario no puede ser negativo.");
      return;
    }
    const inputDate = new Date(formData.fecha);
    const today = new Date();
    if (inputDate > today) {
      alert("La fecha y hora de la compra no puede ser futura.");
      return;
    }
    // Confirmación antes de registrar
    if (!window.confirm("¿Está seguro de registrar esta compra?")) {
      return;
    }
    const submissionData = { ...formData };
    onSubmit(submissionData);
    // Limpiar formulario tras registrar
    setFormData({
      fecha: getInitialDateString(),
      proveedor_id: proveedores.length > 0 ? proveedores[0].id : "",
      producto_base_id:
        productosConEstado.length > 0 ? productosConEstado[0].id : "",
      cantidad: 1,
      precio_unitario: 0,
      referencia_factura_proveedor: "",
      notas: "",
      estado_pago: EstadoPago.PENDIENTE,
      unidad_compra_id: "",
    });
    setSuccessMsg("¡Compra registrada exitosamente!");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const importeTotal = formData.cantidad * formData.precio_unitario;

  // Si no hay productos base, mostrar mensaje y deshabilitar formulario
  if (productosConEstado.length === 0) {
    return (
      <div className="p-4 text-center text-yellow-700 bg-yellow-100 rounded-md dark:bg-yellow-900/30 dark:text-yellow-200">
        No hay productos base registrados.
        <br />
        Añada productos base para poder registrar compras.
        <div className="mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:text-slate-200 dark:bg-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-2 text-center">
          {successMsg}
        </div>
      )}
      <div>
        <label
          htmlFor="fecha"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
        >
          Fecha y Hora <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          id="fecha"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          max={getInitialDateString()}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="proveedor_id"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
          >
            Proveedor <span className="text-red-500">*</span>
          </label>
          <select
            id="proveedor_id"
            name="proveedor_id"
            value={formData.proveedor_id}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            required
          >
            <option value="" disabled>
              Seleccione un proveedor...
            </option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre_proveedor}
              </option>
            ))}
          </select>
          {proveedores.length === 0 && (
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              No hay proveedores. Añada uno en la sección de Proveedores.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="producto_base_id"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
          >
            Producto Base <span className="text-red-500">*</span>
          </label>
          <select
            id="producto_base_id"
            name="producto_base_id"
            value={formData.producto_base_id}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            required
          >
            <option value="" disabled>
              Seleccione un producto...
            </option>
            {productosConEstado.map((p) => (
              <option
                key={p.id}
                value={p.id}
                disabled={p.umInvalida || p.umEsPesos}
                style={
                  p.umInvalida || p.umEsPesos
                    ? { color: "#b91c1c", background: "#fef2f2" }
                    : {}
                }
              >
                {p.nombre_producto}
                {p.umInvalida
                  ? " (UM inválida)"
                  : p.umEsPesos
                  ? " (UM 'Pesos' inválida)"
                  : ""}
              </option>
            ))}
          </select>
          {productosConEstado.some((p) => p.umInvalida || p.umEsPesos) && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Los productos marcados en rojo tienen una unidad inválida o usan
              'Pesos' como UM y no pueden ser seleccionados. Revise y corrija en
              la tabla de Productos Base.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="grid grid-cols-2 gap-2 items-end">
          <div>
            <label
              htmlFor="cantidad"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
            >
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
              required
              min="0.001"
              step="any"
            />
          </div>
          <div>
            <label
              htmlFor="unidad_compra_id"
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
            >
              Unidad <span className="text-red-500">*</span>
            </label>
            <select
              id="unidad_compra_id"
              name="unidad_compra_id"
              value={formData.unidad_compra_id}
              onChange={handleChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              required
            >
              <option value="" disabled>
                Seleccione...
              </option>
              {ums.map((um) => (
                <option key={um.id} value={um.id}>
                  {um.unidad_nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="precio_unitario"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
          >
            Precio Unitario <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="precio_unitario"
            name="precio_unitario"
            value={formData.precio_unitario}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            required
            min="0"
            step="any"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Importe Total
          </label>
          <input
            type="text"
            value={isNaN(importeTotal) ? "0.00" : importeTotal.toFixed(2)}
            readOnly
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-gray-100 dark:bg-slate-600 sm:text-sm dark:text-slate-200"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="estado_pago"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
        >
          Estado del Pago <span className="text-red-500">*</span>
        </label>
        <select
          id="estado_pago"
          name="estado_pago"
          value={formData.estado_pago}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
          required
        >
          <option value={EstadoPago.PENDIENTE}>Pendiente (a crédito)</option>
          <option value={EstadoPago.EFECTIVO}>Pagado (Efectivo)</option>
          <option value={EstadoPago.TRANSFERENCIA}>
            Pagado (Transferencia)
          </option>
          <option value={EstadoPago.ZELLE}>Pagado (Zelle)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          Si es 'Pendiente', la compra no afectará al inventario hasta que se
          marque como pagada.
        </p>
      </div>

      <div>
        <label
          htmlFor="referencia_factura_proveedor"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
        >
          Referencia Factura (Opcional)
        </label>
        <input
          type="text"
          id="referencia_factura_proveedor"
          name="referencia_factura_proveedor"
          value={formData.referencia_factura_proveedor || ""}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
        />
      </div>

      <div>
        <label
          htmlFor="notas"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
        >
          Notas (Opcional)
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={2}
          value={formData.notas || ""}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:text-slate-200 dark:bg-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
          disabled={
            proveedores.length === 0 ||
            productosConEstado.length === 0 ||
            !productosConEstado.some(
              (p) =>
                p.id === formData.producto_base_id &&
                !(p.umInvalida || p.umEsPesos)
            )
          }
        >
          Registrar Compra
        </button>
      </div>
    </form>
  );
};

export default CompraForm;
