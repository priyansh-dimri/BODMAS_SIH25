import { API_BASE_URL as ENV_API_URL } from "@env";

if (!ENV_API_URL) {
  throw new Error(
    "API_BASE_URL is not set in your .env file. Please create one based on .env.example."
  );
}

export const API_BASE_URL = ENV_API_URL;
export const API_TIMEOUT = 15000; // 15 seconds
