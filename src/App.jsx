import './App.css'
// import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import BishkekMap from './components/BishkekMap'
import RouteMap from './components/RouteMap/RouteMap'

function App() {
  return (
    <>
      <h1>Bishkek Map</h1>
      <RouteMap/>
    </>
  )
}

export default App
