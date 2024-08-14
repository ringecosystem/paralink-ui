"use client";

import { ChangeEventHandler, useCallback, useMemo, useRef, useState } from "react";
import data from "../data/data.json";
import Image from "next/image";
import ChainSelectInput, { chainType } from "./chainSelectInput";
import SuccessModal from "./successModal";
import PendingModal from "./pendingModal";
import { formatBalance, getAssetIconSrc, isValidAddress, parseCross } from "@/utils";
import { useTransfer } from "@/hooks";
import { BN, BN_ZERO, bnToBn } from "@polkadot/util";
import { formatUnits, parseUnits } from "viem";
import { InputAlert } from "@/old_components/input-alert";

export default function AppBox() {
  const { defaultSourceAssetOptions } = parseCross();
  const [sourceAssetOptions, setSourceAssetOptions] = useState(defaultSourceAssetOptions);
  const [senderSelectedChain, setSenderSelectedChain] = useState<chainType>(data.chains[0]);
  const [recipientSelectedChain, setRecipientSelectedChain] = useState<chainType>(data.chains[0]);
  const [senderAddress, setSenderAddress] = useState<string>("14WfAfDX24cU8StvAGgPnBqGZyJ3gFcPFHh39rQouzvTy4Fj");
  const [recipientAddress, setRecipientAddress] = useState<string>("14WfAfDX24cU8StvAGgPnBqGZyJ3gFcPFHh39rQouzvTy4Fj");
  const [amount, setAmount] = useState<string>("0");
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [pendingModal, setPendingModal] = useState<boolean>(false);

  const {
    sender,
    setSender,
    recipient,
    setRecipient,
    sourceAssetBalance,
    sourceAsset,
    setTransferAmount,
    transferAmount,
    setSourceAsset,
    bridgeInstance,
    assetLimitOnTargetChain,
    targetAssetSupply,
    sourceChain,
    targetChain,
  } = useTransfer();
  const handleCloseSuccessModal = useCallback(() => {
    setSuccessModal(false);
  }, []);

  const handleClosePendingModal = useCallback(() => {
    setPendingModal(false);
  }, []);

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

  return (
    <section className="flex h-fit w-[400px] flex-col gap-[20px] rounded-[20px] bg-white p-[20px]">
      <div className="flex h-[95px] flex-col gap-[10px] rounded-[10px] bg-[#F2F3F5] p-[20px]">
        <div>
          <p className="text-[12px] leading-[15.22px] text-[#12161980]">Token</p>
        </div>
        <div className="flex items-center gap-[10px]">
          {sourceAssetOptions.map((item: any) => (
            <div
              className="flex items-center gap-[10px]"
              key={item.name}
              onClick={() => {
                setSourceAsset(item);
              }}
            >
              <Image src={getAssetIconSrc(item.icon)} width={30} height={30} alt="item.name" />
              {sourceAsset.name === item.name && <p className="text-[18px] font-[700] leading-[23px]">{item.name}</p>}
            </div>
          ))}
        </div>
      </div>
      <div className="flex h-[95px] flex-col gap-[10px] rounded-[10px] bg-[#F2F3F5] p-[10px]">
        <div className="flex items-center justify-between">
          <p className="text-[12px] leading-[15.22px] text-[#12161980]">Sender</p>
          <ChainSelectInput who="sender" />
        </div>
        <input
          type="text"
          value={sender?.address}
          onChange={handleSenderAddressChange}
          className="h-[24px] text-ellipsis whitespace-nowrap border-none bg-transparent text-[14px] font-[700] leading-[24px] outline-none"
        />
      </div>
      <div className="flex h-[95px] flex-col gap-[10px] rounded-[10px] bg-[#F2F3F5] p-[10px]">
        <div className="flex items-center justify-between">
          <p className="text-[12px] leading-[15.22px] text-[#12161980]">Recipient</p>
          <ChainSelectInput who="target" />
        </div>
        <input
          type="text"
          value={recipient?.address}
          onChange={handleRecipientAddressChange}
          className="h-[24px] text-ellipsis whitespace-nowrap border-none bg-transparent text-[14px] font-[700] leading-[24px] outline-none"
        />
      </div>
      <div>
        <div className="flex h-[95px] flex-col gap-[10px] rounded-[10px] bg-[#F2F3F5] p-[10px]">
          <div>
            <p className="text-[12px] leading-[15.22px] text-[#12161980]">Amount</p>
          </div>
          <div className="flex items-center justify-center gap-[10px]">
            <input
              type="text"
              value={transferAmount?.input}
              onChange={handleInputChange}
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
              className="h-[26px] w-fit flex-shrink-0 rounded-[5px] bg-[#FF00831A] px-[15px] text-[12px] font-bold text-[#FF0083]"
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
      </div>
      <button className="h-[34px] flex-shrink-0 rounded-[10px] bg-[#FF0083] text-[14px] leading-[24px] text-white">
        Send
      </button>
      <SuccessModal visible={successModal} onClose={handleCloseSuccessModal} />
      <PendingModal visible={pendingModal} onClose={handleClosePendingModal} />
    </section>
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
