import { createStore } from 'vuex'
import { createPublicClient, http } from 'viem'
import { arbitrumNova } from 'viem/chains'
import RPC from '../web3RPC'
import Web3 from 'web3';
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'

import mainContracts from "../../../contracts/local-contracts.json"
import { CHAIN_ID_MAINNET, CURRENT_CHAIN_ID, DEFAULT_FETCH_BLOCK, READ_PROVIDER_URL, RPC_URLS } from '../types/index';
// import { Bridge, BridgeChain, BridgeToken } from 'orbiter-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { copyTextToClipboard } from '../utils';

export const client: any = createPublicClient({
  chain: arbitrumNova,
  transport: http(RPC_URLS[CURRENT_CHAIN_ID]),
})



interface Balances {
  [address: string]: any;
}

interface PointStats {
  totalPoints: number;
}

interface Profile {
  name: string;
  avatar: string;
  address: string;
  earnings: number;
  feesGenerated: number;
  points: number;
  gamesPlayed: number;
}

interface Profiles {
  [address: string]: Profile;
}

//async delay function
const delay = (ms:number) => new Promise(res => setTimeout(res, ms));

const store = createStore({
  state() {
    let games = {};
    let localGames: string | null = localStorage.getItem('games');
    if(localGames) {
      games = JSON.parse(localGames);
    }
    return {
      // Auth
      loggedin: false,
      loading: false,
      loginButtonStatus:"",
      connecting: false,
      activeAccount: "",
      balance: "0",
      mainnetBalance: "0",
      balances: {} as Balances,
      provider: null as any,
      mainnetProvider: null as any,
      web3auth: null as any,
      onboard: null as any,
      wallets: null as any,
      isMetamask: false,
      web3ReadProvider: new Web3(new Web3.providers.HttpProvider(READ_PROVIDER_URL)),
      shouldAutoBridgeToNova: true,
      sendingEthToNova: false,
      completedSendingEthToNova: false,
      bridgingEthToMainnetFromNova: false,
      completedBridgingEthToMainnetFromNova: false,
      withdrawingToAddress: false,
      completedWithdrawingToAddress: false,



      // Game
      games: games,
      isInGame: false,
      isJoiningPasswordMatch: false,
      joiningPassword: null,
      joiningBetAmount: null,
      leaveGame: () => { console.log("leaveGame not set") },
      leaveText: "Leave",
      addFundsMessage: "Adding Funds...",

      // Stake
      stakeContract: null as any,
      handsTokenContract: null as any,

      //Time
      currentTime: Math.floor(Date.now() / 1000),

      // Events
      triggerProcessEvents: false,
      isFetchingEvents: false,
      lastFetchedBlock: DEFAULT_FETCH_BLOCK,
      handledEventIds: new Set(),
      playerRegisteredEvents: [],
      playerWaitingEvents: [],
      playersMatchedEvents: [],
      moveCommittedEvents: [],
      moveRevealedEvents: [],
      newRoundEvents: [],
      gameOutcomeEvents: [],
      playerCancelledEvents: [],
      playerLeftEvents: [],
      stakeEvents: [],
      unstakeEvents: [],
      recievedFundsEvents: [],

      //Notifications
      isNotificationsEnabled: false,

      //Profiles
      profiles: {} as Profiles,
    }
  },
  getters: {
    balance: (state) => (address: any) => {
      return state.balances[address] || "0"
    },
    getPoints: (state) => (address: any) => {
      return state.profiles[address.toLowerCase()]?.points || 0
    }
  },
  mutations: {
    // Auth
    setLoggedIn(state, payload) { state.loggedin = payload },
    setLoading(state, payload) { state.loading = payload },
    setLoginButtonStatus(state, payload) { state.loginButtonStatus = payload },
    setConnecting(state, payload) { state.connecting = payload },
    setActiveAccount(state, payload) { state.activeAccount = payload },
    setBalance(state, payload) { state.balance = payload },
    setMainnetBalance(state, payload) { state.mainnetBalance = payload },
    setBalances(state, payload) { state.balances = payload },
    setProvider(state, payload) { state.provider = payload },
    setMainnetProvider(state, payload) { state.mainnetProvider = payload },
    setWeb3Auth(state, payload) { state.web3auth = payload },
    setIsMetamask(state, payload) { state.isMetamask = payload },
    setOnboard(state, payload) { state.onboard = payload },
    setWallets(state, payload) { state.wallets = payload },
    setShouldAutoBridgeToNova(state, payload) { state.shouldAutoBridgeToNova = payload },
    setSendingEthToNova(state, payload) { state.sendingEthToNova = payload },
    setCompletedSendingEthToNova(state, payload) { state.completedSendingEthToNova = payload },
    setBridgingEthToMainnetfromNova(state, payload) { state.bridgingEthToMainnetFromNova = payload },
    setCompletedBridgingEthToMainnetfromNova(state, payload) { state.completedBridgingEthToMainnetFromNova = payload },
    setWithdrawingToAddress(state, payload) { state.withdrawingToAddress = payload },
    setCompletedWithdrawingToAddress(state, payload) { state.completedWithdrawingToAddress = payload },

    // Game
    setGames(state, payload) { 
      state.games = payload;
      localStorage.setItem('games', JSON.stringify(state.games));
    },
    setIsInGame(state, payload) { state.isInGame = payload },
    setLeaveGame(state, payload) { state.leaveGame = payload },
    setLeaveText(state, payload) { state.leaveText = payload },
    setIsJoiningPasswordMatch(state, payload) { state.isJoiningPasswordMatch = payload },
    setJoiningPassword(state, payload) { state.joiningPassword = payload },
    setJoiningBetAmount(state, payload) { state.joiningBetAmount = payload },
    setAddFundsMessage(state, payload) { state.addFundsMessage = payload },

    // Stake
    setHandsTokenContract(state, payload) { state.handsTokenContract = payload },
    setStakeContract(state, payload) { state.stakeContract = payload },

    //current time in seconds
    setCurrentTime(state, payload) { state.currentTime = payload },

    // Events
    triggerProcessEvents(state, payload){ state.triggerProcessEvents = payload},
    setIsFetchingEvents(state, payload) { state.isFetchingEvents = payload },
    setLastFetchBlock(state, payload) { state.lastFetchedBlock = payload },
    setHandledEventIds(state, payload) { state.handledEventIds = payload },
    setPlayerRegisteredEvents(state, payload) { state.playerRegisteredEvents = payload },
    setPlayerWaitingEvents(state, payload) { state.playerWaitingEvents = payload },
    setPlayersMatchedEvents(state, payload) { state.playersMatchedEvents = payload },
    setMoveCommittedEvents(state, payload) { state.moveCommittedEvents = payload },
    setMoveRevealedEvents(state, payload) { state.moveRevealedEvents = payload },
    setNewRoundEvents(state, payload) { state.newRoundEvents = payload },
    setGameOutcomeEvents(state, payload) { state.gameOutcomeEvents = payload },
    setPlayerCancelledEvents(state, payload) { state.playerCancelledEvents = payload },
    setPlayerLeftEvents(state, payload) { state.playerLeftEvents = payload },
    setStakeEvents(state, payload) { state.stakeEvents = payload },
    setUnstakeEvents(state, payload) { state.unstakeEvents = payload },
    setRecievedFundsEvents(state, payload) { state.recievedFundsEvents = payload },

    //Notifications
    setIsNotificationsEnabled(state, payload) { state.isNotificationsEnabled = payload },

    //Profiles
    setProfiles(state, payload) { state.profiles = payload },
    setProfile(state, payload) {
      let profiles = {...state.profiles}
      profiles[payload.address.toLowerCase()] = payload
      state.profiles = profiles
    },
    setProfileName(state, payload) {
      let profiles = {...state.profiles}
      if(!profiles[payload.address.toLowerCase()]){
        profiles[payload.address.toLowerCase()] = {
          name: "",
          avatar: "",
          address: payload.address,
          earnings: 0,
          feesGenerated: 0,
          points: 0,
          gamesPlayed: 0,
        }
      }
      profiles[payload.address.toLowerCase()].name = payload.name
      state.profiles = profiles
    },
    setProfileAvatar(state, payload) {
      let profiles = {...state.profiles}
      profiles[payload.address.toLowerCase()].avatar = payload.avatar
      state.profiles = profiles
    },
    setProfileEarnings(state, payload) {
      let profiles = {...state.profiles}
      if(!profiles[payload.address.toLowerCase()]){
        profiles[payload.address.toLowerCase()] = {
          name: "",
          avatar: "",
          address: payload.address,
          earnings: 0,
          feesGenerated: 0,
          points: 0,
          gamesPlayed: 0,
        }
      }
      profiles[payload.address.toLowerCase()].earnings = payload.earnings
      state.profiles = profiles
    },
    setProfileFeesGenerated(state, payload) {
      let profiles = {...state.profiles}
      if(!profiles[payload.address.toLowerCase()]){
        profiles[payload.address.toLowerCase()] = {
          name: "",
          avatar: "",
          address: payload.address,
          earnings: 0,
          feesGenerated: 0,
          points: 0,
          gamesPlayed: 0,
        }
      }
      profiles[payload.address.toLowerCase()].feesGenerated = payload.feesGenerated
      state.profiles = profiles
    },
    setProfilePoints(state, payload) {
      let profiles = {...state.profiles}
      if(!profiles[payload.address.toLowerCase()]){
        profiles[payload.address.toLowerCase()] = {
          name: "",
          avatar: "",
          address: payload.address,
          earnings: 0,
          feesGenerated: 0,
          points: 0,
          gamesPlayed: 0,
        }
      }
      profiles[payload.address.toLowerCase()].points = payload.points
      state.profiles = profiles
    },
    addProfileEarnings(state, payload) {
      let profiles = {...state.profiles}
      if(!profiles[payload.address.toLowerCase()]){
        profiles[payload.address.toLowerCase()] = {
          name: "",
          avatar: "",
          address: payload.address,
          earnings: 0,
          feesGenerated: 0,
          points: 0,
          gamesPlayed: 0,
        }
      }
      profiles[payload.address.toLowerCase()].earnings += payload.earnings
      state.profiles = profiles
    },
    //if profile doesn't exist, create it
    addProfilePoints(state, payload) {
      let profiles = {...state.profiles}
      if(!profiles[payload.address.toLowerCase()]){
        profiles[payload.address.toLowerCase()] = {
          name: "",
          avatar: "",
          address: payload.address,
          earnings: 0,
          feesGenerated: 0,
          points: 0,
          gamesPlayed: 0,
        }
      }
      profiles[payload.address.toLowerCase()].points += payload.points
      state.profiles = profiles
    },
    addProfileFeesGenerated(state, payload) {
      let profiles = {...state.profiles}
      if(!profiles[payload.address.toLowerCase()]){
        profiles[payload.address.toLowerCase()] = {
          name: "",
          avatar: "",
          address: payload.address,
          earnings: 0,
          feesGenerated: 0,
          points: 0,
          gamesPlayed: 0,
        }
      }
      profiles[payload.address.toLowerCase()].feesGenerated += payload.feesGenerated
      state.profiles = profiles
    },
    addGamesPlayed(state, payload) {
      let profiles = {...state.profiles}
      if(!profiles[payload.address.toLowerCase()]){
        profiles[payload.address.toLowerCase()] = {
          name: "",
          avatar: "",
          address: payload.address,
          earnings: 0,
          feesGenerated: 0,
          points: 0,
          gamesPlayed: 0,
        }
      }
      profiles[payload.address.toLowerCase()].gamesPlayed++
      state.profiles = profiles
      console.log("profiles list", profiles)
    }
  },
  actions: {
    // Auth
    setLoggedIn({ commit }, payload) { commit('setLoggedIn', payload) },
    setLoading({ commit }, payload) { commit('setLoading', payload) },
    setLoginButtonStatus({ commit }, payload) { commit('setLoginButtonStatus', payload) },
    setConnecting({ commit }, payload) { commit('setConnecting', payload) },
    setActiveAccount({ commit }, payload) { commit('setActiveAccount', payload) },
    setBalance({ commit }, payload) { commit('setBalance', payload) },
    setProvider({ commit }, payload) {
       commit('setProvider', payload) 
      console.log("setProvider", payload)
      },
    setWeb3Auth({ commit }, payload) { commit('setWeb3Auth', payload) },
    setIsMetamask({ commit }, payload) { commit('setIsMetamask', payload) },
    async setBalanceOf({ commit, state }, payload) {
      const rpc = new RPC(state.provider)
      

      //do this every 10 seconds
        const balance = await rpc.getBalanceOf(payload)

        let balances: Balances = {...state.balances}
        balances[payload.toLowerCase()] = balance
        console.log("balances", balance)
        commit('setBalances', balances)
    },
    async login ({ commit, state }) {
      if (!state.onboard) {
        console.error("Onboard not set")
        return;
      }

      commit("setLoading", true);
      const wallets = await state.onboard.connectWallet()
      console.log("wallets", wallets)
      commit("setWallets", wallets);
      if(wallets[0]) {
        await state.onboard.setChain({chainId: CURRENT_CHAIN_ID})
        commit("setLoggedIn", true);
        commit("setProvider", wallets[0].provider);
        commit("setIsMetamask", true);
      }else{
        commit("setLoggedIn", false);
      }
    },
    async loginWeb3Auth ({ commit, state }) {
      console.log("loginWeb3Auth")
      const web3auth = state.web3auth
      if (!web3auth) {
        console.error("web3auth not set")
        return;
      }
      //await web3auth.initModal();
      const provider = await web3auth.connect();
      store.dispatch("setLoading", true);
      store.dispatch("setProvider", provider);

      if (web3auth.provider) {
        store.dispatch("setProvider", web3auth.provider);
        console.log("setProviderTest", (window as any).ethereum);
        console.log("setProvider", web3auth.provider);
        //const initVal = await torusPlugin.initWithProvider(store.state.provider, userInfo);
        store.dispatch("setLoggedIn", true);

      }
      //check if logged in through metamask
      if (web3auth.connectedAdapterName === "metamask") {
        store.dispatch("setIsMetamask", true);
        store.dispatch("setProvider", (window as any).ethereum);
      }

      //get private key
      // store.dispatch("syncMainnetBalance");

      // const provider = await state.web3auth.connect();
      // store.dispatch("setLoading", true);
      // store.dispatch("setProvider", provider);

    },
    // Game
    setGames({ commit }, payload) { commit('setGames', payload) },
    setIsInGame({ commit }, payload) { commit('setIsInGame', payload) },
    setLeaveGame({ commit }, payload) { commit('setLeaveGame', payload) },
    setIsJoiningPasswordMatch({ commit }, payload) { commit('setIsJoiningPasswordMatch', payload) },
    setJoiningPassword({ commit }, payload) { commit('setJoiningPassword', payload) },

    //Stake
    setStakeContract({ commit }, payload) { commit('setStakeContract', payload) },
    setHandsTokenContract({ commit }, payload) { commit('setHandsTokenContract', payload) },
    async stake({ commit, state }, amount) {
      try {
        const web3 = new Web3(state.provider as any);
        const gasPrice = web3.utils.toWei("0.1", "gwei");
        const gasLimit = 30000000;

        // give allowance to staking contract
        const tx1 = await state.handsTokenContract.methods.approve(
          mainContracts.deployedContracts.Staking,
          web3.utils.toWei(amount, "ether")
        ).send({ from: state.activeAccount, gasPrice, gasLimit });
        

        const tx = await state.stakeContract.methods.stake(
          web3.utils.toWei(amount, "ether")
        ).send({ from: state.activeAccount, gasPrice, gasLimit });
        
        // Wait for the transaction to be mined
        await web3.eth.getTransactionReceipt(tx.transactionHash);
        
        // Transaction was successful if we made it here
        console.log('Staked', tx);
        return tx;
      } catch (error) {
        // Log more detailed information about the error
        console.error('Error staking. Message:', error);
        
        // Log error reason if available. This can be the error message from a require statement in a smart contract
        if (error) {
          console.error('Error reason:', error);
        }
        
        // Log the error stack trace for debugging
        console.error('Error stack trace:', error);
        
        return error;
      }
    },

    async unstake({ commit, state }, amount) {
      try {
        const web3 = new Web3(state.provider as any);
        const gasPrice = web3.utils.toWei("0.1", "gwei");
        const gasLimit = 30000000;

        const tx = await state.stakeContract.methods.unstake(
          web3.utils.toWei(amount, "ether")
        ).send({ from: state.activeAccount, gasPrice, gasLimit });
        
        // Wait for the transaction to be mined
        await web3.eth.getTransactionReceipt(tx.transactionHash);
        
        // Transaction was successful if we made it here
        console.log('Unstaked', tx);
        return tx;
      } catch (error) {
        // Log more detailed information about the error
        console.error('Error unstaking. Message:', error);
        
        // Log error reason if available. This can be the error message from a require statement in a smart contract
        if (error) {
          console.error('Error reason:', error);
        }
        
        // Log the error stack trace for debugging
        console.error('Error stack trace:', error);
        
        return error;
      }
    },

    async exportPrivateKey({ commit, state }) {
      const privateKey = await state.provider.request({ method: 'eth_private_key' });
      console.log("privateKey", privateKey)
      copyTextToClipboard(privateKey)
      alert("Private key copied to clipboard")
      console.log("privateKey read from clipboard", await navigator.clipboard.readText())
      return privateKey;
    },

    async syncMainnetBalance({ commit, state }) {
      // Check if mainnet provider is set, if not set it
      if (!state.mainnetProvider) {
        const privateKey = await state.provider.request({ method: 'eth_private_key' });
        const mainnetPrivateKeyProvider = new EthereumPrivateKeyProvider({
          config: {
            chainConfig: {
              chainId: CHAIN_ID_MAINNET,
              rpcTarget: RPC_URLS[CHAIN_ID_MAINNET],
              // Avoid using public rpcTarget in production.
              // Use services like Infura, Quicknode etc
              displayName: "Mainnet",
              blockExplorer: "https://etherscan.io/",
              ticker: "ETH",
              tickerName: "Ether",
            },
          },
        });
        await mainnetPrivateKeyProvider.setupProvider(privateKey);
        commit('setMainnetProvider', mainnetPrivateKeyProvider.provider);
      }
    
      // Initialize web3 with the mainnet provider
      const web3 = new Web3(state.mainnetProvider);
    
      // Function to fetch and commit the balance
      const fetchBalance = async () => {
        try {
          const activeAccount = state.activeAccount; // Assuming you have an activeAccount in your state
          const balanceWei = await web3.eth.getBalance(activeAccount);
          const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
          console.log('Mainnet Balance:', balanceEth);
          commit('setMainnetBalance', balanceEth); // Assuming you have a mutation named 'setBalance'

          //if not isMetamask, automatically send eth to nova
          if(!state.isMetamask && state.shouldAutoBridgeToNova){
            if(parseFloat(balanceEth) > 0){
              //await store.dispatch('sendMainnetEthToNova')
            }
          }

        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      };
    
      // Fetch balance immediately
      await fetchBalance();
    
      // Set an interval to fetch the balance every second
      setInterval(fetchBalance, 1000);
    },

    //send mainnet eth
    async sendMainnetEthToNova({ commit, state }) {
    //   commit('setSendingEthToNova', true)
    //   commit('setCompletedSendingEthToNova', false)
    //   try {
    //     const web3 = new Web3(state.mainnetProvider as any);
    //     const balance = state.mainnetBalance;
    //     const balanceInWei:any = web3.utils.toWei(balance, "ether");

    //     //return if balance less than 0.01 eth
    //     if(parseFloat(balance) < 0.005){
    //       console.log("balance less than 0.01 eth")
    //       return;
    //     }

    //     const bridge = new Bridge("Mainnet")
    //     const supports = bridge.supports()
    //     const bridgeToken = (await supports).tokens.find((token: BridgeToken) => token.name === "ETH")
    //     const fromChain = (await supports).fromChains.find((chain: BridgeChain) => chain.name === "mainnet")
    //     const toChain = (await supports).toChains.find((chain: BridgeChain) => chain.name === "nova")
    //     const gasPrice:any = await web3.eth.getGasPrice();
    //     const gasLimit = 22000;
    //     const totalGasCost = gasPrice * gasLimit;
    //     const initialNovaBalance = state.balance;

    //     //Amount to send to empty balance - 9001 wei
    //     const amountToSend:any = balanceInWei - totalGasCost;
    //     const amountToSendHm = web3.utils.fromWei(amountToSend.toString(), "ether");
    //     const amountToSendConcat = amountToSend.toString().slice(0, -4) + "9016";


    //     console.log("mainnet amountToSendhm", amountToSendHm)
    //     console.log("mainnet fromChain", fromChain)
    //     console.log("mainnet toChain", toChain)
    //     console.log("mainnet bridgeToken", bridgeToken)


    //     // const result = await bridge.transfer(
    //     //   new Web3Provider(state.mainnetProvider as any).getSigner(),
    //     //   bridgeToken as BridgeToken,
    //     //   fromChain as BridgeChain,
    //     //   toChain as BridgeChain,
    //     //   amountToSendHm,
    //     // )

    //     const transaction  = {
    //       from: state.activeAccount,
    //       to: bridgeToken?.makerAddress,
    //       value: web3.utils.toHex(amountToSendConcat),
    //       gasPrice: web3.utils.toHex(gasPrice),
    //       gasLimit: web3.utils.toHex(gasLimit),
    //     }

    //     console.log(`Sending ${amountToSendHm} eth to nova...`)
    //     const privateKey = await state.provider.request({ method: 'eth_private_key' });

    //     const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);

    //     const tx = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction as string);

    //     //wait for transaction to go through
    //     alert(`Transaction sent. Waiting for confirmation...${tx.transactionHash}}`)
    //     await web3.eth.getTransactionReceipt(tx.transactionHash);

    //     //wait for nova balance to update. make sure balance is greater than initial balance by almost the amount sent
    //     while(parseFloat(state.balance) - parseFloat(initialNovaBalance)  < parseFloat(balance) - 0.01){
    //       await new Promise(resolve => setTimeout(resolve, 1000));
    //     }

    //     //update state
    //     commit('setSendingEthToNova', false)
    //     commit('setCompletedSendingEthToNova', true)
        
        
    //     // Transaction was successful if we made it here
    //     //console.log('Sent', result);
    //   } catch (error) {
    //     // Log more detailed information about the error
    //     console.error('Error sending eth', error);
        
    //     //commit('setSendingEthToNova', false)
    //     commit('setSendingEthToNova', false)
    //     commit('setCompletedSendingEthToNova', false)
    //     return error;
    //   }
    },

    //send nova eth to mainnet
    async sendNovaEthToMainnet({ commit, state }, amount) {
    //   commit('setBridgingEthToMainnetfromNova', true)
    //   commit('setCompletedBridgingEthToMainnetfromNova', false)
    //   try {
    //     const web3 = new Web3(state.provider as any);
    //     const balance = amount;
    //     const balanceInWei:any = web3.utils.toWei(balance, "ether");

    //     const initialMainnetBalance = state.mainnetBalance;

    //     //return if balance less than 0.01 eth
    //     if(parseFloat(balance) < 0.005){
    //       console.log("balance less than 0.01 eth")
    //       return;
    //     }

    //     const bridge = new Bridge("Mainnet")
    //     const supports = bridge.supports()
    //     const bridgeToken = (await supports).tokens.find((token: BridgeToken) => token.name === "ETH")
    //     const fromChain = (await supports).fromChains.find((chain: BridgeChain) => chain.name === "nova")
    //     const toChain = (await supports).toChains.find((chain: BridgeChain) => chain.name === "mainnet")
    //     const gasPrice:any = await web3.eth.getGasPrice();
    //     const gasLimit = 22000;
    //     const totalGasCost = gasPrice * gasLimit;

    //     //Calculate amount to send and append 9001 wei
    //     const amountToSend:any = balanceInWei - totalGasCost;
    //     const amountToSendHm = web3.utils.fromWei(amountToSend.toString(), "ether");
    //     const amountToSendConcat = amountToSend.toString().slice(0, -4) + "9001";


    //     console.log("mainnet amountToSendhm", amountToSendHm)
    //     console.log("mainnet fromChain", fromChain)
    //     console.log("mainnet toChain", toChain)
    //     console.log("mainnet bridgeToken", bridgeToken)


    //     // const result = await bridge.transfer(
    //     //   new Web3Provider(state.mainnetProvider as any).getSigner(),
    //     //   bridgeToken as BridgeToken,
    //     //   fromChain as BridgeChain,
    //     //   toChain as BridgeChain,
    //     //   amountToSendHm,
    //     // )

    //     const transaction  = {
    //       from: state.activeAccount,
    //       to: bridgeToken?.makerAddress,
    //       value: web3.utils.toHex(amountToSendConcat),
    //       gasPrice: gasPrice,
    //       gasLimit: gasLimit,
    //     }

    //     const tx = await web3.eth.sendTransaction(transaction);

    //     //wait for transaction to go through
    //     await web3.eth.getTransactionReceipt(tx.transactionHash);

    //     //wait for mainnet balance to update. make sure balance is greater than initial balance by almost the amount sent
    //     while(parseFloat(state.mainnetBalance) - parseFloat(initialMainnetBalance)  < parseFloat(amount) - 0.001){
    //       await new Promise(resolve => setTimeout(resolve, 1000));
    //     }

    //     //update state
    //     commit('setBridgingEthToMainnetfromNova', false)
    //     commit('setCompletedBridgingEthToMainnetfromNova', true)

    //     // Transaction was successful if we made it here
    //     //console.log('Sent', result);
    //     //commit('setSendingEthToNova', false)
    //   }
    //   catch (error) {
    //     // Log more detailed information about the error
    //     console.error('Error sending eth', error);
        
    //     //commit('setSendingEthToNova', false)
    //     commit('setBridgingEthToMainnetfromNova', false)
    //     commit('setCompletedBridgingEthToMainnetfromNova', false)
    //     return error;
    //   }
    },

    //withdraw eth from nova to address
    async withdrawNovaEth({ commit, state }, {amount, address}) {
    //   commit('setShouldAutoBridgeToNova', false)
    //   commit('setCompletedWithdrawingToAddress', false)
    //   commit('setWithdrawingToAddress', false)
    //   try {
    //     await store.dispatch('sendNovaEthToMainnet', amount)

    //     //send mainnet eth to address
    //     commit('setWithdrawingToAddress', true)
    //     const web3 = new Web3(state.mainnetProvider as any);
    //     const gasPrice:any = await web3.eth.getGasPrice();
    //     const gasLimit = 22000;

    //     const transaction  = {
    //       from: state.activeAccount,
    //       to: address,
    //       value: web3.utils.toHex(web3.utils.toWei(amount, "ether")),
    //       gasPrice: gasPrice,
    //       gasLimit: gasLimit,
    //     }

    //     const tx = await web3.eth.sendTransaction(transaction);

    //     //wait for transaction to go through
    //     await web3.eth.getTransactionReceipt(tx.transactionHash);

    //     //update state
    //     commit('setWithdrawingToAddress', false)
    //     commit('setCompletedWithdrawingToAddress', true)
    //     commit('setShouldAutoBridgeToNova', true)

        
    //   } catch (error) {
    //     //update state
    //     commit('setWithdrawingToAddress', false)
    //     commit('setCompletedWithdrawingToAddress', false)
    //     commit('setShouldAutoBridgeToNova', true)

        
    //   }
    },
        
      
        


    //set time interval to update currentTime
    setTime({ commit, state }) {
      setInterval(() => {
        commit('setCurrentTime', Math.floor(Date.now() / 1000))
      }, 1000)
    },

    // Events
    addEvent({commit, state}, {eventName, event}){
      switch (eventName) {
        case "PlayerRegistered":
          commit('setPlayerRegisteredEvents', [...state.playerRegisteredEvents, event]);
          localStorage.setItem('playerRegisteredEvents', JSON.stringify(state.playerRegisteredEvents))
          break;
      
        case "PlayerWaiting":
          commit('setPlayerWaitingEvents', [...state.playerWaitingEvents, event]);
          localStorage.setItem('playerWaitingEvents', JSON.stringify(state.playerWaitingEvents))
          break;

        case "PlayersMatched":
          commit('setPlayersMatchedEvents', [...state.playersMatchedEvents, event]);
          localStorage.setItem('playersMatchedEvents', JSON.stringify(state.playersMatchedEvents))
          break;
      
        case "MoveCommitted":
          commit('setMoveCommittedEvents', [...state.moveCommittedEvents, event]);
          localStorage.setItem('moveCommittedEvents', JSON.stringify(state.moveCommittedEvents))
          break;

        case "MoveRevealed":
          commit('setMoveRevealedEvents', [...state.moveRevealedEvents, event]);
          localStorage.setItem('moveRevealedEvents', JSON.stringify(state.moveRevealedEvents))
          break;

        case "NewRound":
          commit('setNewRoundEvents', [...state.newRoundEvents, event]);
          localStorage.setItem('newRoundEvents', JSON.stringify(state.newRoundEvents))
          break;

        case "GameOutcome":
          commit('setGameOutcomeEvents', [...state.gameOutcomeEvents, event]);
          localStorage.setItem('gameOutcomeEvents', JSON.stringify(state.gameOutcomeEvents))
          break;

        case "PlayerCancelled":
          commit('setPlayerCancelledEvents', [...state.playerCancelledEvents, event]);
          localStorage.setItem('playerCancelledEvents', JSON.stringify(state.playerCancelledEvents))
          break;

        case "PlayerLeft":
          commit('setPlayerLeftEvents', [...state.playerLeftEvents, event]);
          localStorage.setItem('playerLeftEvents', JSON.stringify(state.playerLeftEvents))
          break;

        case "PlayerLeft":
          commit('setPlayerLeftEvents', [...state.playerLeftEvents, event]);
          localStorage.setItem('playerLeftEvents', JSON.stringify(state.playerLeftEvents))
          break;

        case "PlayerLeft":
          commit('setPlayerLeftEvents', [...state.playerLeftEvents, event]);
          localStorage.setItem('playerLeftEvents', JSON.stringify(state.playerLeftEvents))
          break;

        case "PlayerLeft":
          commit('setPlayerLeftEvents', [...state.playerLeftEvents, event]);
          localStorage.setItem('playerLeftEvents', JSON.stringify(state.playerLeftEvents))
          break;
        
        default:
          break;
      }

    },
    clearCachedEvents({ commit, state }) {
      localStorage.setItem('playerRegisteredEvents', "")
      localStorage.setItem('playerWaitingEvents', "")
      localStorage.setItem('playersMatchedEvents', "")
      localStorage.setItem('moveCommittedEvents', "")
      localStorage.setItem('moveRevealedEvents', "")
      localStorage.setItem('newRoundEvents', "")
      localStorage.setItem('gameOutcomeEvents', "")
      localStorage.setItem('playerCancelledEvents', "")
      localStorage.setItem('playerLeftEvents', "")
      localStorage.setItem('stakeEvents', "")
      localStorage.setItem('unstakeEvents', "")
      localStorage.setItem('recievedFundsEvents', "")
      localStorage.setItem('lastFetchedBlock', "")
    },
    cacheEvents({ commit, state }) {
      localStorage.setItem('playerRegisteredEvents', JSON.stringify(state.playerRegisteredEvents))
      localStorage.setItem('playerWaitingEvents', JSON.stringify(state.playerWaitingEvents))
      localStorage.setItem('playersMatchedEvents', JSON.stringify(state.playersMatchedEvents))
      localStorage.setItem('moveCommittedEvents', JSON.stringify(state.moveCommittedEvents))
      localStorage.setItem('moveRevealedEvents', JSON.stringify(state.moveRevealedEvents))
      localStorage.setItem('newRoundEvents', JSON.stringify(state.newRoundEvents))
      localStorage.setItem('gameOutcomeEvents', JSON.stringify(state.gameOutcomeEvents))
      localStorage.setItem('playerCancelledEvents', JSON.stringify(state.playerCancelledEvents))
      localStorage.setItem('playerLeftEvents', JSON.stringify(state.playerLeftEvents))
      localStorage.setItem('stakeEvents', JSON.stringify(state.stakeEvents))
      localStorage.setItem('unstakeEvents', JSON.stringify(state.unstakeEvents))
      localStorage.setItem('recievedFundsEvents', JSON.stringify(state.recievedFundsEvents))
    },
    uncacheEvents({ commit, state }) {
      commit('setPlayerRegisteredEvents', JSON.parse(localStorage.getItem('playerRegisteredEvents') || "[]"))
      commit('setPlayerWaitingEvents', JSON.parse(localStorage.getItem('playerWaitingEvents') || "[]"))
      commit('setPlayersMatchedEvents', JSON.parse(localStorage.getItem('playersMatchedEvents') || "[]"))
      commit('setMoveCommittedEvents', JSON.parse(localStorage.getItem('moveCommittedEvents') || "[]"))
      commit('setMoveRevealedEvents', JSON.parse(localStorage.getItem('moveRevealedEvents') || "[]"))
      commit('setNewRoundEvents', JSON.parse(localStorage.getItem('newRoundEvents') || "[]"))
      commit('setGameOutcomeEvents', JSON.parse(localStorage.getItem('gameOutcomeEvents') || "[]"))
      commit('setPlayerCancelledEvents', JSON.parse(localStorage.getItem('playerCancelledEvents') || "[]"))
      commit('setPlayerLeftEvents', JSON.parse(localStorage.getItem('playerLeftEvents') || "[]"))
      commit('setStakeEvents', JSON.parse(localStorage.getItem('stakeEvents') || "[]"))
      commit('setUnstakeEvents', JSON.parse(localStorage.getItem('unstakeEvents') || "[]"))
      commit('setRecievedFundsEvents', JSON.parse(localStorage.getItem('recievedFundsEvents') || "[]"))
    },
    initLastFetchedBlock({ commit }) {
      const lastFetchedBlock = localStorage.getItem('lastFetchedBlock')
      if (lastFetchedBlock) {
        commit('setLastFetchBlock', lastFetchedBlock)
      }
    },
    setLastFetchBlock({ commit, state }, payload) {
      commit('setLastFetchBlock', payload)
      localStorage.setItem('lastFetchedBlock', payload)
    },
    initHandledEventIds({ commit }) {
      const handledEventIds = localStorage.getItem('handledEventIds')
      if (handledEventIds) {
        commit('setHandledEventIds', new Set(JSON.parse(handledEventIds)))
      }
    },
    setHandledEventIds({ commit, state }, payload) {
      commit('setHandledEventIds', payload)
      localStorage.setItem('handledEventIds', JSON.stringify(Array.from(payload)))
    },
    addHandledEventId({ commit, state }, payload) {
      const handledEventIds = new Set(state.handledEventIds)
      handledEventIds.add(payload)
      commit('setHandledEventIds', handledEventIds)
    },

    async fetchEvents({ commit, state , dispatch }) {
      let retries = 0;
      const maxRetries = 4;

      //check if new hands contract address is detected, if so, clear cached events
      const handsContractAddress = mainContracts.deployedContracts.Hands;
      const cachedHandsContractAddress = localStorage.getItem('handsContractAddress');
      if(cachedHandsContractAddress != handsContractAddress.toLowerCase()){
        dispatch('clearCachedEvents')
        localStorage.setItem('handsContractAddress', handsContractAddress.toLowerCase())
      }

      while(retries < maxRetries){
        try{
          //Start fetching events
          commit('setIsFetchingEvents', true)
  
          //Initialize events from cache
          dispatch('initLastFetchedBlock')
          dispatch('initHandledEventIds')
          dispatch('uncacheEvents')
  
          //initialize web3 Read only provider and contracts
          const web3 = state.web3ReadProvider;
  
          const handsContract = new web3.eth.Contract(
            mainContracts.deployedAbis.Hands as any,
            mainContracts.deployedContracts.Hands
          )
          const stakeContract = new web3.eth.Contract(
            mainContracts.deployedAbis.Staking as any,
            mainContracts.deployedContracts.Staking
          )

          // 2. Set up your client with desired chain & transport.
        

          const blockNumber = await client.getBlockNumber()
          console.log("viem blockNumber", blockNumber)
          
  
          //Get events from lastFetchedBlock
          const startBlock = state.lastFetchedBlock
          const endBlock = await client.getBlockNumber()
          const blockLimit = 10000; // Maximum blocks that can be fetched in one request

          // const playerRegisteredEvents = await client.getContractEvents({
          //   abi: mainContracts.deployedAbis.Hands,
          //   address: mainContracts.deployedContracts.Hands,
          //   eventName: "PlayerRegistered",
          //   fromBlock: BigInt(startBlock),
          //   toBlock: BigInt(toBlock)
          // })

          //console.log("playerRegisteredEvents", playerRegisteredEvents)

  
          let fromBlock = startBlock;
          let toBlock = Math.min(Number(fromBlock) + blockLimit, Number(endBlock));
          while (fromBlock <= toBlock) {
            console.log("fetched fetching events from block", fromBlock, "to block", toBlock)
              const playerRegisteredEvents = (await client.getContractEvents({
                abi: mainContracts.deployedAbis.Hands,
                address: mainContracts.deployedContracts.Hands,
                eventName: "PlayerRegistered",
                fromBlock: BigInt(fromBlock),
                toBlock: BigInt(toBlock)
              })).map((event: any) => {
                console.log("real playerRegisteredEvent", event)
                return {
                  blockHash: event.blockHash,
                  transactionHash: event.transactionHash,
                  logIndex: Number(event.logIndex),
                  blockNumber: Number(event.blockNumber),
                  gameId: Number(event.args.gameId),
                  playerAddress: event.args.playerAddress,
                }
              })
              const playerWaitingEvents = (await client.getContractEvents({
                abi: mainContracts.deployedAbis.Hands,
                address: mainContracts.deployedContracts.Hands,
                eventName: "PlayerWaiting",
                fromBlock: BigInt(fromBlock),
                toBlock: BigInt(toBlock)
              })).map((event: any) => {
                console.log("real playerWaitingEvent", event)
                return {
                  blockHash: event.blockHash,
                  transactionHash: event.transactionHash,
                  logIndex: Number(event.logIndex),
                  blockNumber: Number(event.blockNumber),
                  gameId: Number(event.args.gameId),
                  bet: Number(event.args.bet),
                  playerAddress: event.args.playerAddress,
                }
              })
              const playersMatchedEvents = (await client.getContractEvents({
                abi: mainContracts.deployedAbis.Hands,
                address: mainContracts.deployedContracts.Hands,
                eventName: "PlayersMatched",
                fromBlock: BigInt(fromBlock),
                toBlock: BigInt(toBlock)
              })).map((event: any) => {
                return {
                  blockHash: event.blockHash,
                  transactionHash: event.transactionHash,
                  logIndex: Number(event.logIndex),
                  blockNumber: Number(event.blockNumber),
                  gameId: Number(event.args.gameId),
                  playerA: event.args.playerA,
                  playerB: event.args.playerB,
                }
              })
              const moveCommittedEvents = (await client.getContractEvents({
                abi: mainContracts.deployedAbis.Hands,
                address: mainContracts.deployedContracts.Hands,
                eventName: "MoveCommitted",
                fromBlock: BigInt(fromBlock),
                toBlock: BigInt(toBlock)
              })).map((event: any) => {
                return {
                  blockHash: event.blockHash,
                  transactionHash: event.transactionHash,
                  logIndex: Number(event.logIndex),
                  blockNumber: Number(event.blockNumber),
                  gameId: Number(event.args.gameId),
                  playerAddress: event.args.playerAddress,
                  round: Number(event.args.round),
                }
              });
              const moveRevealedEvents = (await client.getContractEvents({
                abi: mainContracts.deployedAbis.Hands,
                address: mainContracts.deployedContracts.Hands,
                eventName: "MoveRevealed",
                fromBlock: BigInt(fromBlock),
                toBlock: BigInt(toBlock)
              })).map((event: any) => {
                return {
                  blockHash: event.blockHash,
                  transactionHash: event.transactionHash,
                  logIndex: Number(event.logIndex),
                  blockNumber: Number(event.blockNumber),
                  gameId: Number(event.args.gameId),
                  playerAddress: event.args.playerAddress,
                  round: Number(event.args.round),
                  move: Number(event.args.move),
                }
              })
              const newRoundEvents = (await client.getContractEvents({
                abi: mainContracts.deployedAbis.Hands,
                address: mainContracts.deployedContracts.Hands,
                eventName: "NewRound",
                fromBlock: BigInt(fromBlock),
                toBlock: BigInt(toBlock)
              })).map((event: any) => {
                
                return {
                  blockHash: event.blockHash,
                  transactionHash: event.transactionHash,
                  logIndex: Number(event.logIndex),
                  blockNumber: Number(event.blockNumber),
                  gameId: Number(event.args.gameId),
                  round: Number(event.args.playerAddress),
                  pointsA: Number(event.args.pointsA),
                  pointsB: Number(event.args.pointsB),
                }
              })
              const gameOutcomeEvents = (await client.getContractEvents({
                abi: mainContracts.deployedAbis.Hands,
                address: mainContracts.deployedContracts.Hands,
                eventName: "GameOutcome",
                fromBlock: BigInt(fromBlock),
                toBlock: BigInt(toBlock)
              })).map((event: any) => {
                return {
                  blockHash: event.blockHash,
                  transactionHash: event.transactionHash,
                  logIndex: Number(event.logIndex),
                  blockNumber: Number(event.blockNumber),
                  gameId: Number(event.args.gameId),
                  outcome: Number(event.args.outcome),
                }
              })
              const playerCancelledEvents = (await client.getContractEvents({
                abi: mainContracts.deployedAbis.Hands,
                address: mainContracts.deployedContracts.Hands,
                eventName: "PlayerCancelled",
                fromBlock: BigInt(fromBlock),
                toBlock: BigInt(toBlock)
              })).map((event: any) => {
                return {
                  blockHash: event.blockHash,
                  transactionHash: event.transactionHash,
                  logIndex: Number(event.logIndex),
                  blockNumber: Number(event.blockNumber),
                  gameId: Number(event.args.gameId),
                  playerAddress: event.args.playerAddress,
                }
              })
              const playerLeftEvents = (await client.getContractEvents({
                abi: mainContracts.deployedAbis.Hands,
                address: mainContracts.deployedContracts.Hands,
                eventName: "PlayerLeft",
                fromBlock: BigInt(fromBlock),
                toBlock: BigInt(toBlock)
              })).map((event: any) => {
                return {
                  blockHash: event.blockHash,
                  transactionHash: event.transactionHash,
                  logIndex: Number(event.logIndex),
                  blockNumber: Number(event.blockNumber),
                  gameId: Number(event.args.gameId),
                  playerAddress: event.args.playerAddress,
                }
              })
              // const stakeEvents = await client.getContractEvents({
              //   abi: mainContracts.deployedAbis.Staking,
              //   address: mainContracts.deployedContracts.Staking,
              //   eventName: "Staked",
              //   fromBlock: BigInt(fromBlock),
              //   toBlock: BigInt(toBlock)
              // })
              // const unstakeEvents = await client.getContractEvents({
              //   abi: mainContracts.deployedAbis.Staking,
              //   address: mainContracts.deployedContracts.Staking,
              //   eventName: "Unstaked",
              //   fromBlock: BigInt(fromBlock),
              //   toBlock: BigInt(toBlock)
              // })
              // const recievedFundsEvents = await client.getContractEvents({
              //   abi: mainContracts.deployedAbis.Staking,
              //   address: mainContracts.deployedContracts.Staking,
              //   eventName: "ReceivedFundsForStaking",
              //   fromBlock: BigInt(fromBlock),
              //   toBlock: BigInt(toBlock)
              // })
  
              console.log("fetched", playerRegisteredEvents, "PlayerRegistered events")
              console.log("fetched", playerWaitingEvents, "PlayerWaiting events")
              console.log("fetched", playersMatchedEvents, "PlayersMatched events")
              console.log("fetched", moveCommittedEvents, "MoveCommitted events")
              console.log("fetched", moveRevealedEvents, "MoveRevealed events")
              console.log("fetched", newRoundEvents, "NewRound events")
              console.log("fetched", gameOutcomeEvents, "GameOutcome events")
              console.log("fetched", playerCancelledEvents, "PlayerCancelled events")
              console.log("fetched", playerLeftEvents, "PlayerLeft events")
              // console.log("fetched", stakeEvents, "Staked events")
              // console.log("fetched", unstakeEvents, "Unstaked events")
              // console.log("fetched", recievedFundsEvents, "ReceivedFundsForStaking events")
  
  
              // Add to events
              commit('setPlayerRegisteredEvents', [...state.playerRegisteredEvents, ...playerRegisteredEvents]);
              commit('setPlayerWaitingEvents', [...state.playerWaitingEvents, ...playerWaitingEvents]);
              commit('setPlayersMatchedEvents', [...state.playersMatchedEvents, ...playersMatchedEvents]);
              commit('setMoveCommittedEvents', [...state.moveCommittedEvents, ...moveCommittedEvents]);
              commit('setMoveRevealedEvents', [...state.moveRevealedEvents, ...moveRevealedEvents]);
              commit('setNewRoundEvents', [...state.newRoundEvents, ...newRoundEvents]);
              commit('setGameOutcomeEvents', [...state.gameOutcomeEvents, ...gameOutcomeEvents]);
              commit('setPlayerCancelledEvents', [...state.playerCancelledEvents, ...playerCancelledEvents]);
              commit('setPlayerLeftEvents', [...state.playerLeftEvents, ...playerLeftEvents]);
              // commit('setStakeEvents', [...state.stakeEvents, ...stakeEvents]);
              // commit('setUnstakeEvents', [...state.unstakeEvents, ...unstakeEvents]);
              // commit('setRecievedFundsEvents', [...state.recievedFundsEvents, ...recievedFundsEvents]);
  
              //Cache events and set last fetched block
              dispatch('setLastFetchBlock', Number(endBlock));
              dispatch('cacheEvents')
  
              // Update blocks for the next iteration
              fromBlock += blockLimit;
              toBlock = Math.min(Number(toBlock) + blockLimit, Number(endBlock));
              
              //process events
              commit('triggerProcessEvents', !state.triggerProcessEvents);
              //await delay(1000)
              retries = maxRetries;
          }
  
        } catch (error) {
          console.error("Error fetching events:", error);
          retries++;
          if (retries === maxRetries) {
              console.error("Max retries reached. Unable to fetch events.");
              // Optionally, handle the error further or dispatch an action to update the state
              commit('setIsFetchingEvents', false); // Ensure the fetching state is set to false in case of an error
          } else {
              console.log(`Retrying... (${retries}/${maxRetries})`);
          }
        }
      }
      
    
      //Done fetching events
      commit('setIsFetchingEvents', false)

    },

    clearAndReload(){
      localStorage.clear()
      location.reload()
    },

    //Notifications
    async checkNotficationsEnabled({ commit, state }) {
      const permission = Notification.permission;
      //check if permission granted
      if (permission !== 'granted') {
        console.error('We weren\'t granted permission.');
        commit('setIsNotificationsEnabled', false)
        return;
      }
      commit('setIsNotificationsEnabled', true)
    },


    async requestNotificationPermission({ commit, state }) {
      const permissionResult = await Notification.requestPermission();
      //check if permission granted
      alert(`permissionResult ${permissionResult}`)
      if (permissionResult !== 'granted') {
        console.error('We weren\'t granted permission.');
        return;
      }
      commit('setIsNotificationsEnabled', true)
    },

    async sendNotification({ commit, state }, {title, body}) {
      const img = '/rock.svg';
      //send notification,
      // make sure to only send notification if tab is not focused
      if (!document.hasFocus()) {
        const notification = new Notification(title, { body , icon: img });
        console.log("notification", notification)
      }
    },

    


  },
  modules: {
  },

})

store.dispatch('setTime')
store.dispatch('fetchEvents')
store.dispatch('checkNotficationsEnabled')

export default store
