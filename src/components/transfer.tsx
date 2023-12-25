"use client";

import Button from "@/ui/button";
import BalanceInput from "./balance-input";
import ChainSelect from "./chain-select";
import TransferSection from "./transfer-section";
import { isAssetExcess, parseCross } from "@/utils";
import { useTalisman, useTransfer } from "@/hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SwitchCross from "./switch-cross";
import AddressInput from "./address-input";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { Asset, ChainConfig, WalletID } from "@/types";
import { BN_ZERO } from "@polkadot/util";
import notification from "@/ui/notification";

const {
  defaultSourceChainOptions,
  defaultTargetChainOptions,
  defaultSourceAssetOptions,
  availableSourceAssetOptions,
  availableTargetChainOptions,
  availableTargetAssetOptions,
} = parseCross();

export default function Transfer() {
  const {
    assetLimit,
    targetAssetDetails,
    sender,
    recipient,
    sourceChain,
    targetChain,
    sourceAsset,
    targetAsset,
    sourceBalance,
    targetBalance,
    transferAmount,
    bridgeInstance,
    activeSenderAccount,
    activeSenderWallet,
    activeRecipientWallet,
    setSender,
    setRecipient,
    setActiveSenderAccount,
    setActiveRecipientAccount,
    setSourceChain,
    setTargetChain,
    setSourceAsset,
    setTargetAsset,
    setTransferAmount,
    evmTransfer,
    substrateTransfer,
    refetchSourceBalance,
    refetchTargetBalance,
    refetchTargetAssetDetails,
  } = useTransfer();
  const [sourceChainOptions, _setSourceChainOptions] = useState(defaultSourceChainOptions);
  const [targetChainOptions, setTargetChainOptions] = useState(defaultTargetChainOptions);
  const [sourceAssetOptions, setSourceAssetOptions] = useState(defaultSourceAssetOptions);
  const [busy, setBusy] = useState(false);

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { talismanAccounts } = useTalisman();
  const { address } = useAccount();

  const canSwitch = useMemo(() => {
    const length =
      availableTargetAssetOptions[targetChain.network]?.[targetAsset.symbol]?.[sourceChain.network]?.length;
    return !!length;
  }, [sourceChain, targetChain, targetAsset]);

  const needSwitchNetwork = useMemo(
    () => activeSenderWallet === WalletID.RAINBOW && chain && chain.id !== sourceChain.id,
    [chain, sourceChain, activeSenderWallet],
  );

  const sourceChainRef = useRef(sourceChain);
  const targetChainRef = useRef(targetChain);
  const sourceAssetRef = useRef(sourceAsset);
  const targetAssetRef = useRef(targetAsset);

  const _setSourceChain = useCallback(
    (chain: ChainConfig | undefined) => {
      setSourceChain((prev) => chain ?? prev);
      sourceChainRef.current = chain ?? sourceChainRef.current;
    },
    [setSourceChain],
  );

  const _setTargetChain = useCallback(
    (chain: ChainConfig | undefined) => {
      setTargetChain((prev) => chain ?? prev);
      targetChainRef.current = chain ?? targetChainRef.current;
    },
    [setTargetChain],
  );

  const _setSourceAsset = useCallback(
    (asset: Asset | undefined) => {
      setSourceAsset((prev) => asset ?? prev);
      sourceAssetRef.current = asset ?? sourceAssetRef.current;
    },
    [setSourceAsset],
  );

  const _setTargetAsset = useCallback(
    (asset: Asset | undefined) => {
      setTargetAsset((prev) => asset ?? prev);
      targetAssetRef.current = asset ?? targetAssetRef.current;
    },
    [setTargetAsset],
  );

  const handleSwitch = useCallback(() => {
    setSourceChain(targetChainRef.current);
    setTargetChain(sourceChainRef.current);
    setSourceAsset(targetAssetRef.current);
    setTargetAsset(sourceAssetRef.current);

    const c = sourceChainRef.current;
    sourceChainRef.current = targetChainRef.current;
    targetChainRef.current = c;

    const a = sourceAssetRef.current;
    sourceAssetRef.current = targetAssetRef.current;
    targetAssetRef.current = a;
  }, [setSourceChain, setTargetChain, setSourceAsset, setTargetAsset]);

  const handleSend = useCallback(async () => {
    if (needSwitchNetwork) {
      switchNetwork?.(sourceChain.id);
    } else if (bridgeInstance && recipient) {
      const callback = {
        successCb: () => {
          setBusy(false);
          setTransferAmount({ valid: true, input: "", amount: BN_ZERO });
          refetchSourceBalance();
          refetchTargetBalance();
          refetchTargetAssetDetails();
        },
        failedCb: () => {
          setBusy(false);
        },
      };
      setBusy(true);
      if (await isAssetExcess(bridgeInstance, transferAmount.amount)) {
        notification.error({ title: "Transaction failed", description: "Asset limit exceeded" });
        refetchTargetAssetDetails();
        setBusy(false);
      } else if (address && sender?.address === address) {
        await evmTransfer(bridgeInstance, address, recipient.address, transferAmount.amount, callback);
      } else if (activeSenderAccount) {
        await substrateTransfer(
          bridgeInstance,
          activeSenderAccount,
          recipient.address,
          transferAmount.amount,
          callback,
        );
      }
    }
  }, [
    sender,
    address,
    activeSenderAccount,
    needSwitchNetwork,
    bridgeInstance,
    recipient,
    transferAmount,
    sourceChain,
    setTransferAmount,
    switchNetwork,
    evmTransfer,
    substrateTransfer,
    refetchSourceBalance,
    refetchTargetBalance,
    refetchTargetAssetDetails,
  ]);

  useEffect(() => {
    const options = availableSourceAssetOptions[sourceChain.network] || [];
    setSourceAssetOptions(options);
    _setSourceAsset(options.at(0));
  }, [sourceChain, _setSourceAsset]);

  useEffect(() => {
    const options = availableTargetChainOptions[sourceChain.network]?.[sourceAsset.symbol] || [];
    setTargetChainOptions(options);
    _setTargetChain(options.at(0));
  }, [sourceChain, sourceAsset, _setTargetChain]);

  useEffect(() => {
    const options = availableTargetAssetOptions[sourceChain.network]?.[sourceAsset.symbol]?.[targetChain.network] || [];
    _setTargetAsset(options.at(0));
  }, [sourceChain, targetChain, sourceAsset, _setTargetAsset]);

  const disabledSend =
    !(
      sender?.address &&
      sender.valid &&
      recipient?.address &&
      recipient.valid &&
      transferAmount.input &&
      transferAmount.valid
    ) && !needSwitchNetwork;
  const senderOptions =
    activeSenderWallet === WalletID.RAINBOW && address
      ? [{ address }]
      : activeSenderWallet === WalletID.TALISMAN
      ? talismanAccounts
      : [];
  const recipientOptions =
    activeRecipientWallet === WalletID.RAINBOW && address
      ? [{ address }]
      : activeRecipientWallet === WalletID.TALISMAN
      ? talismanAccounts
      : [];

  return (
    <div className="border-radius mx-auto mt-10 flex w-[30rem] flex-col gap-5 bg-component p-5">
      {/* From */}
      <TransferSection
        label="From"
        extra={<ChainSelect value={sourceChain} options={sourceChainOptions} onChange={_setSourceChain} />}
        className="mb-3 mt-12"
      >
        <BalanceInput
          value={transferAmount}
          asset={sourceAsset}
          assetLimit={assetLimit}
          assetSupply={targetAssetDetails?.supply}
          min={sourceChain.minCross}
          balance={sourceBalance?.asset.value}
          assetOptions={sourceAssetOptions}
          onChange={setTransferAmount}
          onAssetChange={_setSourceAsset}
        />
      </TransferSection>

      {/* Switch */}
      <SwitchCross disabled={!canSwitch} onClick={handleSwitch} />

      {/* To */}
      <TransferSection
        label="To"
        extra={<ChainSelect value={targetChain} options={targetChainOptions} onChange={_setTargetChain} />}
        className="mt-3"
      >
        <BalanceInput disabled asset={targetAsset} balance={targetBalance?.asset.value} placeholder="Balance 0" />
      </TransferSection>

      {/* Sender */}
      <TransferSection label="Sender" className="mt-10">
        <AddressInput
          who="sender"
          placeholder="Select an address"
          value={sender}
          options={senderOptions}
          accounts={activeSenderWallet === WalletID.TALISMAN ? talismanAccounts : []}
          onClear={setSender}
          onChange={setSender}
          onAccountChange={setActiveSenderAccount}
        />
      </TransferSection>

      {/* Recipient */}
      <TransferSection label="Recipient" className="mt-10">
        <AddressInput
          canInput
          who="recipient"
          placeholder="Select or enter an address"
          value={recipient}
          options={recipientOptions}
          accounts={activeRecipientWallet === WalletID.TALISMAN ? talismanAccounts : []}
          onClear={setRecipient}
          onChange={setRecipient}
          onAccountChange={setActiveRecipientAccount}
        />
      </TransferSection>

      {/* Send */}
      <Button kind="primary" className="py-[7px]" onClick={handleSend} disabled={disabledSend} busy={busy}>
        {needSwitchNetwork ? "Switch network" : "Send"}
      </Button>
    </div>
  );
}
