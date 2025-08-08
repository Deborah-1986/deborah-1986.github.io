// components/CierreMensualForm.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { CierreMensualFormData, CierreMensualCalculatedData, Configuracion, CierreMensual, GastoPorCategoria } from '../types.js';

console.log("CierreMensualForm.tsx script starting execution..."); // DEBUG LOG

interface CierreMensualFormProps {
  onSubmit: (formData: CierreMensualFormData, calculatedData: CierreMensualCalculatedData) => void;
  onClose: () => void;
  initialFormData?: CierreMensualFormData;
  preCalculatedData?: CierreMensualCalculatedData;
  configuracion: Configuracion;
  allCierresMensuales: CierreMensual[];
}

const CierreMensualFormComponent: React.FC<CierreMensualFormProps> = ({
  onSubmit,
  onClose,
  initialFormData,
  preCalculatedData,
  configuracion,
  allCierresMensuales,
}) => {

  const [formData, setFormData] = useState<CierreMensualFormData>(
    initialFormData || {
      mes_a_cerrar: '',
      impuesto_negocio_pagado: 0,
      notas_cierre: '',
      saldo_inicial_manual: undefined,
    }
  );
  
  const [displayData, setDisplayData] = useState<CierreMensualCalculatedData & { 
      utilidad_neta_mes_calculada?: number; 
      saldo_final_mes_calculado?: number;
      saldo_inicial_a_usar: number;
    }>(
    () => { 
        const defaultBaseCalculatedData: CierreMensualCalculatedData = {
            saldo_inicial: 0, 
            total_ingresos: 0, 
            total_costo_ventas: 0, 
            utilidad_bruta: 0,
            total_compras_inventario: 0, 
            gastos_por_categoria: [], 
            total_otros_gastos_directos: 0,
            total_impuestos_terceros_ventas: 0,
            total_comisiones_servicio_ventas: 0, // Added
            gastos_operativos_totales: 0,
            utilidad_antes_impuesto_negocio: 0,
            utilidad_neta_mes: 0, 
            saldo_final_mes: 0,    
        };
        const baseData = preCalculatedData || defaultBaseCalculatedData;
        const saldoInicialManual = initialFormData?.saldo_inicial_manual;
        const esPrimerCierre = allCierresMensuales.length === 0;

        const saldoInicialDeterminado = esPrimerCierre 
            ? (saldoInicialManual ?? 0) 
            : (baseData.saldo_inicial ?? 0);
        const utilidadAntesImpuesto = baseData.utilidad_antes_impuesto_negocio ?? 0;
        const impuestoPagado = initialFormData?.impuesto_negocio_pagado || 0;
        const utilidadNeta = utilidadAntesImpuesto - impuestoPagado;
        const saldoFinal = saldoInicialDeterminado + utilidadNeta;

        return {
            ...baseData,
            saldo_inicial_a_usar: saldoInicialDeterminado,
            utilidad_neta_mes_calculada: utilidadNeta,
            saldo_final_mes_calculado: saldoFinal,
        };
    }
  );

  const isFirstCierre = allCierresMensuales.length === 0;

  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData);
    }
  }, [initialFormData]);

  useEffect(() => {
    const baseCalcDataFallback: CierreMensualCalculatedData = {
        saldo_inicial: 0, total_ingresos: 0, total_costo_ventas: 0, utilidad_bruta: 0,
        total_compras_inventario: 0, gastos_por_categoria: [], total_otros_gastos_directos: 0,
        total_impuestos_terceros_ventas: 0,
        total_comisiones_servicio_ventas: 0, // Added
        gastos_operativos_totales: 0,
        utilidad_antes_impuesto_negocio: 0,
        utilidad_neta_mes: 0,
        saldo_final_mes: 0,   
    };
    const baseCalcData = preCalculatedData || baseCalcDataFallback;

    const saldoInicialDeterminado = isFirstCierre 
        ? (formData.saldo_inicial_manual ?? 0) 
        : (baseCalcData.saldo_inicial ?? 0);

    const utilidadAntesImpuesto = baseCalcData.utilidad_antes_impuesto_negocio ?? 0;
    const impuestoPagado = formData.impuesto_negocio_pagado || 0;
    const utilidadNeta = utilidadAntesImpuesto - impuestoPagado;
    const saldoFinal = saldoInicialDeterminado + utilidadNeta;
    
    setDisplayData({
        ...baseCalcData,
        saldo_inicial_a_usar: saldoInicialDeterminado,
        utilidad_neta_mes_calculada: utilidadNeta,
        saldo_final_mes_calculado: saldoFinal,
    });
  }, [preCalculatedData, formData.impuesto_negocio_pagado, formData.saldo_inicial_manual, isFirstCierre]);


  const formatCurrency = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) return `0.00 ${configuracion.simbolo_moneda}`;
    return `${value.toFixed(2)} ${configuracion.simbolo_moneda}`;
  }, [configuracion.simbolo_moneda]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;
    const parsedValue = (target.type === 'number') ? (value === '' ? undefined : parseFloat(value)) : value;
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.mes_a_cerrar) {
      alert("Debe seleccionar un mes para el cierre.");
      return;
    }
    if (isFirstCierre && (formData.saldo_inicial_manual === undefined || isNaN(formData.saldo_inicial_manual))) {
      alert("Para el primer cierre, debe ingresar un Saldo Inicial Manual válido (número).");
      return;
    }
     if (formData.impuesto_negocio_pagado === undefined || isNaN(formData.impuesto_negocio_pagado) || formData.impuesto_negocio_pagado < 0) {
        alert("El Impuesto del Negocio Pagado debe ser un número no negativo.");
        return;
    }

    if (!preCalculatedData) { 
        alert("No hay datos calculados base para realizar el cierre. Esto puede indicar un problema al seleccionar el mes.");
        return;
    }
    
    const saldoInicialFinal = isFirstCierre ? (formData.saldo_inicial_manual ?? 0) : preCalculatedData.saldo_inicial;
    
    const finalCalculatedDataForSubmit: CierreMensualCalculatedData = {
      ...preCalculatedData,
      saldo_inicial: saldoInicialFinal,
      // Recalculate net utility and final balance based on current form data
      utilidad_neta_mes: (preCalculatedData.utilidad_antes_impuesto_negocio ?? 0) - (formData.impuesto_negocio_pagado ?? 0),
      saldo_final_mes: saldoInicialFinal + ((preCalculatedData.utilidad_antes_impuesto_negocio ?? 0) - (formData.impuesto_negocio_pagado ?? 0)),
    };
        
    onSubmit(formData, finalCalculatedDataForSubmit);
  };

  const renderDataField = (label: string, value?: number, isPositiveGood: boolean = true, isBold: boolean = false) => (
    <div className="flex justify-between py-1.5">
      <span className={`text-gray-600 dark:text-slate-300 ${isBold ? 'font-semibold' : ''}`}>{label}:</span>
      <span className={`
        ${isBold ? 'font-bold' : 'font-medium'} 
        ${value === undefined || value === null || isNaN(value) ? 'text-gray-500 dark:text-slate-400' : 
          (isPositiveGood ? (value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 
                            (value <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'))
        }
      `}>
        {formatCurrency(value)}
      </span>
    </div>
  );
  
  const mesDisplay = formData.mes_a_cerrar 
    ? new Date(parseInt(formData.mes_a_cerrar.substring(0,4)), parseInt(formData.mes_a_cerrar.substring(5,7)) -1, 1)
        .toLocaleString('es-CU', { month: 'long', year: 'numeric', timeZone: 'UTC' }).replace(/^\w/, c => c.toUpperCase())
    : 'N/A';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
        <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-1">
                Cierre Mensual para: <span className="text-orange-600 dark:text-orange-400">{mesDisplay}</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
                Revise los datos calculados y complete los campos editables.
            </p>
        </div>
        <hr className="dark:border-slate-600"/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {renderDataField("Saldo Inicial del Mes", displayData.saldo_inicial_a_usar, true, true)}
            {renderDataField("(+) Ingresos Totales por Ventas", displayData.total_ingresos)}
            {renderDataField("(-) Costo de Mercancía Vendida (CMV)", displayData.total_costo_ventas, false)}
            {renderDataField("(=) Utilidad Bruta", displayData.utilidad_bruta, true, true)}
        </div>
        
        <div className="pt-2 mt-2 border-t dark:border-slate-600">
            <h4 className="text-md font-semibold text-gray-700 dark:text-slate-200 mb-1">(-) Gastos Operativos:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm pl-3">
                {renderDataField("Total Compras de Inventario", displayData.total_compras_inventario, false)}
                {renderDataField("Total Comisiones por Servicio (Ventas)", displayData.total_comisiones_servicio_ventas, false)}
                {displayData.gastos_por_categoria.map(gasto => renderDataField(gasto.categoria, gasto.total, false))}
            </div>
             {renderDataField("Subtotal Otros Gastos Directos", displayData.total_otros_gastos_directos, false, true)}
             {renderDataField("(=) Total Gastos Operativos", displayData.gastos_operativos_totales, false, true)}
        </div>
        
        <hr className="dark:border-slate-600"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {renderDataField("(=) Utilidad Antes de Impuesto del Negocio", displayData.utilidad_antes_impuesto_negocio, true, true)}
        </div>

        {isFirstCierre && (
            <div>
                <label htmlFor="saldo_inicial_manual" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Saldo Inicial Manual (Solo para el Primer Cierre) <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    id="saldo_inicial_manual"
                    name="saldo_inicial_manual"
                    value={formData.saldo_inicial_manual ?? ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
                    min="0"
                    step="any"
                    placeholder={`0.00 ${configuracion.simbolo_moneda}`}
                    required={isFirstCierre}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Ingrese el saldo de efectivo/banco al inicio de este primer mes de operaciones.</p>
            </div>
        )}

        <div>
            <label htmlFor="impuesto_negocio_pagado" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            (-) Impuesto del Negocio Pagado en el Mes <span className="text-red-500">*</span>
            </label>
            <input
            type="number"
            id="impuesto_negocio_pagado"
            name="impuesto_negocio_pagado"
            value={formData.impuesto_negocio_pagado ?? ''}
            onChange={handleInputChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            min="0"
            step="any"
            placeholder={`0.00 ${configuracion.simbolo_moneda}`}
            required
            />
        </div>
        
        <hr className="dark:border-slate-600"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {renderDataField("(=) Utilidad Neta del Mes", displayData.utilidad_neta_mes_calculada, true, true)}
            {renderDataField("(=) Saldo Final del Mes (Estimado)", displayData.saldo_final_mes_calculado, true, true)}
        </div>

        <div>
            <label htmlFor="notas_cierre" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Notas del Cierre (Opcional)
            </label>
            <textarea
            id="notas_cierre"
            name="notas_cierre"
            value={formData.notas_cierre || ''}
            onChange={handleInputChange}
            rows={2}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            placeholder="Anotaciones importantes sobre este cierre..."
            />
        </div>

        <div className="flex justify-end space-x-3 pt-3">
            <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:text-slate-200 dark:bg-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
            Cancelar
            </button>
            <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
            Confirmar y Realizar Cierre
            </button>
        </div>
    </form>
  );
};

export default CierreMensualFormComponent;