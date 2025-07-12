import { google } from "googleapis";
import { authorize } from "../index.js";

export async function getGoogleCalendarClient() {
  try {
    const auth = await authorize();
    const calendar = google.calendar({ version: "v3", auth });
    return calendar;
  } catch (error) {
    return null;
  }
}
