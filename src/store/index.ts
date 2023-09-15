import { createStore } from 'vuex'
import RPC from '../web3RPC'
import Web3 from 'web3';
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'

import mainContracts from "../../../contracts/local-contracts.json"
import { CURRENT_CHAIN_ID, DEFAULT_FETCH_BLOCK, READ_PROVIDER_URL } from '../types/index';

interface Balances {
  [address: string]: any;
}

//Util functions
function getGameContract(){

}

function getStakeContract(){

}

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
      balances: {} as Balances,
      provider: null as any,
      web3auth: null as any,
      onboard: null as any,
      wallets: null as any,
      isMetamask: false,

      // Game
      games: games,
      isInGame: false,
      isJoiningPasswordMatch: false,
      joiningPassword: null,
      joiningBetAmount: null,
      leaveGame: () => { console.log("leaveGame not set") },
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
    setOnboard(state, payload) { state.onboard = payload },
    setWallets(state, payload) { state.wallets = payload },

    // Game
    setGames(state, payload) { 
      state.games = payload;
      localStorage.setItem('games', JSON.stringify(state.games));
    },
    setIsInGame(state, payload) { state.isInGame = payload },
    setLeaveGame(state, payload) { state.leaveGame = payload },
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
      const web3auth = state.web3auth
      if (!web3auth) {
        console.error("web3auth not set")
        return;
      }

      if (web3auth.provider) {
        store.dispatch("setProvider", web3auth.provider);
        console.log("setProvider", web3auth.provider);
        //const initVal = await torusPlugin.initWithProvider(store.state.provider, userInfo);
        store.dispatch("setLoggedIn", true);

      }
      //check if logged in through metamask
      if (web3auth.connectedAdapterName === "metamask") {
        store.dispatch("setIsMetamask", true);
      }

      const provider = await state.web3auth.connect();
      store.dispatch("setLoading", true);
      store.dispatch("setProvider", provider);

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
      //Start fetching events
      commit('setIsFetchingEvents', true)

      //Initialize events from cache
      dispatch('initLastFetchedBlock')
      dispatch('initHandledEventIds')
      dispatch('uncacheEvents')

      //initialize web3 Read only provider and contracts
      const web3 = new Web3(new Web3.providers.HttpProvider(READ_PROVIDER_URL))
      const handsContract = new web3.eth.Contract(
        mainContracts.deployedAbis.Hands as any,
        mainContracts.deployedContracts.Hands
      )
      const stakeContract = new web3.eth.Contract(
        mainContracts.deployedAbis.Staking as any,
        mainContracts.deployedContracts.Staking
      )

      //Get events from lastFetchedBlock
      const startBlock = state.lastFetchedBlock
      const endBlock = await web3.eth.getBlockNumber()
      const blockLimit = 1000000; // Maximum blocks that can be fetched in one request

      let fromBlock = startBlock;
      let toBlock = Math.min(fromBlock + blockLimit, endBlock);
      while (fromBlock <= endBlock) {
        console.log("fetched fetching events from block", fromBlock, "to block", toBlock)
          const playerRegisteredEvents = await handsContract.getPastEvents("PlayerRegistered", { fromBlock: fromBlock, toBlock: toBlock});
          const playerWaitingEvents = await handsContract.getPastEvents("PlayerWaiting", { fromBlock: fromBlock, toBlock: toBlock});
          const playersMatchedEvents = await handsContract.getPastEvents("PlayersMatched", { fromBlock: fromBlock, toBlock: toBlock});
          const moveCommittedEvents = await handsContract.getPastEvents("MoveCommitted", { fromBlock: fromBlock, toBlock: toBlock});
          const moveRevealedEvents = await handsContract.getPastEvents("MoveRevealed", { fromBlock: fromBlock, toBlock: toBlock});
          const newRoundEvents = await handsContract.getPastEvents("NewRound", { fromBlock: fromBlock, toBlock: toBlock});
          const gameOutcomeEvents = await handsContract.getPastEvents("GameOutcome", { fromBlock: fromBlock, toBlock: toBlock});
          const playerCancelledEvents = await handsContract.getPastEvents("PlayerCancelled", { fromBlock: fromBlock, toBlock: toBlock});
          const playerLeftEvents = await handsContract.getPastEvents("PlayerLeft", { fromBlock: fromBlock, toBlock: toBlock});
          const stakeEvents = await stakeContract.getPastEvents("Staked", { fromBlock: fromBlock, toBlock: toBlock});
          const unstakeEvents = await stakeContract.getPastEvents("Unstaked", { fromBlock: fromBlock, toBlock: toBlock});
          const recievedFundsEvents = await stakeContract.getPastEvents("ReceivedFundsForStaking", { fromBlock: fromBlock, toBlock: toBlock});

          console.log("fetched", playerRegisteredEvents.length, "PlayerRegistered events")
          console.log("fetched", playerWaitingEvents.length, "PlayerWaiting events")
          console.log("fetched", playersMatchedEvents.length, "PlayersMatched events")
          console.log("fetched", moveCommittedEvents.length, "MoveCommitted events")
          console.log("fetched", moveRevealedEvents.length, "MoveRevealed events")
          console.log("fetched", newRoundEvents.length, "NewRound events")
          console.log("fetched", gameOutcomeEvents.length, "GameOutcome events")
          console.log("fetched", playerCancelledEvents.length, "PlayerCancelled events")
          console.log("fetched", playerLeftEvents.length, "PlayerLeft events")
          console.log("fetched", stakeEvents.length, "Staked events")
          console.log("fetched", unstakeEvents.length, "Unstaked events")
          console.log("fetched", recievedFundsEvents.length, "ReceivedFundsForStaking events")


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
          commit('setStakeEvents', [...state.stakeEvents, ...stakeEvents]);
          commit('setUnstakeEvents', [...state.unstakeEvents, ...unstakeEvents]);
          commit('setRecievedFundsEvents', [...state.recievedFundsEvents, ...recievedFundsEvents]);

          //Cache events and set last fetched block
          dispatch('setLastFetchBlock', toBlock);
          dispatch('cacheEvents')

          // Update blocks for the next iteration
          fromBlock = toBlock + 1;
          toBlock = Math.min(fromBlock + blockLimit, endBlock);  
          
          //process events
          commit('triggerProcessEvents', !state.triggerProcessEvents);
      }

      //Done fetching events
      commit('setIsFetchingEvents', false)

    },

    clearAndReload(){
      localStorage.clear()
      location.reload()
    }


  },
  modules: {
  },

})

store.dispatch('setTime')
store.dispatch('fetchEvents')

export default store
