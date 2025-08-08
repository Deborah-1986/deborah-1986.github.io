// components/DisponibilidadPlatos.tsx
import React, { useMemo } from 'react';
import { Plato, CartaTecnologica, InventarioItem, ProductoBase, UnidadMedida } from '../types.js';
import { ClipboardCheckIcon } from '../constants.js';

interface DisponibilidadPlatosProps {
  platos: Plato[];
  cartasTecnologicas: CartaTecnologica[];
  inventarioItems: InventarioItem[];
  productosBase: ProductoBase[];
  ums: UnidadMedida[];
}

const DisponibilidadPlatos: React.FC<DisponibilidadPlatosProps> = ({
  platos,
  cartasTecnologicas,
  inventarioItems,
}) => {

  const platosDisponibles = useMemo(() => {
    return platos.map(plato => {
      const receta = cartasTecnologicas.find(c => c.plato_id === plato.id);

      // Si no hay receta, no se puede determinar la disponibilidad
      if (!receta || receta.ingredientes_receta.length === 0) {
        return { nombrePlato: plato.nombre_plato, cantidadPosible: null };
      }

      let maxPlatosPosibles = Infinity;

      for (const ingrediente of receta.ingredientes_receta) {
        const itemInventario = inventarioItems.find(i => i.producto_base_id === ingrediente.producto_base_id);
        const stockActual = itemInventario ? itemInventario.entradas - itemInventario.salidas : 0;
        
        if (ingrediente.cantidad <= 0) {
            continue; // Ignorar ingredientes con cantidad cero o negativa
        }

        const posibleConEsteIngrediente = Math.floor(stockActual / ingrediente.cantidad);

        if (posibleConEsteIngrediente < maxPlatosPosibles) {
          maxPlatosPosibles = posibleConEsteIngrediente;
        }
      }
      
      // Si un ingrediente faltaba por completo, maxPlatosPosibles será 0.
      return { nombrePlato: plato.nombre_plato, cantidadPosible: maxPlatosPosibles === Infinity ? 0 : maxPlatosPosibles };
    })
    .filter(p => p.cantidadPosible !== null && p.cantidadPosible > 0)
    .sort((a, b) => b.cantidadPosible! - a.cantidadPosible!);
  }, [platos, cartasTecnologicas, inventarioItems]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 md:p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-2 flex items-center">
          <ClipboardCheckIcon className="w-6 h-6 mr-3 text-orange-500" />
          Platos Disponibles para Elaborar
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Esta lista muestra cuántas unidades de cada plato se pueden preparar con el inventario actual.
        </p>
      </div>
      
      {platosDisponibles.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-slate-400">
                No hay suficientes ingredientes en el inventario para elaborar completamente ningún plato con receta.
            </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-orange-50 dark:bg-orange-900/30">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                  Nombre del Plato
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                  Cantidad Máxima a Elaborar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {platosDisponibles.map((plato) => (
                <tr key={plato.nombrePlato} className="hover:bg-orange-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                    {plato.nombrePlato}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 text-right font-bold text-lg">
                    {plato.cantidadPosible}
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

export default DisponibilidadPlatos;