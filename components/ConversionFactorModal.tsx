import React, { useState } from "react";
import Modal from "./Modal";

interface ConversionFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (factor: number) => void;
  unidadOrigen: string;
  unidadDestino: string;
}

const ConversionFactorModal: React.FC<ConversionFactorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  unidadOrigen,
  unidadDestino,
}) => {
  const [factor, setFactor] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    const num = parseFloat(factor);
    if (isNaN(num) || num <= 0) {
      setError("Ingrese un número mayor que cero.");
      return;
    }
    setError("");
    onSave(num);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Definir Factor de Conversión"
    >
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-slate-300">
          No se encontró una conversión para este producto.
          <br />
          Por favor, indica cuántas <b>{unidadDestino}</b> contiene una{" "}
          <b>{unidadOrigen}</b>.
        </p>
        <input
          type="number"
          min="0.0001"
          step="any"
          className="w-full border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 dark:bg-slate-700 dark:text-slate-200"
          value={factor}
          onChange={(e) => setFactor(e.target.value)}
          placeholder="Ejemplo: 6"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded bg-cyan-600 text-white hover:bg-cyan-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConversionFactorModal;
