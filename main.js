// === DOM Elements ===
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const resultEl = document.getElementById('result');
const themeToggleBtn = document.getElementById('theme-toggle');
const langToggleBtn = document.getElementById('lang-toggle');

// === State ===
let currentWeatherData = null;
let currentCityInfo = null;
let currentSituation = 'casual';
let currentGender = 'male';
let currentLang = 'ko';

// === Translations ===
const translations = {
  ko: {
    title: '오늘 뭐 입지? - 날씨 기반 옷차림 추천',
    h1: '오늘 뭐 입지?',
    subtitle: '날씨 기반 옷차림 추천 서비스',
    cityPlaceholder: '도시 이름을 입력하세요 (예: Seoul, Busan)',
    search: '검색',
    currentLocation: '현재 위치로 검색',
    loading: '날씨 정보를 가져오는 중...',
    feelsLike: '체감',
    humidity: '습도',
    rainProb: '비 확률',
    wind: '바람',
    tempRange: '최고/최저',
    gender: '성별',
    male: '👨 남자',
    female: '👩 여자',
    situation: '상황별 코디',
    casual: '🧢 캐주얼',
    commute: '💼 출근',
    date: '💕 데이트',
    exercise: '🏃 운동',
    outfitTitle: '오늘의 추천 옷차림',
    aiNote: 'AI 생성 이미지입니다. 실제와 다를 수 있어요.',
    rainAlert: '<strong>비 예보!</strong> 우산을 챙기세요. 방수 소재의 겉옷과 방수 신발을 추천합니다.',
    snowAlert: '<strong>눈 예보!</strong> 미끄럼 방지 신발을 신고, 방수 소재의 아우터를 입으세요.',
    share: '카카오톡으로 공유하기',
    footer: 'Open-Meteo API 기반 | 무료 날씨 데이터 제공',
    // Errors
    '도시 검색에 실패했습니다.': '도시 검색에 실패했습니다.',
    '해당 도시를 찾을 수 없습니다. 영문 이름으로 다시 시도해 보세요.': '해당 도시를 찾을 수 없습니다. 영문 이름으로 다시 시도해 보세요.',
    '날씨 정보를 가져오지 못했습니다.': '날씨 정보를 가져오지 못했습니다.',
    '도시 이름을 입력해 주세요.': '도시 이름을 입력해 주세요.',
    '브라우저가 위치 정보를 지원하지 않습니다.': '브라우저가 위치 정보를 지원하지 않습니다.',
    '위치 정보를 가져올 수 없습니다. 위치 접근 권한을 허용해 주세요.': '위치 정보를 가져올 수 없습니다. 위치 접근 권한을 허용해 주세요.',
  },
  en: {
    title: 'What to Wear Today? - Weather-Based Outfit Recommendations',
    h1: 'What to Wear Today?',
    subtitle: 'Weather-Based Outfit Recommendations',
    cityPlaceholder: 'Enter a city name (e.g., London, New York)',
    search: 'Search',
    currentLocation: 'Use Current Location',
    loading: 'Fetching weather data...',
    feelsLike: 'Feels like',
    humidity: 'Humidity',
    rainProb: 'Rain %',
    wind: 'Wind',
    tempRange: 'High/Low',
    gender: 'Gender',
    male: '👨 Men',
    female: '👩 Women',
    situation: 'Occasion',
    casual: '🧢 Casual',
    commute: '💼 Commute',
    date: '💕 Date',
    exercise: '🏃 Exercise',
    outfitTitle: "Today's Outfit Recommendation",
    aiNote: 'Images are AI-generated and may differ from reality.',
    rainAlert: '<strong>Rain Alert!</strong> Take an umbrella. Waterproof outerwear and shoes are recommended.',
    snowAlert: '<strong>Snow Alert!</strong> Wear non-slip shoes and waterproof outerwear.',
    share: 'Share on KakaoTalk',
    footer: 'Powered by Open-Meteo API | Free Weather Data',
    // Errors
    '도시 검색에 실패했습니다.': 'Failed to search for the city.',
    '해당 도시를 찾을 수 없습니다. 영문 이름으로 다시 시도해 보세요.': 'City not found. Try again with an English name.',
    '날씨 정보를 가져오지 못했습니다.': 'Failed to fetch weather information.',
    '도시 이름을 입력해 주세요.': 'Please enter a city name.',
    '브라우저가 위치 정보를 지원하지 않습니다.': 'Geolocation is not supported by your browser.',
    '위치 정보를 가져올 수 없습니다. 위치 접근 권한을 허용해 주세요.': 'Unable to retrieve location. Please allow location access.',
  },
};

// === Kakao SDK ===
const KAKAO_APP_KEY = '';

function initKakao() {
  if (window.Kakao && KAKAO_APP_KEY && !window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_APP_KEY);
  }
}

// === API Endpoints ===
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// === Weather Code Descriptions ===
const weatherDescriptions = {
  ko: {
    0: '맑음', 1: '대체로 맑음', 2: '구름 조금', 3: '흐림', 45: '안개', 48: '짙은 안개',
    51: '가벼운 이슬비', 53: '이슬비', 55: '짙은 이슬비', 56: '가벼운 얼어붙는 이슬비',
    57: '짙은 얼어붙는 이슬비', 61: '약한 비', 63: '비', 65: '강한 비',
    66: '가벼운 얼어붙는 비', 67: '강한 얼어붙는 비', 71: '약한 눈', 73: '눈',
    75: '강한 눈', 77: '싸락눈', 80: '약한 소나기', 81: '소나기', 82: '강한 소나기',
    85: '약한 눈소나기', 86: '강한 눈소나기', 95: '뇌우', 96: '가벼운 우박 뇌우', 99: '강한 우박 뇌우',
  },
  en: {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle', 56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Light freezing rain', 67: 'Heavy freezing rain', 71: 'Slight snow fall', 73: 'Moderate snow fall',
    75: 'Heavy snow fall', 77: 'Snow grains', 80: 'Slight rain showers', 81: 'Moderate rain showers',
    82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
  }
};

// === Weather Icons ===
const weatherIcons = {
  0: '☀️', 1: '🌤️', 2: '☁️', 3: '☁️', 45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️', 56: '🌨️', 57: '🌨️',
  61: '🌧️', 63: '🌧️', 65: '🌧️', 66: '🌨️', 67: '🌨️',
  71: '❄️', 73: '🌨️', 75: '🌨️', 77: '🌨️', 80: '🌦️',
  81: '🌧️', 82: '🌧️', 85: '🌨️', 86: '🌨️', 95: '⛈️',
  96: '⛈️', 99: '⛈️',
};

// === AI Image Generation ===
const AI_IMAGE_CONFIG = {
  provider: 'pollinations',
  baseUrl: 'https://image.pollinations.ai/prompt/',
  width: 512,
  height: 512,
  outfitWidth: 640,
  outfitHeight: 900,
  extraParams: { nologo: 'true' },
};

const ITEM_LABELS = {
  beanie: 'beanie',
  blazer: 'blazer',
  blouse: 'blouse',
  boots: 'boots',
  cap: 'baseball cap',
  cardigan: 'cardigan',
  chinos: 'chinos',
  dress: 'dress',
  dressShoes: 'dress shoes',
  earMuffs: 'earmuffs',
  field_jacket: 'field jacket',
  fleece_leggings: 'fleece leggings',
  fleece_longSleeve: 'fleece long sleeve top',
  fleece_pants: 'fleece pants',
  fleece_puffer: 'fleece puffer jacket',
  fleece_slacks: 'fleece slacks',
  fleece_sweatshirt: 'fleece sweatshirt',
  fleece_training_pants: 'fleece training pants',
  functional_longSleeve: 'performance long sleeve top',
  functional_tshirt: 'performance t-shirt',
  gloves: 'winter gloves',
  heat_tech: 'thermal base layer',
  jacket: 'light jacket',
  jeans: 'jeans',
  jumper: 'zip-up jacket',
  knit: 'knit sweater',
  knit_tshirt: 'knit short sleeve top',
  knit_vest: 'knit vest',
  leather_jacket: 'leather jacket',
  leggings: 'leggings',
  loafers: 'loafers',
  longSleeve: 'long sleeve t-shirt',
  neck_warmer: 'neck warmer',
  puffer: 'puffer coat',
  puffer_vest: 'puffer vest',
  sandals: 'sandals',
  scarf: 'scarf',
  shirt: 'button-up shirt',
  shorts: 'shorts',
  skirt: 'skirt',
  slacks: 'slacks',
  sneakers: 'sneakers',
  sunglasses: 'sunglasses',
  sweatshirt: 'sweatshirt',
  tanktop: 'tank top',
  training_jacket: 'training jacket',
  training_leggings: 'training leggings',
  training_pants: 'training pants',
  trenchCoat: 'trench coat',
  tshirt: 't-shirt',
  turtleneck: 'turtleneck sweater',
  windbreaker: 'windbreaker',
  winterBoots: 'winter boots',
  woolCoat: 'wool coat',
};

const TEMP_PROMPTS = {
  veryHot: 'very hot weather',
  hot: 'hot weather',
  warm: 'warm weather',
  mild: 'mild weather',
  cool: 'cool weather',
  chilly: 'chilly weather',
  cold: 'cold weather',
  veryCold: 'very cold weather',
  freezing: 'freezing weather',
};

const SITUATION_PROMPTS = {
  casual: 'casual',
  commute: 'smart commute',
  date: 'date night',
  exercise: 'athleisure',
};

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildAIImageUrl(prompt, { width, height, seed } = {}) {
  const params = new URLSearchParams();
  params.set('width', width || AI_IMAGE_CONFIG.width);
  params.set('height', height || AI_IMAGE_CONFIG.height);
  if (seed !== undefined) params.set('seed', seed);
  Object.entries(AI_IMAGE_CONFIG.extraParams || {}).forEach(([key, value]) => {
    params.set(key, value);
  });
  return `${AI_IMAGE_CONFIG.baseUrl}${encodeURIComponent(prompt)}?${params.toString()}`;
}

function buildItemPrompt({ itemKey, gender, situation, category }) {
  const itemLabel = ITEM_LABELS[itemKey] || itemKey.replace(/_/g, ' ');
  const genderLabel = gender === 'male' ? 'men' : 'women';
  const situationLabel = SITUATION_PROMPTS[situation] || 'casual';
  const tempLabel = TEMP_PROMPTS[category] || 'mild weather';
  return [
    `Editorial lookbook studio photo of a ${itemLabel} for ${genderLabel}.`,
    `${situationLabel} style for ${tempLabel}.`,
    'Luxury fashion magazine aesthetic, soft diffused studio lighting, realistic fabric texture, high detail.',
    'Monotone palette (black, gray, white) with minimal accents.',
    'Soft neutral gradient background with subtle floor shadow, clean styling.',
    'No text, no logo, no watermark.',
  ].join(' ');
}

function buildOutfitPrompt({ gender, situation, category }) {
  const genderLabel = gender === 'male' ? 'men' : 'women';
  const situationLabel = SITUATION_PROMPTS[situation] || 'casual';
  const tempLabel = TEMP_PROMPTS[category] || 'mild weather';
  return [
    `Editorial lookbook studio photo, full-body ${genderLabel} outfit on a mannequin.`,
    `${situationLabel} look for ${tempLabel}.`,
    'Luxury fashion magazine aesthetic, soft diffused studio lighting, high detail.',
    'Monotone palette (black, gray, white) with minimal accents.',
    'Soft neutral gradient background with subtle floor shadow, clean styling.',
    'No text, no logo, no watermark.',
  ].join(' ');
}

function makeFallbackSvg(text, width = 300, height = 300) {
  const safeText = String(text || '').slice(0, 40);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#e2e8f0"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#64748b">${safeText}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function wireImageLoading(img, fallbackLabel, fallbackWidth, fallbackHeight) {
  img.classList.remove('is-loaded');
  img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  img.addEventListener('error', () => {
    img.src = makeFallbackSvg(fallbackLabel, fallbackWidth, fallbackHeight);
  }, { once: true });
}

// === Temperature Range Labels ===
const tempRangeLabels = {
  ko: {
    veryHot: { label: '🔥 매우 더움 (28°C 이상)', cssClass: 'very-hot' },
    hot: { label: '☀️ 더움 (23~27°C)', cssClass: 'hot' },
    warm: { label: '🌤️ 따뜻함 (20~22°C)', cssClass: 'warm' },
    mild: { label: '🌿 선선함 (17~19°C)', cssClass: 'mild' },
    cool: { label: '🍂 쌀쌀함 (12~16°C)', cssClass: 'cool' },
    chilly: { label: '🌬️ 쌀쌀함 (9~11°C)', cssClass: 'chilly' },
    cold: { label: '❄️ 추움 (5~8°C)', cssClass: 'cold' },
    veryCold: { label: '🥶 매우 추움 (0~4°C)', cssClass: 'very-cold' },
    freezing: { label: '🧊 한파 (0°C 미만)', cssClass: 'freezing' },
  },
  en: {
    veryHot: { label: '🔥 Very Hot (Above 28°C)', cssClass: 'very-hot' },
    hot: { label: '☀️ Hot (23-27°C)', cssClass: 'hot' },
    warm: { label: '🌤️ Warm (20-22°C)', cssClass: 'warm' },
    mild: { label: '🌿 Mild (17-19°C)', cssClass: 'mild' },
    cool: { label: '🍂 Cool (12-16°C)', cssClass: 'cool' },
    chilly: { label: '🌬️ Chilly (9-11°C)', cssClass: 'chilly' },
    cold: { label: '❄️ Cold (5-8°C)', cssClass: 'cold' },
    veryCold: { label: '🥶 Very Cold (0-4°C)', cssClass: 'very-cold' },
    freezing: { label: '🧊 Freezing (Below 0°C)', cssClass: 'freezing' },
  },
};

// === Helper Functions ===
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function showError(msgKey) {
  errorEl.textContent = translations[currentLang][msgKey] || msgKey;
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

function isRainy(code) { return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code); }
function isSnowy(code) { return [71, 73, 75, 77, 85, 86].includes(code); }

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
const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
let currentTheme = savedTheme || systemTheme;

function applyTheme(theme) {
  document.body.classList.toggle('dark-mode', theme === 'dark');
  localStorage.setItem('theme', theme);
  themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

themeToggleBtn.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
});

// === Language Toggle ===
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;
  
  const t = translations[lang];
  document.title = t.title;
  document.querySelector('h1').textContent = t.h1;
  document.querySelector('.subtitle').textContent = t.subtitle;
  cityInput.placeholder = t.cityPlaceholder;
  searchBtn.setAttribute('aria-label', t.search);
  document.querySelector('#location-btn').innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> ${t.currentLocation}`;
  document.querySelector('#loading p').textContent = t.loading;
  
  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.dataset.langKey;
    if (t[key]) {
      el.innerHTML = t[key];
    }
  });

  // Re-render components with new language
  if (currentWeatherData) {
    renderResult(currentCityInfo, currentWeatherData);
  }

  langToggleBtn.textContent = lang === 'ko' ? '🇺🇸' : '🇰🇷';
}

langToggleBtn.addEventListener('click', () => {
  const newLang = currentLang === 'ko' ? 'en' : 'ko';
  applyLanguage(newLang);
});


// === Geocoding ===
async function geocodeCity(cityName) {
  const url = `${GEO_API}?name=${encodeURIComponent(cityName)}&count=1&language=${currentLang}&format=json`;
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
  const rangeInfo = tempRangeLabels[currentLang][category];
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

  const fullOutfitImg = document.getElementById('full-outfit-img');
  const fullOutfitPrompt = buildOutfitPrompt({
    gender: currentGender,
    situation,
    category,
  });
  const fullOutfitUrl = buildAIImageUrl(fullOutfitPrompt, {
    width: AI_IMAGE_CONFIG.outfitWidth,
    height: AI_IMAGE_CONFIG.outfitHeight,
    seed: hashString(`outfit-${currentGender}-${situation}-${category}`) % 100000,
  });
  const fullOutfitContainer = document.getElementById('full-outfit-container');

  if (fullOutfitImg && fullOutfitContainer) {
    fullOutfitImg.classList.add('ai-image');
    fullOutfitImg.loading = 'lazy';
    fullOutfitImg.decoding = 'async';
    fullOutfitImg.src = fullOutfitUrl;
    fullOutfitImg.alt = `${currentGender === 'male' ? 'Men' : 'Women'} outfit example`;
    wireImageLoading(fullOutfitImg, fullOutfitImg.alt, AI_IMAGE_CONFIG.outfitWidth, AI_IMAGE_CONFIG.outfitHeight);
    fullOutfitContainer.classList.remove('hidden');
  } else if (fullOutfitContainer) {
    fullOutfitContainer.classList.add('hidden');
  }

  const cardsContainer = document.getElementById('outfit-cards');
  cardsContainer.innerHTML = items
    .map(([imgKey, name, desc]) => {
      const prompt = buildItemPrompt({
        itemKey: imgKey,
        gender: currentGender,
        situation,
        category,
      });
      const imgUrl = buildAIImageUrl(prompt, {
        seed: hashString(`${imgKey}-${currentGender}-${situation}-${category}`) % 100000,
      });
      return `
        <div class="outfit-card">
          <img class="outfit-img ai-image" src="${imgUrl}" alt="${name}" loading="lazy" decoding="async" data-label="${name}">
          <div class="name">${name}</div>
          <div class="desc">${desc}</div>
        </div>
      `;
    }).join('');

  cardsContainer.querySelectorAll('img.outfit-img').forEach((img) => {
    wireImageLoading(img, img.dataset.label || 'Outfit', AI_IMAGE_CONFIG.width, AI_IMAGE_CONFIG.height);
  });

  cardsContainer.classList.remove('fade-in');
  void cardsContainer.offsetWidth;
  cardsContainer.classList.add('fade-in');

  document.getElementById('outfit-tip').innerHTML = tip;
}

// === Render Result ===
function renderResult(cityInfo, weather) {
  currentWeatherData = weather;
  currentCityInfo = cityInfo;

  const t = translations[currentLang];
  const current = weather.current;
  const daily = weather.daily;
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const windSpeed = current.wind_speed_10m;
  const weatherCode = current.weather_code;
  const tempMax = Math.round(daily.temperature_2m_max[0]);
  const tempMin = Math.round(daily.temperature_2m_min[0]);
  const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;

  // Update static text
  document.querySelector('.detail-item:nth-child(1) span').childNodes[0].textContent = t.feelsLike + ' ';
  document.querySelector('.detail-item:nth-child(2) span').childNodes[0].textContent = t.humidity + ' ';
  document.querySelector('.detail-item:nth-child(3) span').childNodes[0].textContent = t.rainProb + ' ';
  document.querySelector('.detail-item:nth-child(4) span').childNodes[0].textContent = t.wind + ' ';
  document.querySelector('.detail-item:nth-child(5) span').childNodes[0].textContent = t.tempRange + ' ';
  document.querySelector('.gender-toggle .filter-label').textContent = t.gender;
  document.querySelector('.gender-btn[data-gender="male"]').textContent = t.male;
  document.querySelector('.gender-btn[data-gender="female"]').textContent = t.female;
  document.querySelector('.situation-filters .filter-label').textContent = t.situation;
  document.querySelector('.filter-btn[data-situation="casual"]').textContent = t.casual;
  document.querySelector('.filter-btn[data-situation="commute"]').textContent = t.commute;
  document.querySelector('.filter-btn[data-situation="date"]').textContent = t.date;
  document.querySelector('.filter-btn[data-situation="exercise"]').textContent = t.exercise;
  document.querySelector('.outfit-title').innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2 12 5.5 8 2l-4.38 1.46a2 2 0 0 0-1.34 2.23l2.1 12.6A2 2 0 0 0 6.35 20h11.3a2 2 0 0 0 1.97-1.71l2.1-12.6a2 2 0 0 0-1.34-2.23z"/></svg> ${t.outfitTitle}`;
  document.querySelector('#kakao-share-btn').innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 1C5.9 1 1 5.1 1 10.2c0 3.3 2.2 6.2 5.5 7.8l-1.1 4.1c-.1.2.1.4.3.4h.2l4.8-3.2c.7.1 1.5.2 2.3.2 6.1 0 11-4.1 11-9.3S18.1 1 12 1z" fill="#3C1E1E"/></svg> ${t.share}`;
  document.querySelector('.footer p').textContent = t.footer;

  // Weather info
  document.getElementById('weather-icon').textContent = weatherIcons[weatherCode] || '☀️';
  document.getElementById('temp').textContent = temp;
  document.getElementById('city-name').textContent = cityInfo.admin ? `${cityInfo.name}, ${cityInfo.admin}` : cityInfo.name;
  document.getElementById('weather-desc').textContent = weatherDescriptions[currentLang][weatherCode] || 'N/A';
  document.getElementById('feels-like').textContent = `${feelsLike}°C`;
  document.getElementById('humidity').textContent = `${humidity}%`;
  document.getElementById('rain-prob').textContent = `${rainProb}%`;
  document.getElementById('wind').textContent = `${windSpeed} km/h`;
  document.getElementById('temp-range').textContent = `${tempMax}° / ${tempMin}°`;

  // Outfit recommendation
  renderOutfit(feelsLike, currentSituation);

  // Weather alert (rain/snow)
  const alertEl = document.getElementById('weather-alert');
  if (isRainy(weatherCode)) {
    alertEl.className = 'weather-alert rain';
    alertEl.innerHTML = `<span class="alert-icon">☔</span><span>${t.rainAlert}</span>`;
    show(alertEl);
  } else if (isSnowy(weatherCode)) {
    alertEl.className = 'weather-alert snow';
    alertEl.innerHTML = `<span class="alert-icon">❄️</span><span>${t.snowAlert}</span>`;
    show(alertEl);
  } else {
    hide(alertEl);
  }

  hide(loadingEl);
  hide(errorEl);
  show(resultEl);
}

// === Main Search Handler ===
async function searchByCity(cityName) {
  if (!cityName.trim()) {
    showError('도시 이름을 입력해 주세요.');
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
searchBtn.addEventListener('click', () => searchByCity(cityInput.value));
cityInput.addEventListener('keydown', (e) => e.key === 'Enter' && searchByCity(cityInput.value));

locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('브라우저가 위치 정보를 지원하지 않습니다.');
    return;
  }

  hide(resultEl);
  hide(errorEl);
  show(loadingEl);

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      const name = currentLang === 'ko' ? '현재 위치' : 'Current Location';
      const cityInfo = { name, admin: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`, country: '' };
      const weather = await fetchWeather(latitude, longitude);
      renderResult(cityInfo, weather);
    },
    () => {
      showError('위치 정보를 가져올 수 없습니다. 위치 접근 권한을 허용해 주세요.');
    }
  );
});

document.querySelectorAll('.gender-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentGender = btn.dataset.gender;
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (currentWeatherData) {
      renderOutfit(Math.round(currentWeatherData.current.apparent_temperature), currentSituation);
    }
  });
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentSituation = btn.dataset.situation;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (currentWeatherData) {
      renderOutfit(Math.round(currentWeatherData.current.apparent_temperature), currentSituation);
    }
  });
});

document.getElementById('kakao-share-btn').addEventListener('click', () => {
  if (!currentWeatherData) return;
  // This is a simplified share function. A real implementation would be more robust.
  const text = `${currentCityInfo.name}: ${currentWeatherData.current.temperature_2m}°C`;
  navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
});


// === Init ===
function init() {
  const savedLanguage = localStorage.getItem('language') || 'ko';
  applyLanguage(savedLanguage);
  applyTheme(currentTheme);
  initKakao();
  searchByCity('Seoul');
}

init();
