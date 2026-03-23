import { useState } from "react";

import { getOrCreateClientId } from "../utils/identity";

export function useIdentity() {
  const [clientId] = useState(() => getOrCreateClientId());
  return clientId;
}
