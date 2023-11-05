"use client";

import { Dispatch, PropsWithChildren, SetStateAction, createContext, useCallback, useMemo, useState } from "react";
import { BN, BN_ZERO } from "@polkadot/util";
import { Asset, ChainConfig, WalletID } from "@/types";
import { usePublicClient, useWalletClient } from "wagmi";
import { EvmBridge } from "@/libs";

import { WalletAccount } from "@talismn/connect-wallets";
import { Signer } from "@polkadot/api/types";
import { notifyTransaction, parseCross, signAndSendExtrinsic } from "@/utils";
import { useApi, useBalance } from "@/hooks";

interface TransferCtx {
  bridgeInstance: EvmBridge | undefined;
  sourceBalance: { asset: { value: BN; asset: Asset } } | undefined;
  targetBalance: { asset: { value: BN; asset: Asset } } | undefined;
  activeWallet: WalletID | undefined;
  transferAmount: { input: string; amount: BN };
  sourceChain: ChainConfig;
  targetChain: ChainConfig;
  sourceAsset: Asset;
  targetAsset: Asset;
  sender: string | undefined;
  recipient: string | undefined;

  setActiveWallet: Dispatch<SetStateAction<WalletID | undefined>>;
  setTransferAmount: Dispatch<SetStateAction<{ input: string; amount: BN }>>;
  setSourceChain: Dispatch<SetStateAction<ChainConfig>>;
  setTargetChain: Dispatch<SetStateAction<ChainConfig>>;
  setSourceAsset: Dispatch<SetStateAction<Asset>>;
  setTargetAsset: Dispatch<SetStateAction<Asset>>;
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
  refetchSourceBalance: () => void;
  refetchTargetBalance: () => void;
}

const { defaultSourceChain, defaultTargetChain, defaultSourceAsset, defaultTargetAsset } = parseCross();

const defaultValue: TransferCtx = {
  bridgeInstance: undefined,
  sourceBalance: undefined,
  targetBalance: undefined,
  activeWallet: undefined,
  transferAmount: { input: "", amount: BN_ZERO },
  sourceChain: defaultSourceChain,
  targetChain: defaultTargetChain,
  sourceAsset: defaultSourceAsset,
  targetAsset: defaultTargetAsset,
  sender: undefined,
  recipient: undefined,

  setActiveWallet: () => undefined,
  setTransferAmount: () => undefined,
  setSourceChain: () => undefined,
  setTargetChain: () => undefined,
  setSourceAsset: () => undefined,
  setTargetAsset: () => undefined,
  setSender: () => undefined,
  setRecipient: () => undefined,
  refetchSourceBalance: () => undefined,
  refetchTargetBalance: () => undefined,
  evmTransfer: async () => undefined,
  substrateTransfer: async () => undefined,
};

const transferCb = {
  successCb: () => {},
  failedCb: () => {},
};

export const TransferContext = createContext(defaultValue);

export default function TransferProvider({ children }: PropsWithChildren<unknown>) {
  const [activeWallet, setActiveWallet] = useState(defaultValue.activeWallet);
  const [transferAmount, setTransferAmount] = useState(defaultValue.transferAmount);
  const [sourceChain, setSourceChain] = useState(defaultValue.sourceChain);
  const [targetChain, setTargetChain] = useState(defaultValue.targetChain);
  const [sourceAsset, setSourceAsset] = useState(defaultValue.sourceAsset);
  const [targetAsset, setTargetAsset] = useState(defaultValue.targetAsset);
  const [sender, setSender] = useState(defaultValue.sender);
  const [recipient, setRecipient] = useState(defaultValue.recipient);

  const { api: sourceApi } = useApi(sourceChain);
  const { api: targetApi } = useApi(targetChain);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const bridgeInstance = useMemo(
    () =>
      sourceApi && targetApi
        ? new EvmBridge({
            sourceApi,
            targetApi,
            publicClient,
            walletClient,
            sourceChain,
            targetChain,
            sourceAsset,
            targetAsset,
          })
        : undefined,
    [sourceApi, targetApi, publicClient, walletClient, sourceChain, targetChain, sourceAsset, targetAsset],
  );

  const { balance: sourceBalance, refetch: refetchSourceBalance } = useBalance(bridgeInstance, sender, "source");
  const { balance: targetBalance, refetch: refetchTargetBalance } = useBalance(bridgeInstance, sender, "target");

  const evmTransfer = useCallback(
    async (_bridge: EvmBridge, _sender: string, _recipient: string, _amount: BN, options = transferCb) => {
      try {
        const receipt = await _bridge.transferAssetWithPrecompile(_sender, _recipient, _amount);
        notifyTransaction(receipt, _bridge.getSourceChain());
        if (receipt?.status === "success") {
          options.successCb();
        } else {
          options.failedCb();
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
          await signAndSendExtrinsic(_extrinsic, _signer, _sender, _bridge.getSourceChain(), options);
        } catch (err) {
          console.error(err);
        }
      }
    },
    [],
  );

  return (
    <TransferContext.Provider
      value={{
        bridgeInstance,
        sourceBalance,
        targetBalance,
        activeWallet,
        transferAmount,
        sourceChain,
        targetChain,
        sourceAsset,
        targetAsset,
        sender,
        recipient,

        setActiveWallet,
        setTransferAmount,
        setSourceChain,
        setTargetChain,
        setSourceAsset,
        setTargetAsset,
        setSender,
        setRecipient,
        evmTransfer,
        substrateTransfer,
        refetchSourceBalance,
        refetchTargetBalance,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
}
