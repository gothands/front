import { createStore } from 'vuex'
import RPC from '../web3RPC'

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
      provider: null,

      // Game
      games: games,

    }
  },
  getters: {
    balance: (state) => async (address: any) => {
      return state.balances[address]
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

    // Game
    setGames(state, payload) { 
      state.games = payload;
      localStorage.setItem('games', JSON.stringify(state.games));
    },
  },
  actions: {
    // Auth
    setLoggedIn({ commit }, payload) { commit('setLoggedIn', payload) },
    setLoading({ commit }, payload) { commit('setLoading', payload) },
    setLoginButtonStatus({ commit }, payload) { commit('setLoginButtonStatus', payload) },
    setConnecting({ commit }, payload) { commit('setConnecting', payload) },
    setActiveAccount({ commit }, payload) { commit('setActiveAccount', payload) },
    setBalance({ commit }, payload) { commit('setBalance', payload) },
    setProvider({ commit }, payload) { commit('setProvider', payload) },
    async setBalanceOf({ commit, state }, payload) {
      const rpc = new RPC(state.provider)
      const balance = await rpc.getBalanceOf(payload)

      let balances: Balances = {...state.balances}
      balances[payload] = balance
      console.log("balances", balances)
      commit('setBalances', balances)
    },
    // Game
    setGames({ commit }, payload) { commit('setGames', payload) },
  },
  modules: {
  }
})
