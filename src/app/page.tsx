'use client';
import { useState, useEffect } from "react";
import io from "socket.io-client";

const GRID_SIZE = 10;
const CELL_TYPES = {
  EMPTY: 0,
  OBSTACLE: 1,
  CATCHER: 2,
  RUNNER: 3,
} as const;

type CellType = typeof CELL_TYPES[keyof typeof CELL_TYPES];

export default function Home() {
  const [grid, setGrid] = useState<CellType[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(CELL_TYPES.EMPTY))
  );
  const [selectedType, setSelectedType] = useState<CellType>(CELL_TYPES.EMPTY);
  const [socket, setSocket] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:8000', {
      path: "/socket.io",
      transports: ['websocket']
    });
    setSocket(newSocket);
    console.log('newSocket', socket);

    // Listen for grid updates from the simulation
    newSocket.on('grid_update', (data) => {
      console.log('grid_update', data);
      setGrid(data.grid);
      if (data.done) {
        setIsSimulating(false);
      }
    });

    // Listen for errors
    newSocket.on('error', (data) => {
      setError(data.message);
      setIsSimulating(false);
    });
    

    newSocket.on('connect_error', () => {
      setError('Failed to connect to server');
      setIsSimulating(false);
    });

    return () => newSocket.close();
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (isSimulating) return;
    
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = selectedType;
      return newGrid;
    });
  };

  const handleStart = () => {
    try {
      setError(null);
      setIsSimulating(true);
      
      // Validate grid has exactly one runner and one catcher
      let runnerCount = 0;
      let catcherCount = 0;
      grid.forEach(row => {
        row.forEach(cell => {
          if (cell === CELL_TYPES.RUNNER) runnerCount++;
          if (cell === CELL_TYPES.CATCHER) catcherCount++;
        });
      });

      if (runnerCount !== 1 || catcherCount !== 1) {
        setError('Grid must have exactly one runner and one catcher');
        setIsSimulating(false);
        return;
      }

      // Emit start_simulation event to the server
      socket?.emit('start_simulation', { grid });
    } catch (error) {
      setError('Failed to start simulation. Please try again.');
      setIsSimulating(false);
    }
  };

  const stopSimulation = () => {
    socket?.emit('stop_simulation');
}

  const handleReset = () => {
    stopSimulation();
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(CELL_TYPES.EMPTY)));
    setIsSimulating(false);
    setError(null);
  };

  const controlButtons = [
    { type: CELL_TYPES.EMPTY, label: 'Empty Cell', icon: '⬜' },
    { type: CELL_TYPES.OBSTACLE, label: 'Obstacle', icon: '⬛' },
    { type: CELL_TYPES.CATCHER, label: 'Catcher', icon: '🔴' },
    { type: CELL_TYPES.RUNNER, label: 'Runner', icon: '🔵' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Grid Simulation</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Grid Section */}
          <div className="flex-1">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div 
                className="grid gap-1"
                style={{ 
                  gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                  maxWidth: '600px' 
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        aspect-square rounded-sm transition-all duration-200
                        ${isSimulating ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
                        ${cell === CELL_TYPES.EMPTY ? 'bg-gray-100 border border-gray-200' :
                          cell === CELL_TYPES.OBSTACLE ? 'bg-gray-800' :
                          cell === CELL_TYPES.CATCHER ? 'bg-red-500' :
                          cell === CELL_TYPES.RUNNER ? 'bg-blue-500' : ''}
                      `}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="w-full md:w-80">
            <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Controls</h2>
                <div className="space-y-2">
                  {controlButtons.map(({ type, label, icon }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      disabled={isSimulating}
                      className={`
                        w-full p-3 rounded-lg border transition-all duration-200
                        flex items-center gap-3
                        ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                        ${selectedType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                      `}
                    >
                      <span className="text-xl">{icon}</span>
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleStart}
                  disabled={isSimulating}
                  className={`
                    w-full p-3 rounded-lg font-semibold text-white
                    transition-all duration-200
                    ${isSimulating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600'}
                  `}
                >
                  {isSimulating ? 'Simulation Running...' : 'Start Simulation'}
                </button>

                <button
                  onClick={handleReset}
                  className="w-full p-3 rounded-lg font-semibold text-gray-600 
                           border border-gray-300 hover:bg-gray-50 
                           transition-all duration-200"
                >
                  Reset Grid
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
