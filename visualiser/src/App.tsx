import TopologyCanvas from './components/TopologyCanvas'
import PhaseToggle from './components/PhaseToggle'

function App() {
  return (
    <div className="w-screen h-screen bg-gray-950 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center gap-6">
        <h1 className="text-white font-mono text-lg">VLAN Lab Visualizer</h1>
        <PhaseToggle />
      </div>
      <div className="flex-1">
        <TopologyCanvas />
      </div>
    </div>
  )
}

export default App