import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const WARMUP_URL = `${API_URL}/assessment/warmup`;
const WARMUP_INTERVAL_MS = 60 * 1000;

let lastWarmupAt = 0;
let warmupPromise = null;

const isApiRequest = (url = "") => {
  if (!url || typeof url !== "string") return false;
  return url.startsWith(API_URL);
};

const shouldSkipWarmup = (config) => {
  const url = config?.url || "";
  return Boolean(config?.skipWarmup) || url.includes("/assessment/warmup");
};

axios.interceptors.request.use(async (config) => {
  if (shouldSkipWarmup(config) || !isApiRequest(config?.url)) {
    return config;
  }

  const now = Date.now();
  if (now - lastWarmupAt < WARMUP_INTERVAL_MS) {
    return config;
  }

  if (!warmupPromise) {
    warmupPromise = axios
      .get(WARMUP_URL, {
        timeout: 45000,
        skipWarmup: true,
      })
      .finally(() => {
        warmupPromise = null;
      });
  }

  try {
    await warmupPromise;
    lastWarmupAt = Date.now();
  } catch {
    // Warmup failures should not block the original request.
  }

  return config;
});
