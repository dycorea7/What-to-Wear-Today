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
  loafers: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=300&h=300&fit=crop',
  dressShoes: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=300&h=300&fit=crop',
  winterBoots: 'https://images.unsplash.com/photo-1542840410-3092f99611a3?w=300&h=300&fit=crop',
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

// === Outfit Recommendations by Temperature Range (Casual / Default) ===
const outfitData = {
  veryHot: {
    label: '\uD83D\uDD25 매우 더움 (28\u00B0C 이상)',
    cssClass: 'very-hot',
    items: [
      { icon: '\uD83D\uDC55', name: '민소매', desc: '시원하게' },
      { icon: '\uD83D\uDC5A', name: '반팔 티셔츠', desc: '면 소재' },
      { icon: '\uD83E\uDE73', name: '반바지', desc: '통풍 좋은' },
      { icon: '\uD83D\uDC57', name: '원피스', desc: '린넨 소재' },
      { icon: '\uD83E\uDD7F', name: '샌들', desc: '통풍 좋은' },
      { icon: '\uD83E\uDDE2', name: '모자', desc: '자외선 차단' },
    ],
    tip: '\uD83D\uDCA1 자외선이 강해요! 선크림을 꼭 바르고, 얇고 통풍 잘 되는 옷을 입으세요. 밝은 색상의 옷이 열을 덜 흡수합니다.',
  },
  hot: {
    label: '\u2600\uFE0F 더움 (23~27\u00B0C)',
    cssClass: 'hot',
    items: [
      { icon: '\uD83D\uDC55', name: '반팔 티셔츠', desc: '면/린넨' },
      { icon: '\uD83D\uDC5A', name: '얇은 셔츠', desc: '오버핏' },
      { icon: '\uD83E\uDE73', name: '반바지', desc: '면 소재' },
      { icon: '\uD83D\uDC56', name: '면바지', desc: '얇은 소재' },
      { icon: '\uD83D\uDC5F', name: '스니커즈', desc: '가벼운' },
    ],
    tip: '\uD83D\uDCA1 쾌적한 여름 날씨에요. 반팔에 면바지 조합이면 충분하지만, 실내 냉방이 강할 수 있으니 얇은 가디건을 챙기면 좋아요.',
  },
  warm: {
    label: '\uD83C\uDF24\uFE0F 따뜻함 (20~22\u00B0C)',
    cssClass: 'warm',
    items: [
      { icon: '\uD83D\uDC5A', name: '긴팔 티', desc: '얇은 소재' },
      { icon: '\uD83D\uDC54', name: '블라우스', desc: '가벼운' },
      { icon: '\uD83D\uDC56', name: '슬랙스', desc: '면 소재' },
      { icon: '\uD83D\uDC57', name: '원피스', desc: '긴팔' },
      { icon: '\uD83D\uDC5F', name: '로퍼', desc: '클래식' },
    ],
    tip: '\uD83D\uDCA1 나들이하기 좋은 날씨에요! 긴팔 하나면 충분하고, 활동량이 많다면 반팔도 괜찮아요.',
  },
  mild: {
    label: '\uD83C\uDF3F 선선함 (17~19\u00B0C)',
    cssClass: 'mild',
    items: [
      { icon: '\uD83E\uDDE5', name: '가디건', desc: '얇은 니트' },
      { icon: '\uD83D\uDC55', name: '맨투맨', desc: '기본템' },
      { icon: '\uD83D\uDC56', name: '청바지', desc: '데님' },
      { icon: '\uD83D\uDC5A', name: '얇은 니트', desc: '캐시미어' },
      { icon: '\uD83D\uDC5F', name: '운동화', desc: '편한' },
    ],
    tip: '\uD83D\uDCA1 아침저녁으로 쌀쌀할 수 있어요. 가디건이나 얇은 겉옷을 걸치면 좋아요. 레이어드 코디를 추천해요!',
  },
  cool: {
    label: '\uD83C\uDF42 쌀쌀함 (12~16\u00B0C)',
    cssClass: 'cool',
    items: [
      { icon: '\uD83E\uDDE5', name: '자켓', desc: '가벼운' },
      { icon: '\uD83D\uDC55', name: '가디건', desc: '두꺼운' },
      { icon: '\uD83E\uDDE5', name: '야상', desc: '캐주얼' },
      { icon: '\uD83D\uDC56', name: '청바지', desc: '기본' },
      { icon: '\uD83D\uDC56', name: '면바지', desc: '두꺼운' },
      { icon: '\uD83E\uDDE6', name: '스타킹', desc: '보온' },
    ],
    tip: '\uD83D\uDCA1 겉옷이 필수인 날씨에요! 자켓이나 야상을 챙기세요. 안에는 니트나 맨투맨이 적당해요.',
  },
  chilly: {
    label: '\uD83C\uDF43 쌀쌀함 (9~11\u00B0C)',
    cssClass: 'chilly',
    items: [
      { icon: '\uD83E\uDDE5', name: '트렌치코트', desc: '클래식' },
      { icon: '\uD83E\uDDE5', name: '야상', desc: '방풍' },
      { icon: '\uD83E\uDDE5', name: '점퍼', desc: '캐주얼' },
      { icon: '\uD83D\uDC56', name: '기모바지', desc: '보온' },
      { icon: '\uD83E\uDDE6', name: '스타킹', desc: '기모' },
      { icon: '\uD83E\uDDF4', name: '니트', desc: '두꺼운' },
    ],
    tip: '\uD83D\uDCA1 아우터가 꼭 필요해요! 트렌치코트나 점퍼를 추천하고, 안에는 두꺼운 니트를 입으세요.',
  },
  cold: {
    label: '\u2744\uFE0F 추움 (5~8\u00B0C)',
    cssClass: 'cold',
    items: [
      { icon: '\uD83E\uDDE5', name: '울코트', desc: '보온성 좋은' },
      { icon: '\uD83D\uDC55', name: '히트텍', desc: '내복 대용' },
      { icon: '\uD83E\uDDE5', name: '가죽자켓', desc: '방풍' },
      { icon: '\uD83D\uDC56', name: '기모바지', desc: '두꺼운' },
      { icon: '\uD83E\uDDF4', name: '목폴라', desc: '목 보온' },
      { icon: '\uD83E\uDDE3', name: '머플러', desc: '목도리' },
    ],
    tip: '\uD83D\uDCA1 확실한 방한이 필요해요! 히트텍 위에 니트, 그 위에 코트를 입는 레이어드가 효과적이에요.',
  },
  veryCold: {
    label: '\uD83E\uDD76 매우 추움 (0~4\u00B0C)',
    cssClass: 'very-cold',
    items: [
      { icon: '\uD83E\uDDE5', name: '패딩', desc: '롱패딩' },
      { icon: '\uD83E\uDDE5', name: '두꺼운 코트', desc: '울/캐시미어' },
      { icon: '\uD83D\uDC55', name: '히트텍', desc: '필수' },
      { icon: '\uD83E\uDDE3', name: '목도리', desc: '두꺼운' },
      { icon: '\uD83E\uDDE4', name: '장갑', desc: '방한' },
      { icon: '\uD83D\uDC56', name: '기모바지', desc: '두꺼운 기모' },
    ],
    tip: '\uD83D\uDCA1 한파 수준이에요! 히트텍 + 니트 + 패딩 조합으로 완전 무장하세요. 목도리, 장갑 필수입니다.',
  },
  freezing: {
    label: '\u26C4 한파 (-10\u00B0C 이하~0\u00B0C 미만)',
    cssClass: 'freezing',
    items: [
      { icon: '\uD83E\uDDE5', name: '롱패딩', desc: '무릎 아래' },
      { icon: '\uD83D\uDC55', name: '히트텍', desc: '상하 세트' },
      { icon: '\uD83E\uDDE3', name: '목도리', desc: '두꺼운' },
      { icon: '\uD83E\uDDE4', name: '장갑', desc: '방한 필수' },
      { icon: '\uD83E\uDDCB', name: '귀마개', desc: '방한' },
      { icon: '\uD83E\uDD7E', name: '방한부츠', desc: '보온/방수' },
    ],
    tip: '\uD83D\uDCA1 외출을 최소화하세요! 나갈 때는 히트텍 상하 + 기모 + 롱패딩 + 목도리 + 장갑 + 귀마개 완전 방한이 필요해요.',
  },
};

// === Situation-specific Outfit Recommendations ===
const situationOutfits = {
  commute: {
    veryHot: {
      items: [
        { icon: '\uD83D\uDC54', name: '반팔 셔츠', desc: '쿨비즈' },
        { icon: '\uD83D\uDC56', name: '면 슬랙스', desc: '얇은 소재' },
        { icon: '\uD83D\uDC5E', name: '로퍼', desc: '통풍 좋은' },
        { icon: '\uD83D\uDC5C', name: '서류가방', desc: '가벼운' },
        { icon: '\uD83E\uDDF4', name: '선크림', desc: '필수' },
      ],
      tip: '\uD83D\uDCA1 쿨비즈 스타일로 반팔 셔츠에 면 슬랙스를 추천해요. 사무실 냉방 대비 얇은 카디건을 가방에 넣어두세요.',
    },
    hot: {
      items: [
        { icon: '\uD83D\uDC54', name: '반팔 셔츠', desc: '린넨/면' },
        { icon: '\uD83D\uDC56', name: '슬랙스', desc: '얇은 소재' },
        { icon: '\uD83D\uDC5E', name: '로퍼', desc: '클래식' },
        { icon: '\uD83E\uDDE5', name: '가디건', desc: '냉방 대비' },
      ],
      tip: '\uD83D\uDCA1 반팔 셔츠가 적당한 출근 날씨에요. 사무실에 얇은 가디건이나 블레이저를 두면 냉방 대비에 좋아요.',
    },
    warm: {
      items: [
        { icon: '\uD83D\uDC54', name: '셔츠', desc: '긴팔' },
        { icon: '\uD83D\uDC56', name: '슬랙스', desc: '면 소재' },
        { icon: '\uD83E\uDDE5', name: '가디건', desc: '얇은' },
        { icon: '\uD83D\uDC5E', name: '구두', desc: '클래식' },
      ],
      tip: '\uD83D\uDCA1 긴팔 셔츠 한 장이면 딱 좋은 출근 날씨에요. 가벼운 가디건을 걸치면 깔끔한 오피스룩 완성!',
    },
    mild: {
      items: [
        { icon: '\uD83E\uDDE5', name: '블레이저', desc: '가벼운' },
        { icon: '\uD83D\uDC54', name: '셔츠', desc: '긴팔' },
        { icon: '\uD83D\uDC56', name: '슬랙스', desc: '기본' },
        { icon: '\uD83D\uDC5E', name: '구두', desc: '편한' },
        { icon: '\uD83E\uDDE3', name: '스카프', desc: '포인트' },
      ],
      tip: '\uD83D\uDCA1 블레이저를 걸치면 멋진 출근룩이 완성돼요. 실내에서는 셔츠만으로도 충분해요.',
    },
    cool: {
      items: [
        { icon: '\uD83E\uDDE5', name: '트렌치코트', desc: '클래식' },
        { icon: '\uD83D\uDC54', name: '셔츠', desc: '긴팔' },
        { icon: '\uD83E\uDDF6', name: '니트 조끼', desc: '레이어드' },
        { icon: '\uD83D\uDC56', name: '슬랙스', desc: '울 소재' },
        { icon: '\uD83D\uDC62', name: '앵클부츠', desc: '가죽' },
      ],
      tip: '\uD83D\uDCA1 트렌치코트가 잘 어울리는 출근 날씨에요. 안에 니트 조끼를 레이어드하면 따뜻하고 세련돼요!',
    },
    chilly: {
      items: [
        { icon: '\uD83E\uDDE5', name: '울코트', desc: '미디 길이' },
        { icon: '\uD83E\uDDF6', name: '니트', desc: '두꺼운' },
        { icon: '\uD83D\uDC56', name: '기모 슬랙스', desc: '보온' },
        { icon: '\uD83E\uDDE3', name: '머플러', desc: '포인트' },
        { icon: '\uD83D\uDC62', name: '부츠', desc: '가죽' },
      ],
      tip: '\uD83D\uDCA1 울코트에 니트를 매치하세요. 기모 슬랙스로 하의 보온도 챙기면 따뜻한 출근이 가능해요.',
    },
    cold: {
      items: [
        { icon: '\uD83E\uDDE5', name: '울코트', desc: '롱 기장' },
        { icon: '\uD83D\uDC55', name: '히트텍', desc: '기본' },
        { icon: '\uD83E\uDDF6', name: '니트', desc: '목폴라' },
        { icon: '\uD83D\uDC56', name: '기모 슬랙스', desc: '두꺼운' },
        { icon: '\uD83E\uDDE3', name: '머플러', desc: '필수' },
        { icon: '\uD83E\uDDE4', name: '장갑', desc: '가죽' },
      ],
      tip: '\uD83D\uDCA1 히트텍 위에 니트, 그 위에 롱코트를 입으세요. 머플러와 장갑도 챙기면 따뜻한 출근길!',
    },
    veryCold: {
      items: [
        { icon: '\uD83E\uDDE5', name: '패딩', desc: '롱패딩' },
        { icon: '\uD83D\uDC55', name: '히트텍', desc: '상하 세트' },
        { icon: '\uD83E\uDDF6', name: '니트', desc: '두꺼운' },
        { icon: '\uD83D\uDC56', name: '기모 슬랙스', desc: '두꺼운 기모' },
        { icon: '\uD83E\uDDE3', name: '머플러', desc: '두꺼운' },
        { icon: '\uD83E\uDDE4', name: '장갑', desc: '방한' },
      ],
      tip: '\uD83D\uDCA1 출근 시 완전 방한이 필요해요! 롱패딩 안에 히트텍+니트 조합, 머플러와 장갑은 필수입니다.',
    },
    freezing: {
      items: [
        { icon: '\uD83E\uDDE5', name: '롱패딩', desc: '무릎 아래' },
        { icon: '\uD83D\uDC55', name: '히트텍', desc: '상하 세트' },
        { icon: '\uD83E\uDDF6', name: '목폴라', desc: '두꺼운' },
        { icon: '\uD83E\uDDE3', name: '머플러', desc: '필수' },
        { icon: '\uD83E\uDDE4', name: '장갑', desc: '필수' },
        { icon: '\uD83E\uDDE2', name: '귀마개', desc: '방한' },
      ],
      tip: '\uD83D\uDCA1 한파에도 출근은 해야죠! 최대한 방한하고, 사무실에 여분의 따뜻한 옷을 두세요.',
    },
  },
  date: {
    veryHot: {
      items: [
        { icon: '\uD83D\uDC57', name: '원피스', desc: '린넨 소재' },
        { icon: '\uD83D\uDC55', name: '반팔 니트', desc: '깔끔한' },
        { icon: '\uD83E\uDE73', name: '반바지', desc: '깔끔한' },
        { icon: '\uD83E\uDD7F', name: '샌들', desc: '스트랩' },
        { icon: '\uD83D\uDD76\uFE0F', name: '선글라스', desc: '포인트' },
      ],
      tip: '\uD83D\uDCA1 시원하면서도 깔끔한 데이트룩! 린넨 원피스나 반팔 니트에 깔끔한 반바지 조합을 추천해요.',
    },
    hot: {
      items: [
        { icon: '\uD83D\uDC55', name: '반팔 니트', desc: '깔끔한' },
        { icon: '\uD83D\uDC57', name: '원피스', desc: '면 소재' },
        { icon: '\uD83D\uDC56', name: '면바지', desc: '슬림핏' },
        { icon: '\uD83D\uDC5F', name: '스니커즈', desc: '화이트' },
      ],
      tip: '\uD83D\uDCA1 반팔 니트나 깔끔한 티에 면바지 조합으로 센스있는 데이트룩을 완성하세요!',
    },
    warm: {
      items: [
        { icon: '\uD83D\uDC5A', name: '블라우스', desc: '포인트' },
        { icon: '\uD83D\uDC56', name: '슬랙스', desc: '깔끔한' },
        { icon: '\uD83D\uDC57', name: '롱원피스', desc: '플로럴' },
        { icon: '\uD83D\uDC5F', name: '로퍼', desc: '클래식' },
        { icon: '\uD83D\uDC5C', name: '미니백', desc: '포인트' },
      ],
      tip: '\uD83D\uDCA1 데이트하기 딱 좋은 날씨! 블라우스나 원피스로 로맨틱한 분위기를 연출해보세요.',
    },
    mild: {
      items: [
        { icon: '\uD83E\uDDE5', name: '가디건', desc: '니트' },
        { icon: '\uD83D\uDC5A', name: '블라우스', desc: '레이어드' },
        { icon: '\uD83D\uDC56', name: '청바지', desc: '슬림핏' },
        { icon: '\uD83D\uDC5F', name: '스니커즈', desc: '깔끔한' },
        { icon: '\uD83E\uDDE3', name: '스카프', desc: '포인트' },
      ],
      tip: '\uD83D\uDCA1 가디건을 활용한 레이어드 코디로 센스있는 데이트룩을 완성하세요!',
    },
    cool: {
      items: [
        { icon: '\uD83E\uDDE5', name: '자켓', desc: '가죽/데님' },
        { icon: '\uD83E\uDDF6', name: '니트', desc: '캐시미어' },
        { icon: '\uD83D\uDC56', name: '슬랙스', desc: '깔끔한' },
        { icon: '\uD83D\uDC62', name: '앵클부츠', desc: '스타일리시' },
        { icon: '\uD83E\uDDE3', name: '스카프', desc: '포인트' },
      ],
      tip: '\uD83D\uDCA1 자켓에 니트 조합으로 세련된 데이트룩! 앵클부츠로 마무리하면 완벽해요.',
    },
    chilly: {
      items: [
        { icon: '\uD83E\uDDE5', name: '코트', desc: '핸드메이드' },
        { icon: '\uD83E\uDDF6', name: '니트', desc: '터틀넥' },
        { icon: '\uD83D\uDC56', name: '슬랙스', desc: '울 소재' },
        { icon: '\uD83D\uDC62', name: '롱부츠', desc: '스타일리시' },
        { icon: '\uD83E\uDDE3', name: '머플러', desc: '캐시미어' },
      ],
      tip: '\uD83D\uDCA1 코트에 터틀넥 니트 조합으로 따뜻하면서도 세련된 데이트룩을 완성하세요!',
    },
    cold: {
      items: [
        { icon: '\uD83E\uDDE5', name: '롱코트', desc: '울/캐시미어' },
        { icon: '\uD83E\uDDF6', name: '니트', desc: '두꺼운' },
        { icon: '\uD83D\uDC56', name: '기모바지', desc: '슬림핏' },
        { icon: '\uD83E\uDDE3', name: '머플러', desc: '포인트' },
        { icon: '\uD83E\uDDE4', name: '장갑', desc: '가죽' },
      ],
      tip: '\uD83D\uDCA1 추운 날의 데이트는 실내 위주로! 롱코트에 두꺼운 니트로 따뜻하면서도 멋스럽게!',
    },
    veryCold: {
      items: [
        { icon: '\uD83E\uDDE5', name: '롱패딩', desc: '스타일리시' },
        { icon: '\uD83D\uDC55', name: '히트텍', desc: '기본' },
        { icon: '\uD83E\uDDF6', name: '니트', desc: '두꺼운' },
        { icon: '\uD83D\uDC56', name: '기모바지', desc: '두꺼운' },
        { icon: '\uD83E\uDDE3', name: '머플러', desc: '포인트' },
        { icon: '\uD83E\uDDE4', name: '장갑', desc: '방한' },
      ],
      tip: '\uD83D\uDCA1 따뜻한 실내 데이트를 추천해요! 나갈 때는 롱패딩에 히트텍+니트로 방한하세요.',
    },
    freezing: {
      items: [
        { icon: '\uD83E\uDDE5', name: '롱패딩', desc: '무릎 아래' },
        { icon: '\uD83D\uDC55', name: '히트텍', desc: '상하 세트' },
        { icon: '\uD83E\uDDF6', name: '목폴라', desc: '두꺼운' },
        { icon: '\uD83E\uDDE3', name: '머플러', desc: '두꺼운' },
        { icon: '\uD83E\uDDE4', name: '장갑', desc: '필수' },
        { icon: '\uD83E\uDDE2', name: '비니', desc: '보온' },
      ],
      tip: '\uD83D\uDCA1 이런 날은 따뜻한 카페나 실내 데이트가 최고에요! 완전 방한 후 이동하세요.',
    },
  },
  exercise: {
    veryHot: {
      items: [
        { icon: '\uD83D\uDC55', name: '반팔 기능성', desc: '흡습속건' },
        { icon: '\uD83E\uDE73', name: '운동 반바지', desc: '통풍' },
        { icon: '\uD83D\uDC5F', name: '운동화', desc: '가벼운' },
        { icon: '\uD83E\uDDE2', name: '캡모자', desc: '자외선 차단' },
        { icon: '\uD83D\uDCA7', name: '물병', desc: '수분보충 필수' },
      ],
      tip: '\uD83D\uDCA1 폭염에는 실내 운동을 추천해요! 야외 운동 시 수분 보충을 자주 하고, 자외선 차단에 신경 쓰세요.',
    },
    hot: {
      items: [
        { icon: '\uD83D\uDC55', name: '반팔 기능성', desc: '흡습속건' },
        { icon: '\uD83E\uDE73', name: '운동 반바지', desc: '가벼운' },
        { icon: '\uD83D\uDC5F', name: '운동화', desc: '통기성' },
        { icon: '\uD83E\uDDE2', name: '캡모자', desc: '자외선 차단' },
      ],
      tip: '\uD83D\uDCA1 기능성 소재의 반팔에 반바지면 충분해요. 수분 보충을 잊지 마세요!',
    },
    warm: {
      items: [
        { icon: '\uD83D\uDC55', name: '반팔 기능성', desc: '흡습속건' },
        { icon: '\uD83D\uDC56', name: '레깅스', desc: '기본' },
        { icon: '\uD83E\uDDE5', name: '바람막이', desc: '얇은' },
        { icon: '\uD83D\uDC5F', name: '운동화', desc: '쿠셔닝' },
      ],
      tip: '\uD83D\uDCA1 운동하기 좋은 날씨! 반팔에 레깅스, 워밍업 전에 얇은 바람막이를 걸치세요.',
    },
    mild: {
      items: [
        { icon: '\uD83D\uDC55', name: '긴팔 기능성', desc: '흡습속건' },
        { icon: '\uD83D\uDC56', name: '레깅스', desc: '기본' },
        { icon: '\uD83E\uDDE5', name: '바람막이', desc: '방풍' },
        { icon: '\uD83D\uDC5F', name: '운동화', desc: '쿠셔닝' },
      ],
      tip: '\uD83D\uDCA1 긴팔 기능성 티에 레깅스 조합이 딱이에요. 바람막이를 챙기면 좋아요!',
    },
    cool: {
      items: [
        { icon: '\uD83D\uDC55', name: '기모 맨투맨', desc: '보온' },
        { icon: '\uD83D\uDC56', name: '트레이닝 팬츠', desc: '기모' },
        { icon: '\uD83E\uDDE5', name: '바람막이', desc: '방풍' },
        { icon: '\uD83D\uDC5F', name: '운동화', desc: '쿠셔닝' },
        { icon: '\uD83E\uDDE4', name: '장갑', desc: '얇은' },
      ],
      tip: '\uD83D\uDCA1 기모 소재로 보온하면서 운동하세요. 바람막이로 방풍도 챙기면 쾌적한 운동이 가능해요.',
    },
    chilly: {
      items: [
        { icon: '\uD83E\uDDE5', name: '트레이닝 자켓', desc: '기모' },
        { icon: '\uD83D\uDC55', name: '기능성 긴팔', desc: '보온' },
        { icon: '\uD83D\uDC56', name: '기모 레깅스', desc: '보온' },
        { icon: '\uD83D\uDC5F', name: '운동화', desc: '보온' },
        { icon: '\uD83E\uDDE4', name: '장갑', desc: '터치' },
        { icon: '\uD83E\uDDE3', name: '넥워머', desc: '보온' },
      ],
      tip: '\uD83D\uDCA1 기모 트레이닝복 세트를 추천해요. 워밍업을 충분히 하고 부상에 주의하세요!',
    },
    cold: {
      items: [
        { icon: '\uD83E\uDDE5', name: '패딩 조끼', desc: '보온' },
        { icon: '\uD83D\uDC55', name: '기모 기능성', desc: '보온' },
        { icon: '\uD83D\uDC56', name: '기모 트레이닝', desc: '두꺼운' },
        { icon: '\uD83E\uDDE4', name: '장갑', desc: '방한' },
        { icon: '\uD83E\uDDE3', name: '넥워머', desc: '필수' },
        { icon: '\uD83D\uDC5F', name: '운동화', desc: '보온' },
      ],
      tip: '\uD83D\uDCA1 실내 운동을 추천해요! 야외 시 패딩 조끼에 기모 운동복, 충분한 워밍업은 필수입니다.',
    },
    veryCold: {
      items: [
        { icon: '\uD83E\uDDE5', name: '기모 패딩', desc: '운동용' },
        { icon: '\uD83D\uDC55', name: '히트텍', desc: '기능성' },
        { icon: '\uD83D\uDC56', name: '기모 레깅스', desc: '두꺼운' },
        { icon: '\uD83E\uDDE4', name: '장갑', desc: '방한' },
        { icon: '\uD83E\uDDE3', name: '넥워머', desc: '필수' },
        { icon: '\uD83E\uDDE2', name: '비니', desc: '보온' },
      ],
      tip: '\uD83D\uDCA1 이런 날은 실내 운동이 최선이에요! 부득이 야외 운동 시 완전 방한 후 충분한 워밍업!',
    },
    freezing: {
      items: [
        { icon: '\uD83E\uDDE5', name: '기모 패딩', desc: '두꺼운' },
        { icon: '\uD83D\uDC55', name: '히트텍', desc: '상하 세트' },
        { icon: '\uD83D\uDC56', name: '기모 레깅스', desc: '이중' },
        { icon: '\uD83E\uDDE4', name: '장갑', desc: '방한 필수' },
        { icon: '\uD83E\uDDE3', name: '넥워머', desc: '필수' },
        { icon: '\uD83E\uDDE2', name: '비니', desc: '귀덮개' },
      ],
      tip: '\uD83D\uDCA1 야외 운동은 위험해요! 실내 체육관이나 홈트레이닝을 강력 추천합니다.',
    },
  },
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

// === Render Weather & Outfit ===
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
      showError('\uC704\uCE58 \uC815\uBCF4\uB97C \uAC00\uC838\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC704\uCE58 \uC811\uADFC \uAD8C\uD55C\uC744 \uD5C8\uC6A9\uD574 \uC8FC\uC138\uC694.');
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
document.getElementById('kakao-share-btn').addEventListener('click', shareWeather);

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
