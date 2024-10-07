import abi from "../utils/BuyMeACoffee.json";
import { ethers } from "ethers";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { FaEthereum, FaArrowLeft, FaArrowRight } from "react-icons/fa"; // Ethereum Icon
import { GiCoffeeCup } from "react-icons/gi"; // Coffee Icon
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(""); // State to store the name input
  const [message, setMessage] = useState(""); // State to store the memo input
  const contractAddress = "0xE0F79B20FeFf300C7Ad5170CE3fEFE535E016835"; // Sepolia contract address
  const contractABI = abi.abi;
  const [currentMemoIndex, setCurrentMemoIndex] = useState(0);
  const [memos, setMemos] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        checkNetwork(); // Check the network once an account is found
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      checkNetwork(); // Check the network after the wallet is connected
    } catch (error) {
      console.error(error);
    }
  };

  const checkNetwork = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const network = await provider.getNetwork();

        console.log("Network info:", network);
        setNetwork(network);

        if (network.chainId !== 11155111) {
          toast.warning("Please switch to the Sepolia network");
        } else {
          toast.success("Connected to Sepolia network");
        }
      }
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  const buyCoffee = async (isLarge = false) => {
    setIsLoading(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        toast.info("Buying coffee...");
        const method = isLarge
          ? buyMeACoffee.buyLargeCoffee
          : buyMeACoffee.buyCoffee;
        const value = isLarge ? "0.003" : "0.001";
        const coffeeTxn = await method(
          name || "anon", // Use the entered name or "anon" if empty
          message || "Enjoy your coffee!", // Use the entered message or a default message
          { value: ethers.utils.parseEther(value) }
        );

        await coffeeTxn.wait();
        toast.success("Coffee purchased!");
        setName(""); // Reset name input
        setMessage(""); // Reset message input
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to buy coffee. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const withdrawFunds = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        toast.info("Withdrawing funds...");
        const withdrawTxn = await buyMeACoffee.withdrawFunds();
        await withdrawTxn.wait();
        toast.success("Funds withdrawn successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to withdraw funds. Please try again.");
    }
  };

  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );

        const memoCount = await buyMeACoffee.getMemoCount();
        const fetchedMemos = [];
        for (let i = 0; i < memoCount; i++) {
          const memo = await buyMeACoffee.getMemoByIndex(i);
          fetchedMemos.push({
            from: memo.from,
            timestamp: new Date(memo.timestamp * 1000).toLocaleString(),
            name: memo.name,
            message: memo.message,
            tipAmount: ethers.utils.formatEther(memo.tipAmount),
          });
        }
        setMemos(fetchedMemos);
      }
    } catch (error) {
      console.error("Error fetching memos:", error);
    }
  };

  const nextMemo = () => {
    setCurrentMemoIndex((prevIndex) =>
      prevIndex === memos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevMemo = () => {
    setCurrentMemoIndex((prevIndex) =>
      prevIndex === 0 ? memos.length - 1 : prevIndex - 1
    );
  };

  const checkIfOwner = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );
        const owner = await buyMeACoffee.owner();
        setIsOwner(currentAccount.toLowerCase() === owner.toLowerCase());
      }
    } catch (error) {
      console.error("Error checking owner:", error);
    }
  };
  useEffect(() => {
    isWalletConnected();
    if (currentAccount) {
      getMemos();
      checkIfOwner();
    }
  }, [currentAccount]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy Hany a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <GiCoffeeCup className={styles.icon} /> Buy Hany a Coffee!{" "}
          <FaEthereum className={styles.icon} />
        </h1>

        {currentAccount ? (
          <>
            <form className={styles.form}>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
                <textarea
                  rows="3"
                  placeholder="Leave a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={styles.textarea}
                ></textarea>
              </div>

              <div className={styles.buttonContainer}>
                <button
                  className={styles.button}
                  type="button"
                  onClick={() => buyCoffee(false)}
                  disabled={isLoading || network?.chainId !== 11155111}
                >
                  Send 1 Coffee for 0.001ETH <GiCoffeeCup />
                </button>

                <button
                  className={styles.button}
                  type="button"
                  onClick={() => buyCoffee(true)}
                  disabled={isLoading || network?.chainId !== 11155111}
                >
                  Send 1 Large Coffee for 0.003ETH <FaEthereum />
                </button>
              </div>
            </form>

            {isOwner && (
              <div className={styles.withdrawContainer}>
                <button
                  className={styles.withdrawButton}
                  onClick={withdrawFunds}
                >
                  Withdraw Funds
                </button>
              </div>
            )}

            <div className={styles.memosSection}>
              <h2 className={styles.subtitle}>Memos</h2>
              {memos.length > 0 ? (
                <div className={styles.memoCarousel}>
                  <button className={styles.carouselButton} onClick={prevMemo}>
                    <FaArrowLeft />
                  </button>
                  <div className={styles.memoCard}>
                    <p>
                      <strong>From:</strong> {memos[currentMemoIndex].name}
                    </p>
                    <p>
                      <strong>Message:</strong>{" "}
                      {memos[currentMemoIndex].message}
                    </p>
                    <p>
                      <strong>Amount:</strong>{" "}
                      {memos[currentMemoIndex].tipAmount} ETH
                    </p>
                    <p>
                      <strong>Time:</strong> {memos[currentMemoIndex].timestamp}
                    </p>
                  </div>
                  <button className={styles.carouselButton} onClick={nextMemo}>
                    <FaArrowRight />
                  </button>
                </div>
              ) : (
                <p>No memos yet!</p>
              )}
            </div>
          </>
        ) : (
          <button className={styles.connectButton} onClick={connectWallet}>
            Connect your wallet
          </button>
        )}

        {currentAccount && network?.chainId !== 11155111 && (
          <p className={styles.warning}>Please switch to the Sepolia network</p>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Created by @Hany 2024!</p>
      </footer>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}
