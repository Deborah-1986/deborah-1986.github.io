import React, { useState, useEffect, useCallback } from "react";
import {
  MenuPrecioItem,
  MenuPrecioFormData,
  Plato,
  Configuracion,
} from "../types.js";

interface MenuPrecioFormProps {
  onSubmit: (data: MenuPrecioFormData | MenuPrecioItem) => void;
  onClose: () => void;
  initialData?: MenuPrecioItem;
  platos: Plato[];
  existingMenuPlatoIds: string[];
  configuracion: Configuracion;
}

const MenuPrecioForm: React.FC<MenuPrecioFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  platos,
  existingMenuPlatoIds,
  configuracion,
}) => {
  const getInitialState = useCallback(() => {
    if (initialData) {
      return { ...initialData };
    }
    const firstAvailablePlato = platos.find(
      (p) => !existingMenuPlatoIds.includes(p.id)
    );
    return {
      plato_id: firstAvailablePlato?.id || "",
      precio_restaurante: undefined,
      precio_bar: undefined,
    };
  }, [initialData, platos, existingMenuPlatoIds]);

  const [formData, setFormData] = useState<MenuPrecioFormData | MenuPrecioItem>(
    getInitialState()
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const isPriceField = name.startsWith("precio_");
    const parsedValue = isPriceField
      ? value === ""
        ? undefined
        : parseFloat(value)
      : value;

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handlePlatoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      plato_id: e.target.value,
      precio_restaurante: undefined,
      precio_bar: undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.plato_id) {
      alert("Debe seleccionar un plato.");
      return;
    }

    const restaurantePrice = Number(formData.precio_restaurante) || 0;
    const barPrice = Number(formData.precio_bar) || 0;

    const dataToSubmit = { ...formData };
    // Ensure all numeric fields are numbers or 0 before submitting
    Object.keys(dataToSubmit).forEach((key) => {
      if (
        key.startsWith("precio_") &&
        dataToSubmit[key as keyof typeof dataToSubmit] === undefined
      ) {
        dataToSubmit[key as keyof typeof dataToSubmit] = 0 as any;
      }
    });
    onSubmit({ ...dataToSubmit, precio_cocina: restaurantePrice + barPrice });
  };

  const calculateSuggestedPrice = (
    basePrice: number | undefined,
    formula: (price: number) => number
  ): string => {
    if (typeof basePrice !== "number" || basePrice <= 0) {
      return "Sugerido";
    }
    const result = formula(basePrice);
    return isNaN(result) ? "Sugerido" : result.toFixed(2);
  };

  const availablePlatos = initialData
    ? platos.filter(
        (p) =>
          p.id === initialData.plato_id || !existingMenuPlatoIds.includes(p.id)
      )
    : platos.filter((p) => !existingMenuPlatoIds.includes(p.id));

  const restaurantePrice =
    "precio_restaurante" in formData ? formData.precio_restaurante : undefined;

  const calculatedCocinaPrice =
    (Number(formData.precio_restaurante) || 0) +
    (Number(formData.precio_bar) || 0);

  const priceFieldsConfig: {
    key: keyof MenuPrecioItem;
    label: string;
    placeholder?: string;
    readOnly?: boolean;
    value?: string | number;
  }[] = [
    { key: "precio_restaurante", label: "P. Restaurante" },
    { key: "precio_bar", label: "Precio Bar" },
    {
      key: "precio_cocina",
      label: "P. Cocina (Auto)",
      readOnly: true,
      value: calculatedCocinaPrice.toFixed(2),
    },
    {
      key: "precio_mandado",
      label: "P. Mandado",
      placeholder: calculateSuggestedPrice(
        restaurantePrice,
        (p) => p * (1 + configuracion.comision_mandado_pct)
      ),
    },
    {
      key: "precio_catauro",
      label: "P. Catauro",
      placeholder: calculateSuggestedPrice(
        restaurantePrice,
        (p) => p * (1 + configuracion.comision_catauro_pct)
      ),
    },
    {
      key: "precio_zelle_mandado",
      label: "P. Zelle/MLC Mandado",
      placeholder: calculateSuggestedPrice(restaurantePrice, (p) =>
        configuracion.zelle_mandado_valor > 0
          ? p / configuracion.zelle_mandado_valor
          : 0
      ),
    },
    {
      key: "precio_zelle_restaurante",
      label: "P. Zelle/MLC Restaurante",
      placeholder: calculateSuggestedPrice(restaurantePrice, (p) =>
        configuracion.zelle_restaurante_valor > 0
          ? p / configuracion.zelle_restaurante_valor
          : 0
      ),
    },
  ];

  // Recalcular precios sugeridos cuando cambia el precio base
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      precio_mandado: getNewPrice(
        prev.precio_mandado,
        restaurantePrice,
        (p) => p * (1 + configuracion.comision_mandado_pct)
      ),
      precio_catauro: getNewPrice(
        prev.precio_catauro,
        restaurantePrice,
        (p) => p * (1 + configuracion.comision_catauro_pct)
      ),
      precio_zelle_mandado: getNewPrice(
        prev.precio_zelle_mandado,
        restaurantePrice,
        (p) =>
          configuracion.zelle_mandado_valor > 0
            ? p / configuracion.zelle_mandado_valor
            : 0
      ),
      precio_zelle_restaurante: getNewPrice(
        prev.precio_zelle_restaurante,
        restaurantePrice,
        (p) =>
          configuracion.zelle_restaurante_valor > 0
            ? p / configuracion.zelle_restaurante_valor
            : 0
      ),
    }));
  }, [
    restaurantePrice,
    configuracion.comision_mandado_pct,
    configuracion.comision_catauro_pct,
    configuracion.zelle_mandado_valor,
    configuracion.zelle_restaurante_valor,
  ]);

  const getNewPrice = (
    oldPrice: number | undefined,
    basePrice: number | undefined,
    formula: (price: number) => number
  ) =>
    oldPrice === undefined
      ? undefined
      : Number(calculateSuggestedPrice(basePrice, formula));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="plato_id"
          className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
        >
          Plato <span className="text-red-500">*</span>
        </label>
        <select
          id="plato_id"
          name="plato_id"
          value={formData.plato_id || ""}
          onChange={handlePlatoChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          required
          disabled={!!initialData}
        >
          <option value="" disabled>
            Seleccione un plato...
          </option>
          {availablePlatos.map((plato) => (
            <option key={plato.id} value={plato.id}>
              {plato.nombre_plato}
            </option>
          ))}
        </select>
        {availablePlatos.length === 0 && !initialData && (
          <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
            Todos los platos ya tienen precios en el menú. Edite uno existente o
            cree nuevos platos primero.
          </p>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-slate-300">
        Ingrese el precio base de restaurante. Los demás precios se sugerirán
        automáticamente pero pueden ser ajustados.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {priceFieldsConfig.map((fieldInfo) => (
          <div key={fieldInfo.key as string}>
            <label
              htmlFor={fieldInfo.key as string}
              className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
            >
              {fieldInfo.label}
            </label>
            <input
              type="number"
              id={fieldInfo.key as string}
              name={fieldInfo.key as string}
              value={
                fieldInfo.value !== undefined
                  ? fieldInfo.value
                  : formData[fieldInfo.key as keyof MenuPrecioItem] ===
                      undefined ||
                    formData[fieldInfo.key as keyof MenuPrecioItem] === null
                  ? ""
                  : String(formData[fieldInfo.key as keyof MenuPrecioItem])
              }
              onChange={handleChange}
              placeholder={fieldInfo.placeholder || "0.00"}
              className={`mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200 ${
                fieldInfo.readOnly ? "bg-gray-100 dark:bg-slate-600" : ""
              }`}
              min="0"
              step="0.01"
              readOnly={fieldInfo.readOnly}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:text-slate-200 dark:bg-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          {" "}
          Cancelar{" "}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          disabled={
            availablePlatos.length === 0 && !initialData && !formData.plato_id
          }
        >
          {" "}
          {initialData ? "Actualizar Precios" : "Añadir Precios al Menú"}{" "}
        </button>
      </div>
    </form>
  );
};

export default MenuPrecioForm;
