/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  Payment,
  useInitializeSDK,
  usePay,
  usePayErc20,
} from "scribepay-sdk";
import { ProviderConfig } from "scribepay-sdk";
import "./App.css"; // Import the CSS file
interface IToken {
  value: string;
  label: string;
}
const apiKey = import.meta.env.VITE_API_KEY;
export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>(
    undefined
  );
  const [selectedToken, setSelectedToken] = useState<IToken>({
    value: "",
    label: "",
  });

  const [businessChain, setBusinessChain] = useState<any | null>(null); // Update type for better clarity
  const [error, setError] = useState<string>(""); // To store error message
  const currentTime = Math.floor(Date.now() / 1000);
  const timePlus3Minutes = currentTime + 3 * 60;

  useEffect(() => {
    const { ethereum } = window;
    if (ethereum) {
      const newProvider = new ethers.BrowserProvider(ethereum);
      setProvider(newProvider);
      if (businessData && businessData.chains.length > 0 && provider) {
        provider.getNetwork().then((network) => {
          const mChain = businessData.chains.find(
            (chain) => chain.chainId === Number(network.chainId)
          );
          setBusinessChain(mChain || null);
        });

      }
    }
  }, []);

  const providerConfig: ProviderConfig = {
    apiKey: apiKey,
    provider: provider
  };

  const { businessData } = useInitializeSDK(providerConfig);


  ethereum.on("chainChanged", async (chainId: string) => {
    if (businessData && businessData.chains.length > 0) {
      console.log("Chain changed to:", chainId);
      const mChain = businessData.chains.find(
        (chain) => chain.chainId === parseInt(chainId, 16)
      );
      setBusinessChain(mChain || null);
      // Fetch updated network details
      // const network = await newProvider.getNetwork();
      // console.log("Updated Network:", network);
    }
  });

  
  // Handle token selection change
  const handleTokenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value, options } = event.target;
    const label = options[options.selectedIndex].text;
    setSelectedToken({ value, label });
    setError(""); // Reset error when a new token is selected
  };

  const handlePaymentSuccess = () => {
    console.log("Payment was successful!");
    // Perform any additional actions, such as navigation or showing a success message
  };

  const { payNativeToken, currencyResData } = usePay({
    amount: "0.01",
    expectedDelivery: 11111111,
    fromCurrency: "USD",
    token: { value: selectedToken.value, label: selectedToken.label },
  });



  const { payERC20Token } = usePayErc20({
    amount: "1",
    expectedDelivery: 11111111,
    fromCurrency: "USD",
    token: { value: selectedToken.value, label: selectedToken.label },
  });

  const handlePay = (payFunction: () => void) => {
    // Validation: Check if a token is selected
    if (!selectedToken.value) {
      setError("Please select a token before proceeding.");
      return;
    }
    setError(""); // Clear error if valid token is selected
    payFunction(); // Proceed with payment if token is valid
  };
  return (
    <main>
      <div className="h1">
        <h1>ScribePay Demo </h1>
      </div>
      <div className="main-wrapper">
        <div className="container">
          <h3>Integartion With ScribePay UI</h3>
          <Payment
            amount="0.01"
            expectedDelivery={timePlus3Minutes}
            theme="dark"
            fromCurrency="USD"
            onSuccess={handlePaymentSuccess}
          />
        </div>
        <div className="container">
          <h3>Integartion With Custom UI </h3>
          <div className="custom-wrapper">
            <div>
              <div style={{ marginBottom: "16px" }}>Amount From : 0.01 USD</div>
              <div style={{ marginBottom: "16px" }}>
                Amount To :{" "}
                {currencyResData !== null
                  ? currencyResData?.rate.toFixed(4)
                  : "-"}{" "}
                {currencyResData !== null ? currencyResData?.to : "-"}{" "}
              </div>
            </div>
            {/* Token selection dropdown */}
            <div>
              <label htmlFor="token-select" className="block text-gray-700">
                Select Token
              </label>
              <select
                id="token-select"
                value={selectedToken.value}
                onChange={handleTokenChange}
                className="select-token"
              >
                <option value="">-- Select Token --</option>
                {businessChain?.supportedTokens.map(
                  (item: { tokenName: string; tokenAddress: string }) => (
                    <option key={item.tokenAddress} value={item.tokenAddress}>
                      {item.tokenName}
                    </option>
                  )
                )}
                {/* {(businessChain) ?
                  businessChain.supportedTokens.map(
                    (item: { tokenName: string; tokenAddress: string }) => (
                      <option value={item.tokenAddress} label={item.tokenName}>
                        {item.tokenName}
                      </option>
                    )
                  ) : {}} */}
              </select>
            </div>

            {/* Display error message if no token is selected */}
            {error && <p className="error-message">{error}</p>}

            {/* Payment buttons */}
            <div className="custom-button-wrapper">
              <div className="button-container mt-6">
                <button
                  onClick={() => handlePay(payNativeToken)} // Trigger payment on button click
                  className="button pay-native"
                  disabled={
                    selectedToken.value !==
                    "0x0000000000000000000000000000000000000000"
                  }
                >
                  Pay Native
                </button>
                <button
                  onClick={() => handlePay(payERC20Token)} // Trigger payment on button click
                  className="button pay-erc20"
                  disabled={
                    selectedToken.value !==
                    "0x4335D1397c05aB2CE2Ad090fB8b19FFF706e001d"
                  }
                >
                  Pay ERC20
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
