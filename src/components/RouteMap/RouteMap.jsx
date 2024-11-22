import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import './RouteMap.css'; // Подключение стилей

const RouteMap = () => {
  const [map, setMap] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [routeDetails, setRouteDetails] = useState(null); // Данные маршрута (дистанция, время)
  const [routePoints, setRoutePoints] = useState(null); // Координаты точек

  useEffect(() => {
    const mapInstance = L.map('map').setView([42.8746, 74.5698], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance);
    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

  const fetchSuggestions = async (query, setter) => {
    if (query.length < 2) {
      setter([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ', Bishkek'
        )}&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setter(data.map((item) => item.display_name));
      } else {
        setter([]);
      }
    } catch (error) {
      console.error('Ошибка при получении подсказок:', error);
      setter([]);
    }
  };

  const drawRoute = async () => {
    if (routingControl) {
      map.removeControl(routingControl);
    }

    const geocodeAddress = async (address) => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      throw new Error(`Не удалось найти координаты для адреса "${address}".`);
    };

    try {
      const originCoords = await geocodeAddress(origin);
      const destinationCoords = await geocodeAddress(destination);

      const newRoutingControl = L.Routing.control({
        waypoints: [
          L.latLng(originCoords.lat, originCoords.lng),
          L.latLng(destinationCoords.lat, destinationCoords.lng),
        ],
        routeWhileDragging: true,
        show: false,
        createMarker: () => null,
      });

      newRoutingControl.on('routesfound', (e) => {
        const route = e.routes[0];
        setRouteDetails({
          distance: (route.summary.totalDistance / 1000).toFixed(2),
          time: (route.summary.totalTime / 60).toFixed(2),
        });

        // Сохраняем координаты точек
        setRoutePoints({
          origin: originCoords,
          destination: destinationCoords,
        });
      });

      newRoutingControl.addTo(map);
      setRoutingControl(newRoutingControl);
    } catch (error) {
      alert('Не удалось построить маршрут. Проверьте адреса.');
    }
  };

  const StyledDropdown = ({ suggestions, onSelect }) => (
    <ul className="styled-dropdown">
      {suggestions.map((suggestion, index) => (
        <li key={index} onClick={() => onSelect(suggestion)}>
          {suggestion}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="route-info">
      <h1>Построение маршрута с подсказками</h1>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginRight: '10px' }}>
          <input
            type="text"
            placeholder="Адрес отправления"
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              fetchSuggestions(e.target.value, setOriginSuggestions);
            }}
            className="input-field"
          />
          {originSuggestions.length > 0 && (
            <StyledDropdown
              suggestions={originSuggestions}
              onSelect={(suggestion) => {
                setOrigin(suggestion);
                setOriginSuggestions([]);
              }}
            />
          )}
        </div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <input
            type="text"
            placeholder="Адрес назначения"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              fetchSuggestions(e.target.value, setDestinationSuggestions);
            }}
            className="input-field"
          />
          {destinationSuggestions.length > 0 && (
            <StyledDropdown
              suggestions={destinationSuggestions}
              onSelect={(suggestion) => {
                setDestination(suggestion);
                setDestinationSuggestions([]);
              }}
            />
          )}
        </div>
        <button onClick={drawRoute} className="route-button">
          Построить маршрут
        </button>
      </div>
      <div id="map"></div>
      <div>
        <h2>Информация о маршруте</h2>
        {routeDetails ? (
          <div>
            <p>
              <strong>Расстояние:</strong> {routeDetails.distance} км
            </p>
            <p>
              <strong>Оценочное время:</strong> {routeDetails.time} мин
            </p>
          </div>
        ) : (
          <p>Маршрут пока не построен.</p>
        )}
      </div>
      <div>
        <h2>Точки маршрута</h2>
        {routePoints ? (
          <div>
            <p>
              <strong>Точка отправления:</strong> {routePoints.origin.lat.toFixed(6)}, {routePoints.origin.lng.toFixed(6)}
            </p>
            <p>
              <strong>Точка назначения:</strong> {routePoints.destination.lat.toFixed(6)}, {routePoints.destination.lng.toFixed(6)}
            </p>
          </div>
        ) : (
          <p>Точки маршрута пока не определены.</p>
        )}
      </div>
    </div>
  );
};

export default RouteMap;
