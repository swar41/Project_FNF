import * as signalR from "@microsoft/signalr";
import { getAuth } from "./utils/auth";
let connection = null;

export function startSignalR() {
  const auth = getAuth();
  if (!auth?.token) return;

  connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5157/hubs/notifications", {
      accessTokenFactory: () => auth?.token || "",
      transport: signalR.HttpTransportType.WebSockets
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  connection.start().catch(err => console.error("SignalR error:", err));

  return connection;
}