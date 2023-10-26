"use client";

import "@polkadot/api-augment/substrate";
import type { Unsubcall } from "@polkadot/extension-inject/types";
import type { XcmV3WeightLimit, XcmVersionedMultiLocation, XcmVersionedMultiAssets } from "@polkadot/types/lookup";
import { bnToBn, u8aToHex, BN_ZERO, BN_TEN, formatBalance } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Wallet, WalletAccount, getWallets } from "@talismn/connect-wallets";
import { useEffect, useState } from "react";
import { Signer } from "@polkadot/api/types";
import { signAndSendExtrinsic } from "@/utils/tx";
import { XcmVersionedMultiAsset } from "@/types";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { pangolinChain } from "@/config/chains";
import { DISPATCH_PRECOMPILE_ADDRESS } from "@/config";
import { formatUnits } from "viem";

/**
 * encodeAddress('0x44cb62d1d6cdd2fff2a5ef3bb7ef827be5b3e117a394ecaa634d8dd9809d5608') => address
 * u8aToHex(decodeAddress('5DcuXnWag4ro3fPNKcYvD3G1vPUVG1hhTViHn6AhVniKjtND')) => publicKey
 */

// console.log(BN_TEN.muln(2.2399999).toString()); // => 22
// console.log(BN_TEN.pow(bnToBn(6)).toString()); // => 1000000

/**
 * Pangolin => AssetHub:
 *     - section: xTokens
 *     - method: transferMultiasset
 */

export default function JayTest() {
  const [talismanWallet, setTalismanWallet] = useState<Wallet>();
  const [talismanAccounts, setTalismanAccounts] = useState<WalletAccount[]>([]);

  const { openConnectModal } = useConnectModal();
  const { switchNetwork } = useSwitchNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { chain } = useNetwork();

  const handleConnectTalismanWallet = async () => {
    console.log("Start");

    const installedWallets = getWallets().filter((w) => w.installed);
    const talisman = installedWallets.find((wallet) => wallet.extensionName === "talisman");
    if (talisman) {
      await talisman.enable("Darwinia CrossChain");
      setTalismanWallet(talisman);
    }

    console.log("End");
  };

  const handleCrossUSDTFromPangolinToAssetHub = async () => {
    console.log("Start");

    const pangolinAccount = talismanAccounts.find((acc) => acc.name === "Account 01 Ethereum");
    const assethubAccount = talismanAccounts.find((acc) => acc.name === "Account 01");

    if (pangolinAccount && assethubAccount) {
      const api = await ApiPromise.create({ provider: new WsProvider("wss://pangolin-rpc.darwinia.network/") });
      const section = "xTokens";
      const method = "transferMultiasset";
      const fn = api.tx[section][method];

      const signer = pangolinAccount.signer as Signer;
      const sender = pangolinAccount.address;
      const recipient = assethubAccount.address;

      const token = {
        id: 7777,
        decimals: 6,
      };
      const crossValue = 20.5; // In USDT
      const crossAmount = BN_TEN.pow(bnToBn(token.decimals)).muln(crossValue);

      /**
       * Token name, symbol and decimals: api.query.assets.metadata
       */
      const assetId = 1027;
      const assetOption = await api.query.assets.account(assetId, sender);
      if (assetOption.isSome) {
        const assetBalance = assetOption.unwrap().balance;
        console.log(
          assetBalance.toString(),
          formatBalance(assetBalance, { decimals: 6, forceUnit: "Unit", withUnit: false }),
        );
      }

      /**
       * Token decimals and symbol: api.rpc.system.properties
       */
      const balancesAll = await api.derive.balances.all(sender);
      const locked = balancesAll.lockedBalance;
      const transferrable = balancesAll.availableBalance;
      const total = balancesAll.freeBalance.add(balancesAll.reservedBalance);
      console.log(
        formatBalance(locked, { decimals: 18, forceUnit: "Unit", withUnit: false }),
        formatBalance(transferrable, { decimals: 18, forceUnit: "Unit", withUnit: false }),
        formatBalance(total, { decimals: 18, forceUnit: "Unit", withUnit: false }),
      );

      const asset = api.registry.createType<XcmVersionedMultiAsset>("XcmVersionedMultiAsset", {
        V3: {
          id: {
            Concrete: {
              parents: 1,
              interior: {
                X3: [{ Parachain: bnToBn(1000) }, { PalletInstance: 50 }, { GeneralIndex: bnToBn(token.id) }],
              },
            },
          },
          fun: { Fungible: crossAmount },
        },
      });
      const dest = api.registry.createType<XcmVersionedMultiLocation>("XcmVersionedMultiLocation", {
        V3: {
          parents: 1,
          interior: {
            X2: [
              { Parachain: bnToBn(1000) },
              { AccountId32: { network: null, id: u8aToHex(decodeAddress(recipient)) } },
            ],
          },
        },
      });
      const destWeightLimit = api.registry.createType<XcmV3WeightLimit>("XcmV3WeightLimit", { Unlimited: null });

      const extrinsic = fn(asset, dest, destWeightLimit);
      await signAndSendExtrinsic(extrinsic, signer, sender);
    }

    console.log("End");
  };

  const handleCrossUSDTFromAssetHubToPangolin = async () => {
    console.log("Start");

    const pangolinAccount = talismanAccounts.find((acc) => acc.name === "Account 01 Ethereum");
    const assethubAccount = talismanAccounts.find((acc) => acc.name === "Account 01");

    if (pangolinAccount && assethubAccount) {
      const api = await ApiPromise.create({ provider: new WsProvider("wss://rococo-asset-hub-rpc.polkadot.io/") });
      const section = "polkadotXcm";
      const method = "limitedReserveTransferAssets";
      const fn = api.tx[section][method];

      const signer = assethubAccount.signer as Signer;
      const sender = assethubAccount.address;
      const recipient = pangolinAccount.address;

      const token = {
        id: 7777,
        decimals: 6,
      };
      const crossValue = 6.5; // In USDT
      const crossAmount = BN_TEN.pow(bnToBn(token.decimals)).muln(crossValue);

      const dest: XcmVersionedMultiLocation = api.registry.createType<XcmVersionedMultiLocation>(
        "XcmVersionedMultiLocation",
        { V3: { parents: 1, interior: { X1: { Parachain: bnToBn(2105) } } } },
      );
      const beneficiary: XcmVersionedMultiLocation = api.registry.createType<XcmVersionedMultiLocation>(
        "XcmVersionedMultiLocation",
        { V3: { parents: 0, interior: { X1: { AccountKey20: { network: null, key: recipient } } } } },
      );
      const assets: XcmVersionedMultiAssets = api.registry.createType<XcmVersionedMultiAssets>(
        "XcmVersionedMultiAssets",
        {
          V3: [
            {
              id: {
                Concrete: {
                  parents: 0,
                  interior: { X2: [{ PalletInstance: 50 }, { GeneralIndex: bnToBn(token.id) }] },
                },
              },
              fun: { Fungible: crossAmount },
            },
          ],
        },
      );
      const feeAssetItem = BN_ZERO;
      const weightLimit: XcmV3WeightLimit = api.registry.createType<XcmV3WeightLimit>("XcmV3WeightLimit", {
        Unlimited: null,
      });

      const extrinsic = fn(dest, beneficiary, assets, feeAssetItem, weightLimit);
      await signAndSendExtrinsic(extrinsic, signer, sender);
    }

    console.log("End");
  };

  /**
   * Precompile reference: https://github.com/darwinia-network/apps/pull/331
   */
  const handleCrossUSDTFromPangolinToAssetHubWithPrecompile = async () => {
    console.log("Start");

    const pangolinAccount = talismanAccounts.find((acc) => acc.name === "Account 01 Ethereum");
    const assethubAccount = talismanAccounts.find((acc) => acc.name === "Account 01");

    if (pangolinAccount && assethubAccount && walletClient && address) {
      const api = await ApiPromise.create({ provider: new WsProvider("wss://pangolin-rpc.darwinia.network/") });
      const section = "xTokens";
      const method = "transferMultiasset";
      const fn = api.tx[section][method];

      const sender = address;
      const recipient = assethubAccount.address;

      const token = {
        id: 7777,
        decimals: 6,
      };
      const crossValue = 9.5; // In USDT
      const crossAmount = BN_TEN.pow(bnToBn(token.decimals)).muln(crossValue);

      const asset = api.registry.createType<XcmVersionedMultiAsset>("XcmVersionedMultiAsset", {
        V3: {
          id: {
            Concrete: {
              parents: 1,
              interior: {
                X3: [{ Parachain: bnToBn(1000) }, { PalletInstance: 50 }, { GeneralIndex: bnToBn(token.id) }],
              },
            },
          },
          fun: { Fungible: crossAmount },
        },
      });
      const dest = api.registry.createType<XcmVersionedMultiLocation>("XcmVersionedMultiLocation", {
        V3: {
          parents: 1,
          interior: {
            X2: [
              { Parachain: bnToBn(1000) },
              { AccountId32: { network: null, id: u8aToHex(decodeAddress(recipient)) } },
            ],
          },
        },
      });
      const destWeightLimit = api.registry.createType<XcmV3WeightLimit>("XcmV3WeightLimit", { Unlimited: null });

      const extrinsic = fn(asset, dest, destWeightLimit);

      try {
        const estimateGas = await publicClient.estimateGas({
          account: sender,
          to: DISPATCH_PRECOMPILE_ADDRESS,
          data: u8aToHex(extrinsic.method.toU8a()),
        });
        const { maxFeePerGas } = await publicClient.estimateFeesPerGas();
        const estimateFee = estimateGas * (maxFeePerGas || 0n);
        console.log(estimateGas, maxFeePerGas, estimateFee, formatUnits(estimateFee, 18));

        const hash = await walletClient.sendTransaction({
          account: sender,
          to: DISPATCH_PRECOMPILE_ADDRESS,
          data: u8aToHex(extrinsic.method.toU8a()),
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(receipt);
      } catch (err) {
        console.error(err);
      } finally {
        //
      }
    }

    console.log("End");
  };

  /**
   * Subscribe accounts
   */
  useEffect(() => {
    let unsub: Unsubcall | undefined;

    if (talismanWallet) {
      (
        talismanWallet.subscribeAccounts((accounts) => {
          setTalismanAccounts(accounts || []);
        }) as Promise<Unsubcall>
      )
        .then((_unsub) => {
          unsub = _unsub;
        })
        .catch((err) => {
          console.error(err);
          setTalismanAccounts([]);
        });
    } else {
      setTalismanAccounts([]);
    }

    return () => {
      unsub && unsub();
    };
  }, [talismanWallet]);

  return (
    <div className="flex h-screen w-full flex-col items-center gap-5 pt-10">
      <button onClick={handleConnectTalismanWallet} className="border border-black p-2 hover:text-blue-500">
        Connect Talisman Wallet
      </button>
      <button onClick={openConnectModal} className="border border-black p-2 hover:text-blue-500">
        Connect Rainbow Wallet
      </button>
      <button onClick={() => switchNetwork?.(pangolinChain.id)} className="border border-black p-2 hover:text-blue-500">
        Switch to Pangolin
      </button>
      <button onClick={handleCrossUSDTFromPangolinToAssetHub} className="border border-black p-2 hover:text-blue-500">
        Cross USDT from Pangolin to AssetHub
      </button>
      <button onClick={handleCrossUSDTFromAssetHubToPangolin} className="border border-black p-2 hover:text-blue-500">
        Cross USDT from AssetHub to Pangolin
      </button>
      <button
        onClick={handleCrossUSDTFromPangolinToAssetHubWithPrecompile}
        className="border border-black p-2 hover:text-blue-500"
      >
        Cross USDT from Pangolin to AssetHub with Precompile
      </button>
      <span>
        {chain?.name} :: {address}
      </span>
    </div>
  );
}
