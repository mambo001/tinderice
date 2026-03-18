import { useState } from "react";

import { getOrCreateUserId } from "../utils/identity";

export function useIdentity() {
  const [userId] = useState(() => getOrCreateUserId());
  return userId;
}
