let quoteIndex = 0;
let priceChart = null;
let alerts = [];

// Fear & Greed Index
function updateFearAndGreed() {
  fetch('https://api.alternative.me/fng/') 
    .then(res => res.json())
    .then(data => {
      document.getElementById('fng-value').innerText = data.data[0].value;
      document.getElementById('fng-text').innerText = data.data[0].value_classification;
    });
}

// Market Stats
function updateMarketStats() {
  fetch('https://api.coingecko.com/api/v3/global') 
    .then(res => res.json())
    .then(data => {
      const stats = data.data;
      document.getElementById('total-marketcap').innerText = `$${(stats.total_market_cap.usd / 1e9).toFixed(2)}B`;
      document.getElementById('btc-dominance').innerText = `${stats.market_cap_percentage.btc.toFixed(1)}%`;
      document.getElementById('volume-24h').innerText = `$${(stats.total_volume.usd / 1e9).toFixed(2)}B`;
    });
}

// Top Gainer
function updateTopGainer() {
  fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=1&page=1')
    .then(res => res.json())
    .then(data => {
      const coin = data[0];
      document.getElementById('gainer-img').src = coin.image;
      document.getElementById('gainer-name').innerText = coin.name;
      document.getElementById('gainer-change').innerText = `${coin.price_change_percentage_24h.toFixed(2)}%`;
    });
}

// Crypto Table with Click to Chart
function updateCryptoTable() {
  fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false')
    .then(res => res.json())
    .then(coins => {
      const tbody = document.querySelector('#crypto-table tbody'); 
      tbody.innerHTML = '';
      coins.forEach((coin, i) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${i + 1}</td>
          <td class="coin-name" data-id="${coin.id}"><img src="${coin.image}" width="20" alt=""> ${coin.name}</td>
          <td>$${coin.current_price.toLocaleString()}</td>
          <td class="${coin.price_change_percentage_24h > 0 ? 'text-green' : 'text-red'}">
            ${coin.price_change_percentage_24h.toFixed(2)}%
          </td>
        `;
        tbody.appendChild(row);
      });

      // Add click event to open chart modal
      document.querySelectorAll('.coin-name').forEach(row => {
        row.addEventListener('click', () => {
          const coinId = row.dataset.id;
          fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`)
            .then(res => res.json())
            .then(data => {
              const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString());
              const prices = data.prices.map(p => p[1]);

              document.getElementById('modal-title').innerText = row.innerText.trim();
              document.getElementById('chart-modal').classList.remove('hidden');

              if (priceChart) priceChart.destroy();

              priceChart = new Chart(document.getElementById('price-chart'), {
                type: 'line',
                data: {
                  labels,
                  datasets: [{
                    label: 'ფასი (USD)',
                    data: prices,
                    borderColor: '#7C3AED', 
                    backgroundColor: 'rgba(124, 58, 237, 0.2)',
                    tension: 0.3,
                    fill: true
                  }]
                },
                options: {
                  responsive: true,
                  scales: {
                    y: { beginAtZero: false }
                  }
                }
              });
            });
        });
      });
    });
}

// Close Modal
document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('chart-modal').classList.add('hidden');
});

// Inspirational Quotes
function rotateQuote() {
  fetch('quotes.json')
    .then(res => res.json())
    .then(data => {
      const quote = data.quotes[quoteIndex % data.quotes.length];
      document.getElementById('quote').innerText = quote;
      quoteIndex++;
    });
}

// Notification Permission
function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("ბრაუზერი არ მხარდაჭერს შეტყობინებებს!");
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      console.log("შეტყობინებები ჩართულია.");
    } else {
      alert("შეტყობინებები განსაზღვრულია.");
    }
  });
}

// Local Notification
function showLocalNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/assets/icons/icon-192x192.png"
    });
  }
}

// Price Alert Logic
function checkPriceAlerts() {
  fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    .then(res => res.json())
    .then(data => {
      const price = data.bitcoin.usd;
      if (price > 70000) {
        showLocalNotification("ფასის მკვეთრი ზრდა", "Bitcoin გადააჭარბა $70,000-ს!");
      }
    });
}

// Custom Alerts
function setCustomAlert() {
  const coin = document.getElementById('alert-coin').value.toLowerCase();
  const threshold = parseFloat(document.getElementById('alert-price').value);

  if (coin && !isNaN(threshold)) {
    alerts.push({ coin, threshold });
    alert("ალერტი დამატებულია");
  }
}

function checkCustomAlerts() {
  if (alerts.length === 0) return;

  const ids = alerts.map(a => a.coin).join(',');
  fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
    .then(res => res.json())
    .then(data => {
      alerts.forEach(alert => {
        const price = data[alert.coin]?.usd;
        if (price && price >= alert.threshold) {
          showLocalNotification(`${alert.coin.toUpperCase()} ალერტი`, `ფასი მიაღწია $${price}`);
        }
      });
    });
}

// Auto-refresh every 5 minutes
function refreshData() {
  updateFearAndGreed();
  updateMarketStats();
  updateTopGainer();
  updateCryptoTable();
}
refreshData();
setInterval(refreshData, 5 * 60 * 1000);

// Quote rotation every 30 seconds
rotateQuote();
setInterval(rotateQuote, 30000);

// Check alerts every minute
setInterval(checkPriceAlerts, 60 * 1000);
setInterval(checkCustomAlerts, 60 * 1000);