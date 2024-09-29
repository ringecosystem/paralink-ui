"use client";

import { Dispatch, PropsWithChildren, SetStateAction, createContext, useCallback, useMemo, useState } from "react";
import { BN, BN_ZERO } from "@polkadot/util";
import { Asset, ChainConfig, Currency, WalletID } from "@/types";
import { usePublicClient, useWalletClient } from "wagmi";
import { UniversalBridge } from "@/libs";

import { WalletAccount } from "@talismn/connect-wallets";
import { Signer } from "@polkadot/api/types";
import { notifyError, notifyTransaction, parseCross, signAndSendExtrinsic } from "@/utils";
import {
  useApi,
  useAssetSupply,
  useAssetLimit,
  useAssetBalance,
  useFeeBalance,
  useExistentialDeposit,
  useNativeBalance,
} from "@/hooks";
import { ApiPromise } from "@polkadot/api";

interface TransferCtx {
  assetLimitOnTargetChain: { currency: Currency; amount: BN } | undefined;
  existentialDepositOnTargetChain: { currency: Currency; amount: BN } | undefined;
  targetAssetSupply: { currency: Currency; amount: BN } | undefined;
  bridgeInstance: UniversalBridge | undefined;
  sourceAssetBalance: { currency: Currency; amount: BN } | undefined;
  targetAssetBalance: { currency: Currency; amount: BN } | undefined;
  sourceNativeBalance: { currency: Currency; amount: BN } | undefined;
  targetNativeBalance: { currency: Currency; amount: BN } | undefined;
  feeBalanceOnSourceChain: { currency: Currency; amount: BN } | undefined;
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
  sourceApi: ApiPromise | undefined;
  targetApi: ApiPromise | undefined;

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
  transfer: (
    _bridge: UniversalBridge,
    _sender: string | WalletAccount,
    _recipient: string,
    _amount: BN,
    options?: { successCb: () => void; failedCb: () => void },
  ) => Promise<void>;
  updateSourceAssetBalance: () => void;
  updateTargetAssetBalance: () => void;
  updateSourceNativeBalance: () => void;
  updateTargetNativeBalance: () => void;
  updateTargetAssetSupply: () => void;
  updateFeeBalanceOnSourceChain: () => void;
}

const { defaultSourceChain, defaultTargetChain, defaultSourceAsset, defaultTargetAsset } = parseCross();

const transferCb = {
  successCb: (receipt: any) => {},
  failedCb: () => {},
};

export const TransferContext = createContext({} as TransferCtx);

export default function TransferProvider({ children }: PropsWithChildren<unknown>) {
  const [transferAmount, setTransferAmount] = useState({ valid: true, input: "", amount: BN_ZERO });
  const [sourceChain, setSourceChain] = useState(defaultSourceChain);
  const [targetChain, setTargetChain] = useState(defaultTargetChain);
  const [sourceAsset, setSourceAsset] = useState(defaultSourceAsset);
  const [targetAsset, setTargetAsset] = useState(defaultTargetAsset);
  const [sender, setSender] = useState<TransferCtx["sender"]>();
  const [recipient, setRecipient] = useState<TransferCtx["recipient"]>();
  const [activeSenderAccount, setActiveSenderAccount] = useState<TransferCtx["activeSenderAccount"]>();
  const [activeRecipientAccount, setActiveRecipientAccount] = useState<TransferCtx["activeRecipientAccount"]>();
  const [activeSenderWallet, setActiveSenderWallet] = useState<TransferCtx["activeSenderWallet"]>();
  const [activeRecipientWallet, setActiveRecipientWallet] = useState<TransferCtx["activeRecipientWallet"]>();

  const { api: sourceApi } = useApi(sourceChain);
  const { api: targetApi } = useApi(targetChain);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const bridgeInstance = useMemo(
    () =>
      sourceApi && targetApi
        ? new UniversalBridge({
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

  const { value: assetLimitOnTargetChain } = useAssetLimit(bridgeInstance, "target");
  const { value: existentialDepositOnTargetChain } = useExistentialDeposit(bridgeInstance, "target");
  const { value: targetAssetSupply, update: updateTargetAssetSupply } = useAssetSupply(bridgeInstance, "target");
  const { value: feeBalanceOnSourceChain, update: updateFeeBalanceOnSourceChain } = useFeeBalance(
    bridgeInstance,
    sender,
    "source",
  );
  const { value: sourceNativeBalance, update: updateSourceNativeBalance } = useNativeBalance(
    bridgeInstance,
    sender,
    "source",
  );
  const { value: targetNativeBalance, update: updateTargetNativeBalance } = useNativeBalance(
    bridgeInstance,
    recipient,
    "target",
  );
  const { value: sourceAssetBalance, update: updateSourceAssetBalance } = useAssetBalance(
    bridgeInstance,
    sender,
    "source",
  );
  const { value: targetAssetBalance, update: updateTargetAssetBalance } = useAssetBalance(
    bridgeInstance,
    recipient,
    "target",
  );

  /**
   * Transfer
   */
  const evmTransfer = useCallback(
    async (_bridge: UniversalBridge, _sender: string, _recipient: string, _amount: BN, options = transferCb) => {
      try {
        const receipt = await _bridge.transferWithPrecompile(_recipient, _amount);
        notifyTransaction(receipt, _bridge.getSourceChain());
        if (receipt?.status === "success") {
          options.successCb(receipt);
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
    async (
      _bridge: UniversalBridge,
      _account: WalletAccount,
      _recipient: string,
      _amount: BN,
      options = transferCb,
    ) => {
      const crossInfo = _bridge.getCrossInfo();
      if (crossInfo) {
        const _sender = _account.address;
        const _signer = _account.signer as Signer;
        try {
          const _extrinsic = await _bridge.transfer(_recipient, _amount);
          if (_extrinsic) {
            await signAndSendExtrinsic(_extrinsic, _signer, _sender, _bridge.getSourceChain(), options);
          }
        } catch (err) {
          console.error(err);
          notifyError(err);
          options.failedCb();
        }
      }
    },
    [],
  );
  const transfer = useCallback(
    (
      _bridge: UniversalBridge,
      _sender: string | WalletAccount,
      _recipient: string,
      _amount: BN,
      options?: { successCb: () => void; failedCb: () => void },
    ) => {
      if (typeof _sender === "string") {
        return evmTransfer(_bridge, _sender, _recipient, _amount, options);
      } else {
        return substrateTransfer(_bridge, _sender, _recipient, _amount, options);
      }
    },
    [evmTransfer, substrateTransfer],
  );

  return (
    <TransferContext.Provider
      value={{
        sourceApi,
        targetApi,
        assetLimitOnTargetChain,
        existentialDepositOnTargetChain,
        feeBalanceOnSourceChain,
        targetAssetSupply,
        bridgeInstance,
        sourceAssetBalance,
        targetAssetBalance,
        sourceNativeBalance,
        targetNativeBalance,
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
        transfer,
        updateSourceAssetBalance,
        updateTargetAssetBalance,
        updateSourceNativeBalance,
        updateTargetNativeBalance,
        updateTargetAssetSupply,
        updateFeeBalanceOnSourceChain,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
}
