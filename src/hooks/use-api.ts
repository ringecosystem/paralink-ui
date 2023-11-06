import { ChainConfig } from "@/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { useEffect, useState } from "react";

export function useApi(chain: ChainConfig) {
  const [api, setApi] = useState<ApiPromise>();

  useEffect(() => {
    const _api = new ApiPromise({ provider: new WsProvider(chain.endpoint) });

    const successListener = () => {
      setApi(_api);
    };
    const failedListener = () => {
      setApi(undefined);
    };

    _api.on("connected", () => {});
    _api.on("ready", successListener);
    _api.on("disconnected", failedListener);
    _api.on("error", (err) => {
      console.error(err);
    });

    return () => {
      _api.off("ready", successListener);
      _api.off("disconnected", failedListener);
    };
  }, [chain]);

  return { api };
}
