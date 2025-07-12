# Node MCP Server - Google Calendar Integration

A Model Context Protocol (MCP) server that provides seamless integration with Google Calendar, allowing AI assistants and other MCP clients to manage calendar events programmatically.

## Features

- **Full Calendar Management**: Create, read, update, and delete Google Calendar events
- **MCP Protocol Compliance**: Built using the official MCP SDK for seamless integration
- **Google OAuth Authentication**: Secure authentication with Google Calendar API
- **MongoDB Token Storage**: Persistent token storage for seamless re-authentication
- **Flexible Event Handling**: Support for both timed events and all-day events
- **Attendee Management**: Add and manage event attendees
- **Rich Event Details**: Support for descriptions, locations, and other event metadata

## Prerequisites

- Node.js (v18 or higher)
- MongoDB instance
- Google Cloud Project with Calendar API enabled
- Google OAuth 2.0 credentials

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd node-mcp-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   MONGO_URI=mongodb://localhost:27017
   MONGO_DB_NAME=your_database_name
   ```

4. **Configure Google OAuth**
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Google Calendar API
   - Create OAuth 2.0 credentials (Desktop application)
   - Download the credentials JSON file and save it as `credentials_desktop.json` in the project root

## Usage

### Running the MCP Server

The server can be run as a standalone MCP server:

```bash
node mcp-server.js
```

### Testing with the Test Client

Use the included test client to verify functionality:

```bash
node test-client.js
```

### Integration with MCP Clients

This server can be integrated with any MCP-compatible client. The server provides the following tools:

#### Available Tools

1. **createEvent** - Create a new calendar event

   - Parameters: `summary`, `startDateTime`, `endDateTime`, `attendees` (optional), `description` (optional), `isFullday` (optional)

2. **listEvents** - List upcoming calendar events

   - Parameters: `maxResults` (optional), `timeMin` (optional)

3. **getEvent** - Get detailed information about a specific event

   - Parameters: `eventId`

4. **updateEvent** - Update an existing event

   - Parameters: `eventId`, `summary` (optional), `startDateTime` (optional), `endDateTime` (optional), `attendees` (optional), `description` (optional), `location` (optional), `isFullday` (optional)

5. **deleteEvent** - Delete an event from the calendar
   - Parameters: `eventId`

### Example Usage

```javascript
// Create a new event
const result = await client.callTool({
  name: "createEvent",
  arguments: {
    summary: "Team Meeting",
    startDateTime: "2025-01-15T10:00:00Z",
    endDateTime: "2025-01-15T11:00:00Z",
    attendees: ["colleague@example.com"],
    description: "Weekly team sync meeting",
    isFullday: false,
  },
});

// List upcoming events
const events = await client.callTool({
  name: "listEvents",
  arguments: {
    maxResults: 10,
    timeMin: new Date().toISOString(),
  },
});
```

## Project Structure
