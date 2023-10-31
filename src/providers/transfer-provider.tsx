"use client";

import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BN, BN_ZERO } from "@polkadot/util";
import { Asset, ChainConfig, WalletID } from "@/types";
import { assethubRococoChain, pangolinChain } from "@/config/chains";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { usePublicClient, useWalletClient } from "wagmi";
import { EvmBridge } from "@/libs";
import { forkJoin, Subscription } from "rxjs";
import { WalletAccount } from "@talismn/connect-wallets";
import { Signer } from "@polkadot/api/types";
import { signAndSendExtrinsic } from "@/utils";

interface TransferCtx {
  bridgeInstance: EvmBridge | undefined;
  sourceBalance: { asset: { value: BN; asset: Asset } } | undefined;
  sourceApi: ApiPromise | undefined;
  activeWallet: WalletID | undefined;
  transferAmount: { input: string; amount: BN };
  transferSource: { asset: Asset; chain: ChainConfig };
  transferTarget: { asset: Asset; chain: ChainConfig };
  sender: string | undefined;
  recipient: string | undefined;

  setSourceApi: Dispatch<SetStateAction<ApiPromise | undefined>>;
  setActiveWallet: Dispatch<SetStateAction<WalletID | undefined>>;
  setTransferAmount: Dispatch<SetStateAction<{ input: string; amount: BN }>>;
  setTransferSource: Dispatch<SetStateAction<{ asset: Asset; chain: ChainConfig }>>;
  setTransferTarget: Dispatch<SetStateAction<{ asset: Asset; chain: ChainConfig }>>;
  setSender: Dispatch<SetStateAction<string | undefined>>;
  setRecipient: Dispatch<SetStateAction<string | undefined>>;
  evmTransfer: (
    _bridge: EvmBridge,
    _sender: string,
    _recipient: string,
    _amount: BN,
    options?: { successCb: () => void; failedCb: () => void },
  ) => Promise<void>;
  substrateTransfer: (
    _bridge: EvmBridge,
    _account: WalletAccount,
    _recipient: string,
    _amount: BN,
    options?: { successCb: () => void; failedCb: () => void },
  ) => Promise<void>;
}

const defaultValue: TransferCtx = {
  bridgeInstance: undefined,
  sourceBalance: undefined,
  sourceApi: undefined,
  activeWallet: undefined,
  transferAmount: { input: "", amount: BN_ZERO },
  transferSource: { asset: pangolinChain.assets[0], chain: pangolinChain },
  transferTarget: { asset: assethubRococoChain.assets[0], chain: assethubRococoChain },
  sender: undefined,
  recipient: undefined,

  setSourceApi: () => undefined,
  setActiveWallet: () => undefined,
  setTransferAmount: () => undefined,
  setTransferSource: () => undefined,
  setTransferTarget: () => undefined,
  setSender: () => undefined,
  setRecipient: () => undefined,
  evmTransfer: async () => undefined,
  substrateTransfer: async () => undefined,
};

const transferCb = {
  successCb: () => {},
  failedCb: () => {},
};

export const TransferContext = createContext(defaultValue);

export default function TransferProvider({ children }: PropsWithChildren<unknown>) {
  const [sourceBalance, setSourceBalance] = useState(defaultValue.sourceBalance);
  const [sourceApi, setSourceApi] = useState(defaultValue.sourceApi);
  const [activeWallet, setActiveWallet] = useState(defaultValue.activeWallet);
  const [transferAmount, setTransferAmount] = useState(defaultValue.transferAmount);
  const [transferSource, setTransferSource] = useState(defaultValue.transferSource);
  const [transferTarget, setTransferTarget] = useState(defaultValue.transferTarget);
  const [sender, setSender] = useState(defaultValue.sender);
  const [recipient, setRecipient] = useState(defaultValue.recipient);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const bridgeInstance = useMemo(
    () =>
      sourceApi ? new EvmBridge({ sourceApi, publicClient, walletClient, transferSource, transferTarget }) : undefined,
    [sourceApi, publicClient, walletClient, transferSource, transferTarget],
  );

  const evmTransfer = useCallback(
    async (_bridge: EvmBridge, _sender: string, _recipient: string, _amount: BN, options = transferCb) => {
      try {
        const receipt = await _bridge.transferAssetWithPrecompile(_sender, _recipient, _amount);
        if (receipt?.status === "success") {
          console.log("Success");
        }
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

  const substrateTransfer = useCallback(
    async (_bridge: EvmBridge, _account: WalletAccount, _recipient: string, _amount: BN, options = transferCb) => {
      const crossInfo = _bridge.getCrossInfo();
      if (crossInfo) {
        const _sender = _account.address;
        const _signer = _account.signer as Signer;
        const call = crossInfo.isReserve ? _bridge.limitedReserveTransferAsset : _bridge.transferAsset;
        try {
          const _extrinsic = await call(_recipient, _amount);
          await signAndSendExtrinsic(_extrinsic, _signer, _sender);
        } catch (err) {
          console.error(err);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const { endpoint } = transferSource.chain;
    const api = new ApiPromise({ provider: new WsProvider(endpoint) });

    const successListener = () => {
      setSourceApi(api);
    };
    const failedListener = () => {
      setSourceApi(undefined);
    };

    api.on("connected", () => {});
    api.on("ready", successListener);
    api.on("disconnected", failedListener);
    api.on("error", (err) => {
      console.error(err);
    });

    return () => {
      api.off("ready", successListener);
      api.off("disconnected", failedListener);
    };
  }, [transferSource.chain]);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (sender && bridgeInstance) {
      sub$$ = forkJoin([bridgeInstance.getSourceAssetBalance(sender)]).subscribe({
        next: ([asset]) => {
          setSourceBalance({ asset });
        },
        error: (err) => {
          console.error(err);
          setSourceBalance(undefined);
        },
      });
    } else {
      setSourceBalance(undefined);
    }

    return () => sub$$?.unsubscribe();
  }, [sender, bridgeInstance]);

  return (
    <TransferContext.Provider
      value={{
        bridgeInstance,
        sourceBalance,
        sourceApi,
        activeWallet,
        transferAmount,
        transferSource,
        transferTarget,
        sender,
        recipient,

        setSourceApi,
        setActiveWallet,
        setTransferAmount,
        setTransferSource,
        setTransferTarget,
        setSender,
        setRecipient,
        evmTransfer,
        substrateTransfer,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
}
