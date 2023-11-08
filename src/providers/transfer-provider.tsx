"use client";

import { Dispatch, PropsWithChildren, SetStateAction, createContext, useCallback, useMemo, useState } from "react";
import { BN, BN_ZERO } from "@polkadot/util";
import type { PalletAssetsAssetDetails } from "@polkadot/types/lookup";
import { Asset, ChainConfig, WalletID } from "@/types";
import { usePublicClient, useWalletClient } from "wagmi";
import { EvmBridge } from "@/libs";

import { WalletAccount } from "@talismn/connect-wallets";
import { Signer } from "@polkadot/api/types";
import { notifyError, notifyTransaction, parseCross, signAndSendExtrinsic } from "@/utils";
import { useApi, useAssetDetails, useAssetLimit, useBalance } from "@/hooks";

interface TransferCtx {
  assetLimit: BN | undefined;
  bridgeInstance: EvmBridge | undefined;
  sourceAssetDetails: PalletAssetsAssetDetails | undefined;
  sourceBalance: { asset: { value: BN; asset: Asset } } | undefined;
  targetBalance: { asset: { value: BN; asset: Asset } } | undefined;
  transferAmount: { valid: boolean; input: string; amount: BN };
  sourceChain: ChainConfig;
  targetChain: ChainConfig;
  sourceAsset: Asset;
  targetAsset: Asset;
  sender: { valid: boolean; address: string } | undefined;
  recipient: { valid: boolean; address: string } | undefined;
  activeSenderAccount: WalletAccount | undefined;
  activeRecipientAccount: WalletAccount | undefined;
  activeSenderWallet: WalletID | undefined;
  activeRecipientWallet: WalletID | undefined;

  setTransferAmount: Dispatch<SetStateAction<{ valid: boolean; input: string; amount: BN }>>;
  setSourceChain: Dispatch<SetStateAction<ChainConfig>>;
  setTargetChain: Dispatch<SetStateAction<ChainConfig>>;
  setSourceAsset: Dispatch<SetStateAction<Asset>>;
  setTargetAsset: Dispatch<SetStateAction<Asset>>;
  setSender: Dispatch<SetStateAction<{ valid: boolean; address: string } | undefined>>;
  setRecipient: Dispatch<SetStateAction<{ valid: boolean; address: string } | undefined>>;
  setActiveSenderAccount: Dispatch<SetStateAction<WalletAccount | undefined>>;
  setActiveRecipientAccount: Dispatch<SetStateAction<WalletAccount | undefined>>;
  setActiveSenderWallet: Dispatch<SetStateAction<WalletID | undefined>>;
  setActiveRecipientWallet: Dispatch<SetStateAction<WalletID | undefined>>;
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
  assetLimit: undefined,
  bridgeInstance: undefined,
  sourceAssetDetails: undefined,
  sourceBalance: undefined,
  targetBalance: undefined,
  transferAmount: { valid: true, input: "", amount: BN_ZERO },
  sourceChain: defaultSourceChain,
  targetChain: defaultTargetChain,
  sourceAsset: defaultSourceAsset,
  targetAsset: defaultTargetAsset,
  sender: undefined,
  recipient: undefined,
  activeSenderAccount: undefined,
  activeRecipientAccount: undefined,
  activeSenderWallet: undefined,
  activeRecipientWallet: undefined,

  setTransferAmount: () => undefined,
  setSourceChain: () => undefined,
  setTargetChain: () => undefined,
  setSourceAsset: () => undefined,
  setTargetAsset: () => undefined,
  setSender: () => undefined,
  setRecipient: () => undefined,
  setActiveSenderAccount: () => undefined,
  setActiveRecipientAccount: () => undefined,
  setActiveSenderWallet: () => undefined,
  setActiveRecipientWallet: () => undefined,
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
  const [transferAmount, setTransferAmount] = useState(defaultValue.transferAmount);
  const [sourceChain, setSourceChain] = useState(defaultValue.sourceChain);
  const [targetChain, setTargetChain] = useState(defaultValue.targetChain);
  const [sourceAsset, setSourceAsset] = useState(defaultValue.sourceAsset);
  const [targetAsset, setTargetAsset] = useState(defaultValue.targetAsset);
  const [sender, setSender] = useState(defaultValue.sender);
  const [recipient, setRecipient] = useState(defaultValue.recipient);
  const [activeSenderAccount, setActiveSenderAccount] = useState(defaultValue.activeSenderAccount);
  const [activeRecipientAccount, setActiveRecipientAccount] = useState(defaultValue.activeRecipientAccount);
  const [activeSenderWallet, setActiveSenderWallet] = useState(defaultValue.activeSenderWallet);
  const [activeRecipientWallet, setActiveRecipientWallet] = useState(defaultValue.activeRecipientWallet);

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

  const { assetLimit } = useAssetLimit(bridgeInstance);
  const { assetDetails: sourceAssetDetails } = useAssetDetails(bridgeInstance, "source");
  const { balance: sourceBalance, refetch: refetchSourceBalance } = useBalance(bridgeInstance, sender, "source");
  const { balance: targetBalance, refetch: refetchTargetBalance } = useBalance(bridgeInstance, recipient, "target");

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
        notifyError(err);
        options.failedCb();
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
        try {
          const _extrinsic = await (crossInfo.isReserve
            ? _bridge.limitedReserveTransferAsset(_recipient, _amount)
            : _bridge.transferAsset(_recipient, _amount));
          await signAndSendExtrinsic(_extrinsic, _signer, _sender, _bridge.getSourceChain(), options);
        } catch (err) {
          console.error(err);
          notifyError(err);
          options.failedCb();
        }
      }
    },
    [],
  );

  return (
    <TransferContext.Provider
      value={{
        assetLimit,
        bridgeInstance,
        sourceAssetDetails,
        sourceBalance,
        targetBalance,
        transferAmount,
        sourceChain,
        targetChain,
        sourceAsset,
        targetAsset,
        sender,
        recipient,
        activeSenderAccount,
        activeRecipientAccount,
        activeSenderWallet,
        activeRecipientWallet,

        setTransferAmount,
        setSourceChain,
        setTargetChain,
        setSourceAsset,
        setTargetAsset,
        setSender,
        setRecipient,
        setActiveSenderAccount,
        setActiveRecipientAccount,
        setActiveSenderWallet,
        setActiveRecipientWallet,
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
