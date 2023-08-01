<template>
    <header
     v-if="!loggedin"
     class=""
    >
      <h1 class="title-header">
        Welcome to Handsy.io
      </h1>
      <p class="title-paragraph">
        Play rock paper scissors with your friends or with random opponents for <span class="currency-symbol bolden">real money</span>
      </p>
      
      <button
        class="button-dark"
        @click="login"
        style="cursor: pointer; width: 270px; height:86px;"
      >
        {{ loading ? 'Logging in...' : 'Sign Up'  }}
      </button>
    </header>

    <img
      v-if="!loggedin"
      src="../assets/background.png"
      style="width: 100%; position: fixed; bottom: 0; left: 0; z-index: -1;"
    />

    <div v-if="loggedin">
      <!-- Staking and Game screen tabs-->

      <!-- <button
        class="card"
        @click="staking = false"
        style="cursor: pointer"
      >
        Game
      </button>

      <button
        class="card"
        @click="staking = true"
        style="cursor: pointer"
      >
        Staking coming soon
      </button> -->

      
      <!-- <div>Logged in as {{ activeAccount }}</div>
      <div>Balance: {{ balance }} ETH</div> -->
      <Game
        v-if="!staking"
       :provider="provider" 
       :balance="balance"
      />

      <!-- <button @click="logout">Logout</button>
      <button @click="buyEth">Buy ETH</button> -->
      <Staking
        v-if="staking"
        :provider="provider"
      />
    </div>
</template>

<script lang="ts">
import Game from "../components/Game.vue";
import Staking from "../components/Staking.vue";
import Web3 from "web3";


import Transak from '@biconomy/transak';


import { ref, onMounted, watch } from "vue";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import RPC from "../web3RPC";

// Plugins
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";

// Adapters
import { WalletConnectV1Adapter } from "@web3auth/wallet-connect-v1-adapter";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { TorusWalletAdapter } from "@web3auth/torus-evm-adapter";
import { mapState } from 'vuex';
import store from '@/store';

const CHAIN_ID_MAINNET = "0x1"
const CHAIN_ID_TESTNET = "0x118"
const CHAIN_ID_LOCALHOST = "0x10e"
const CHAIN_ID_LOCALHOST_HARDHAT = "0x7A69"
const CHAIN_ID_ARBITRUM_GOERLI = "0x66EED"

const RPC_URLS = {
  [CHAIN_ID_MAINNET]: "https://rpc.ankr.com/eth",
  [CHAIN_ID_TESTNET]: "https://testnet.era.zksync.dev",
  [CHAIN_ID_LOCALHOST]: "http://localhost:3050/",
  [CHAIN_ID_LOCALHOST_HARDHAT]: "http://localhost:8545",
  [CHAIN_ID_ARBITRUM_GOERLI]: "https://maximum-shy-meme.arbitrum-goerli.discover.quiknode.pro/9e608d37bed73e216df881fc52b358d41236b29e/",

};

const CURRENT_CHAIN_ID = CHAIN_ID_ARBITRUM_GOERLI;

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Home",
  props: {
    msg: String,
  },
  components: {
    Game,
    Staking,
  },
  computed: mapState([
    'loggedin',
    'loading',
    'loginButtonStatus',
    'connecting',
    'activeAccount',
    'balance',
    'provider',
    'isJoiningPasswordMatch',
    'joiningPassword',
  ]),
  methods:{
    login() {
      store.dispatch('login')
    },
  }
 
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
