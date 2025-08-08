
import React, { useState, useEffect } from 'react';
import { Configuracion, EstadoPago } from '../types';

interface ConfiguracionFormProps {
  initialConfig: Configuracion;
  onSave: (updatedConfig: Configuracion) => void;
}

const ConfiguracionFormComponent: React.FC<ConfiguracionFormProps> = ({ initialConfig, onSave }) => {
  const [formData, setFormData] = useState<Configuracion>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Convert stored decimal percentages to display percentages when loading initial data
    // Explicitly create the new state object before setting it
    const newFormDataState = {
        ...initialConfig,
        comision_catauro_pct: initialConfig.comision_catauro_pct * 100,
        comision_mandado_pct: initialConfig.comision_mandado_pct * 100,
        zelle_mandado_valor: initialConfig.zelle_mandado_valor || 0,
        zelle_restaurante_valor: initialConfig.zelle_restaurante_valor || 0,
    };
    setFormData(newFormDataState);
  }, [initialConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
        let newValue: any = value;
        // For number inputs (including percentages), parse to float or set undefined if empty
        if (type === 'number' || 
            name === 'comision_catauro_pct' || 
            name === 'comision_mandado_pct' ||
            name === 'zelle_mandado_valor' ||
            name === 'zelle_restaurante_valor'
        ) { 
            newValue = value === '' ? undefined : parseFloat(value);
        } else if (e.target.nodeName === 'SELECT' && (name === 'default_estado_pago')) { 
            newValue = value as EstadoPago; 
        }
        // For other types (text, textarea), use the value directly
        return { ...prev, [name]: newValue };
    });
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const comisionCatauroPct = formData.comision_catauro_pct;
    const comisionMandadoPct = formData.comision_mandado_pct;
    const zelleMandadoValor = formData.zelle_mandado_valor;
    const zelleRestauranteValor = formData.zelle_restaurante_valor;

    const validatePercentage = (value: number | undefined, fieldName: string): boolean => {
      if (value === undefined || isNaN(value) || value < 0 || value > 100) {
        alert(`El porcentaje para "${fieldName}" debe ser un número válido entre 0 y 100.`);
        return false;
      }
      return true;
    };
    
    const validateDirectValue = (value: number | undefined, fieldName: string): boolean => {
        if (value === undefined || isNaN(value) || value < 0) {
            alert(`El valor para "${fieldName}" debe ser un número válido no negativo.`);
            return false;
        }
        return true;
    }; 

    if (!validatePercentage(comisionCatauroPct, "Comisión Catauro") ||
        !validatePercentage(comisionMandadoPct, "Comisión Mandado") ||
        !validateDirectValue(zelleMandadoValor, "Valor Zelle Mandado") ||
        !validateDirectValue(zelleRestauranteValor, "Valor Zelle Restaurante")
    ) {
      setIsSaving(false);
      return;
    }

     if (!formData.simbolo_moneda || formData.simbolo_moneda.trim() === '') {
      alert("El símbolo de moneda no puede estar vacío.");
      setIsSaving(false);
      return;
    }
    if (!formData.nombre_restaurante || formData.nombre_restaurante.trim() === '') {
      alert("El nombre del restaurante no puede estar vacío.");
      setIsSaving(false);
      return;
    }

    const configToSave: Configuracion = {
        ...formData,
        // Convert percentages from form (e.g., 10) back to decimal (0.10) for storage
        comision_catauro_pct: (comisionCatauroPct ?? 0) / 100,
        comision_mandado_pct: (comisionMandadoPct ?? 0) / 100,
        zelle_mandado_valor: zelleMandadoValor ?? 0,
        zelle_restaurante_valor: zelleRestauranteValor ?? 0,
    };
    
    onSave(configToSave);
    setTimeout(() => {
        setIsSaving(false);
    }, 500);
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-6 border-b dark:border-slate-700 pb-3">Configuración General del Sistema</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
            <label htmlFor="nombre_restaurante" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Nombre del Restaurante <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                id="nombre_restaurante"
                name="nombre_restaurante"
                value={formData.nombre_restaurante}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                required
            />
            </div>
            <div>
                <label htmlFor="slogan_restaurante" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Slogan del Restaurante
                </label>
                <input
                    type="text"
                    id="slogan_restaurante"
                    name="slogan_restaurante"
                    value={formData.slogan_restaurante || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                />
            </div>
        </div>

        <div>
            <label htmlFor="direccion_restaurante" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Dirección del Restaurante
            </label>
            <textarea
                id="direccion_restaurante"
                name="direccion_restaurante"
                value={formData.direccion_restaurante || ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <label htmlFor="telefono_restaurante" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Teléfono de Contacto
                </label>
                <input
                    type="tel"
                    id="telefono_restaurante"
                    name="telefono_restaurante"
                    value={formData.telefono_restaurante || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                />
            </div>
            <div>
                <label htmlFor="id_fiscal_restaurante" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    ID Fiscal (Ej: NIT, RUC)
                </label>
                <input
                    type="text"
                    id="id_fiscal_restaurante"
                    name="id_fiscal_restaurante"
                    value={formData.id_fiscal_restaurante || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                />
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
             <div>
                <label htmlFor="default_estado_pago" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Método de Pago Predeterminado (Ventas) <span className="text-red-500">*</span>
                </label>
                <select
                    id="default_estado_pago"
                    name="default_estado_pago"
                    value={formData.default_estado_pago}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    required
                >
                    {Object.values(EstadoPago).filter(s => s !== EstadoPago.NA && s !== EstadoPago.PENDIENTE).map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                    ))}
                </select>
            </div>
            <div>
            <label htmlFor="comision_catauro_pct" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Comisión Catauro (%) <span className="text-red-500">*</span>
            </label>
            <input
                type="number"
                id="comision_catauro_pct"
                name="comision_catauro_pct"
                value={formData.comision_catauro_pct === undefined ? '' : formData.comision_catauro_pct}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                required
                min="0"
                max="100"
                step="0.01"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Ej: 10 para 10%</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
            <label htmlFor="comision_mandado_pct" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Comisión Mandado (%) <span className="text-red-500">*</span>
            </label>
            <input
                type="number"
                id="comision_mandado_pct"
                name="comision_mandado_pct"
                value={formData.comision_mandado_pct === undefined ? '' : formData.comision_mandado_pct}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                required
                min="0"
                max="100"
                step="0.01"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Ej: 5 para 5%</p>
            </div>
            <div>
            <label htmlFor="moneda_principal" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Nombre Moneda Principal <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                id="moneda_principal"
                name="moneda_principal"
                value={formData.moneda_principal}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                required
                maxLength={5}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Ej: CUP, USD</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <label htmlFor="zelle_mandado_valor" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Valor Zelle Mandado (Precio Zelle = Precio Rest / Valor) <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    id="zelle_mandado_valor"
                    name="zelle_mandado_valor"
                    value={formData.zelle_mandado_valor === undefined ? '' : formData.zelle_mandado_valor}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                    required
                    min="0"
                    step="any"
                />
            </div>
            <div>
                <label htmlFor="zelle_restaurante_valor" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Valor Zelle Restaurante (Precio Zelle = Precio Rest / Valor) <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    id="zelle_restaurante_valor"
                    name="zelle_restaurante_valor"
                    value={formData.zelle_restaurante_valor === undefined ? '' : formData.zelle_restaurante_valor}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100"
                    required
                    min="0"
                    step="any"
                />
            </div>
        </div>
        
        <div>
            <label htmlFor="simbolo_moneda" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Símbolo de Moneda <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                id="simbolo_moneda"
                name="simbolo_moneda"
                value={formData.simbolo_moneda}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm md:w-1/2 dark:bg-slate-700 dark:text-slate-100"
                required
                maxLength={3}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Ej: $, €, CUP</p>
        </div>


        <div className="pt-6 text-right">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-70 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-400"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfiguracionFormComponent;
