fetch(`/api/city/${cityId}/`)
  .then(res => res.json())
  .then(data => {
    const map = L.map('map').setView([parseFloat(data.city.lat), parseFloat(data.city.lon)], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.easyPrint({
      title: 'Download Map',
      position: 'topright',
      filename: `${data.city.name}_map`,
      exportOnly: true,
      sizeModes: ['Current']
    }).addTo(map);

    L.marker([data.city.lat, data.city.lon])
      .addTo(map)
      .bindPopup(`${data.city.name} center`);

    data.attractions.forEach(a => {
      const marker = L.marker([parseFloat(a.lat), parseFloat(a.lon)]).addTo(map);
      const popup = `<b>${a.name}</b><br><img src="${a.image}" width="100"/>`;
      marker.bindPopup(popup);
    });
  });