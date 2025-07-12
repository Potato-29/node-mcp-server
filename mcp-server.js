import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from "./services/event-services.js";
import {
  createEventSchema,
  deleteEventSchema,
  getEventSchema,
  listEventsSchema,
  updateEventSchema,
} from "./schemas/event-schemas.js";
import { z } from "zod";

const server = new McpServer({
  name: "mcp-server",
  version: "1.0.0",
});

server.tool(
  "createEvent",
  "Create a new event",
  createEventSchema,
  async ({
    summary,
    startDateTime,
    endDateTime,
    attendees,
    description,
    isFullday,
  }) => {
    try {
      const res = await createEvent({
        summary,
        startDateTime,
        endDateTime,
        attendees,
        description,
        isFullday,
      });
      if (res) {
        return res;
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: error.message }],
      };
    }
  }
);

server.tool(
  "listEvents",
  "List upcoming events from Google Calendar",
  listEventsSchema,
  async ({ maxResults, timeMin }) => {
    const events = await listEvents({
      maxResults,
      timeMin,
    });
    if (events) {
      return events;
    }
    return {
      content: [{ type: "text", text: "Failed to list events" }],
    };
  }
);

server.tool(
  "deleteEvent",
  "Delete an existing event from Google Calendar",
  deleteEventSchema,
  async ({ eventId }) => {
    console.log("eventId", eventId);
    const res = await deleteEvent({ eventId }); // Pass as object
    if (res) {
      return res;
    }
    return {
      content: [{ type: "text", text: "Failed to delete event" }],
    };
  }
);

server.tool(
  "getEvent",
  "Get detailed information about a specific event from Google Calendar",
  getEventSchema,
  async ({ eventId }) => {
    const res = await getEvent({ eventId });
    if (res) {
      return res;
    }
    return {
      content: [{ type: "text", text: "Failed to get event" }],
    };
  }
);

server.tool(
  "updateEvent",
  "Update an existing event in Google Calendar",
  updateEventSchema,
  async ({
    eventId,
    summary,
    startDateTime,
    endDateTime,
    attendees,
    description,
    location,
    isFullday,
  }) => {
    try {
      const res = await updateEvent({
        eventId,
        summary,
        startDateTime,
        endDateTime,
        attendees,
        description,
        location,
        isFullday,
      });
      if (res) {
        return res;
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: error.message }],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
