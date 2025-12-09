import React, { useState, useRef } from 'react';
import { AlertCircle, Play, RotateCcw, Settings2 } from 'lucide-react';
import ConfigureOptions from './ConfigureOptions';
import './App.css'

const COLORS = [
  '#06AEEF', // Blue
  '#53458D', // Green
  '#16094A', // Red
  '#75D0F2', // Yellow
  '#A1B8F0', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#06B6D4', // Cyan
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('spinner'); // 'spinner' or 'settings'
  
  // Default to 6 options as requested, with equal probability initially
  const [options, setOptions] = useState([
    { id: 1, text: '20% Off', probability: 85 },
    { id: 2, text: 'Car Sunshade', probability: 10 },
    { id: 3, text: '6 Months Free', probability: 5 },
    { id: 4, text: 'Gift Box', probability: 0 },
    { id: 5, text: 'Try Again', probability: 0 },
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
    const sliceAngle = 360 / options.length;
    
    let requiredRotation = -(selectedIndex * sliceAngle + sliceAngle / 2);
    
    // Adjust to be positive relative to current rotation to ensure forward spin
    const currentRot = currentRotation.current;
    
    // Calculate the next multiple of 360 that is greater than currentRot
    const nextMultiple = Math.ceil(currentRot / 360) * 360;
    
    // Add extra spins (5 full rotations = 1800 degrees) for effect
    const extraSpins = 1800;
    
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

  // Show ConfigureOptions page
  if (currentPage === 'settings') {
    return (
      <ConfigureOptions
        options={options}
        onUpdateOption={handleUpdateOption}
        onRemoveOption={handleRemoveOption}
        onAddOption={handleAddOption}
        onEvenDistribute={handleEvenDistribute}
        onBack={() => setCurrentPage('spinner')}
      />
    );
  }

  // Main Spinner Page - Centered
  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 md:p-8 font-sans selection:bg-blue-500 selection:text-white flex flex-col items-center justify-center">
      
      {/* Logo at top left */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <img 
          src="/addenda-logo.png" 
          alt="Addenda Logo" 
          className="h-10 md:h-14 w-auto"
        />
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setCurrentPage('settings')}
        className="absolute top-4 right-4 md:top-8 md:right-8 p-3 cursor-pointer"
        title="Configure Options"
      >
        <Settings2 className="text-white" size={24} />
      </button>

      {/* The Wheel */}
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
                {winner 
                  ? (winner.text.toLowerCase() === 'try again' 
                      ? 'Try Again' 
                      : `You won: ${winner.text}`)
                  : 'Ready to Spin'}
             </h2>
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || !isValidTotal}
            className={`
              spin-button relative overflow-hidden group px-12 py-4 rounded-2xl font-bold text-xl shadow-xl transition-all
              ${isSpinning || !isValidTotal 
                ? 'text-slate-400 cursor-not-allowed' 
                : 'text-white cursor-pointer hover:scale-105 hover:shadow-purple-500/25 active:scale-95'}
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
      </div>
  );
}
