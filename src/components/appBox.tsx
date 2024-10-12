"use client";

import { ChangeEventHandler, useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ChainSelectInput from "./chainSelectInput";
import SuccessModal from "./successModal";
import PendingModal from "./pendingModal";
import {
  formatAddressByChain,
  formatBalance,
  getAssetIconSrc,
  getAvailableSourceAsset,
  getAvailableSourceChain,
  getAvailableSourceChainOptions,
  getAvailableTargetAsset,
  getAvailableTargetChain,
  getAvailableTargetChainOptions,
  isExceedingCrossChainLimit,
  isValidAddress,
} from "@/utils";
import { useTransfer } from "@/hooks";
import { BN, BN_ZERO, bnToBn } from "@polkadot/util";
import { formatUnits, parseUnits } from "viem";
import { WalletID } from "@/types";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import notification from "@/ui/notification";
import { useTrail, animated, useSpring } from "@react-spring/web";
import WalletSelectionModal from "./walletSelectionModal";
import { assetCategories } from "@/config/asset-categories";

export default function AppBox() {
  const [connectModal, setConnectModal] = useState(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<boolean | null>(false);

  const {
    sender,
    setSender,
    recipient,
    setRecipient,
    sourceAssetBalance,
    sourceAsset,
    setTargetAsset,
    setTransferAmount,
    transferAmount,
    setSourceAsset,
    bridgeInstance,
    assetLimitOnTargetChain,
    targetAssetSupply,
    existentialDepositOnTargetChain,
    sourceChain,
    setSourceChain,
    targetChain,
    setTargetChain,
    transfer,
    activeSenderWallet,
    updateSourceAssetBalance,
    updateTargetAssetBalance,
    updateTargetAssetSupply,
    updateSourceNativeBalance,
    updateTargetNativeBalance,
    targetNativeBalance,
    updateFeeBalanceOnSourceChain,
    activeSenderAccount,
    feeBalanceOnSourceChain,
    sourceNativeBalance,
    assetCategory,
    setAssetCategory,
  } = useTransfer();

  const handleCloseSuccessModal = useCallback(() => {
    setSuccessModal(false);
    setReceipt(null);
    setTransferAmount({ valid: true, input: "", amount: BN_ZERO });
    updateSourceAssetBalance();
    updateTargetAssetBalance();
    updateTargetAssetSupply();
    updateSourceNativeBalance();
    updateTargetNativeBalance();
    updateFeeBalanceOnSourceChain();
  }, [
    setTransferAmount,
    updateFeeBalanceOnSourceChain,
    updateSourceAssetBalance,
    updateSourceNativeBalance,
    updateTargetAssetBalance,
    updateTargetAssetSupply,
    updateTargetNativeBalance,
  ]);

  const cross = bridgeInstance?.getCrossInfo();
  const assetLimit = assetLimitOnTargetChain?.amount;
  const assetSupply = targetAssetSupply?.amount;

  const min = useMemo(() => {
    if (cross && cross.fee.asset.local.id === sourceAsset.id) {
      return cross.fee.amount;
    }
    return undefined;
  }, [cross, sourceAsset.id]);

  const insufficient =
    sourceAssetBalance?.amount && transferAmount?.input && sourceAssetBalance.amount.lt(transferAmount?.amount)
      ? true
      : false;
  const requireMin = min && transferAmount?.input && transferAmount.amount.lt(min) ? true : false;
  const requireLimit = isExcess(assetLimitOnTargetChain?.amount, targetAssetSupply?.amount, transferAmount?.amount);

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.target.value) {
        if (!Number.isNaN(Number(e.target.value)) && sourceAsset) {
          setTransferAmount(
            parseValue(e.target.value, sourceAsset.decimals, min, sourceAssetBalance?.amount, assetLimit, assetSupply),
          );
        }
      } else {
        setTransferAmount({ valid: true, input: e.target.value, amount: BN_ZERO });
      }
    },
    [sourceAsset, min, sourceAssetBalance, assetLimit, assetSupply, setTransferAmount],
  );

  const senderAddressType = useMemo(() => sourceChain.addressType, [sourceChain]);

  const handleSenderAddressChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const address = e.target.value;
      const valid = address ? isValidAddress(address, senderAddressType) : true;
      setSender({ valid, address });
    },
    [senderAddressType, setSender],
  );

  const recipientAddressType = useMemo(() => targetChain.addressType, [targetChain]);

  const handleRecipientAddressChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const address = e.target.value;
      const valid = address ? isValidAddress(address, recipientAddressType) : true;
      setRecipient({ valid, address });
    },
    [recipientAddressType, setRecipient],
  );

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address } = useAccount();

  const needSwitchNetwork = useMemo(
    () => activeSenderWallet === WalletID.EVM && chain && chain.id !== sourceChain.id,
    [chain, sourceChain, activeSenderWallet],
  );

  const [busy, setBusy] = useState(false);

  const feeAlert = useMemo(() => {
    const fee = bridgeInstance?.getCrossInfo()?.fee;
    if (fee && feeBalanceOnSourceChain && fee.amount.gt(feeBalanceOnSourceChain.amount)) {
      return (
        <div className="flex items-start justify-center gap-small">
          <Image alt="Warning" width={15} height={15} src="/images/warning.svg" />
          <span className="text-xs text-alert">{`You need at least ${formatBalance(
            fee.amount,
            feeBalanceOnSourceChain.currency.decimals,
          )} ${feeBalanceOnSourceChain.currency.symbol} in your Sender on ${
            sourceChain.name
          } to cover cross-chain fees.`}</span>
        </div>
      );
    }
    return null;
  }, [bridgeInstance, feeBalanceOnSourceChain, sourceChain]);

  const existentialAlertOnSourceChain = useMemo(() => {
    if (
      sourceChain.existential &&
      sourceNativeBalance &&
      sourceNativeBalance.amount.lt(sourceChain.existential.minBalance)
    ) {
      return (
        <div className="flex items-start justify-center gap-small">
          <Image alt="Warning" width={15} height={15} src="/images/warning.svg" />
          <span className="text-xs text-alert">{`You need at least ${formatBalance(
            sourceChain.existential.minBalance,
            sourceChain.nativeCurrency.decimals,
          )} ${sourceChain.nativeCurrency.symbol} in your Sender on ${
            sourceChain.name
          } to keep an account alive.`}</span>
        </div>
      );
    }
    return null;
  }, [
    sourceChain.existential,
    sourceChain.name,
    sourceChain.nativeCurrency.decimals,
    sourceChain.nativeCurrency.symbol,
    sourceNativeBalance,
  ]);

  const existentialAlertOnTargetChain = useMemo(() => {
    if (
      targetNativeBalance &&
      existentialDepositOnTargetChain &&
      targetNativeBalance.amount.lt(existentialDepositOnTargetChain.amount)
    ) {
      return (
        <div className="flex items-start justify-center gap-small">
          <Image alt="Warning" width={15} height={15} src="/images/warning.svg" />
          <span className="text-xs text-alert">{`You need at least ${formatBalance(
            existentialDepositOnTargetChain.amount,
            existentialDepositOnTargetChain.currency.decimals,
          )} ${existentialDepositOnTargetChain.currency.symbol} in your Recipient on ${
            targetChain.name
          } to keep an account open.`}</span>
        </div>
      );
    }
    return null;
  }, [targetNativeBalance, existentialDepositOnTargetChain, targetChain]);

  const disabledSend =
    !sender?.address ||
    !sender.valid ||
    !recipient?.address ||
    !recipient?.valid ||
    !transferAmount.input ||
    !transferAmount.valid ||
    !!feeAlert ||
    !!existentialAlertOnSourceChain ||
    !!existentialAlertOnTargetChain;

  const handleSend = useCallback(async () => {
    if (needSwitchNetwork) {
      switchNetwork?.(sourceChain.id);
    } else if (bridgeInstance && recipient) {
      const callback = {
        successCb: (receipt: any) => {
          setReceipt(receipt);
          setBusy(false);
          setSuccessModal(true);
        },
        failedCb: () => {
          setBusy(false);
        },
      };
      const sender_ = activeSenderAccount ?? (address && sender?.address === address ? address : undefined);
      setBusy(true);
      if (await isExceedingCrossChainLimit(bridgeInstance, transferAmount.input)) {
        notification.error({ title: "Transaction failed", description: "Exceeding the cross-chain limit." });
        updateTargetAssetSupply();
        setBusy(false);
      } else if (sender_) {
        await transfer(bridgeInstance, sender_, recipient.address, transferAmount.amount, callback);
      }
    } else {
      notification.warn({ title: "Oops!", description: "Failed to construct bridge." });
    }
  }, [
    activeSenderAccount,
    address,
    bridgeInstance,
    needSwitchNetwork,
    recipient,
    sender?.address,
    sourceChain.id,
    switchNetwork,
    transfer,
    transferAmount.amount,
    transferAmount.input,
    updateTargetAssetSupply,
  ]);

  const trails = useTrail(5, {
    from: { transform: "translateX(-100%)", opacity: 0 },
    to: { opacity: 1, transform: "translateX(0)" },
  });

  const style = useSpring({
    from: { opacity: 0, transform: "translateY(-100%)" },
    to: { opacity: 1, transform: "translateY(0)" },
  });

  return (
    <>
      <animated.section
        style={style}
        className="flex h-fit w-[400px] flex-col gap-[20px] rounded-[20px] bg-white p-[20px]"
      >
        <animated.div
          style={trails[0]}
          className="flex h-[95px] flex-col gap-[10px] rounded-[10px] bg-[#F2F3F5] p-[20px]"
        >
          <div>
            <p className="text-[12px] leading-[15.22px] text-[#12161980]">Token</p>
          </div>
          <div className="flex items-center gap-[10px]">
            {assetCategories.map((item) => (
              <div
                className="flex items-center gap-[10px] duration-500"
                key={item.name}
                style={{
                  maxWidth: assetCategory === item.category ? "100px" : "30px",
                  transitionDelay: assetCategory === item.category ? "0.4s" : "0s",
                }}
                onClick={() => {
                  setAssetCategory(item.category);
                  const _sourceChain = getAvailableSourceChain(getAvailableSourceChainOptions(item.category));
                  const _sourceAsset = getAvailableSourceAsset(_sourceChain, item.category);
                  const _targetChain = getAvailableTargetChain(getAvailableTargetChainOptions(_sourceAsset));
                  const _targetAsset = getAvailableTargetAsset(_targetChain, item.category);
                  setSourceChain(_sourceChain);
                  setSourceAsset(_sourceAsset);
                  setTargetChain(_targetChain);
                  setTargetAsset(_targetAsset);
                }}
              >
                <Image
                  src={getAssetIconSrc(item.icon)}
                  width={30}
                  height={30}
                  alt="item.name"
                  style={{ borderRadius: "50%" }}
                />
                <p className="overflow-hidden text-[18px] font-[700] leading-[23px]">{item.name}</p>
              </div>
            ))}
          </div>
        </animated.div>
        <animated.div
          style={trails[1]}
          className="z-20 flex h-[84px] flex-col gap-[10px] rounded-[10px] bg-[#F2F3F5] p-[10px]"
        >
          <div className="flex h-[30px] items-center justify-between">
            <p className="text-[12px] leading-[15.22px] text-[#12161980]">Sender</p>
            <ChainSelectInput
              value={sourceChain}
              options={getAvailableSourceChainOptions(assetCategory)}
              onSelect={(chain) => {
                setSourceChain(chain);
                const _sourceAsset = getAvailableSourceAsset(chain, assetCategory);
                const _targetChain = getAvailableTargetChain(getAvailableTargetChainOptions(_sourceAsset));
                const _targetAsset = getAvailableTargetAsset(_targetChain, assetCategory);
                setSourceAsset(_sourceAsset);
                setTargetChain(_targetChain);
                setTargetAsset(_targetAsset);
              }}
            />
          </div>
          {sender ? (
            <input
              type="text"
              disabled
              value={sender ? formatAddressByChain(sender.address, sourceChain) : ""}
              onChange={handleSenderAddressChange}
              placeholder="Enter address"
              className="h-[24px] text-ellipsis whitespace-nowrap border-none bg-transparent text-[14px] font-[700] leading-[24px] outline-none"
            />
          ) : (
            <button
              onClick={() => {
                setConnectModal(true);
              }}
              className="mt-auto h-[24px] w-fit text-[14px] font-bold text-[#FF0083]"
            >
              Connect Wallet
            </button>
          )}
        </animated.div>
        <animated.div
          style={trails[2]}
          className="z-10 flex h-[84px] flex-col gap-[10px] rounded-[10px] bg-[#F2F3F5] p-[10px]"
        >
          <div className="flex h-[30px] items-center justify-between">
            <p className="text-[12px] leading-[15.22px] text-[#12161980]">Recipient</p>
            <ChainSelectInput
              value={targetChain}
              options={getAvailableTargetChainOptions(sourceAsset)}
              onSelect={(chain) => {
                setTargetChain(chain);
                const _targetAsset = getAvailableTargetAsset(chain, assetCategory);
                setTargetAsset(_targetAsset);
              }}
            />
          </div>
          <input
            type="text"
            value={recipient?.address}
            onChange={handleRecipientAddressChange}
            placeholder="Enter address"
            className="h-[24px] text-ellipsis whitespace-nowrap border-none bg-transparent text-[14px] font-[700] leading-[24px] outline-none"
          />
        </animated.div>
        <animated.div style={trails[3]}>
          <div className="z-0 flex h-[71px] flex-col gap-[10px] rounded-[10px] bg-[#F2F3F5] p-[10px]">
            <div>
              <p className="text-[12px] leading-[15.22px] text-[#12161980]">Amount</p>
            </div>
            <div className="flex items-center justify-center gap-[10px]">
              <input
                type="text"
                value={transferAmount?.input}
                onChange={handleInputChange}
                placeholder="0"
                className="h-[24px] flex-grow text-ellipsis whitespace-nowrap border-none bg-transparent text-[14px] font-[700] leading-[24px] outline-none"
              />
              <button
                onClick={() => {
                  if (sourceAssetBalance?.amount && assetSupply) {
                    if (assetLimit && assetSupply.gte(assetLimit)) {
                      setTransferAmount({ valid: !(min && min.gt(BN_ZERO)), input: "0", amount: BN_ZERO });
                    } else if (assetLimit) {
                      const remaining = assetLimit.sub(assetSupply);
                      const amount = remaining.lte(sourceAssetBalance?.amount) ? remaining : sourceAssetBalance?.amount;
                      const input = formatUnits(BigInt(amount.toString()), sourceAsset.decimals);
                      setTransferAmount({ valid: !(min && min.gt(amount)), input, amount });
                    } else {
                      setTransferAmount({
                        amount: sourceAssetBalance?.amount,
                        valid: !(min && min.gt(sourceAssetBalance?.amount)),
                        input: formatUnits(BigInt(sourceAssetBalance?.amount.toString()), sourceAsset.decimals),
                      });
                    }
                  } else {
                    setTransferAmount({ valid: !(min && min.gt(BN_ZERO)), input: "0", amount: BN_ZERO });
                  }
                }}
                className="duration-300s h-[26px] w-fit flex-shrink-0 rounded-[5px] bg-[#FF00831A] px-[15px] text-[12px] font-bold text-[#FF0083] hover:shadow-lg"
              >
                Max
              </button>
            </div>
          </div>
          {sourceAssetBalance && (
            <p className="mt-[5px] text-[12px] leading-[15px] text-[#12161980]">
              Balance: {formatBalance(sourceAssetBalance.amount, sourceAsset.decimals)} {sourceAsset.name}
            </p>
          )}
          {requireLimit ? (
            <p className="mt-[5px] text-[12px] leading-[15px] text-[#FF0083]">
              {`* Limit: ${formatBalance(assetLimit ?? BN_ZERO, sourceAsset?.decimals ?? 0)}, supply: ${formatBalance(
                (assetSupply ?? BN_ZERO).add(transferAmount?.amount ?? BN_ZERO),
                sourceAsset?.decimals ?? 0,
              )}.`}
            </p>
          ) : requireMin ? (
            <p className="mt-[5px] text-[12px] leading-[15px] text-[#FF0083]">
              {`* At least ${formatBalance(min ?? BN_ZERO, sourceAsset?.decimals ?? 0)} ${
                sourceAsset.symbol
              } for tx fee.`}
            </p>
          ) : insufficient ? (
            <p className="mt-[5px] text-[12px] leading-[15px] text-[#FF0083]">* Insufficient.</p>
          ) : null}
        </animated.div>
        {feeAlert}
        {existentialAlertOnSourceChain}
        {existentialAlertOnTargetChain}
        <animated.div className="flex w-full" style={trails[4]}>
          <button
            onClick={handleSend}
            disabled={!sender || needSwitchNetwork || disabledSend}
            className="h-[34px] w-full flex-shrink-0 rounded-[10px] bg-[#FF0083] text-[14px] leading-[24px] text-white disabled:opacity-50"
          >
            Send
          </button>
        </animated.div>
      </animated.section>

      <SuccessModal visible={successModal} onClose={handleCloseSuccessModal} receipt={receipt} />
      <PendingModal visible={busy} />
      <WalletSelectionModal
        visible={connectModal}
        onClose={() => {
          setConnectModal(false);
        }}
      />
    </>
  );
}

function parseValue(origin: string, decimals: number, min?: BN, max?: BN, limit?: BN, supply?: BN) {
  let input = "";
  let amount = BN_ZERO;
  const [i, d] = origin.split(".").concat("-1");
  if (i) {
    input = d === "-1" ? i : d ? `${i}.${d.slice(0, decimals)}` : `${i}.`;
    amount = bnToBn(parseUnits(input, decimals));
  }
  const valid =
    min && amount.lt(min) ? false : max && amount.gt(max) ? false : isExcess(limit, supply, amount) ? false : true;
  return { input, amount, valid };
}

function isExcess(limit?: BN, supply?: BN, amount = BN_ZERO) {
  return limit && supply && supply.add(amount).gt(limit) ? true : false;
}
