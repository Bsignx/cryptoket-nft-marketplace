import React, { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';

import { MarketAddress, MarketAddressABI } from './constants';

export const NFTContext = React.createContext();

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);

  const nftCurrency = 'ETH';

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask.');

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    setCurrentAccount(accounts[0]);
    window.location.reload();
  };

  const checkIfWalletIsConnect = async () => {
    if (!window.ethereum) return alert('Please install MetaMask.');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log('No accounts found');
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();

    const transaction = !isReselling
      ? await contract.createToken(url, price, {
        value: listingPrice.toString(),
      })
      : await contract.resellToken(id, price, {
        value: listingPrice.toString(),
      });

    setIsLoadingNFT(true);
    await transaction.wait();
  };

  useEffect(() => {
    checkIfWalletIsConnect();
  }, []);

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        connectWallet,
        createSale,
        checkIfWalletIsConnect,
        currentAccount,
        isLoadingNFT,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
