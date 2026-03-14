import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const WARMUP_URL = `${API_URL}/assessment/warmup`;
const WARMUP_TIMEOUT_MS = 65000;
const MAX_ATTEMPTS = 3;

let hasStartedWarmup = false;
let warmupPromise = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const initAppWarmup = () => {
  if (hasStartedWarmup && warmupPromise) {
    return;
  }

  hasStartedWarmup = true;

  // Fire-and-forget startup warmup so first user actions are less likely to hit cold starts.
  warmupPromise = (async () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      try {
        await axios.get(WARMUP_URL, { timeout: WARMUP_TIMEOUT_MS });
        return true;
      } catch {
        if (attempt === MAX_ATTEMPTS - 1) {
          return false;
        }

        await sleep(1200 * (attempt + 1));
      }
    }
  })();
};

export const waitForAppWarmup = async () => {
  initAppWarmup();

  if (!warmupPromise) {
    return false;
  }

  try {
    return await warmupPromise;
  } catch {
    return false;
  }
};
