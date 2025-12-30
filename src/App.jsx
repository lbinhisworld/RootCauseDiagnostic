import React, { useState } from 'react'
import ProblemInput from './components/ProblemInput'
import DiagnosticCanvas from './components/DiagnosticCanvas'
import './App.css'

function App() {
  const [problem, setProblem] = useState(null)
  const [initialNodes, setInitialNodes] = useState(null)
  const [initialEdges, setInitialEdges] = useState(null)

  const handleProblemSubmit = (problemText) => {
    setProblem(problemText)
    setInitialNodes(null)
    setInitialEdges(null)
  }

  const handleAnalyzeWithAI = (problemText, nodes, edges) => {
    setProblem(problemText)
    setInitialNodes(nodes)
    setInitialEdges(edges)
  }

  const handleBackToInput = () => {
    setProblem(null)
    setInitialNodes(null)
    setInitialEdges(null)
  }

  return (
    <div className="app">
      {!problem ? (
        <ProblemInput 
          onSubmit={handleProblemSubmit} 
          onAnalyzeWithAI={handleAnalyzeWithAI}
        />
      ) : (
        <DiagnosticCanvas 
          initialProblem={problem}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onBack={handleBackToInput}
        />
      )}
    </div>
  )
}

export default App


