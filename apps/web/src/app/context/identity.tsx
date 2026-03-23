import { createContext, PropsWithChildren, useContext } from "react";

import { useIdentity } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { Schema } from "effect";

const API_URL = import.meta.env.VITE_API_URL;

const Identity = Schema.Struct({
  id: Schema.String,
  clientId: Schema.String,
  name: Schema.String,
  email: Schema.String,
});

type Identity = typeof Identity.Type;

const decodeIdentity = Schema.decodeUnknownSync(Identity);

interface IdentityContext {
  identity: Identity | null;
}

const IdentityContext = createContext<IdentityContext>({
  identity: null,
});

export function IdentityContextProvider(props: PropsWithChildren) {
  const clientId = useIdentity();
  const { data } = useQuery({
    queryKey: ["identity"],
    queryFn: async (): Promise<Identity> => {
      const response = await fetch(`${API_URL}/user/client-id`, {
        method: "GET",
        headers: {
          "X-Client-ID": clientId,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch identity");
      }
      const json = await response.json();
      console.log({ json });
      return decodeIdentity(json);
    },
  });
  const identity = data || null;

  console.log({ API_URL });
  console.log("import.meta.env: ", import.meta.env);
  console.log("import.meta.env.VITE_API_URL: ", import.meta.env.VITE_API_URL);

  return (
    <IdentityContext.Provider value={{ identity }}>
      {props.children}
    </IdentityContext.Provider>
  );
}

// eslint-disable-next-line
export function useIdentityContext() {
  const context = useContext(IdentityContext);
  if (context === null) {
    throw new Error(
      "useIdentityContext must be used within a IdentityContextProvider",
    );
  }
  return context;
}
