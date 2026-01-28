import React, { useState } from 'react'
import ProfileManager from './components/ProfileManager'
import './App.css'
import './components/ProfileManager.css'

function App() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'autofill' | 'settings'>('profiles')

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Google Forms Autofill Tool</h1>
        <p>Save time by automatically filling forms with your saved profiles</p>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'profiles' ? 'active' : ''}
          onClick={() => setActiveTab('profiles')}
        >
          📝 Profiles
        </button>
        <button 
          className={activeTab === 'autofill' ? 'active' : ''}
          onClick={() => setActiveTab('autofill')}
        >
          ⚡ Autofill
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'profiles' && <ProfileManager />}
        {activeTab === 'autofill' && (
          <div className="coming-soon">
            <h2>🔧 Autofill Feature</h2>
            <p>This will contain the bookmarklet and injection tools - Coming in Phase 2!</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="coming-soon">
            <h2>⚙️ Settings</h2>
            <p>Global settings and preferences - Coming in Phase 3!</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
