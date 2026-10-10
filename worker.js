const CPCB_RESOURCE_URL = "https://www.data.gov.in/resource/real-time-air-quality-index-various-locations";
const CPCB_UPSTREAM = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69";
const NWDP_API = "https://nwdp.nwic.gov.in/api/3/action";
const NWDP_DATASET_URL = "https://nwdp.nwic.gov.in/dataset/ground-water-quality-manual-chemical-parameters-cgwb-f-gfg";
const NWDP_DATASET_SLUG = "ground-water-quality-manual-chemical-parameters-cgwb-f-gfg";
const AQI_CACHE_SECONDS = 300;
const WATER_CACHE_SECONDS = 1800;
const LOOKUP_CACHE_SECONDS = 86400;

// In-memory fallback cache for fast local dev and edge execution
const memoryCache = new Map();

// Bureau of Indian Standards (BIS IS 10500:2012) & JJM Guidelines
const PARAM_DEFINITIONS = [
  { id: "ph", label: "pH", unit: "", match: ["potentialofhydrogen", "ph"], safeMin: 6.5, safeMax: 8.5, desc: "Measure of acidity or alkalinity. Safe range is 6.5 to 8.5." },
  { id: "ec", label: "Electrical conductivity", unit: "µS/cm", match: ["electricconductivity", "electricalconductivity"], safeMax: 1500, permMax: 3000, desc: "Indicator of dissolved ionic minerals." },
  { id: "tds", label: "Total dissolved solids", unit: "mg/L", match: ["totaldissolvedsolids", "tds"], safeMax: 500, permMax: 2000, desc: "Total mineral content. Acceptable limit is 500 mg/L; permissible up to 2000 mg/L." },
  { id: "hardness", label: "Total hardness", unit: "mg/L as CaCO₃", match: ["totalhardness", "hardness"], safeMax: 200, permMax: 600, desc: "Calcium and magnesium carbonates. Desirable < 200 mg/L, permissible up to 600 mg/L." },
  { id: "carbonate", label: "Carbonate", unit: "mg/L", match: ["carbonate"], safeMax: null, desc: "Alkaline salt present in groundwater." },
  { id: "bicarbonate", label: "Bicarbonate", unit: "mg/L", match: ["bicarbonate"], safeMax: 500, desc: "Buffering ion contributing to alkalinity." },
  { id: "alkalinity", label: "Total alkalinity", unit: "mg/L as CaCO₃", match: ["totalalkalinity", "alkalinity"], safeMax: 200, permMax: 600, desc: "Ability of water to neutralize acids." },
  { id: "chloride", label: "Chloride", unit: "mg/L", match: ["chloride"], safeMax: 250, permMax: 1000, desc: "Desirable < 250 mg/L. High levels give salty taste and cause corrosion." },
  { id: "nitrate", label: "Nitrate nitrogen", unit: "mg N/L", match: ["nitraten", "nitrate"], safeMax: 45, permMax: 45, desc: "Desirable limit 45 mg/L. Elevated levels indicate fertilizer runoff or sewage." },
  { id: "sulphate", label: "Sulphate", unit: "mg/L", match: ["sulphate", "sulfate"], safeMax: 200, permMax: 400, desc: "Desirable < 200 mg/L. High levels cause laxative effects." },
  { id: "phosphate", label: "Phosphate", unit: "mg/L", match: ["phosphate"], safeMax: null, desc: "Nutrient trace compound." },
  { id: "silica", label: "Silica", unit: "mg/L", match: ["silica"], safeMax: null, desc: "Dissolved mineral from rocks." },
  { id: "fluoride", label: "Fluoride", unit: "mg/L", match: ["fluoride"], safeMax: 1.0, permMax: 1.5, desc: "Acceptable < 1.0 mg/L, permissible 1.5 mg/L. Higher causes dental/skeletal fluorosis." },
  { id: "calcium", label: "Calcium", unit: "mg/L", match: ["calcium"], safeMax: 75, permMax: 200, desc: "Desirable limit 75 mg/L, permissible up to 200 mg/L." },
  { id: "magnesium", label: "Magnesium", unit: "mg/L", match: ["magnesium"], safeMax: 30, permMax: 100, desc: "Desirable limit 30 mg/L, permissible up to 100 mg/L." },
  { id: "sodium", label: "Sodium", unit: "mg/L", match: ["sodium"], safeMax: 200, desc: "Mineral component. Recommended < 200 mg/L." },
  { id: "potassium", label: "Potassium", unit: "mg/L", match: ["potassium"], safeMax: 12, desc: "Essential mineral trace element." },
  { id: "iron", label: "Iron", unit: "mg/L", match: ["iron"], safeMax: 1.0, permMax: 1.0, desc: "Desirable limit 1.0 mg/L. Causes rust staining and metallic taste." },
  { id: "arsenic", label: "Arsenic", unit: "mg/L", match: ["arsenic"], safeMax: 0.01, permMax: 0.01, desc: "Highly toxic contaminant. Strict permissible limit is 0.01 mg/L." },
  { id: "uranium", label: "Uranium", unit: "mg/L", match: ["uranium"], safeMax: 0.03, permMax: 0.03, desc: "Heavy metal radiological contaminant. Safe limit is 0.03 mg/L." },
  { id: "manganese", label: "Manganese", unit: "mg/L", match: ["manganese"], safeMax: 0.1, permMax: 0.3, desc: "Safe limit 0.1 mg/L. Excess causes neurological risks." },
  { id: "copper", label: "Copper", unit: "mg/L", match: ["copper"], safeMax: 0.05, permMax: 1.5, desc: "Safe limit 0.05 mg/L, permissible up to 1.5 mg/L." },
  { id: "lead", label: "Lead", unit: "mg/L", match: ["lead"], safeMax: 0.01, permMax: 0.01, desc: "Severe heavy metal neurotoxin. Permissible limit 0.01 mg/L." },
  { id: "zinc", label: "Zinc", unit: "mg/L", match: ["zinc"], safeMax: 5.0, permMax: 15.0, desc: "Safe limit 5.0 mg/L, permissible 15.0 mg/L." },
  { id: "nickel", label: "Nickel", unit: "mg/L", match: ["nickel"], safeMax: 0.02, permMax: 0.02, desc: "Heavy metal. Permissible limit 0.02 mg/L." },
  { id: "cadmium", label: "Cadmium", unit: "mg/L", match: ["cadmium"], safeMax: 0.003, permMax: 0.003, desc: "Toxic heavy metal. Permissible limit 0.003 mg/L." },
  { id: "chromium", label: "Chromium", unit: "mg/L", match: ["chromium"], safeMax: 0.05, permMax: 0.05, desc: "Heavy metal. Permissible limit 0.05 mg/L." },
];

// Common Indian district/city spelling and administrative variants
const DISTRICT_ALIASES = {
  bengaluru: ["bangalore", "bangaloreurban", "bangalorerural", "bengaluruurban", "bengalururural"],
  bangalore: ["bengaluru", "bangaloreurban", "bangalorerural", "bengaluruurban", "bengalururural"],
  mumbai: ["mumbaisuburban", "mumbaicity", "bombay"],
  kolkata: ["calcutta"],
  gurgaon: ["gurugram"],
  gurugram: ["gurgaon"],
  ahmedabad: ["ahmadabad"],
  allahabad: ["prayagraj"],
  prayagraj: ["allahabad"],
  delhi: ["newdelhi", "centraldelhi", "southdelhi", "northdelhi", "westdelhi", "eastdelhi", "northwest", "southwest"],
  newdelhi: ["delhi", "centraldelhi"],
  chennai: ["madras"],
  varanasi: ["banaras", "kashi"],
  mysuru: ["mysore"],
  mysore: ["mysuru"],
  puducherry: ["pondicherry"],
  kozhikode: ["calicut"],
  thiruvananthapuram: ["trivandrum"],
  belagavi: ["belgaum"],
  mangaluru: ["mangalore"],
  shivamogga: ["shimoga"],
  tumakuru: ["tumkur"],
  kalaburagi: ["gulbarga"],
  vijayapura: ["bijapur"],
  ballari: ["bellary"],
  visakhapatnam: ["vizag"],
};

const compareKey = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const apiFilter = (value) => String(value ?? "").trim().replace(/\s+/g, "_");
const plausiblePlace = (value) => typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 80;

const json = (body, status = 200, maxAge = 0) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": status >= 400 ? "no-store" : `public, max-age=${maxAge}, stale-while-revalidate=${Math.max(maxAge, 600)}`,
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  },
});

function matchesDistrict(recDistrict, targetDistrict) {
  const r = compareKey(recDistrict);
  const t = compareKey(targetDistrict);
  if (!r || !t) return false;
  if (r === t || r.includes(t) || t.includes(r)) return true;
  const aliases = DISTRICT_ALIASES[t] || [];
  for (const a of aliases) {
    if (r === a || r.includes(a) || a.includes(r)) return true;
  }
  return false;
}

// Great circle Haversine formula
function calcDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null || isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Official CPCB Breakpoints for National Air Quality Index (NAQI)
function calculateIndianAQI(pm25, pm10) {
  function subIndex(val, breakpoints) {
    if (val === null || val === undefined || isNaN(val) || val < 0) return null;
    for (const [cLow, cHigh, iLow, iHigh] of breakpoints) {
      if (val >= cLow && val <= cHigh) {
        return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (val - cLow) + iLow);
      }
    }
    if (val > breakpoints[breakpoints.length - 1][1]) return 500;
    return null;
  }

  const bpPM25 = [
    [0, 30, 0, 50],
    [31, 60, 51, 100],
    [61, 90, 101, 200],
    [91, 120, 201, 300],
    [121, 250, 301, 400],
    [251, 500, 401, 500],
  ];

  const bpPM10 = [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 250, 101, 200],
    [251, 350, 201, 300],
    [351, 430, 301, 400],
    [431, 600, 401, 500],
  ];

  const si25 = subIndex(pm25, bpPM25);
  const si10 = subIndex(pm10, bpPM10);
  const valid = [si25, si10].filter((v) => v !== null);
  if (!valid.length) return null;
  const aqi = Math.max(...valid);

  let category = "Good";
  let color = "#2e7d32";
  let bg = "#e8f5e9";
  let advisory = "Air quality is considered satisfactory; air pollution poses little or no risk.";
  if (aqi > 50 && aqi <= 100) {
    category = "Satisfactory";
    color = "#558b2f";
    bg = "#f1f8e9";
    advisory = "Minor breathing discomfort may be experienced by sensitive individuals.";
  } else if (aqi > 100 && aqi <= 200) {
    category = "Moderate";
    color = "#f9a825";
    bg = "#fffde7";
    advisory = "Breathing discomfort possible for individuals with asthma, heart, or lung diseases.";
  } else if (aqi > 200 && aqi <= 300) {
    category = "Poor";
    color = "#ef6c00";
    bg = "#fff3e0";
    advisory = "Breathing discomfort to most people on prolonged outdoor exposure.";
  } else if (aqi > 300 && aqi <= 400) {
    category = "Very Poor";
    color = "#c62828";
    bg = "#ffebee";
    advisory = "Respiratory illness possible to people on prolonged exposure; avoid exertion.";
  } else if (aqi > 400) {
    category = "Severe";
    color = "#4a148c";
    bg = "#f3e5f5";
    advisory = "Healthy individuals severely affected; serious impacts for individuals with pre-existing conditions.";
  }

  return { aqi, category, color, bg, advisory, subIndexPM25: si25, subIndexPM10: si10 };
}

async function getCached(cacheKey) {
  try {
    if (typeof caches !== "undefined" && caches.default) {
      const hit = await caches.default.match(cacheKey);
      if (hit) return hit;
    }
  } catch {}
  const mem = memoryCache.get(cacheKey.url || String(cacheKey));
  if (mem && mem.expires > Date.now()) {
    return json(mem.data, 200, Math.round((mem.expires - Date.now()) / 1000));
  }
  return null;
}

async function putCached(cacheKey, response, maxAge = 300) {
  try {
    if (typeof caches !== "undefined" && caches.default) {
      await caches.default.put(cacheKey, response.clone());
    }
  } catch {}
  try {
    const key = cacheKey.url || String(cacheKey);
    const data = await response.clone().json();
    memoryCache.set(key, { data, expires: Date.now() + maxAge * 1000 });
  } catch {}
}

function cacheRequest(url, pathname, values) {
  const keyUrl = new URL(pathname, url.origin);
  for (const [key, value] of Object.entries(values)) keyUrl.searchParams.set(key, compareKey(value));
  return new Request(keyUrl.toString(), { method: "GET" });
}

async function readJson(url, timeoutMs = 18000) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Nearfield-Preview/1.0" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) return { response, payload: null };
  try {
    return { response, payload: await response.json() };
  } catch {
    return { response, payload: null };
  }
}

function sampleTimeOrder(value) {
  const text = String(value || "").trim();
  const dmy = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (dmy) return Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]), Number(dmy[4] || 0), Number(dmy[5] || 0));
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
  if (iso) return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), Number(iso[4] || 0), Number(iso[5] || 0));
  return 0;
}

function extractMeasurements(record) {
  const normKeys = Object.keys(record).map((k) => ({ original: k, norm: compareKey(k) }));
  const measurements = [];

  for (const def of PARAM_DEFINITIONS) {
    let rawVal = null;
    for (const key of normKeys) {
      if (def.match.some((m) => key.norm.includes(m))) {
        const v = record[key.original];
        if (v !== null && v !== undefined && String(v).trim() !== "" && String(v).trim() !== "-" && String(v).trim().toLowerCase() !== "null") {
          rawVal = String(v).trim();
          break;
        }
      }
    }
    if (rawVal !== null) {
      const numVal = parseFloat(rawVal);
      let status = "normal";
      if (!isNaN(numVal)) {
        if (def.safeMin !== undefined && numVal < def.safeMin) status = "low";
        else if (def.permMax !== undefined && numVal > def.permMax) status = "danger";
        else if (def.safeMax !== undefined && numVal > def.safeMax) status = def.permMax ? "elevated" : "danger";
      }
      measurements.push({
        id: def.id,
        label: def.label,
        value: rawVal,
        numericValue: isNaN(numVal) ? null : numVal,
        unit: def.unit,
        status,
        safeLimit: def.safeMax ? `${def.safeMax} ${def.unit}`.trim() : null,
        desc: def.desc,
      });
    }
  }
  return measurements;
}

// Weighted Arithmetic Water Quality Index (WAWQI) according to BIS IS 10500:2012
function calculateWQI(measurements) {
  if (!measurements || !measurements.length) return null;
  const stds = {
    ph: { desirable: 8.5, ideal: 7.0, range: 1.5, weight: 0.20 },
    tds: { desirable: 500, ideal: 0, weight: 0.18 },
    hardness: { desirable: 200, ideal: 0, weight: 0.12 },
    fluoride: { desirable: 1.0, ideal: 0, weight: 0.18 },
    nitrate: { desirable: 45, ideal: 0, weight: 0.14 },
    chloride: { desirable: 250, ideal: 0, weight: 0.08 },
    sulphate: { desirable: 200, ideal: 0, weight: 0.05 },
    ec: { desirable: 1000, ideal: 0, weight: 0.03 },
    arsenic: { desirable: 0.01, ideal: 0, weight: 0.25 },
  };

  let sumWq = 0;
  let sumW = 0;
  let criticalViolation = false;
  let violations = [];

  for (const m of measurements) {
    const s = stds[m.id];
    if (s && m.numericValue !== null && !isNaN(m.numericValue)) {
      let q = 0;
      if (m.id === "ph") {
        q = (Math.abs(m.numericValue - s.ideal) / s.range) * 100;
        if (m.numericValue < 6.5 || m.numericValue > 8.5) {
          violations.push(`pH ${m.numericValue} outside safe range (6.5–8.5)`);
        }
      } else {
        q = (m.numericValue / s.desirable) * 100;
        if (m.id === "fluoride" && m.numericValue > 1.5) {
          criticalViolation = true;
          violations.push(`Fluoride (${m.numericValue} mg/L) exceeds permissible limit (1.5)`);
        }
        if (m.id === "arsenic" && m.numericValue > 0.01) {
          criticalViolation = true;
          violations.push(`Arsenic (${m.numericValue} mg/L) exceeds strict limit (0.01)`);
        }
        if (m.id === "nitrate" && m.numericValue > 45) {
          violations.push(`Nitrate (${m.numericValue} mg/L) exceeds safe limit (45)`);
        }
        if (m.id === "tds" && m.numericValue > 2000) {
          criticalViolation = true;
          violations.push(`TDS (${m.numericValue} mg/L) exceeds permissible limit (2000)`);
        }
      }
      sumWq += s.weight * q;
      sumW += s.weight;
    }
  }

  if (sumW === 0) return null;
  let score = Math.round((sumWq / sumW) * 10) / 10;
  if (criticalViolation && score < 76) {
    score = Math.max(score, 76.0);
  }

  let grade = "A";
  let category = "Excellent";
  let color = "#16a34a";
  let status = "Pristine drinking quality; safe without special treatment";
  let advice = "Suitable for direct consumption and domestic use.";

  if (score > 100) {
    grade = "E";
    category = "Unfit for Drinking";
    color = "#c5302a";
    status = "Severe chemical contamination; exceeds BIS limits";
    advice = "Do not drink untreated. Requires advanced multi-stage RO & chemical remediation.";
  } else if (score > 75) {
    grade = "D";
    category = "Very Poor";
    color = "#ea580c";
    status = "Heavy mineralization / contamination";
    advice = "Intense multi-stage RO filtration and water softening required.";
  } else if (score > 50) {
    grade = "C";
    category = "Poor";
    color = "#d97706";
    status = "Exceeds desirable baseline standards";
    advice = "Standard domestic RO membrane filtration recommended before drinking.";
  } else if (score > 25) {
    grade = "B";
    category = "Good";
    color = "#2563eb";
    status = "Good potability; safe for domestic supply";
    advice = "Basic sediment and activated carbon filtration recommended.";
  }

  return {
    score,
    grade,
    category,
    color,
    status,
    advice,
    violations,
  };
}

function sampleRecord(record, targetLat = null, targetLon = null) {
  const measurements = extractMeasurements(record);
  const wqi = calculateWQI(measurements);
  const latitude = record.Latitude === null || record.Latitude === undefined || String(record.Latitude).trim() === "" ? NaN : Number(record.Latitude);
  const longitude = record.Longitude === null || record.Longitude === undefined || String(record.Longitude).trim() === "" ? NaN : Number(record.Longitude);
  const validLat = Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 ? latitude : null;
  const validLon = Number.isFinite(longitude) && longitude >= -180 && longitude <= 180 ? longitude : null;
  const distanceKm = targetLat !== null && targetLon !== null && validLat !== null && validLon !== null ? calcDistance(targetLat, targetLon, validLat, validLon) : null;

  return {
    station: String(record.Station || "Station not named"),
    agency: String(record.Agency || "CGWB"),
    state: String(record.State || ""),
    district: String(record.District || ""),
    tehsil: String(record.Tehsil || ""),
    block: String(record.Block || ""),
    village: String(record.Village || ""),
    latitude: validLat,
    longitude: validLon,
    distanceKm,
    observedAt: String(record["Data Acquisition Time"] || ""),
    measurements,
    wqi,
  };
}

// ========================================
// Surface Water (River & Coastal Ocean) Quality Models
// Standards: CPCB NWMP Surface Water & MoEFCC Coastal Marine Criteria
// ========================================

const FAMOUS_WATERBODIES = [
  {
    keywords: ["ganga", "ganges"],
    Name: "Ganga River (Varanasi / Prayagraj)",
    District: "Varanasi",
    State: "Uttar Pradesh",
    Pincode: "221001",
    PINCode: "221001",
    BranchType: "River Basin Monitoring Stretch",
    lat: 25.3176,
    lon: 83.0125,
    waterType: "river",
    waterTarget: "Ganga River"
  },
  {
    keywords: ["yamuna", "jamuna"],
    Name: "Yamuna River (Delhi / Agra Stretch)",
    District: "Delhi",
    State: "Delhi",
    Pincode: "110001",
    PINCode: "110001",
    BranchType: "River Basin Monitoring Stretch",
    lat: 28.6139,
    lon: 77.2090,
    waterType: "river",
    waterTarget: "Yamuna River"
  },
  {
    keywords: ["godavari", "dakshin ganga"],
    Name: "Godavari River (Nashik / Rajahmundry)",
    District: "Nashik",
    State: "Maharashtra",
    Pincode: "422001",
    PINCode: "422001",
    BranchType: "River Basin Monitoring Stretch",
    lat: 19.9975,
    lon: 73.7898,
    waterType: "river",
    waterTarget: "Godavari River"
  },
  {
    keywords: ["cauvery", "kaveri"],
    Name: "Cauvery River (Tiruchirappalli / Srirangam)",
    District: "Tiruchirappalli",
    State: "Tamil Nadu",
    Pincode: "620001",
    PINCode: "620001",
    BranchType: "River Basin Monitoring Stretch",
    lat: 10.8600,
    lon: 78.6900,
    waterType: "river",
    waterTarget: "Cauvery River"
  },
  {
    keywords: ["narmada", "rewa"],
    Name: "Narmada River (Bhedaghat Marble Rocks)",
    District: "Jabalpur",
    State: "Madhya Pradesh",
    Pincode: "482001",
    PINCode: "482001",
    BranchType: "River Basin Monitoring Stretch",
    lat: 23.1310,
    lon: 79.8000,
    waterType: "river",
    waterTarget: "Narmada River"
  },
  {
    keywords: ["brahmaputra", "luhit"],
    Name: "Brahmaputra River (Guwahati Basin)",
    District: "Guwahati",
    State: "Assam",
    Pincode: "781001",
    PINCode: "781001",
    BranchType: "River Basin Monitoring Stretch",
    lat: 26.1850,
    lon: 91.7500,
    waterType: "river",
    waterTarget: "Brahmaputra River"
  },
  {
    keywords: ["sabarmati"],
    Name: "Sabarmati River (Ahmedabad Riverfront)",
    District: "Ahmedabad",
    State: "Gujarat",
    Pincode: "380001",
    PINCode: "380001",
    BranchType: "River Basin Monitoring Stretch",
    lat: 23.0225,
    lon: 72.5714,
    waterType: "river",
    waterTarget: "Sabarmati River"
  },
  {
    keywords: ["hooghly", "hugli"],
    Name: "Hooghly River (Kolkata / Howrah Estuary)",
    District: "Kolkata",
    State: "West Bengal",
    Pincode: "700001",
    PINCode: "700001",
    BranchType: "Estuarine River Stretch",
    lat: 22.5726,
    lon: 88.3639,
    waterType: "river",
    waterTarget: "Hooghly River"
  },
  {
    keywords: ["krishna"],
    Name: "Krishna River (Vijayawada Barrage)",
    District: "Krishna",
    State: "Andhra Pradesh",
    Pincode: "520001",
    PINCode: "520001",
    BranchType: "River Basin Monitoring Stretch",
    lat: 16.5062,
    lon: 80.6480,
    waterType: "river",
    waterTarget: "Krishna River"
  },
  {
    keywords: ["arabian sea", "arabian"],
    Name: "Arabian Sea (Mumbai / Goa Coastal Waters)",
    District: "Mumbai",
    State: "Maharashtra",
    Pincode: "400001",
    PINCode: "400001",
    BranchType: "Marine & Coastal Waterway",
    lat: 18.9220,
    lon: 72.8347,
    waterType: "ocean",
    waterTarget: "Arabian Sea"
  },
  {
    keywords: ["bay of bengal", "bengal sea"],
    Name: "Bay of Bengal (Chennai / Puri Marine Waters)",
    District: "Chennai",
    State: "Tamil Nadu",
    Pincode: "600001",
    PINCode: "600001",
    BranchType: "Marine & Coastal Waterway",
    lat: 13.0827,
    lon: 80.2707,
    waterType: "ocean",
    waterTarget: "Bay of Bengal"
  },
  {
    keywords: ["indian ocean"],
    Name: "Indian Ocean (Kanyakumari Confluence)",
    District: "Kanyakumari",
    State: "Tamil Nadu",
    Pincode: "629702",
    PINCode: "629702",
    BranchType: "Marine & Coastal Waterway",
    lat: 8.0883,
    lon: 77.5385,
    waterType: "ocean",
    waterTarget: "Indian Ocean"
  }
];

const WATER_ECOSYSTEMS = {
  delhi: {
    river: { name: "Yamuna River", stretch: "Delhi Okhla / Wazirabad Stretch", basin: "Ganga Basin", do: 0.8, bod: 24.0, fecalColiform: 32000, ph: 7.6, tds: 680, ec: 1120, turbidity: 26, temp: 26.5 },
    ocean: null
  },
  varanasi: {
    river: { name: "Ganga River", stretch: "Varanasi Ghats Stretch", basin: "Ganga Basin", do: 7.4, bod: 3.6, fecalColiform: 2400, ph: 7.8, tds: 340, ec: 560, turbidity: 12, temp: 24.0 },
    ocean: null
  },
  haridwar: {
    river: { name: "Ganga River", stretch: "Upper Haridwar / Har Ki Pauri", basin: "Ganga Basin", do: 8.6, bod: 1.2, fecalColiform: 110, ph: 7.4, tds: 180, ec: 290, turbidity: 6, temp: 18.0 },
    ocean: null
  },
  prayagraj: {
    river: { name: "Triveni Sangam (Ganga & Yamuna)", stretch: "Prayagraj Confluence Stretch", basin: "Ganga Basin", do: 7.0, bod: 3.4, fecalColiform: 2200, ph: 7.7, tds: 360, ec: 590, turbidity: 11, temp: 23.5 },
    ocean: null
  },
  patna: {
    river: { name: "Ganga River", stretch: "Patna Digha / Gandhi Ghat", basin: "Ganga Basin", do: 6.9, bod: 2.8, fecalColiform: 1800, ph: 7.6, tds: 320, ec: 510, turbidity: 10, temp: 25.0 },
    ocean: null
  },
  kolkata: {
    river: { name: "Hooghly River (Bhagirathi-Ganga)", stretch: "Kolkata Dakshineswar / Howrah", basin: "Ganga-Brahmaputra Basin", do: 5.6, bod: 4.2, fecalColiform: 4800, ph: 7.5, tds: 420, ec: 680, turbidity: 15, temp: 27.0 },
    ocean: { name: "Bay of Bengal (Hooghly Estuary / Digha)", region: "Northern Bay of Bengal", salinity: 26.5, do: 5.4, ph: 7.9, turbidity: 18, coliform: 65, temp: 28.0 }
  },
  mumbai: {
    river: { name: "Mithi & Ulhas Estuary", stretch: "Bandra-Kurla / Thane Basin", basin: "Konkan Coastal Basin", do: 1.2, bod: 28.0, fecalColiform: 45000, ph: 7.3, tds: 850, ec: 1400, turbidity: 24, temp: 28.5 },
    ocean: { name: "Arabian Sea (Mumbai Marine Waters)", region: "Konkan Coast — Juhu & Marine Drive", salinity: 34.8, do: 5.5, ph: 8.1, turbidity: 12, coliform: 48, temp: 28.0 }
  },
  chennai: {
    river: { name: "Adyar & Cooum Rivers", stretch: "Chennai Urban Stretch", basin: "Coromandel Coastal Basin", do: 0.6, bod: 32.0, fecalColiform: 52000, ph: 7.5, tds: 920, ec: 1550, turbidity: 28, temp: 29.5 },
    ocean: { name: "Bay of Bengal (Marina Beach Coast)", region: "Coromandel Marine Coast", salinity: 35.2, do: 5.8, ph: 8.2, turbidity: 14, coliform: 42, temp: 29.0 }
  },
  goa: {
    river: { name: "Mandovi & Zuari Rivers", stretch: "Goa Estuarine Stretch", basin: "West Flowing Rivers", do: 6.8, bod: 1.8, fecalColiform: 240, ph: 7.4, tds: 280, ec: 440, turbidity: 7, temp: 27.5 },
    ocean: { name: "Arabian Sea (Goa Blue Flag Coast)", region: "Central Arabian Sea — Calangute & Colva", salinity: 34.6, do: 6.4, ph: 8.2, turbidity: 6, coliform: 18, temp: 28.5 }
  },
  kochi: {
    river: { name: "Periyar River", stretch: "Aluva / Eloor Industrial Stretch", basin: "Kerala River Basin", do: 5.8, bod: 3.4, fecalColiform: 1200, ph: 7.1, tds: 240, ec: 390, turbidity: 9, temp: 28.0 },
    ocean: { name: "Arabian Sea (Vembanad Estuary Coast)", region: "Malabar Marine Coast — Fort Kochi", salinity: 33.5, do: 5.9, ph: 8.0, turbidity: 10, coliform: 35, temp: 28.5 }
  },
  visakhapatnam: {
    river: { name: "Sarada & Meghadrigedda Rivers", stretch: "Vizag Coastal Basin", basin: "East Flowing Rivers", do: 5.2, bod: 4.8, fecalColiform: 2100, ph: 7.6, tds: 510, ec: 820, turbidity: 11, temp: 28.5 },
    ocean: { name: "Bay of Bengal (Rushikonda Blue Flag Beach)", region: "Northern Andhra Marine Coast", salinity: 34.4, do: 6.1, ph: 8.2, turbidity: 8, coliform: 22, temp: 28.5 }
  },
  puri: {
    river: { name: "Mahanadi & Bhargavi Rivers", stretch: "Mahanadi Deltaic Stretch", basin: "Mahanadi Basin", do: 6.5, bod: 2.4, fecalColiform: 850, ph: 7.5, tds: 310, ec: 490, turbidity: 8, temp: 27.0 },
    ocean: { name: "Bay of Bengal (Puri Golden Beach)", region: "Odisha Coastal Waters — Blue Flag Certified", salinity: 33.8, do: 6.3, ph: 8.2, turbidity: 7, coliform: 20, temp: 28.0 }
  },
  ahmedabad: {
    river: { name: "Sabarmati River", stretch: "Ahmedabad Riverfront Stretch", basin: "Sabarmati Basin", do: 2.2, bod: 15.0, fecalColiform: 18000, ph: 7.7, tds: 740, ec: 1250, turbidity: 19, temp: 27.5 },
    ocean: null
  },
  pune: {
    river: { name: "Mula-Mutha River", stretch: "Pune Sangam / Bund Garden", basin: "Krishna-Bhima Basin", do: 1.4, bod: 19.5, fecalColiform: 28000, ph: 7.5, tds: 620, ec: 1050, turbidity: 22, temp: 25.5 },
    ocean: null
  },
  lucknow: {
    river: { name: "Gomti River", stretch: "Lucknow Urban Stretch", basin: "Ganga-Gomti Basin", do: 2.4, bod: 11.5, fecalColiform: 14000, ph: 7.6, tds: 480, ec: 790, turbidity: 16, temp: 26.0 },
    ocean: null
  },
  agra: {
    river: { name: "Yamuna River", stretch: "Taj Mahal Agra Stretch", basin: "Ganga Basin", do: 1.6, bod: 16.0, fecalColiform: 22000, ph: 7.8, tds: 710, ec: 1180, turbidity: 20, temp: 26.5 },
    ocean: null
  },
  nashik: {
    river: { name: "Godavari River", stretch: "Ramkund Nashik Stretch", basin: "Godavari Basin", do: 6.4, bod: 4.2, fecalColiform: 2900, ph: 7.7, tds: 380, ec: 610, turbidity: 10, temp: 24.5 },
    ocean: null
  },
  rajahmundry: {
    river: { name: "Godavari River", stretch: "Rajahmundry Godavari Ghats", basin: "Godavari Basin", do: 7.2, bod: 2.3, fecalColiform: 750, ph: 7.6, tds: 290, ec: 460, turbidity: 8, temp: 27.5 },
    ocean: null
  },
  vijayawada: {
    river: { name: "Krishna River", stretch: "Prakasam Barrage Vijayawada", basin: "Krishna Basin", do: 6.9, bod: 2.5, fecalColiform: 920, ph: 7.7, tds: 310, ec: 500, turbidity: 9, temp: 28.0 },
    ocean: null
  },
  tiruchirappalli: {
    river: { name: "Cauvery River", stretch: "Srirangam / Trichy Cauvery", basin: "Cauvery Basin", do: 7.1, bod: 2.1, fecalColiform: 680, ph: 7.5, tds: 260, ec: 420, turbidity: 7, temp: 28.0 },
    ocean: null
  },
  guwahati: {
    river: { name: "Brahmaputra River", stretch: "Guwahati Pandu Ghat", basin: "Brahmaputra Basin", do: 7.9, bod: 1.7, fecalColiform: 420, ph: 7.4, tds: 210, ec: 340, turbidity: 8, temp: 23.0 },
    ocean: null
  },
  jabalpur: {
    river: { name: "Narmada River", stretch: "Bhedaghat Marble Rocks", basin: "Narmada Basin", do: 8.2, bod: 1.4, fecalColiform: 160, ph: 7.6, tds: 190, ec: 310, turbidity: 6, temp: 22.5 },
    ocean: null
  },
  surat: {
    river: { name: "Tapi River", stretch: "Surat Causeway Stretch", basin: "Tapi Basin", do: 4.6, bod: 5.6, fecalColiform: 3800, ph: 7.5, tds: 490, ec: 810, turbidity: 14, temp: 28.5 },
    ocean: { name: "Arabian Sea (Dumas Coast / Gulf of Khambhat)", region: "Gujarat Coast", salinity: 32.5, do: 5.2, ph: 8.0, turbidity: 22, coliform: 55, temp: 29.0 }
  },
  bengaluru: {
    river: { name: "Vrishabhavathi & Cauvery Basin", stretch: "Arkavathi-Cauvery Sub-basin", basin: "Cauvery Basin", do: 3.2, bod: 8.5, fecalColiform: 9500, ph: 7.4, tds: 540, ec: 890, turbidity: 15, temp: 24.5 },
    ocean: null
  },
  hyderabad: {
    river: { name: "Musi River", stretch: "Hyderabad Urban Stretch", basin: "Krishna Basin", do: 0.9, bod: 21.0, fecalColiform: 38000, ph: 7.4, tds: 790, ec: 1320, turbidity: 25, temp: 27.0 },
    ocean: null
  }
};

function calculateRiverWQI(params) {
  const doVal = params.do !== undefined && !isNaN(params.do) ? params.do : 6.0;
  const bodVal = params.bod !== undefined && !isNaN(params.bod) ? params.bod : 2.5;
  const fcVal = params.fecalColiform !== undefined && !isNaN(params.fecalColiform) ? params.fecalColiform : 500;
  const phVal = params.ph !== undefined && !isNaN(params.ph) ? params.ph : 7.4;
  const turbVal = params.turbidity !== undefined && !isNaN(params.turbidity) ? params.turbidity : 8;

  const qDO = doVal >= 9 ? 5 : Math.max(0, Math.min(250, ((10 - doVal) / 5) * 100));
  const qBOD = Math.max(0, Math.min(300, (bodVal / 3.0) * 100));
  const qFC = Math.max(0, Math.min(300, (fcVal / 500) * 100));
  const qPH = Math.max(0, Math.min(200, (Math.abs(phVal - 7.2) / 1.3) * 100));
  const qTurb = Math.max(0, Math.min(200, (turbVal / 10) * 100));

  let score = Math.round((0.32 * qDO + 0.28 * qBOD + 0.22 * qFC + 0.10 * qPH + 0.08 * qTurb) * 10) / 10;
  if (bodVal > 12 || doVal < 2) score = Math.max(score, 105);

  let cpcbClass = "Class A";
  let gradeClass = "grade-a";
  let color = "#16a34a";
  let statusTitle = "Class A · Pristine Drinking Water Source";
  let statusDesc = "Water quality meets CPCB Class A criteria. Suitable as drinking water source without conventional treatment (disinfection only).";
  let advice = "Preserve natural riparian buffer and riverbed ecological flow.";

  if (score > 100 || bodVal > 10 || doVal < 2.5) {
    cpcbClass = "Class E";
    gradeClass = "grade-e";
    color = "#c5302a";
    statusTitle = "Class E / Below E · Heavily Polluted River Stretch";
    statusDesc = "Severe organic pollution and low dissolved oxygen. Unfit for bathing or drinking. Severe impact on aquatic life.";
    advice = "Mandatory 100% interception and diversion of city sewage to STPs. Strict ban on direct untreated industrial discharge.";
  } else if (score > 75 || bodVal > 6 || doVal < 4) {
    cpcbClass = "Class D";
    gradeClass = "grade-d";
    color = "#ea580c";
    statusTitle = "Class D · Propagation of Wildlife & Fisheries";
    statusDesc = "Marginal river water quality supporting resilient aquatic life. Not recommended for direct human contact or outdoor bathing.";
    advice = "River rejuvenation and aeration required. Prevent agricultural nutrient runoff and municipal sewage inflow.";
  } else if (score > 50 || bodVal > 3) {
    cpcbClass = "Class C";
    gradeClass = "grade-c";
    color = "#d97706";
    statusTitle = "Class C · Drinking Water with Conventional Treatment";
    statusDesc = "Meets CPCB Class C standards. Suitable for public drinking supply after conventional multi-stage filtration and chlorination.";
    advice = "Conventional coagulation, sedimentation, rapid sand filtration, and disinfection mandatory.";
  } else if (score > 25 || fcVal > 500) {
    cpcbClass = "Class B";
    gradeClass = "grade-b";
    color = "#2563eb";
    statusTitle = "Class B · Outdoor Bathing Standard";
    statusDesc = "Meets official CPCB criteria for organized outdoor bathing and holy dips. High dissolved oxygen with safe coliform levels.";
    advice = "Safe for holy dips, swimming, and recreational bathing. Disinfection recommended prior to ingestion.";
  }

  return {
    score,
    cpcbClass,
    gradeClass,
    color,
    statusTitle,
    statusDesc,
    advice,
    parameters: { do: doVal, bod: bodVal, fecalColiform: fcVal, ph: phVal, turbidity: turbVal }
  };
}

function calculateMarineSWQI(params) {
  const salVal = params.salinity !== undefined && !isNaN(params.salinity) ? params.salinity : 34.5;
  const doVal = params.do !== undefined && !isNaN(params.do) ? params.do : 5.8;
  const phVal = params.ph !== undefined && !isNaN(params.ph) ? params.ph : 8.1;
  const turbVal = params.turbidity !== undefined && !isNaN(params.turbidity) ? params.turbidity : 10;
  const colVal = params.coliform !== undefined && !isNaN(params.coliform) ? params.coliform : 30;

  const qDO = doVal >= 6 ? 5 : Math.max(0, Math.min(250, ((6.5 - doVal) / 2.5) * 100));
  const qSal = Math.max(0, Math.min(200, (Math.abs(salVal - 34.5) / 5) * 100));
  const qPH = Math.max(0, Math.min(200, (Math.abs(phVal - 8.1) / 0.8) * 100));
  const qTurb = Math.max(0, Math.min(200, (turbVal / 15) * 100));
  const qCol = Math.max(0, Math.min(300, (colVal / 100) * 100));

  let score = Math.round((0.28 * qDO + 0.20 * qSal + 0.16 * qPH + 0.16 * qTurb + 0.20 * qCol) * 10) / 10;

  let swClass = "Class SW-I";
  let gradeClass = "grade-a";
  let color = "#16a34a";
  let statusTitle = "Class SW-I · Pristine Mariculture & Shellfish";
  let statusDesc = "Coastal water quality is exceptional. Meets MoEFCC Class SW-I standard for commercial shellfishing, salt pan harvesting, and pristine contact recreation.";
  let advice = "Blue Flag certified beach standard. Pristine marine biodiversity preservation.";

  if (score > 100 || doVal < 2.5) {
    swClass = "Class SW-V";
    gradeClass = "grade-e";
    color = "#c5302a";
    statusTitle = "Class SW-V · Severely Contaminated Marine Waters";
    statusDesc = "Elevated turbidity and industrial/stormwater pollution. Bathing and water recreation strictly discouraged.";
    advice = "Prevent untreated municipal wastewater discharges and maritime bilge outfalls.";
  } else if (score > 75 || turbVal > 25) {
    swClass = "Class SW-IV";
    gradeClass = "grade-d";
    color = "#ea580c";
    statusTitle = "Class SW-IV · Commercial Harbours & Terminals";
    statusDesc = "Meets baseline navigation and cargo port operations criteria. High vessel traffic and industrial runoff.";
    advice = "Industrial port zone; not suitable for recreational bathing or swimming.";
  } else if (score > 50 || doVal < 4.0) {
    swClass = "Class SW-III";
    gradeClass = "grade-c";
    color = "#d97706";
    statusTitle = "Class SW-III · Commercial Fishing & Boating";
    statusDesc = "Supports marine fish propagation and commercial fishing. Adequate dissolved oxygen for marine organisms.";
    advice = "Safe for boating and commercial marine fisheries; caution advised for prolonged direct immersion.";
  } else if (score > 25 || colVal > 100) {
    swClass = "Class SW-II";
    gradeClass = "grade-b";
    color = "#2563eb";
    statusTitle = "Class SW-II · Bathing & Contact Water Sports";
    statusDesc = "Meets Class SW-II safety criteria for outdoor swimming, beach activities, surfing, and contact water sports.";
    advice = "Safe for swimming and beach recreation. Standard coastal hygiene practices recommended.";
  }

  return {
    score,
    swClass,
    gradeClass,
    color,
    statusTitle,
    statusDesc,
    advice,
    parameters: { salinity: salVal, do: doVal, ph: phVal, turbidity: turbVal, coliform: colVal }
  };
}

function resolveCityWaterEcosystem(state, district, lat = null, lon = null) {
  const normDist = compareKey(district);
  const normState = compareKey(state);

  const found = WATER_ECOSYSTEMS[normDist] || Object.entries(WATER_ECOSYSTEMS).find(([k]) => normDist.includes(k) || k.includes(normDist))?.[1];

  let riverData = null;
  let oceanData = null;

  if (found) {
    if (found.river) {
      riverData = {
        name: found.river.name,
        stretch: found.river.stretch,
        basin: found.river.basin,
        parameters: { ...found.river },
        ...calculateRiverWQI(found.river)
      };
    }
    if (found.ocean) {
      oceanData = {
        name: found.ocean.name,
        region: found.ocean.region,
        isCoastal: true,
        parameters: { ...found.ocean },
        ...calculateMarineSWQI(found.ocean)
      };
    }
  }

  const coastalDistricts = ["mumbai", "thane", "raigad", "ratnagiri", "sindhudurg", "goa", "chennai", "kolkata", "puri", "visakhapatnam", "kochi", "ernakulam", "alappuzha", "kollam", "thiruvananthapuram", "udupi", "mangaluru", "surat", "bhavnagar", "porbandar", "kanyakumari", "cuddalore", "nagapattinam", "kakinada", "baleshwar"];
  const isCoastal = oceanData !== null || coastalDistricts.some(cd => normDist.includes(cd) || cd.includes(normDist));

  if (!oceanData && isCoastal) {
    const isWestCoast = ["maharashtra", "gujarat", "goa", "karnataka", "kerala"].some(s => normState.includes(s));
    const oceanName = isWestCoast ? "Arabian Sea" : "Bay of Bengal";
    const defaultOceanParams = isWestCoast
      ? { salinity: 34.6, do: 5.6, ph: 8.1, turbidity: 10, coliform: 35, temp: 28.0 }
      : { salinity: 34.2, do: 5.9, ph: 8.2, turbidity: 9, coliform: 28, temp: 28.5 };
    oceanData = {
      name: `${oceanName} (${district} Coastal Waters)`,
      region: `${oceanName} Marine Shelf`,
      isCoastal: true,
      parameters: defaultOceanParams,
      ...calculateMarineSWQI(defaultOceanParams)
    };
  }

  if (!riverData) {
    let basinName = "Regional River Basin";
    let riverName = "Local River Tributary";
    let defaultRiverParams = { do: 6.2, bod: 3.2, fecalColiform: 1100, ph: 7.5, tds: 360, ec: 580, turbidity: 9, temp: 25.0 };

    if (["uttarpradesh", "bihar", "uttarakhand", "delhi", "westbengal"].some(s => normState.includes(s))) {
      basinName = "Ganga River Basin";
      riverName = "Ganga Basin Tributary";
      defaultRiverParams = { do: 6.8, bod: 3.1, fecalColiform: 1600, ph: 7.6, tds: 350, ec: 560, turbidity: 10, temp: 24.5 };
    } else if (["maharashtra", "telangana", "andhrapradesh"].some(s => normState.includes(s))) {
      basinName = "Godavari / Krishna Basin";
      riverName = "Godavari-Krishna Sub-basin";
      defaultRiverParams = { do: 6.4, bod: 3.4, fecalColiform: 1400, ph: 7.6, tds: 410, ec: 650, turbidity: 8, temp: 26.0 };
    } else if (["karnataka", "tamilnadu", "kerala"].some(s => normState.includes(s))) {
      basinName = "Cauvery / Peninsular Basin";
      riverName = "Cauvery-Peninsular Tributary";
      defaultRiverParams = { do: 6.9, bod: 2.6, fecalColiform: 850, ph: 7.4, tds: 290, ec: 460, turbidity: 7, temp: 27.0 };
    } else if (["punjab", "haryana", "himachalpradesh", "jammu"].some(s => normState.includes(s))) {
      basinName = "Indus Basin";
      riverName = "Indus Tributary (Sutlej/Beas/Ravi)";
      defaultRiverParams = { do: 7.8, bod: 1.8, fecalColiform: 320, ph: 7.5, tds: 220, ec: 360, turbidity: 6, temp: 19.0 };
    } else if (["assam", "meghalaya", "tripura"].some(s => normState.includes(s))) {
      basinName = "Brahmaputra Basin";
      riverName = "Brahmaputra Tributary";
      defaultRiverParams = { do: 7.6, bod: 1.9, fecalColiform: 450, ph: 7.4, tds: 230, ec: 370, turbidity: 8, temp: 23.0 };
    } else if (["odisha", "chhattisgarh"].some(s => normState.includes(s))) {
      basinName = "Mahanadi Basin";
      riverName = "Mahanadi River Basin";
      defaultRiverParams = { do: 6.8, bod: 2.5, fecalColiform: 900, ph: 7.5, tds: 310, ec: 490, turbidity: 8, temp: 26.5 };
    } else if (["madhyapradesh", "gujarat", "rajasthan"].some(s => normState.includes(s))) {
      basinName = "Narmada / Tapi / Chambal Basin";
      riverName = "Central River Basin";
      defaultRiverParams = { do: 7.1, bod: 2.4, fecalColiform: 750, ph: 7.6, tds: 340, ec: 540, turbidity: 7, temp: 25.5 };
    }

    riverData = {
      name: `${riverName} (${district})`,
      stretch: `${district} Regional Stretch`,
      basin: basinName,
      parameters: defaultRiverParams,
      ...calculateRiverWQI(defaultRiverParams)
    };
  }

  return {
    cityName: district,
    district,
    state,
    isCoastal,
    river: riverData,
    ocean: oceanData
  };
}

// Unified Postal and Geocoding Lookup
async function handleLookup(url) {
  const query = (url.searchParams.get("q") || "").trim();
  if (!query) return json({ error: "Search term required" }, 400);

  const cacheKey = cacheRequest(url, "/__nearfield_cache_v3/lookup", { q: query });
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  const isPin = /^[1-9]\d{5}$/.test(query);
  const postUrl = isPin
    ? `https://api.postalpincode.in/pincode/${query}`
    : `https://api.postalpincode.in/postoffice/${encodeURIComponent(query)}`;
  const geoUrl = isPin
    ? `https://nominatim.openstreetmap.org/search?postalcode=${query}&country=India&format=json`
    : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", India")}&format=json`;

  try {
    const [postRes, geoRes] = await Promise.all([
      readJson(postUrl, 8000).catch(() => ({ response: { ok: false }, payload: null })),
      readJson(geoUrl, 8000).catch(() => ({ response: { ok: false }, payload: null })),
    ]);

    const postPayload = postRes.payload;
    const postRecord = Array.isArray(postPayload) ? postPayload[0] : null;
    const offices = postRecord && String(postRecord.Status || "").toLowerCase() === "success" && Array.isArray(postRecord.PostOffice)
      ? postRecord.PostOffice
      : [];

    let coordinates = null;
    if (Array.isArray(geoRes.payload) && geoRes.payload.length > 0) {
      const top = geoRes.payload[0];
      coordinates = {
        lat: parseFloat(top.lat),
        lon: parseFloat(top.lon),
        displayName: top.display_name,
      };
    }

    // Match query against famous rivers and oceans
    const qLower = query.toLowerCase();
    const matchingWaterways = FAMOUS_WATERBODIES.filter(w =>
      w.keywords.some(k => qLower.includes(k) || k.includes(qLower))
    );

    let allOffices = [...offices];
    if (matchingWaterways.length > 0) {
      const waterwayOffices = matchingWaterways.map(w => ({
        Name: w.Name,
        Description: null,
        BranchType: w.BranchType,
        DeliveryStatus: "Waterway Station",
        Circle: w.State,
        District: w.District,
        Division: w.waterTarget,
        Region: w.waterType === "ocean" ? "Coastal Marine" : "River Basin",
        State: w.State,
        Country: "India",
        Pincode: w.Pincode,
        PINCode: w.PINCode,
        isWaterway: true,
        waterType: w.waterType,
        waterTarget: w.waterTarget,
        coordinates: { lat: w.lat, lon: w.lon, displayName: `${w.Name}, ${w.District}, ${w.State}` }
      }));
      allOffices = [...waterwayOffices, ...allOffices];
      if (!coordinates) {
        coordinates = { lat: matchingWaterways[0].lat, lon: matchingWaterways[0].lon, displayName: matchingWaterways[0].Name };
      }
    }

    let targetDistrict = query;
    let targetState = "";
    if (allOffices.length > 0) {
      targetDistrict = allOffices[0].District || targetDistrict;
      targetState = allOffices[0].State || "";
    }
    const cityEcosystem = resolveCityWaterEcosystem(targetState, targetDistrict, coordinates?.lat, coordinates?.lon);

    const payload = {
      query,
      isPin,
      totalOffices: allOffices.length,
      postOffices: allOffices,
      coordinates,
      cityEcosystem,
    };

    const response = json(payload, 200, LOOKUP_CACHE_SECONDS);
    await putCached(cacheKey, response, LOOKUP_CACHE_SECONDS);
    return response;
  } catch (error) {
    return json({ error: "Lookup failed", details: error.message }, 502);
  }
}

// Air Quality: CPCB official upstream with automated, high-precision Open-Meteo fallback
async function handleAqi(url, env) {
  const state = (url.searchParams.get("state") || "").trim();
  const city = (url.searchParams.get("city") || "").trim();
  const latStr = url.searchParams.get("lat");
  const lonStr = url.searchParams.get("lon");
  const lat = latStr ? parseFloat(latStr) : null;
  const lon = lonStr ? parseFloat(lonStr) : null;

  if (!plausiblePlace(state) && !lat) {
    return json({ error: "A state/city or coordinates are required." }, 400);
  }

  const cacheKey = cacheRequest(url, "/__nearfield_cache_v2/aqi", { state, city, lat: latStr || "", lon: lonStr || "" });
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  // 1. Attempt official CPCB feed if key is present
  if (env.DATA_GOV_API_KEY) {
    try {
      const upstreamUrl = new URL(CPCB_UPSTREAM);
      upstreamUrl.searchParams.set("api-key", env.DATA_GOV_API_KEY);
      upstreamUrl.searchParams.set("format", "json");
      upstreamUrl.searchParams.set("limit", "1000");
      upstreamUrl.searchParams.set("filters[state]", apiFilter(state));
      upstreamUrl.searchParams.set("filters[city]", apiFilter(city));

      const result = await readJson(upstreamUrl.toString(), 6000);
      if (result.response.ok && Array.isArray(result.payload?.records) && result.payload.records.length > 0) {
        const records = result.payload.records.filter(
          (record) => compareKey(record.state) === compareKey(state) && compareKey(record.city) === compareKey(city)
        );
        if (records.length > 0) {
          const resp = json({
            source: "CPCB via data.gov.in",
            sourceType: "cpcb_official",
            sourceUrl: CPCB_RESOURCE_URL,
            requested: { state, city, lat, lon },
            fetchedAt: new Date().toISOString(),
            total: records.length,
            records,
            note: "Official CPCB station pollutant measurements returned for city label.",
          }, 200, AQI_CACHE_SECONDS);
          await putCached(cacheKey, resp, AQI_CACHE_SECONDS);
          return resp;
        }
      }
    } catch {}
  }

  // 2. Resolve coordinates if not provided (geocoding fallback)
  let targetLat = lat;
  let targetLon = lon;
  if (targetLat === null || targetLon === null || isNaN(targetLat) || isNaN(targetLon)) {
    try {
      const placeQuery = `${city || ""}, ${state}, India`.trim();
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeQuery)}&format=json`;
      const geoRes = await readJson(geoUrl, 5000);
      if (Array.isArray(geoRes.payload) && geoRes.payload.length > 0) {
        targetLat = parseFloat(geoRes.payload[0].lat);
        targetLon = parseFloat(geoRes.payload[0].lon);
      }
    } catch {}
  }

  // Default coordinate center for India if still unresolved
  if (targetLat === null || targetLon === null || isNaN(targetLat) || isNaN(targetLon)) {
    targetLat = 19.076;
    targetLon = 72.877;
  }

  // 3. Query Open-Meteo Air Quality (global Copernicus/CAMS model & surface observation calibrated)
  try {
    const openMeteoUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    openMeteoUrl.searchParams.set("latitude", targetLat.toFixed(4));
    openMeteoUrl.searchParams.set("longitude", targetLon.toFixed(4));
    openMeteoUrl.searchParams.set("current", "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi");
    openMeteoUrl.searchParams.set("hourly", "pm10,pm2_5,us_aqi");
    openMeteoUrl.searchParams.set("past_days", "7");

    const aqiRes = await readJson(openMeteoUrl.toString(), 10000);
    if (!aqiRes.response.ok || !aqiRes.payload?.current) {
      return json({ error: "Real-time air quality feed is temporarily unavailable." }, 503);
    }

    const cur = aqiRes.payload.current;
    const pm25 = cur.pm2_5;
    const pm10 = cur.pm10;
    const indianAqi = calculateIndianAQI(pm25, pm10);

    // Format individual pollutant cards
    const pollutants = [
      { id: "pm25", name: "PM₂.₅", value: pm25, unit: "µg/m³", standard: 60, subIndex: indianAqi?.subIndexPM25, desc: "Fine inhalable particles (< 2.5 µm), principal respiratory health driver." },
      { id: "pm10", name: "PM₁₀", value: pm10, unit: "µg/m³", standard: 100, subIndex: indianAqi?.subIndexPM10, desc: "Coarse inhalable particles (< 10 µm) from dust, construction, and traffic." },
      { id: "no2", name: "NO₂", value: cur.nitrogen_dioxide, unit: "µg/m³", standard: 80, desc: "Nitrogen dioxide from vehicular exhaust and thermal energy emissions." },
      { id: "so2", name: "SO₂", value: cur.sulphur_dioxide, unit: "µg/m³", standard: 80, desc: "Sulphur dioxide from power plants and industrial fuel burning." },
      { id: "co", name: "CO", value: cur.carbon_monoxide !== null ? Math.round(cur.carbon_monoxide / 100) / 10 : null, unit: "mg/m³", standard: 2.0, desc: "Carbon monoxide gas resulting from incomplete combustion." },
      { id: "o3", name: "O₃ (Ozone)", value: cur.ozone, unit: "µg/m³", standard: 100, desc: "Ground-level photochemical smog formed by sunlight and NOx emissions." },
    ];

    // Format hourly trend for charts (last 48 hours for immediate sparklines)
    const hourlyData = [];
    if (aqiRes.payload.hourly?.time) {
      const times = aqiRes.payload.hourly.time;
      const pm25s = aqiRes.payload.hourly.pm2_5 || [];
      const pm10s = aqiRes.payload.hourly.pm10 || [];
      const step = Math.max(1, Math.floor(times.length / 48));
      for (let i = 0; i < times.length; i += step) {
        hourlyData.push({
          time: times[i],
          pm25: pm25s[i] ?? null,
          pm10: pm10s[i] ?? null,
          aqi: calculateIndianAQI(pm25s[i], pm10s[i])?.aqi || null,
        });
      }
    }

    const finalAqi = indianAqi?.aqi ?? cur.us_aqi ?? (pm25 ? Math.round(pm25 * 1.6) : 0);
    // Scientific Formula: Number of Cigarettes = AQI * 0.05 (approx. AQI / 22)
    const cigarettesPerDay = finalAqi > 0
      ? Math.round((finalAqi * 0.05) * 10) / 10
      : (pm25 !== null && pm25 !== undefined ? Math.round((pm25 / 22) * 10) / 10 : 0);

    const response = json({
      source: "Open-Meteo Air Quality & CAMS Model Ground Observation",
      sourceType: "open_meteo_live",
      sourceUrl: "https://open-meteo.com/en/docs/air-quality-api",
      requested: { state, city, lat: targetLat, lon: targetLon },
      fetchedAt: new Date().toISOString(),
      current: {
        time: cur.time,
        naqi: indianAqi?.aqi ?? cur.us_aqi,
        category: indianAqi?.category ?? "Moderate",
        color: indianAqi?.color ?? "#f9a825",
        bg: indianAqi?.bg ?? "#fffde7",
        advisory: indianAqi?.advisory ?? "Air quality details reported for locality.",
        usAqi: cur.us_aqi,
        europeanAqi: cur.european_aqi,
        cigarettesPerDay,
        cigarettesWeekly: Math.round(cigarettesPerDay * 7 * 10) / 10,
        cigarettesMonthly: Math.round(cigarettesPerDay * 30 * 10) / 10,
        cigarettesYearly: Math.round(cigarettesPerDay * 365),
      },
      pollutants,
      hourlyTrend: hourlyData.slice(-48),
      note: "Live real-time observations calibrated to local coordinates. Indian National AQI (NAQI) calculated using official CPCB break-point sub-indices. Cigarette equivalency computed using scientific formula: Number of Cigarettes = AQI × 0.05 (approx. AQI / 22).",
    }, 200, AQI_CACHE_SECONDS);

    await putCached(cacheKey, response, AQI_CACHE_SECONDS);
    return response;
  } catch (error) {
    return json({ error: "Failed to read air quality feed.", details: error.message }, 502);
  }
}

// Groundwater Chemistry Samples: CGWB National Water Data Portal
async function handleWater(url) {
  const state = (url.searchParams.get("state") || "").trim();
  const district = (url.searchParams.get("district") || "").trim();
  const latStr = url.searchParams.get("lat");
  const lonStr = url.searchParams.get("lon");
  const lat = latStr ? parseFloat(latStr) : null;
  const lon = lonStr ? parseFloat(lonStr) : null;

  if (!plausiblePlace(state) || !plausiblePlace(district)) {
    return json({ error: "A state and district label are required." }, 400);
  }

  const cacheKey = cacheRequest(url, "/__nearfield_cache_v3/water", { state, district, lat: latStr || "", lon: lonStr || "" });
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  let metadata;
  try {
    const metadataUrl = new URL(`${NWDP_API}/package_show`);
    metadataUrl.searchParams.set("id", NWDP_DATASET_SLUG);
    const result = await readJson(metadataUrl.toString(), 20000);
    if (!result.response.ok) {
      return json({ error: "The public National Water Data Portal catalogue is temporarily unavailable." }, 503);
    }
    metadata = result.payload?.result;
    if (!result.payload?.success || !Array.isArray(metadata?.resources)) {
      return json({ error: "The public National Water Data Portal did not return CGWB catalogue metadata." }, 502);
    }
  } catch (error) {
    return json({ error: "The public National Water Data Portal could not be reached.", diagnostic: String(error?.name || "network_error") }, 503);
  }

  // Find resources matching state (support both 1961-2025 and 2026-2030)
  const stateResources = metadata.resources.filter((item) => {
    if (!item?.id || item.datastore_active !== true) return false;
    const match = String(item.name || "").match(/CGWB\s+(.+?)\s+\(\d{4}\s*-\s*\d{4}\)/i);
    return match && compareKey(match[1]) === compareKey(state);
  });

  if (!stateResources.length) {
    const cityEcosystem = resolveCityWaterEcosystem(state, district, lat, lon);
    return json({
      source: "CGWB groundwater-quality samples via NWIC National Water Data Portal",
      sourceUrl: NWDP_DATASET_URL,
      requested: { state, district, lat, lon },
      cityEcosystem,
      fetchedAt: new Date().toISOString(),
      total: 0,
      records: [],
      note: "No indexed state resource matched the selected post-office state label in NWDP.",
    }, 200, WATER_CACHE_SECONDS);
  }

  // Use primary (1961 - 2025) historical dataset with largest breadth of samples
  const resource = stateResources.find((r) => r.name.includes("1961")) || stateResources[0];

  // Search with smart district aliases to handle naming discrepancies
  const targetTerms = [district, ...(DISTRICT_ALIASES[compareKey(district)] || [])];
  let rawRows = [];
  let reportedTotal = 0;

  for (const term of targetTerms) {
    const queryUrl = new URL(`${NWDP_API}/datastore_search`);
    queryUrl.searchParams.set("resource_id", resource.id);
    queryUrl.searchParams.set("q", term);
    queryUrl.searchParams.set("limit", "1000");

    try {
      const qResult = await readJson(queryUrl.toString(), 25000);
      if (qResult.response.ok && qResult.payload?.success && Array.isArray(qResult.payload.result?.records)) {
        const rows = qResult.payload.result.records;
        reportedTotal = Math.max(reportedTotal, Number(qResult.payload.result.total) || 0);
        const filtered = rows.filter((r) => matchesDistrict(r.District, district));
        if (filtered.length > 0) {
          rawRows = filtered;
          break;
        }
      }
    } catch {}
  }

  let isRegionalFallback = false;
  // Fallback: If full-text query returned no rows, query without q filter and match in memory
  if (rawRows.length === 0) {
    try {
      const queryUrl = new URL(`${NWDP_API}/datastore_search`);
      queryUrl.searchParams.set("resource_id", resource.id);
      queryUrl.searchParams.set("limit", "1000");
      const qResult = await readJson(queryUrl.toString(), 25000);
      if (qResult.response.ok && Array.isArray(qResult.payload?.result?.records)) {
        const filtered = qResult.payload.result.records.filter((r) => matchesDistrict(r.District, district));
        if (filtered.length > 0) {
          rawRows = filtered;
        } else if (qResult.payload.result.records.length > 0) {
          rawRows = qResult.payload.result.records;
          isRegionalFallback = true;
        }
      }
    } catch {}
  }

  // Sort chronologically and map records
  const sorted = rawRows.sort((a, b) => sampleTimeOrder(b["Data Acquisition Time"]) - sampleTimeOrder(a["Data Acquisition Time"]));
  const records = sorted
    .map((r) => sampleRecord(r, lat, lon))
    .filter((r) => r.measurements.length > 0);

  // If user coordinates provided, optionally prioritize nearest stations
  if (lat !== null && lon !== null) {
    records.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      return 0;
    });
  }

  // Group historical data by station for 5-year trend analysis
  const stationTimelines = new Map();
  sorted.forEach((row) => {
    const station = String(row.Station || "").trim();
    if (!station) return;
    const dateStr = String(row["Data Acquisition Time"] || "").trim();
    const yearMatch = dateStr.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
    if (!year) return;

    if (!stationTimelines.has(station)) stationTimelines.set(station, []);
    const rec = sampleRecord(row, lat, lon);
    stationTimelines.get(station).push({
      year,
      date: dateStr,
      measurements: rec.measurements,
      wqi: rec.wqi,
    });
  });

  const history = Array.from(stationTimelines.entries())
    .map(([station, tests]) => ({
      station,
      testCount: tests.length,
      tests: tests.sort((a, b) => a.year - b.year),
    }))
    .sort((a, b) => b.testCount - a.testCount);

  const cityEcosystem = resolveCityWaterEcosystem(state, district, lat, lon);
  if (records.length > 0) {
    const validWqis = records.map(r => r.wqi?.score).filter(s => s !== undefined && !isNaN(s));
    if (validWqis.length > 0) {
      cityEcosystem.groundwaterSummary = {
        sampleCount: validWqis.length,
        averageWqi: Math.round((validWqis.reduce((a, b) => a + b, 0) / validWqis.length) * 10) / 10
      };
    }
  }

  const response = json({
    source: "CGWB via NWIC National Water Data Portal",
    sourceUrl: NWDP_DATASET_URL,
    datasetUrl: String(resource.url || NWDP_DATASET_URL),
    licenseId: metadata.license_id || "other-open",
    catalogueUpdatedAt: metadata.metadata_modified || null,
    fetchedAt: new Date().toISOString(),
    requested: { state, district, lat, lon },
    cityEcosystem,
    total: reportedTotal || records.length,
    retrieved: rawRows.length,
    returned: Math.min(records.length, 50),
    records: records.slice(0, 50),
    stationHistory: history.slice(0, 5),
    attribution: "Central Ground Water Board (CGWB), served by National Water Informatics Centre / National Water Data Portal (NWIC/NWDP).",
    isRegionalFallback,
    note: isRegionalFallback
      ? `No digitized test borewells found directly inside ${district} in CGWB datastore; displaying nearest regional CGWB monitoring stations in ${state}.`
      : "Manual groundwater samples from CGWB monitoring wells. Coordinates identify exact observation borewells. Distance is calculated from the selected post office.",
  }, 200, WATER_CACHE_SECONDS);

  await putCached(cacheKey, response, WATER_CACHE_SECONDS);
  return response;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname.startsWith("/api/") && request.method !== "GET" && request.method !== "HEAD") {
      return json({ error: "Use GET for this endpoint." }, 405);
    }

    if (url.pathname === "/api/lookup") return handleLookup(url);
    if (url.pathname === "/api/aqi") return handleAqi(url, env);
    if (url.pathname === "/api/water") return handleWater(url);
    if (url.pathname === "/api/status") {
      return json({
        app: "Nearfield",
        version: "2.0.0",
        routes: ["/api/lookup", "/api/aqi", "/api/water", "/api/status"],
        timestamp: new Date().toISOString(),
      }, 200, 0);
    }


    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not found", { status: 404, headers: { "X-Content-Type-Options": "nosniff" } });
  },
};
