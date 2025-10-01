import * as signalR from "@microsoft/signalr";
import { getAuth } from "./auth";

let connection = null;

export function startSignalR() {
  const auth = getAuth();
  if (!auth?.token) {
    console.warn("No token found, cannot start SignalR");
    return null;
  }

  // Don't create duplicate connections
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    console.log("SignalR already connected");
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5157/hubs/notifications", {
      accessTokenFactory: () => auth.token,
      transport: signalR.HttpTransportType.WebSockets,
      skipNegotiation: false // ✅ Let SignalR negotiate transport
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect([0, 2000, 5000, 10000]) // ✅ Better reconnect strategy
    .build();

  // ✅ Add event listeners
  connection.onreconnecting(error => {
    console.warn("SignalR reconnecting:", error);
  });

  connection.onreconnected(connectionId => {
    console.log("SignalR reconnected:", connectionId);
  });

  connection.onclose(error => {
    console.error("SignalR connection closed:", error);
  });

  // ✅ Start connection with error handling
  connection
    .start()
    .then(() => {
      console.log("✅ SignalR Connected successfully");
    })
    .catch(err => {
      console.error("❌ SignalR connection error:", err);
    });

  return connection;
}

export function getConnection() {
  return connection;
}

export function stopSignalR() {
  if (connection) {
    connection.stop();
    connection = null;
  }
}