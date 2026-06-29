import { useEffect, useState } from 'react'
import './App.css'
import WebGLGamePlayer from './components/WebGLGamePlayer'
import GltfAssetViewer from './components/GltfAssetViewer'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const initialContentState = {
  games: [],
  assets: [],
  status: 'loading',
  error: '',
}

function App() {
  const [content, setContent] = useState(initialContentState)

  useEffect(() => {
    const controller = new AbortController()

    async function loadContent() {
      try {
        setContent((currentContent) => ({
          ...currentContent,
          status: 'loading',
          error: '',
        }))

        const response = await fetch(`${API_BASE_URL}/content`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        setContent({
          games: Array.isArray(data.games) ? data.games : [],
          assets: Array.isArray(data.assets) ? data.assets : [],
          status: 'ready',
          error: '',
        })
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        setContent({
          games: [],
          assets: [],
          status: 'error',
          error: 'Unable to load GameFlow content from the backend.',
        })
      }
    }

    loadContent()

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <main className="app-shell">
      <section className="app-hero">
        <p className="app-eyebrow">GameFlow Platform</p>
        <h1>Backend-driven game and 3D asset library</h1>
        <p className="app-intro">
          Your React frontend is now ready to read published games and asset
          metadata from a Node.js + MongoDB API.
        </p>
      </section>

      {content.status === 'loading' ? (
        <section className="app-feedback-card">
          <p>Loading content from the backend...</p>
        </section>
      ) : null}

      {content.status === 'error' ? (
        <section className="app-feedback-card app-feedback-card--error">
          <p>{content.error}</p>
          <p className="app-feedback-note">
            Start the backend and make sure MongoDB is reachable before
            refreshing this page.
          </p>
        </section>
      ) : null}

      {content.status === 'ready' ? (
        <>
          <section className="app-section">
            <div className="app-section__header">
              <p className="app-section__label">WebGL Games</p>
              <h2>Published game builds</h2>
            </div>
            {content.games.length ? (
              <div className="app-grid">
                {content.games.map((game) => (
                  <article key={game.slug} className="app-card">
                    <div className="app-card__copy">
                      <h3>{game.title}</h3>
                      {game.description ? <p>{game.description}</p> : null}
                    </div>
                    <WebGLGamePlayer
                      gameUrl={game.gameUrl}
                      title={game.title}
                      mode={game.mode}
                      aspectRatio={game.aspectRatio}
                      loadingScreenUrl={game.loadingScreenUrl}
                    />
                  </article>
                ))}
              </div>
            ) : (
              <section className="app-feedback-card">
                <p>No published games found in MongoDB yet.</p>
              </section>
            )}
          </section>

          <section className="app-section">
            <div className="app-section__header">
              <p className="app-section__label">3D Assets</p>
              <h2>Published viewer assets</h2>
            </div>
            {content.assets.length ? (
              <div className="app-grid">
                {content.assets.map((asset) => (
                  <article key={asset.slug} className="app-card">
                    <div className="app-card__copy">
                      <h3>{asset.title}</h3>
                      {asset.description ? <p>{asset.description}</p> : null}
                    </div>
                    <GltfAssetViewer
                      modelUrl={asset.modelUrl}
                      title={asset.title}
                      mode={asset.mode}
                      background={asset.background}
                    />
                  </article>
                ))}
              </div>
            ) : (
              <section className="app-feedback-card">
                <p>No published 3D assets found in MongoDB yet.</p>
              </section>
            )}
          </section>
        </>
      ) : null}
    </main>
  )
}

export default App
