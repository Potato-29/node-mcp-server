import { google } from "googleapis";
import { authorize } from "../index.js";

// Singleton pattern to cache the calendar client
let cachedCalendarClient = null;
let cachedAuth = null;

export async function getGoogleCalendarClient() {
  // Return cached client if available
  if (cachedCalendarClient && cachedAuth) {
    return cachedCalendarClient;
  }

  try {
    // Get fresh auth and create new client
    cachedAuth = await authorize();
    cachedCalendarClient = google.calendar({ version: "v3", auth: cachedAuth });
    return cachedCalendarClient;
  } catch (error) {
    console.error("Failed to initialize Google Calendar client:", error);
    return null;
  }
}

// Function to clear cache (useful for testing or re-authentication)
export function clearCalendarClientCache() {
  cachedCalendarClient = null;
  cachedAuth = null;
}

// Get auth object directly if needed
export async function getAuth() {
  if (cachedAuth) {
    return cachedAuth;
  }

  try {
    cachedAuth = await authorize();
    return cachedAuth;
  } catch (error) {
    console.error("Failed to get auth:", error);
    return null;
  }
}
