import { createStore } from 'vuex'
import RPC from '../web3RPC'
import Web3 from 'web3';

import mainContracts from "../../../contracts/local-contracts.json"


interface Balances {
  [address: string]: any;
}

export default createStore({
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
      balances: {} as Balances,
      provider: null as any,
      web3auth: null as any,
      isMetamask: false,

      // Game
      games: games,
      isInGame: false,
      leaveGame: () => { console.log("leaveGame not set") },

      // Stake
      stakeContract: null as any,
      handsTokenContract: null as any


    }
  },
  getters: {
    balance: (state) => (address: any) => {
      return state.balances[address] || "0"
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
    setBalances(state, payload) { state.balances = payload },
    setProvider(state, payload) { state.provider = payload },
    setWeb3Auth(state, payload) { state.web3auth = payload },
    setIsMetamask(state, payload) { state.isMetamask = payload },

    // Game
    setGames(state, payload) { 
      state.games = payload;
      localStorage.setItem('games', JSON.stringify(state.games));
    },
    setIsInGame(state, payload) { state.isInGame = payload },
    setLeaveGame(state, payload) { state.leaveGame = payload },

    // Stake
    setHandsTokenContract(state, payload) { state.handsTokenContract = payload },
    setStakeContract(state, payload) { state.stakeContract = payload }

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
      const balance = await rpc.getBalanceOf(payload)

      let balances: Balances = {...state.balances}
      balances[payload.toLowerCase()] = balance
      console.log("balances", balances)
      commit('setBalances', balances)
    },
    async login ({ commit, state }) {
      if (!state.web3auth) {
        return;
      }
      const provider = await state.web3auth.connect();
      commit("setProvider", provider);
      //const userInfo: any = await web3auth.getUserInfo();
      //await torusPlugin.initWithProvider(provider, userInfo);
      
      commit("setLoggedIn", true);
      //await torusPlugin.connect()
    },
    // Game
    setGames({ commit }, payload) { commit('setGames', payload) },
    setIsInGame({ commit }, payload) { commit('setIsInGame', payload) },
    setLeaveGame({ commit }, payload) { commit('setLeaveGame', payload) },

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
    }

  },
  modules: {
  }
})
