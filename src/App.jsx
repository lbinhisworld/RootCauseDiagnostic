import React, { useState } from 'react'
import ProblemInput from './components/ProblemInput'
import DiagnosticCanvas from './components/DiagnosticCanvas'
import './App.css'

function App() {
  const [problem, setProblem] = useState(null)

  const handleProblemSubmit = (problemText) => {
    setProblem(problemText)
  }

  const handleBackToInput = () => {
    setProblem(null)
  }

  return (
    <div className="app">
      {!problem ? (
        <ProblemInput onSubmit={handleProblemSubmit} />
      ) : (
        <DiagnosticCanvas 
          initialProblem={problem} 
          onBack={handleBackToInput}
        />
      )}
    </div>
  )
}

export default App

