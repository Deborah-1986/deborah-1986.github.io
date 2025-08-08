// components/AiAssistant.tsx
import React, { useState, useEffect } from 'react';
import { AiPromptDetails, AiGeneratedIdea } from '../types';
import { SparklesIcon, AddIcon } from '../constants'; // Added AddIcon

interface AiAssistantProps {
  onGenerate: (details: AiPromptDetails) => Promise<void>;
  generatedIdeas: AiGeneratedIdea[];
  isLoading: boolean;
  error: string | null;
  onAddToSystem: (idea: AiGeneratedIdea) => void; // New prop
}

const modelOptions = [
  { group: "Más Potentes / Recientes", models: [
    { value: "meta-llama/llama-4-maverick:free", label: "Meta Llama 4 Maverick" },
    { value: "meta-llama/llama-4-scout:free", label: "Meta Llama 4 Scout" },
    { value: "meta-llama/llama-3.1-nemotron-ultra-253b-v1:free", label: "Meta Llama 3.1 Nemotron Ultra (253B)" },
    { value: "meta-llama/llama-3.1-405b:free", label: "Meta Llama 3.1 (405B)" },
    { value: "qwen/qwen-2.5-72b-instruct:free", label: "Qwen 2.5 Instruct (72B)" },
    { value: "qwen/qwen3-235b-a22b:free", label: "Qwen 3 (235B)" },
    { value: "qwen/qwen2.5-vl-72b-instruct:free", label: "Qwen 2.5 VL Instruct (72B)" },
    { value: "shisa-ai/shisa-v2-llama3.3-70b:free", label: "Shisa V2 Llama3.3 (70B)" },
    { value: "deepseek/deepseek-v3-base:free", label: "DeepSeek V3 Base" },
    { value: "deepseek/deepseek-prover-v2:free", label: "DeepSeek Prover V2" },
    { value: "deepseek/deepseek-chat-v3-0324:free", label: "DeepSeek Chat V3 (0324)" },
    { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1" },
    { value: "deepseek/deepseek-chat:free", label: "DeepSeek Chat" },
    { value: "deepseek/deepseek-r1-zero:free", label: "DeepSeek R1 Zero" },
    { value: "microsoft/phi-4-reasoning-plus:free", label: "Microsoft Phi-4 Reasoning Plus" },
    { value: "mistralai/mistral-nemo:free", label: "Mistral Nemo" },
    { value: "google/gemini-2.5-pro-exp-03-25", label: "Google Gemini 2.5 Pro Exp (03-25)" },
    { value: "rekaai/reka-flash-3:free", label: "Reka Flash 3" },
    { value: "thudm/glm-4-32b:free", label: "THUDM GLM-4 (32B)" },
  ]},
  { group: "Intermedios / Especializados", models: [
    { value: "nvidia/llama-3.3-nemotron-super-49b-v1:free", label: "NVIDIA Llama 3.3 Nemotron Super (49B)" },
    { value: "featherless/qwerky-72b:free", label: "Featherless Qwerky (72B)" },
    { value: "qwen/qwen3-32b:free", label: "Qwen 3 (32B)" },
    { value: "qwen/qwq-32b:free", label: "Qwen QWQ (32B)" },
    { value: "qwen/qwen-2.5-coder-32b-instruct:free", label: "Qwen 2.5 Coder Instruct (32B)" },
    { value: "arliai/qwq-32b-arliai-rpr-v1:free", label: "ARLI AI QWQ (32B) RPR v1" },
    { value: "thudm/glm-z1-32b:free", label: "THUDM GLM-Z1 (32B)" },
    { value: "mistralai/mistral-small-24b-instruct-2501:free", label: "Mistral Small Instruct (24B-2501)" },
    { value: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small 3.1 Instruct (24B)" },
    { value: "cognitivecomputations/dolphin3.0-mistral-24b:free", label: "Dolphin 3.0 Mistral (24B)" },
    { value: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free", label: "Dolphin 3.0 R1 Mistral (24B)" },
    { value: "nousresearch/deephermes-3-mistral-24b-preview:free", label: "Nous DeepHermes 3 Mistral (24B Preview)" },
    { value: "google/gemma-3-27b-it:free", label: "Google Gemma 3 (27B-IT)" },
    { value: "moonshotai/kimi-vl-a3b-thinking:free", label: "Moonshot Kimi VL A3B Thinking" },
    { value: "moonshotai/moonlight-16b-a3b-instruct:free", label: "Moonshot Moonlight 16B A3B Instruct" },
    { value: "microsoft/phi-4-reasoning:free", label: "Microsoft Phi-4 Reasoning" },
    { value: "deepseek/deepseek-r1-distill-llama-70b:free", label: "DeepSeek R1 Distill Llama (70B)" },
    { value: "deepseek/deepseek-r1-distill-qwen-32b:free", label: "DeepSeek R1 Distill Qwen (32B)" },
  ]},
  { group: "Ligeros / Flash", models: [
    { value: "meta-llama/llama-3.3-8b-instruct:free", label: "Meta Llama 3.3 Instruct (8B)" },
    { value: "meta-llama/llama-3.1-8b-instruct:free", label: "Meta Llama 3.1 Instruct (8B)" },
    { value: "mistralai/mistral-7b-instruct:free", label: "Mistral Instruct (7B)" },
    { value: "google/gemma-2-9b-it:free", label: "Google Gemma 2 (9B-IT)" },
    { value: "google/gemma-3n-e4b-it:free", label: "Google Gemma 3N (E4B-IT)" },
    { value: "google/gemma-3-12b-it:free", label: "Google Gemma 3 (12B-IT)" },
    { value: "qwen/qwen3-14b:free", label: "Qwen 3 (14B)" },
    { value: "qwen/qwen3-8b:free", label: "Qwen 3 (8B)" },
    { value: "qwen/qwen3-30b-a3b:free", label: "Qwen 3 (30B A3B)" },
    { value: "qwen/qwen-2.5-7b-instruct:free", label: "Qwen 2.5 Instruct (7B)" },
    { value: "qwen/qwen-2.5-vl-7b-instruct:free", label: "Qwen 2.5 VL Instruct (7B)" },
    { value: "qwen/qwen2.5-vl-3b-instruct:free", label: "Qwen 2.5 VL Instruct (3B)" },
    { value: "deepseek/deepseek-r1-0528:free", label: "DeepSeek R1 (0528)" },
    { value: "deepseek/deepseek-r1-0528-qwen3-8b:free", label: "DeepSeek R1 Qwen3 (8B)" },
    { value: "deepseek/deepseek-r1t-chimera:free", label: "DeepSeek R1T Chimera" },
    { value: "deepseek/deepseek-r1-distill-qwen-14b:free", label: "DeepSeek R1 Distill Qwen (14B)" },
    { value: "opengvlab/internvl3-14b:free", label: "OpenGVLab InternVL3 (14B)" },
    { value: "agentica-org/deepcoder-14b-preview:free", label: "Agentica DeepCoder (14B Preview)" },
    { value: "nousresearch/deephermes-3-llama-3-8b-preview:free", label: "Nous DeepHermes 3 Llama 3 (8B Preview)" },
    { value: "sarvamai/sarvam-m:free", label: "Sarvam AI Sarvam-M" },
    { value: "microsoft/mai-ds-r1:free", label: "Microsoft MAI-DS R1" },
    { value: "google/gemini-2.0-flash-exp:free", label: "Google Gemini 2.0 Flash Exp" },
    { value: "open-r1/olympiccoder-32b:free", label: "Open R1 OlympicCoder (32B)" },
  ]},
  { group: "Muy Pequeños / Específicos", models: [
    { value: "meta-llama/llama-3.2-11b-vision-instruct:free", label: "Meta Llama 3.2 Vision Instruct (11B)" },
    { value: "google/gemma-3-4b-it:free", label: "Google Gemma 3 (4B-IT)" },
    { value: "meta-llama/llama-3.2-3b-instruct:free", label: "Meta Llama 3.2 Instruct (3B)" },
    { value: "opengvlab/internvl3-2b:free", label: "OpenGVLab InternVL3 (2B)" },
    { value: "google/gemma-3-1b-it:free", label: "Google Gemma 3 (1B-IT)" },
    { value: "meta-llama/llama-3.2-1b-instruct:free", label: "Meta Llama 3.2 Instruct (1B)" },
  ]}
];


const AiAssistant: React.FC<AiAssistantProps> = ({ onGenerate, generatedIdeas, isLoading, error, onAddToSystem }) => {
  const [dishType, setDishType] = useState('');
  const [cuisineStyle, setCuisineStyle] = useState('');
  const [keyIngredients, setKeyIngredients] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [numberOfSuggestions, setNumberOfSuggestions] = useState<number>(1);
  const [selectedModel, setSelectedModel] = useState<string>('deepseek/deepseek-r1-0528:free');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishType && !cuisineStyle && !keyIngredients) {
        alert("Por favor, ingrese al menos un tipo de plato, estilo de cocina o ingredientes clave.");
        return;
    }
    onGenerate({ dishType, cuisineStyle, keyIngredients, dietaryRestrictions, numberOfSuggestions, model: selectedModel });
  };

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-slate-800 shadow-xl rounded-lg">
      <div className="flex items-center mb-6">
        <SparklesIcon className="w-8 h-8 text-purple-500 dark:text-purple-400 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">Asistente Culinario IA</h2>
      </div>
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
        Obtenga ideas de recetas detalladas, incluyendo ingredientes con gramajes, tiempos de preparación y cocción, e instrucciones paso a paso, como si un chef profesional le estuviera guiando.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div>
            <label htmlFor="selectedModel" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Modelo de IA
            </label>
            <select
                id="selectedModel"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            >
                {modelOptions.map(group => (
                    <optgroup label={group.group} key={group.group}>
                        {group.models.map(model => (
                            <option key={model.value} value={model.value}>
                                {model.label}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="dishType" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Tipo de Plato
            </label>
            <input
              type="text"
              id="dishType"
              value={dishType}
              onChange={(e) => setDishType(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
              placeholder="Ej: Plato principal, Postre, Aperitivo"
            />
          </div>
          <div>
            <label htmlFor="cuisineStyle" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Estilo de Cocina
            </label>
            <input
              type="text"
              id="cuisineStyle"
              value={cuisineStyle}
              onChange={(e) => setCuisineStyle(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
              placeholder="Ej: Italiana, Mexicana, Cubana, Fusión Asiática"
            />
          </div>
        </div>

        <div>
          <label htmlFor="keyIngredients" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Ingredientes Clave (separados por comas)
          </label>
          <textarea
            id="keyIngredients"
            value={keyIngredients}
            onChange={(e) => setKeyIngredients(e.target.value)}
            rows={2}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
            placeholder="Ej: pollo, tomate, albahaca, queso parmesano"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Restricciones Dietéticas (opcional)
            </label>
            <input
              type="text"
              id="dietaryRestrictions"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
              placeholder="Ej: vegetariano, sin gluten, bajo en sodio"
            />
          </div>
          <div>
            <label htmlFor="numberOfSuggestions" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Número de Sugerencias (1-3)
            </label>
            <input
              type="number"
              id="numberOfSuggestions"
              value={numberOfSuggestions}
              onChange={(e) => setNumberOfSuggestions(parseInt(e.target.value, 10))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200"
              min="1"
              max="3"
            />
             <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Para recetas más detalladas, se recomienda 1 sugerencia.</p>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-slate-800 disabled:opacity-70 transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando Ideas...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                Obtener Ideas de Recetas
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-800/30 dark:text-red-300" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {generatedIdeas.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Sugerencias del Chef IA:</h3>
          <div className="space-y-6">
            {generatedIdeas.map((idea, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-700/50 p-4 sm:p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-600">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="text-2xl font-bold text-purple-700 dark:text-purple-400">{idea.nombre_plato}</h4>
                    <button
                        onClick={() => onAddToSystem(idea)}
                        className="ml-4 flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-offset-slate-800 transition-colors"
                        title="Añadir al menú y recetario"
                        aria-label={`Añadir ${idea.nombre_plato} al sistema`}
                    >
                        <AddIcon className="w-4 h-4 mr-1.5" />
                        Añadir al Sistema
                    </button>
                </div>
                <p className="text-sm text-gray-700 dark:text-slate-300 italic mb-4">{idea.descripcion_corta}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    {idea.tiempo_preparacion && <div><strong className="text-gray-600 dark:text-slate-400">Preparación:</strong> <span className="text-gray-800 dark:text-slate-200">{idea.tiempo_preparacion}</span></div>}
                    {idea.tiempo_coccion && <div><strong className="text-gray-600 dark:text-slate-400">Cocción:</strong> <span className="text-gray-800 dark:text-slate-200">{idea.tiempo_coccion}</span></div>}
                    {idea.tiempo_total && <div><strong className="text-gray-600 dark:text-slate-400">Total:</strong> <span className="text-gray-800 dark:text-slate-200">{idea.tiempo_total}</span></div>}
                </div>
                 {idea.porciones_sugeridas && <p className="text-sm mb-4"><strong className="text-gray-600 dark:text-slate-400">Porciones:</strong> <span className="text-gray-800 dark:text-slate-200">{idea.porciones_sugeridas}</span></p>}


                <div className="mb-4">
                  <h5 className="text-md font-semibold text-gray-700 dark:text-slate-200 mb-2">Ingredientes:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-slate-300 space-y-1 pl-2">
                    {idea.ingredientes_detallados.map((ing, idx) => (
                      <li key={idx}><span className="font-medium">{ing.nombre}:</span> {ing.cantidad}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="text-md font-semibold text-gray-700 dark:text-slate-200 mb-2">Instrucciones de Preparación:</h5>
                  <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-slate-300 space-y-2 pl-2">
                    {idea.instrucciones_preparacion.map((step, idx) => (
                      <li key={idx} className="mb-1">{step}</li>
                    ))}
                  </ol>
                </div>

                {idea.consejos_chef && idea.consejos_chef.length > 0 && (
                  <div>
                    <h5 className="text-md font-semibold text-gray-700 dark:text-slate-200 mb-2">Consejos del Chef:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-slate-300 space-y-1 pl-2">
                      {idea.consejos_chef.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;