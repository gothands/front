<template>
  <div >
    <h1>
      Handsy.io
    </h1>
    <h2>
      Rock Paper Scissors for <a>real money</a>
    </h2>

    <button
      v-if="!loggedin"
      class="card"
      @click="login"
      style="cursor: pointer"
    >
      Login
    </button>

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

      
      <div>Logged in as {{ activeAccount }}</div>
      <div>Balance: {{ balance }} ETH</div>
      <Game
        v-if="!staking"
       :provider="provider" 
      />

      <button @click="logout">Logout</button>
      <button @click="buyEth">Buy ETH</button>
      <!-- <Staking
        v-if="staking"
        :provider="provider"
      /> -->
    </div>
  </div>
</template>

<script lang="ts">
import Game from "./components/Game.vue";
import Staking from "./components/Staking.vue";
import Web3 from "web3";


import { ref, onMounted, watch } from "vue";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import RPC from "./web3RPC";

// Plugins
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";

// Adapters
import { WalletConnectV1Adapter } from "@web3auth/wallet-connect-v1-adapter";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { TorusWalletAdapter } from "@web3auth/torus-evm-adapter";

const CHAIN_ID_MAINNET = "0x1"
const CHAIN_ID_TESTNET = "0x118"
const CHAIN_ID_LOCALHOST = "0x10e"

const RPC_URLS = {
  [CHAIN_ID_MAINNET]: "https://rpc.ankr.com/eth",
  [CHAIN_ID_TESTNET]: "https://testnet.era.zksync.dev",
  [CHAIN_ID_LOCALHOST]: "http://localhost:3050/"
};

const CURRENT_CHAIN_ID = CHAIN_ID_LOCALHOST;

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
  setup() {
    const staking = ref<boolean>(false);
    const loggedin = ref<boolean>(false);
    const loading = ref<boolean>(false);
    const loginButtonStatus = ref<string>("");
    const connecting = ref<boolean>(false);
    const rampInstantSdk = ref<any>(null);

    const activeAccount = ref<string>("");
    const balance = ref<string>("0");

    const provider = ref<SafeEventEmitterProvider | any>(false);
    const clientId =
      "BNXP4nqNQ7AgD-kFeqeLjvBNM9RVVJJmhOgd1DVZw89SY7UzYGh_RwXK-YVIVFn8qFU6BbL3krmslFNJPpu71Bs"; // get from https://dashboard.web3auth.io

    const web3auth = new Web3Auth({
      clientId,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: CURRENT_CHAIN_ID,
        rpcTarget: RPC_URLS[CURRENT_CHAIN_ID] // This is the public RPC we have added, please pass on your own endpoint while creating an app
      },
      uiConfig: {
        defaultLanguage: "en",
      },
      web3AuthNetwork: "testnet",
      //provider: new web3.providers.WebsocketProvider("ws://localhost:8545"),
    });

    console.log("web3auth provider", web3auth.provider);

    // plugins and adapters are optional and can be added as per your requirement
    // read more about plugins here: https://web3auth.io/docs/sdk/web/plugins/

    // adding torus wallet connector plugin

    const torusPlugin = new TorusWalletConnectorPlugin({
      torusWalletOpts: {},
      walletInitOptions: {
        whiteLabel: {
          theme: { isDark: true, colors: { primary: "#00a8ff" } },
          logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
          logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
        },
        useWalletConnect: true,
        enableLogging: true,
      },
    });

    // read more about adapters here: https://web3auth.io/docs/sdk/web/adapters/

    // adding wallet connect v1 adapter

    const walletConnectV1Adapter = new WalletConnectV1Adapter({
      adapterSettings: {
        bridge: "https://bridge.walletconnect.org",
      },
      clientId,
    });

    web3auth.configureAdapter(walletConnectV1Adapter);

    // adding metamask adapter

    const metamaskAdapter = new MetamaskAdapter({
      clientId,
      sessionTime: 3600, // 1 hour in seconds
      web3AuthNetwork: "testnet",
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: CURRENT_CHAIN_ID,
        rpcTarget: RPC_URLS[CURRENT_CHAIN_ID]      },
    });
    // we can change the above settings using this function
    metamaskAdapter.setAdapterSettings({
      sessionTime: 86400, // 1 day in seconds
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: CURRENT_CHAIN_ID,
        rpcTarget: RPC_URLS[CURRENT_CHAIN_ID]      },
      web3AuthNetwork: "testnet",
    });

    // it will add/update  the metamask adapter in to web3auth class
    web3auth.configureAdapter(metamaskAdapter);

    const torusWalletAdapter = new TorusWalletAdapter({
      clientId,
    });

    // it will add/update  the torus-evm adapter in to web3auth class
    web3auth.configureAdapter(torusWalletAdapter);


    onMounted(async () => {
      try {
        loading.value = true;
        loggedin.value = false;
        await web3auth.initModal();
        const userInfo: any = await web3auth.getUserInfo();
        await web3auth.addPlugin(torusPlugin);
        if (web3auth.provider) {
          provider.value = web3auth.provider;
          console.log("userInfo", userInfo)
          const initVal = await torusPlugin.initWithProvider(provider, userInfo);
          loggedin.value = true;

        }

        console.log("provider", provider.value);
      } catch (error) {
        uiConsole("error", error);
      } finally {
        loading.value = false;
      }
    });
    const fetchBalance = async () => {
      if (!provider.value || !activeAccount.value) {
        return;
      }

      const rpc = new RPC(provider.value);
      const balanceEth = await rpc.getBalance();

      console.log("balanceEth", balanceEth);

      balance.value = balanceEth;
    };

    const pollBalance = async () => {
      await fetchBalance();
      setTimeout(pollBalance, 5000); // Poll every 5000 milliseconds (5 seconds)
    };


    
watch(
  provider,
  (newValue, oldValue) => {
    if (newValue) {
      // The provider value has changed, start polling the balance
      pollBalance();
      getAccounts();
    }
  },
  { immediate: true } // This option triggers the watch callback immediately with the current value
);

    const login = async () => {
      if (!web3auth) {
        uiConsole("web3auth not initialized yet");
        return;
      }
      provider.value = await web3auth.connect();
      console.log("provider", provider);
      const userInfo: any = await web3auth.getUserInfo();
      await torusPlugin.initWithProvider(provider, userInfo);
      loggedin.value = true;
      uiConsole("Logged in Successfully!");
    };    

    const buyEth = async () => {
      console.log("torusPlugin", torusPlugin);
      if (!web3auth) {
        uiConsole("web3auth not initialized yet");
        return;
      }
      await torusPlugin.initiateTopup("rampnetwork", {
        selectedAddress: activeAccount.value, // User's wallet address
        //selectedCurrency: "USD", // Fiat currency
        fiatValue: 100, // Fiat Value
        chainNetwork: "mainnet", // Blockchain network
      });
    }


    const authenticateUser = async () => {
      if (!web3auth) {
        uiConsole("web3auth not initialized yet");
        return;
      }
      const idToken = await web3auth.authenticateUser();
      uiConsole(idToken);
    };

    const getUserInfo = async () => {
      if (!web3auth) {
        uiConsole("web3auth not initialized yet");
        return;
      }
      const user = await web3auth.getUserInfo();
      uiConsole(user);
    };

    const logout = async () => {
      if (!web3auth) {
        uiConsole("web3auth not initialized yet");
        return;
      }
      await web3auth.logout();
      provider.value = null;
      loggedin.value = false;
    };

    const getChainId = async () => {
      if (!provider.value) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider.value);
      const chainId = await rpc.getChainId();
      uiConsole(chainId);
    };

    const addChain = async () => {
      if (!provider.value) {
        uiConsole("provider not initialized yet");
        return;
      }
      const newChain = {
        chainId: "0x5",
        displayName: "Goerli",
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        tickerName: "Goerli",
        ticker: "ETH",
        decimals: 18,
        rpcTarget: "https://rpc.ankr.com/eth_goerli",
        blockExplorer: "https://goerli.etherscan.io",
      };
      await web3auth?.addChain(newChain);
      uiConsole("New Chain Added");
    };

    const switchChain = async () => {
      if (!provider.value) {
        uiConsole("provider not initialized yet");
        return;
      }
      const newChain = {
        chainId: "0x5",
        displayName: "Goerli",
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        tickerName: "Goerli",
        ticker: "ETH",
        decimals: 18,
        rpcTarget: "https://rpc.ankr.com/eth_goerli",
        blockExplorer: "https://goerli.etherscan.io",
      };
      await web3auth?.switchChain({ chainId: "0x5" });
      uiConsole("Chain Switched");
    };


    const getAccounts = async () => {
      if (!provider.value) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider.value);
      const address = await rpc.getAccounts()
      activeAccount.value = address[0]
      uiConsole(address);
    };

    const getBalance = async () => {
      if (!provider.value) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider.value);
      const balance = await rpc.getBalance();
      uiConsole(balance);
    };

    const sendTransaction = async () => {
      if (!provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider.value);
      const receipt = await rpc.sendTransaction();
      uiConsole(receipt);
    };

    const signMessage = async () => {
      if (!provider.value) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider.value);
      const signedMessage = await rpc.signMessage();
      uiConsole(signedMessage);
    };

    const getPrivateKey = async () => {
      if (!provider.value) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(provider.value);
      const privateKey = await rpc.getPrivateKey();
      uiConsole(privateKey);
    };

    function uiConsole(...args: any[]): void {
      const el = document.querySelector("#console>p");
      if (el) {
        el.innerHTML = JSON.stringify(args || {}, null, 2);
      }
    }

    function setStakingTrue () {
      staking.value = true
    }

    function setStakingFalse () {
      staking.value = false
    }

    return {
      staking,
      loggedin,
      loading,
      loginButtonStatus,
      connecting,
      provider,
      balance,
      activeAccount,
      getWeb3: 
      web3auth,
      login,
      buyEth,
      authenticateUser,
      logout,
      getUserInfo,
      getChainId,
      addChain,
      switchChain,
      getAccounts,
      getBalance,
      sendTransaction,
      signMessage,
      getPrivateKey,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
