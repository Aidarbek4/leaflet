import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BishkekMap = () => {
  useEffect(() => {
    // Инициализация карты с центром в Бишкеке
    const map = L.map('map').setView([42.8746, 74.5698], 13); // Координаты Бишкека

    // Добавление слоя тайлов OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Добавление маркера для центра города
    const marker = L.marker([42.8746, 74.5698]).addTo(map);
    marker.bindPopup('<b>Бишкек</b><br>Центр города').openPopup();

    return () => {
      map.remove(); // Очистка карты при размонтировании компонента
    };
  }, []);

  return (
    <div
      id="map"
      style={{
        width: '100%',
        height: '500px', // Задайте нужный размер карты
      }}
    ></div>
  );
};

export default BishkekMap;
