import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { promises as fs } from "fs";
import { google } from "googleapis";
import { authorize } from "./index.js";

function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // JS months are 0‑based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const server = new McpServer({
  name: "mcp-server",
  version: "1.0.0",
});

server.tool(
  "add",
  "Add two numbers",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  })
);

server.tool("getApiKey", "Get the API key", {}, async ({}) => ({
  content: [{ type: "text", text: process.env.API_KEY }],
}));

server.tool(
  "createEvent",
  "Create a new event",
  {
    summary: z.string().describe("The title/summary of the event"),
    startDateTime: z
      .string()
      .describe(
        "Start date and time in ISO format (e.g., '2025-07-10T12:30:00Z')"
      ),
    endDateTime: z
      .string()
      .describe(
        "End date and time in ISO format (e.g., '2025-07-10T14:30:00Z')"
      ),
    attendees: z
      .array(z.string().email())
      .optional()
      .describe("List of attendee email addresses"),
    description: z
      .string()
      .optional()
      .describe("Optional description for the event"),
    isFullday: z.boolean().optional().describe("Is the event a full day event"),
  },
  async ({
    summary,
    startDateTime,
    endDateTime,
    attendees,
    description,
    isFullday,
  }) => {
    const auth = await authorize();
    try {
      const calendar = google.calendar({ version: "v3", auth });
      const requestBody = {
        summary,
      };
      if (isFullday) {
        requestBody.start = {
          date: formatDateToYYYYMMDD(new Date(startDateTime)),
        };
        requestBody.end = { date: formatDateToYYYYMMDD(new Date(endDateTime)) };
      } else {
        requestBody.start = { dateTime: startDateTime };
        requestBody.end = { dateTime: endDateTime };
      }
      // Add optional fields if provided
      if (attendees && attendees.length > 0) {
        requestBody.attendees = attendees.map((email) => ({ email }));
      }

      if (description) {
        requestBody.description = description;
      }

      const res = await calendar.events.insert({
        calendarId: "primary",
        requestBody,
      });

      const responseText = `AUTH INFO:\n
      ${JSON.stringify(auth, null, 2)}\n
      RESULT:\n
      ${JSON.stringify(res, null, 2)}`;

      return {
        content: [{ type: "text", text: responseText }],
      };
    } catch (error) {
      const errorText = `ERROR DETAILS:\n
    Message: ${error.message}\n 
    Auth Object: ${JSON.stringify(auth)}`;

      return {
        content: [{ type: "text", text: errorText }],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
