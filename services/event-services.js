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

function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // JS months are 0‑based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const createEvent = async ({
  summary,
  startDateTime,
  endDateTime,
  attendees,
  description,
  isFullday,
}) => {
  try {
    const calendar = await getGoogleCalendarClient();
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

    const responseText = `
        RESULT:\n
        ${JSON.stringify(res, null, 2)}`;

    return {
      content: [{ type: "text", text: responseText }],
    };
  } catch (error) {
    const errorText = `ERROR DETAILS:\n
      Message: ${error.message} ${JSON.stringify({
      summary,
      startDateTime,
      endDateTime,
      attendees,
      description,
      isFullday,
    })}`;

    return {
      content: [{ type: "text", text: errorText }],
    };
  }
};

export const listEvents = async ({ maxResults, timeMin }) => {
  const calendar = await getGoogleCalendarClient();
  if (!calendar) {
    return {
      content: [
        { type: "text", text: "Failed to authenticate with Google Calendar" },
      ],
    };
  }

  try {
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin || new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = res.data.items;
    if (!events || events.length === 0) {
      return {
        content: [{ type: "text", text: "No upcoming events found." }],
      };
    }

    const eventList = events
      .map((event, index) => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        return `${index + 1}. ${event.summary} (ID: ${event.id})
            Start: ${start}
            End: ${end}
            ${event.description ? `Description: ${event.description}` : ""}`;
      })
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Upcoming ${events.length} events:\n\n${eventList}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `Error listing events: ${error.message}` },
      ],
    };
  }
};

export const deleteEvent = async ({ eventId }) => {
  console.log(eventId);
  const calendar = await getGoogleCalendarClient();
  if (!calendar) {
    return {
      content: [
        { type: "text", text: "Failed to authenticate with Google Calendar" },
      ],
    };
  }
  try {
    // First, try to get the event to verify it exists
    const event = await calendar.events.get({
      calendarId: "primary",
      eventId: eventId,
    });

    // If we get here, the event exists, so we can delete it
    const deleteRes = await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted event: "${event.data.summary}"`,
        },
      ],
    };
  } catch (error) {
    if (error.code === 404) {
      return {
        content: [
          { type: "text", text: `Event with ID "${eventId}" not found` },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: `Error deleting event: ${error.message} --- ${eventId}`,
        },
      ],
    };
  }
};

export const getEvent = async ({ eventId }) => {
  const calendar = await getGoogleCalendarClient();
  if (!calendar) {
    return {
      content: [
        { type: "text", text: "Failed to authenticate with Google Calendar" },
      ],
    };
  }

  try {
    const event = await calendar.events.get({
      calendarId: "primary",
      eventId: eventId,
    });

    const eventData = event.data;
    const start = eventData.start.dateTime || eventData.start.date;
    const end = eventData.end.dateTime || eventData.end.date;
    const isAllDay = !eventData.start.dateTime;

    let eventInfo = `Event Details:
        Title: ${eventData.summary}
        ID: ${eventData.id}
        Status: ${eventData.status}
        Created: ${eventData.created}
        Updated: ${eventData.updated}
        Start: ${start}
        End: ${end}
        All Day: ${isAllDay ? "Yes" : "No"}`;

    if (eventData.description) {
      eventInfo += `\nDescription: ${eventData.description}`;
    }

    if (eventData.location) {
      eventInfo += `\nLocation: ${eventData.location}`;
    }

    if (eventData.attendees && eventData.attendees.length > 0) {
      const attendeeList = eventData.attendees
        .map(
          (attendee) =>
            `${attendee.email}${
              attendee.responseStatus ? ` (${attendee.responseStatus})` : ""
            }`
        )
        .join(", ");
      eventInfo += `\nAttendees: ${attendeeList}`;
    }

    if (eventData.organizer) {
      eventInfo += `\nOrganizer: ${eventData.organizer.email}`;
    }

    if (eventData.htmlLink) {
      eventInfo += `\nCalendar Link: ${eventData.htmlLink}`;
    }

    return {
      content: [{ type: "text", text: eventInfo }],
    };
  } catch (error) {
    if (error.code === 404) {
      return {
        content: [
          { type: "text", text: `Event with ID "${eventId}" not found` },
        ],
      };
    }
    return {
      content: [
        { type: "text", text: `Error retrieving event: ${error.message}` },
      ],
    };
  }
};

export const updateEvent = async ({
  eventId,
  summary, // Changed from title to summary
  startDateTime,
  endDateTime,
  attendees,
  description,
  location,
  isFullday,
}) => {
  const calendar = await getGoogleCalendarClient();
  if (!calendar) {
    return {
      content: [
        { type: "text", text: "Failed to authenticate with Google Calendar" },
      ],
    };
  }

  try {
    // First, get the current event to preserve existing data
    const currentEvent = await calendar.events.get({
      calendarId: "primary",
      eventId: eventId,
    });

    const requestBody = { ...currentEvent.data };

    // Update only the fields that are provided
    if (summary !== undefined) {
      // Changed from title to summary
      requestBody.summary = summary; // Changed to use summary consistently
    }

    if (description !== undefined) {
      requestBody.description = description;
    }

    if (location !== undefined) {
      requestBody.location = location;
    }

    if (attendees !== undefined) {
      requestBody.attendees = attendees.map((email) => ({ email }));
    }

    // Handle date/time updates
    if (
      startDateTime !== undefined ||
      endDateTime !== undefined ||
      isFullday !== undefined
    ) {
      if (isFullday) {
        // Full day event
        requestBody.start = {
          date: startDateTime
            ? formatDateToYYYYMMDD(new Date(startDateTime))
            : requestBody.start.date,
        };
        requestBody.end = {
          date: endDateTime
            ? formatDateToYYYYMMDD(new Date(endDateTime))
            : requestBody.end.date,
        };
        // Remove dateTime fields if they exist
        delete requestBody.start.dateTime;
        delete requestBody.end.dateTime;
      } else {
        // Time-specific event
        if (startDateTime) {
          requestBody.start = { dateTime: startDateTime };
          delete requestBody.start.date;
        }
        if (endDateTime) {
          requestBody.end = { dateTime: endDateTime };
          delete requestBody.end.date;
        }
      }
    }

    const res = await calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      requestBody,
    });

    const updatedEvent = res.data;
    const start = updatedEvent.start.dateTime || updatedEvent.start.date;
    const end = updatedEvent.end.dateTime || updatedEvent.end.date;

    const responseText = `Event updated successfully!
        Updated Event Details:
        Title: ${updatedEvent.summary}
        ID: ${updatedEvent.id}
        Start: ${start}
        End: ${end}
        ${
          updatedEvent.description
            ? `Description: ${updatedEvent.description}`
            : ""
        }
        ${updatedEvent.location ? `Location: ${updatedEvent.location}` : ""}
        ${
          updatedEvent.attendees && updatedEvent.attendees.length > 0
            ? `Attendees: ${updatedEvent.attendees
                .map((a) => a.email)
                .join(", ")}`
            : ""
        }`;

    return {
      content: [{ type: "text", text: responseText }],
    };
  } catch (error) {
    if (error.code === 404) {
      return {
        content: [
          { type: "text", text: `Event with ID "${eventId}" not found` },
        ],
      };
    }
    return {
      content: [
        { type: "text", text: `Error updating event: ${error.message}` },
      ],
    };
  }
};
