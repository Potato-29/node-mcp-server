import { z } from "zod";

export const createEventSchema = {
  summary: z.string().describe("The title/summary of the event"),
  startDateTime: z
    .string()
    .describe(
      "Start date and time in ISO format (e.g., '2025-07-10T12:30:00Z')"
    ),
  endDateTime: z
    .string()
    .describe("End date and time in ISO format (e.g., '2025-07-10T14:30:00Z')"),
  attendees: z
    .array(z.string().email())
    .optional()
    .describe("List of attendee email addresses"),
  description: z
    .string()
    .optional()
    .describe("Optional description for the event"),
  isFullday: z.boolean().optional().describe("Is the event a full day event"),
};

export const getEventSchema = {
  eventId: z
    .string()
    .describe(
      "The unique ID of the event to get (you can get this from listEvents)"
    ),
};

export const deleteEventSchema = {
  eventId: z
    .string()
    .describe(
      "The unique ID of the event to delete (you can get this from listEvents)"
    ),
};

export const listEventsSchema = {
  maxResults: z
    .number()
    .optional()
    .describe("The maximum number of events to return"),
  timeMin: z
    .string()
    .optional()
    .describe("The minimum time to return events for"),
};

export const updateEventSchema = {
  eventId: z
    .string()
    .describe(
      "The unique ID of the event to update (you can get this from listEvents)"
    ),
  summary: z.string().optional().describe("The new title/summary of the event"),
  startDateTime: z
    .string()
    .optional()
    .describe(
      "New start date and time in ISO format (e.g., '2025-07-10T12:30:00Z')"
    ),
  endDateTime: z
    .string()
    .optional()
    .describe(
      "New end date and time in ISO format (e.g., '2025-07-10T14:30:00Z')"
    ),
  attendees: z
    .array(z.string().email())
    .optional()
    .describe("List of attendee email addresses (replaces existing attendees)"),
  description: z.string().optional().describe("New description for the event"),
  location: z.string().optional().describe("New location for the event"),
  isFullday: z.boolean().optional().describe("Is the event a full day event"),
};
