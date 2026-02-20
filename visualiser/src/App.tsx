import TopologyCanvas from './components/TopologyCanvas'
import PhaseToggle from './components/PhaseToggle'
import AclInspector from './components/AclInspector'
import PacketSimulator from './components/PacketSimulator'
import NodeInspector from './components/NodeInspector'
import ConceptsPanel from './components/ConceptsPanel'
import ZoneLegend from './components/ZoneLegend'
import { useLabStore } from './store/labStore'

function App() {
  const { currentPhase } = useLabStore()

  return (
    <div className="w-screen h-screen bg-gray-950 flex flex-col">
      <div className="border-b border-gray-800">
        <div className="p-4 flex items-start gap-6">
          <h1 className="text-white font-mono text-lg shrink-0">VLAN Lab Visualizer</h1>
          <div className="flex flex-col gap-3 flex-1">
            <PhaseToggle />
            <ZoneLegend />
          </div>
        </div>
        <ConceptsPanel />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <TopologyCanvas />
            <NodeInspector />
          </div>
          {currentPhase === 4 && <PacketSimulator />}
        </div>
        {currentPhase === 4 && <AclInspector />}
      </div>
    </div>
  )
}

export default App