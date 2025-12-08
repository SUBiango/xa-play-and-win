import React from 'react';
import { Settings2, Trash2, Plus, ArrowLeft } from 'lucide-react';

const COLORS = [
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#EAB308', // Yellow
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#06B6D4', // Cyan
];

export default function ConfigureOptions({ 
  options, 
  onUpdateOption, 
  onRemoveOption, 
  onAddOption, 
  onEvenDistribute,
  onBack 
}) {
  const totalProbability = options.reduce((sum, opt) => sum + parseFloat(opt.probability || 0), 0);
  const isValidTotal = Math.abs(totalProbability - 100) < 0.1;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Spinner</span>
        </button>

        {/* Settings Panel */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Settings2 className="text-blue-400" />
              <span>Configure Options</span>
            </h3>
            <button 
              onClick={onEvenDistribute}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 underline"
            >
              Distribute Evenly
            </button>
          </div>

          <div className="space-y-3">
             <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                <div className="col-span-1 text-center">Color</div>
                <div className="col-span-6">Label</div>
                <div className="col-span-3 text-right">Chance %</div>
                <div className="col-span-2"></div>
             </div>

             {options.map((option, idx) => (
               <div key={option.id} className="grid grid-cols-12 gap-2 items-center bg-slate-700/50 p-2 rounded-lg hover:bg-slate-700 transition-colors">
                  <div className="col-span-1 flex justify-center">
                    <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  </div>
                  
                  <div className="col-span-6">
                    <input 
                      type="text" 
                      value={option.text}
                      onChange={(e) => onUpdateOption(option.id, 'text', e.target.value)}
                      maxLength={30}
                      className="w-full bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-sm font-medium px-1 transition-colors"
                      placeholder="Option name"
                    />
                  </div>

                  <div className="col-span-3">
                    <div className="relative">
                        <input 
                          type="number" 
                          value={option.probability}
                          onChange={(e) => onUpdateOption(option.id, 'probability', e.target.value)}
                          min="0"
                          max="100"
                          className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-sm focus:border-blue-500 outline-none"
                        />
                        <span className="absolute right-7 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">%</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button 
                      onClick={() => onRemoveOption(option.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                      disabled={options.length <= 2}
                      title="Remove Option"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
               </div>
             ))}
          </div>

          {options.length < 8 && (
            <button 
              onClick={onAddOption}
              className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg border border-dashed border-slate-600 hover:border-slate-500 transition-all"
            >
              <Plus size={16} />
              Add Option
            </button>
          )}

          <div className="mt-6 pt-6 border-t border-slate-700">
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Probability:</span>
                <span className={`font-bold ${isValidTotal ? 'text-green-400' : 'text-red-400'}`}>
                   {Math.round(totalProbability)}%
                </span>
             </div>
             <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                   className={`h-full transition-all duration-300 ${isValidTotal ? 'bg-green-500' : 'bg-red-500'}`}
                   style={{ width: `${Math.min(totalProbability, 100)}%` }}
                ></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
