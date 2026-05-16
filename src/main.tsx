
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import "mapbox-gl/dist/mapbox-gl.css"
import './index.css'                 // global app styles
import './map-layout.css'           // map container + wrapper
import './map-ui.css'               // search bar, style selector, layers, FAB, dropdown
import './map-mapbox-overrides.css' // Mapbox control overrides

import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
