import React, { useState, useRef, useEffect } from 'react';
import { Trophy, AlertCircle, Play, RotateCcw, Plus, Trash2, Settings2 } from 'lucide-react';
import './App.css'

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

export default function App() {
  // Default to 6 options as requested, with equal probability initially
  const [options, setOptions] = useState([
    { id: 1, text: '20% off', probability: 10 },
    { id: 2, text: 'One month free', probability: 20 },
    { id: 3, text: 'Branded car sun...', probability: 15 },
    { id: 4, text: '1-year free build', probability: 25 },
    { id: 5, text: 'Branded gift box', probability: 10 },
    { id: 6, text: 'Try again', probability: 20 },
  ]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // We need to keep track of the accumulated rotation to prevent the wheel from spinning backwards
  const currentRotation = useRef(0);

  const totalProbability = options.reduce((sum, opt) => sum + parseFloat(opt.probability || 0), 0);
  const isValidTotal = Math.abs(totalProbability - 100) < 0.1; // Allow small float error

  const handleSpin = () => {
    if (isSpinning || totalProbability === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    // 1. Calculate Winner based on Probabilities
    let random = Math.random() * totalProbability;
    let selectedIndex = -1;
    let currentWeight = 0;

    for (let i = 0; i < options.length; i++) {
      currentWeight += parseFloat(options[i].probability);
      if (random <= currentWeight) {
        selectedIndex = i;
        break;
      }
    }

    // Fallback if float math goes weird
    if (selectedIndex === -1) selectedIndex = options.length - 1;

    // 2. Calculate Angle to land on that winner
    // The pointer is at 0 degrees (3 o'clock).
    // In SVG, 0 degrees is 3 o'clock.
    // Each slice is (360 / length) degrees.
    // We want the CENTER of the selected slice to align with 0 degrees.
    
    const sliceAngle = 360 / options.length;
    
    // The center of the slice at index i starts at: i * sliceAngle + sliceAngle/2
    // To bring that angle to 0, we need to rotate BACKWARDS by that amount.
    const targetAngle = selectedIndex * sliceAngle + sliceAngle / 2;
    
    // Add extra spins (5 full rotations = 1800 degrees) for effect
    const extraSpins = 1800; 
    
    // Calculate new total rotation. 
    // We want to land on a value where (rotation % 360) places the slice at 0.
    // Since we rotate the wheel grouping, a positive rotation moves index 0 clockwise (down).
    // To bring a specific index to 3 o'clock (0deg), we actually need to rotate Counter-Clockwise 
    // relative to the slice's position, OR just calculate the offset.
    
    // Let's simplify:
    // If we want index 0 (0-60deg, center 30) to hit 0deg. We rotate -30deg.
    // If we want index 1 (60-120deg, center 90) to hit 0deg. We rotate -90deg.
    // Formula: -(index * sliceAngle + sliceAngle/2)
    
    let requiredRotation = -(selectedIndex * sliceAngle + sliceAngle / 2);
    
    // Adjust to be positive relative to current rotation to ensure forward spin
    // Current rotation might be huge (e.g., 5000). 
    const currentRot = currentRotation.current;
    
    // Calculate the next multiple of 360 that is greater than currentRot
    const nextMultiple = Math.ceil(currentRot / 360) * 360;
    
    // Add the extra spins
    let finalRotation = nextMultiple + extraSpins + requiredRotation;
    
    // Ensure we are always increasing value to spin one way
    if (finalRotation < currentRot) {
        finalRotation += 360;
    }

    setRotation(finalRotation);
    currentRotation.current = finalRotation;

    // 3. Wait for animation to finish (match CSS transition time)
    setTimeout(() => {
      setIsSpinning(false);
      setWinner(options[selectedIndex]);
      setShowConfetti(true);
    }, 4000);
  };

  const handleUpdateOption = (id, field, value) => {
    setOptions(opts => opts.map(o => 
      o.id === id ? { ...o, [field]: value } : o
    ));
  };

  const handleRemoveOption = (id) => {
    if (options.length <= 2) return; // Minimum 2 options
    setOptions(opts => opts.filter(o => o.id !== id));
  };

  const handleAddOption = () => {
    if (options.length >= COLORS.length) return;
    const newId = Math.max(...options.map(o => o.id)) + 1;
    setOptions([...options, { id: newId, text: `Option ${newId}`, probability: 0 }]);
  };

  const handleEvenDistribute = () => {
    const evenProb = (100 / options.length).toFixed(1);
    setOptions(opts => opts.map(o => ({...o, probability: evenProb})));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: The Wheel */}
        <div className="flex flex-col items-center justify-center space-y-8 relative">
          <div className="relative group">
            
            {/* Pointer - Right Side (3 o'clock) */}
            <div className="absolute top-1/2 -right-6 -mt-3 z-20 drop-shadow-lg filter">
                 <div className="w-0 h-0 border-t-[12px] border-t-transparent border-r-[24px] border-r-green-500 border-b-[12px] border-b-transparent transform scale-x-100" />
            </div>

            {/* The Wheel SVG */}
            <div 
              className="w-[340px] h-[340px] md:w-[500px] md:h-[500px] rounded-full shadow-2xl border-4 border-slate-700 relative overflow-hidden bg-slate-800"
              style={{
                boxShadow: '0 0 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div 
                className="w-full h-full"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0, 0.2, 1)' : 'none'
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-0">
                  {options.map((option, index) => {
                    const sliceAngle = 360 / options.length;
                    const startAngle = index * sliceAngle;
                    const endAngle = (index + 1) * sliceAngle;
                    
                    // Convert polar to cartesian
                    const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                    const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                    const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                    const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);
                    
                    // SVG Path Command for a slice
                    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                    
                    // Text positioning (mid-angle)
                    const midAngle = startAngle + sliceAngle / 2;
                    // Move text slightly inward from edge (radius 35 instead of 50)
                    const tx = 50 + 32 * Math.cos(Math.PI * midAngle / 180);
                    const ty = 50 + 32 * Math.sin(Math.PI * midAngle / 180);

                    return (
                      <g key={option.id}>
                        <path d={pathData} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth="0.5" />
                        <text 
                          x={tx} 
                          y={ty} 
                          fill="white" 
                          fontSize="4" 
                          fontWeight="bold"
                          textAnchor="middle" 
                          alignmentBaseline="middle"
                          transform={`rotate(${midAngle}, ${tx}, ${ty}) rotate(180, ${tx}, ${ty})`}
                          style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
                        >
                          {option.text}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Center Hub */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg z-10 flex items-center justify-center border-4 border-slate-200">
                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Winner Display */}
          <div className={`text-center transition-all duration-500 ${winner ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
             <h2 className="text-2xl font-bold text-yellow-400 mb-2 drop-shadow-md">
                {winner ? `Winner: ${winner.text}` : 'Ready to Spin'}
             </h2>
             {winner && (
               <div className="px-4 py-2 bg-slate-800 rounded-lg inline-block border border-slate-700">
                 <span className="text-slate-400 text-sm">Chance was: {winner.probability}%</span>
               </div>
             )}
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || !isValidTotal}
            className={`
              relative overflow-hidden group px-12 py-4 rounded-2xl font-bold text-xl shadow-xl transition-all
              ${isSpinning || !isValidTotal 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:scale-105 hover:shadow-blue-500/25 active:scale-95'}
            `}
          >
            <div className="flex items-center gap-3">
               {isSpinning ? <RotateCcw className="animate-spin" /> : <Play fill="currentColor" />}
               <span>{isSpinning ? 'Spinning...' : 'SPIN!'}</span>
            </div>
          </button>
          
          {!isValidTotal && (
             <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg text-sm">
                <AlertCircle size={16} />
                <span>Total probability must equal 100% (Current: {Math.round(totalProbability)}%)</span>
             </div>
          )}
        </div>

        {/* Right Column: Settings */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Settings2 className="text-blue-400" />
              <span>Configure Options</span>
            </h3>
            <button 
              onClick={handleEvenDistribute}
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
                      onChange={(e) => handleUpdateOption(option.id, 'text', e.target.value)}
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
                          onChange={(e) => handleUpdateOption(option.id, 'probability', e.target.value)}
                          min="0"
                          max="100"
                          className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-sm focus:border-blue-500 outline-none"
                        />
                        <span className="absolute right-7 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">%</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button 
                      onClick={() => handleRemoveOption(option.id)}
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
              onClick={handleAddOption}
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
