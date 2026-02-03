// === DOM Elements ===
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const resultEl = document.getElementById('result');

// === State ===
let currentWeatherData = null;
let currentCityInfo = null;
let currentSituation = 'casual';
let currentGender = 'male';

// === Kakao SDK ===
// To enable KakaoTalk sharing, replace with your Kakao JavaScript App Key
// Register at https://developers.kakao.com
const KAKAO_APP_KEY = '';

function initKakao() {
  if (window.Kakao && KAKAO_APP_KEY && !window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_APP_KEY);
  }
}

// === API Endpoints (Open-Meteo - no API key required) ===
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// === Weather Code Descriptions (WMO) ===
const weatherDescriptions = {
  0: '맑음',
  1: '대체로 맑음',
  2: '구름 조금',
  3: '흐림',
  45: '안개',
  48: '짙은 안개',
  51: '가벼운 이슬비',
  53: '이슬비',
  55: '짙은 이슬비',
  56: '가벼운 얼어붙는 이슬비',
  57: '짙은 얼어붙는 이슬비',
  61: '약한 비',
  63: '비',
  65: '강한 비',
  66: '가벼운 얼어붙는 비',
  67: '강한 얼어붙는 비',
  71: '약한 눈',
  73: '눈',
  75: '강한 눈',
  77: '싸락눈',
  80: '약한 소나기',
  81: '소나기',
  82: '강한 소나기',
  85: '약한 눈소나기',
  86: '강한 눈소나기',
  95: '뇌우',
  96: '가벼운 우박 뇌우',
  99: '강한 우박 뇌우',
};

// === Weather Icons ===
const weatherIcons = {
  0: '\u2600\uFE0F',
  1: '\uD83C\uDF24\uFE0F',
  2: '\u26C5',
  3: '\u2601\uFE0F',
  45: '\uD83C\uDF2B\uFE0F',
  48: '\uD83C\uDF2B\uFE0F',
  51: '\uD83C\uDF26\uFE0F',
  53: '\uD83C\uDF26\uFE0F',
  55: '\uD83C\uDF26\uFE0F',
  56: '\uD83C\uDF28\uFE0F',
  57: '\uD83C\uDF28\uFE0F',
  61: '\uD83C\uDF27\uFE0F',
  63: '\uD83C\uDF27\uFE0F',
  65: '\uD83C\uDF27\uFE0F',
  66: '\uD83C\uDF28\uFE0F',
  67: '\uD83C\uDF28\uFE0F',
  71: '\u2744\uFE0F',
  73: '\uD83C\uDF28\uFE0F',
  75: '\uD83C\uDF28\uFE0F',
  77: '\uD83C\uDF28\uFE0F',
  80: '\uD83C\uDF26\uFE0F',
  81: '\uD83C\uDF27\uFE0F',
  82: '\uD83C\uDF27\uFE0F',
  85: '\uD83C\uDF28\uFE0F',
  86: '\uD83C\uDF28\uFE0F',
  95: '\u26C8\uFE0F',
  96: '\u26C8\uFE0F',
  99: '\u26C8\uFE0F',
};

// === Clothing Images ===
const IMAGES = {
  m_tanktop: 'https://images.unsplash.com/photo-1503341504253-dff4855b8c65?w=300&h=300&fit=crop',
  m_tshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
  m_longSleeve: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop',
  m_shirt: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=300&fit=crop',
  m_sweatshirt: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
  m_knit: 'https://images.unsplash.com/photo-1638000175091-2bfa4cfbc58b?w=300&h=300&fit=crop',
  m_cardigan: 'https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=300&h=300&fit=crop',
  m_blazer: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=300&h=300&fit=crop',
  m_trenchCoat: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=300&fit=crop',
  m_woolCoat: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=300&h=300&fit=crop',
  m_puffer: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=300&h=300&fit=crop',
  m_shorts: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300&h=300&fit=crop',
  m_jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
  m_chinos: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop',
  m_sneakers: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
  m_sandals: 'https://images.unsplash.com/photo-1621251944686-350c33a246a?w=300&h=300&fit=crop',
  f_tanktop: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300&h=300&fit=crop',
  f_tshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
  f_blouse: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=300&h=300&fit=crop',
  f_dress: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
  f_knit: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=300&h=300&fit=crop',
  f_cardigan: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3f0a?w=300&h=300&fit=crop',
  f_jacket: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
  f_trenchCoat: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop',
  f_woolCoat: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=300&h=300&fit=crop',
  f_puffer: 'https://images.unsplash.com/photo-1544923246-77307dd270c5?w=300&h=300&fit=crop',
  f_skirt: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=300&h=300&fit=crop',
  f_jeans: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=300&fit=crop',
  f_slacks: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop',
  f_leggings: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=300&h=300&fit=crop',
  f_sneakers: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=300&fit=crop',
  f_boots: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=300&fit=crop',
  f_sandals: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=300&h=300&fit=crop',
  f_longSleeve: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=300&h=300&fit=crop',
  f_shirt: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=300&h=300&fit=crop',
  f_blazer: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
  f_shorts: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=300&fit=crop',
  f_sweatshirt: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=300&h=300&fit=crop',
  f_chinos: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop',
  scarf: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=300&h=300&fit=crop',
  gloves: 'https://images.unsplash.com/photo-1545170832-bec0c7f04024?w=300&h=300&fit=crop',
  cap: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=300&h=300&fit=crop',
  beanie: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=300&h=300&fit=crop',
  earMuffs: 'https://images.unsplash.com/photo-1457545195570-67f207084966?w=300&h=300&fit=crop',
  sunglasses: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop',
  loafers: 'https://images.unsplash.com/photo-1533867617858-e7b97060509?w=300&h=300&fit=crop',
  dressShoes: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=300&h=300&fit=crop',
  winterBoots: 'https://images.unsplash.com/photo-1542840410-3092f99611a3?w=300&h=300&fit=crop',
};

// === Full Outfit Images ===
const FULL_OUTFITS = {
  male: {
    veryHot: 'https://images.unsplash.com/photo-1565538421053-dff4855b8c65?w=600&h=800&fit=crop',
    hot: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?w=600&h=800&fit=crop',
    warm: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=800&fit=crop',
    mild: 'https://images.unsplash.com/photo-16171379687-b5742c160533?w=600&h=800&fit=crop',
    cool: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&h=800&fit=crop',
    chilly: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&h=800&fit=crop',
    cold: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop',
    veryCold: 'https://images.unsplash.com/photo-1548866532-628d05260f87?w=600&h=800&fit=crop',
    freezing: 'https://images.unsplash.com/photo-1605763240004-7e93b172d754?w=600&h=800&fit=crop',
  },
  female: {
    veryHot: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
    hot: 'https://images.unsplash.com/photo-1581044777550-4cfa607070c3?w=600&h=800&fit=crop',
    warm: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop',
    mild: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=600&h=800&fit=crop',
    cool: 'https://images.unsplash.com/photo-1603144885860-2059345c2253?w=600&h=800&fit=crop',
    chilly: 'https://images.unsplash.com/photo-1552874869-5c39ec9498dc?w=600&h=800&fit=crop',
    cold: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop',
    veryCold: 'https://images.unsplash.com/photo-1485230948881-61a8a83504fb?w=600&h=800&fit=crop',
    freezing: 'https://images.unsplash.com/photo-151657515020-600&h=800&fit=crop',
  },
};

function getImg(key) {
  const prefix = currentGender === 'male' ? 'm_' : 'f_';
  return IMAGES[prefix + key] || IMAGES[key] || '';
}

// === Temperature Range Labels ===
const tempRangeLabels = {
  veryHot: { label: '\uD83D\uDD25 \uB9E4\uC6B0 \uB354\uC6C0 (28\u00B0C \uC774\uC0C1)', cssClass: 'very-hot' },
  hot: { label: '\u2600\uFE0F \uB354\uC6C0 (23~27\u00B0C)', cssClass: 'hot' },
  warm: { label: '\uD83C\uDF24\uFE0F \uB530\uB73B\uD568 (20~22\u00B0C)', cssClass: 'warm' },
  mild: { label: '\uD83C\uDF3F \uC120\uC120\uD568 (17~19\u00B0C)', cssClass: 'mild' },
  cool: { label: '\uD83C\uDF42 \uC300\uC300\uD568 (12~16\u00B0C)', cssClass: 'cool' },
  chilly: { label: '\uD83C\uDF43 \uC300\uC300\uD568 (9~11\u00B0C)', cssClass: 'chilly' },
  cold: { label: '\u2744\uFE0F \uCD94\uC6C0 (5~8\u00B0C)', cssClass: 'cold' },
  veryCold: { label: '\uD83E\uDD76 \uB9E4\uC6B0 \uCD94\uC6C0 (0~4\u00B0C)', cssClass: 'very-cold' },
  freezing: { label: '\u26C4 \uD55C\uD30C (0\u00B0C \uBBF8\uB9CC)', cssClass: 'freezing' },
};

// === Helper Functions ===
function show(el) {
  el.classList.remove('hidden');
}

function hide(el) {
  el.classList.add('hidden');
}

function showError(msg) {
  errorEl.textContent = msg;
  show(errorEl);
  hide(loadingEl);
  hide(resultEl);
}

function getOutfitCategory(temp) {
  if (temp >= 28) return 'veryHot';
  if (temp >= 23) return 'hot';
  if (temp >= 20) return 'warm';
  if (temp >= 17) return 'mild';
  if (temp >= 12) return 'cool';
  if (temp >= 9) return 'chilly';
  if (temp >= 5) return 'cold';
  if (temp >= 0) return 'veryCold';
  return 'freezing';
}

function isRainy(code) {
  return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
}

function isSnowy(code) {
  return [71, 73, 75, 77, 85, 86].includes(code);
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// === Theme Toggle ===
const themeToggleBtn = document.getElementById('theme-toggle');
const root = document.documentElement;

// Check local storage or system preference
const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
let currentTheme = savedTheme || systemTheme;

// Apply theme
function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  if (themeToggleBtn) {
    themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
  });
}

// Init theme
applyTheme(currentTheme);


// === Geocoding ===
async function geocodeCity(cityName) {
  const url = `${GEO_API}?name=${encodeURIComponent(cityName)}&count=1&language=ko&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('도시 검색에 실패했습니다.');
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error('해당 도시를 찾을 수 없습니다. 영문 이름으로 다시 시도해 보세요.');
  }
  const city = data.results[0];
  return {
    name: city.name,
    country: city.country,
    lat: city.latitude,
    lon: city.longitude,
    admin: city.admin1 || '',
  };
}

// === Fetch Weather ===
async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '1',
  });
  const url = `${WEATHER_API}?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('날씨 정보를 가져오지 못했습니다.');
  return res.json();
}

// === Render Outfit ===
function renderOutfit(feelsLike, situation) {
  const category = getOutfitCategory(feelsLike);
  const rangeInfo = tempRangeLabels[category];
  let items, tip;

  if (situation === 'casual' || !situationItems[situation]) {
    items = genderedOutfitItems[currentGender][category];
    tip = outfitTips.casual[category];
  } else {
    items = situationItems[situation][currentGender][category];
    tip = outfitTips[situation][category];
  }

  const tempLabel = document.getElementById('temp-label');
  tempLabel.textContent = rangeInfo.label;
  tempLabel.className = `temp-label ${rangeInfo.cssClass}`;

  // Render Full Outfit Image
  const fullOutfitImg = document.getElementById('full-outfit-img');
  const fullOutfitUrl = FULL_OUTFITS[currentGender][category];
  const fullOutfitContainer = document.getElementById('full-outfit-container');

  if (fullOutfitImg && fullOutfitUrl && fullOutfitContainer) {
    fullOutfitImg.src = fullOutfitUrl;
    fullOutfitImg.alt = `${currentGender === 'male' ? '남성' : '여성'} 코디 예시`;
    fullOutfitContainer.classList.remove('hidden');
  } else if (fullOutfitContainer) {
    fullOutfitContainer.classList.add('hidden');
  }

  const cardsContainer = document.getElementById('outfit-cards');
  cardsContainer.innerHTML = items
    .map(
      ([imgKey, name, desc]) => `
    <div class="outfit-card">
      <img class="outfit-img" src="${getImg(imgKey)}" alt="${name}" loading="lazy">
      <div class="name">${name}</div>
      <div class="desc">${desc}</div>
    </div>
  `
    )
    .join('');

  cardsContainer.classList.remove('fade-in');
  void cardsContainer.offsetWidth;
  cardsContainer.classList.add('fade-in');

  document.getElementById('outfit-tip').innerHTML = tip;
}

// === Render Result ===
function renderResult(cityInfo, weather) {
  currentWeatherData = weather;
  currentCityInfo = cityInfo;

  const current = weather.current;
  const daily = weather.daily;
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const windSpeed = current.wind_speed_10m;
  const weatherCode = current.weather_code;
  const tempMax = Math.round(daily.temperature_2m_max[0]);
  const tempMin = Math.round(daily.temperature_2m_min[0]);
  const rainProb = daily.precipitation_probability_max
    ? daily.precipitation_probability_max[0]
    : 0;

  // Weather info
  document.getElementById('weather-icon').textContent = weatherIcons[weatherCode] || '\u2600\uFE0F';
  document.getElementById('temp').textContent = temp;
  document.getElementById('city-name').textContent =
    cityInfo.admin ? `${cityInfo.name}, ${cityInfo.admin}` : cityInfo.name;
  document.getElementById('weather-desc').textContent =
    weatherDescriptions[weatherCode] || '\uC54C \uC218 \uC5C6\uC74C';
  document.getElementById('feels-like').textContent = `${feelsLike}\u00B0C`;
  document.getElementById('humidity').textContent = `${humidity}%`;
  document.getElementById('rain-prob').textContent = `${rainProb}%`;
  document.getElementById('wind').textContent = `${windSpeed} km/h`;
  document.getElementById('temp-range').textContent = `${tempMax}\u00B0 / ${tempMin}\u00B0`;

  // Outfit recommendation
  renderOutfit(feelsLike, currentSituation);

  // Weather alert (rain/snow)
  const alertEl = document.getElementById('weather-alert');
  if (isRainy(weatherCode)) {
    alertEl.className = 'weather-alert rain';
    alertEl.innerHTML = `
      <span class="alert-icon">\u2614</span>
      <span><strong>\uBE44 \uC608\uBCF4!</strong> \uC6B0\uC0B0\uC744 \uCC59\uAE30\uC138\uC694. \uBC29\uC218 \uC18C\uC7AC\uC758 \uAC89\uC637\uACFC \uBC29\uC218 \uC2E0\uBC1C\uC744 \uCD94\uCC9C\uD569\uB2C8\uB2E4.</span>
    `;
    show(alertEl);
  } else if (isSnowy(weatherCode)) {
    alertEl.className = 'weather-alert snow';
    alertEl.innerHTML = `
      <span class="alert-icon">\u2744\uFE0F</span>
      <span><strong>\uB208 \uC608\uBCF4!</strong> \uBBF8\uB044\uB7FC \uBC29\uC9C0 \uC2E0\uBC1C\uC744 \uC2E0\uACE0, \uBC29\uC218 \uC18C\uC7AC\uC758 \uC544\uC6B0\uD130\uB97C \uC785\uC73C\uC138\uC694.</span>
    `;
    show(alertEl);
  } else {
    hide(alertEl);
  }

  // Reset filter buttons
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.situation === currentSituation);
  });
  document.querySelectorAll('.gender-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.gender === currentGender);
  });

  hide(loadingEl);
  hide(errorEl);
  show(resultEl);
}

// === Main Search Handler ===
async function searchWeather(lat, lon, cityInfo) {
  hide(resultEl);
  hide(errorEl);
  show(loadingEl);

  try {
    if (!cityInfo) {
      cityInfo = { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, admin: '', country: '' };
    }
    const weather = await fetchWeather(lat, lon);
    renderResult(cityInfo, weather);
  } catch (err) {
    showError(err.message);
  }
}

async function searchByCity(cityName) {
  if (!cityName.trim()) {
    showError('\uB3C4\uC2DC \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.');
    return;
  }

  hide(resultEl);
  hide(errorEl);
  show(loadingEl);

  try {
    const cityInfo = await geocodeCity(cityName);
    const weather = await fetchWeather(cityInfo.lat, cityInfo.lon);
    renderResult(cityInfo, weather);
  } catch (err) {
    showError(err.message);
  }
}

// === Event Listeners ===
searchBtn.addEventListener('click', () => {
  searchByCity(cityInput.value);
});

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    searchByCity(cityInput.value);
  }
});

locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('\uBE0C\uB77C\uC6B0\uC800\uAC00 \uC704\uCE58 \uC815\uBCF4\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.');
    return;
  }

  hide(resultEl);
  hide(errorEl);
  show(loadingEl);

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const cityInfo = {
          name: '\uD604\uC7AC \uC704\uCE58',
          admin: `${latitude.toFixed(2)}\u00B0N, ${longitude.toFixed(2)}\u00B0E`,
          country: '',
        };
        const weather = await fetchWeather(latitude, longitude);
        renderResult(cityInfo, weather);
      } catch (err) {
        showError(err.message);
      }
    },
    () => {
      showError('\uC704\uCE58 \uC815\uBCF4\uB97C \uAC00\uC838\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC704\uCE58 \uC811\uFC50 \uAD8C\uD55C\uC744 \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694.');
    }
  );
});

// === Gender Toggle ===
document.querySelectorAll('.gender-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gender-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentGender = btn.dataset.gender;
    if (currentWeatherData) {
      const feelsLike = Math.round(currentWeatherData.current.apparent_temperature);
      renderOutfit(feelsLike, currentSituation);
    }
  });
});

// === Situation Filter ===
document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentSituation = btn.dataset.situation;
    if (currentWeatherData) {
      const feelsLike = Math.round(currentWeatherData.current.apparent_temperature);
      renderOutfit(feelsLike, currentSituation);
    }
  });
});

// === KakaoTalk Share ===
const kakaoShareBtn = document.getElementById('kakao-share-btn');
if (kakaoShareBtn) {
  kakaoShareBtn.addEventListener('click', shareWeather);
}

function shareWeather() {
  const temp = document.getElementById('temp').textContent;
  const city = document.getElementById('city-name').textContent;
  const desc = document.getElementById('weather-desc').textContent;
  const feelsLike = document.getElementById('feels-like').textContent;
  const rainProb = document.getElementById('rain-prob').textContent;

  const shareTitle = '\uC624\uB298 \uBB50 \uC785\uC9C0? - \uB0A0\uC528 \uAE30\uBC18 \uC637\uCC28\uB9BC \uCD94\uCC9C';
  const shareText = `\uD83C\uDF24 ${city} \uB0A0\uC528: ${temp}\u00B0C\n${desc} | \uCCB4\uAC10 ${feelsLike} | \uBE44 \uD655\uB960 ${rainProb}\n\n\uD83D\uDC54 \uC637\uCC28\uB9BC \uCD94\uCC9C\uC744 \uD655\uC778\uD558\uC138\uC694!`;

  // Try Kakao SDK first
  if (window.Kakao && window.Kakao.isInitialized()) {
    window.Kakao.Share.sendDefault({
      objectType: 'text',
      text: shareText,
      link: {
        mobileWebUrl: window.location.href,
        webUrl: window.location.href,
      },
    });
    return;
  }

  // Fallback: Web Share API (shows KakaoTalk on mobile)
  if (navigator.share) {
    navigator.share({
      title: shareTitle,
      text: shareText,
      url: window.location.href,
    }).catch(() => {});
    return;
  }

  // Last resort: clipboard copy
  navigator.clipboard
    .writeText(shareText + '\n' + window.location.href)
    .then(() => {
      showToast('\uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!');
    })
    .catch(() => {
      showToast('\uACF5\uC720\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.');
    });
}

// === Init ===
initKakao();
searchByCity('Seoul');