import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["mcp-server.js"],
});

const client = new Client({
  name: "example-client",
  version: "1.0.0",
});

await client.connect(transport);

const result = await client.listTools();
console.log("result", result);

// CREATE EVENT TOOL CALL
const calresult = await client.callTool({
  name: "createEvent",
  arguments: {
    summary: "MADRID VS PSG!!!!",
    startDateTime: new Date(2025, 6, 10).toISOString(),
    endDateTime: new Date(2025, 6, 10).toISOString(),
    attendees: ["csaprayas@gmail.com"],
    description: "CLUB WORLD CUP SEMIS!!!!!!!",
    isFullday: true,
  },
});
console.log("event", calresult);

// DELETE EVENT TOOL CALL
// const deleteRes = await client.callTool({
//   name: "deleteEvent",
//   arguments: {
//     eventId: "71ru9chqa67vu63f495u2g1t1o",
//   },
// });
// console.log("event", deleteRes);
