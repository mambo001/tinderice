export function getOrCreateClientId() {
  let clientId = localStorage.getItem("client_id");
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem("client_id", clientId);
  }
  return clientId;
}
