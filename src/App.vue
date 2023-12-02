<template>
  <modal-enable-notifications/>
	<nav>
		<div class="title hide-for-mobile">
		  Handsy.io
		</div>
    <div class="show-for-mobile">
      <div style="display:flex; align-items:center;">
        <div class="title" style="">
          Handsy.io
        </div>
        <button
        v-if="isInGame"
        class="button-light"
        style="margin-top: -10px;"
        @click="leaveGame">
        Leave
      </button> 
      </div>
    </div>

		<div
		 	class="nav-right"
		>
			<router-link 
        v-if="!isInGame && loggedin"
        to="/rankings"
        style="display:flex; align-items:center; gap:10px;"
      >
        Ranking 
      </router-link>
			<router-link v-if="!isInGame && loggedin" to="/" aria-disabled="">&#x1F512; Staking</router-link>
			<button
			v-if="isInGame"
			class="button-light hide-for-mobile-real"
			@click="leaveGame">
			{{ leaveText }}
		</button> 
    <profile-icon v-if="loggedin" class="profile" :address="activeAccount" :isMedium="true" />

		</div>
		
		
	  </nav>
    <div style="display:flex;align-items:center;justify-content:center; width:100%;">
      <p 
        v-if="joiningPassword"
        class="joining-password"
      >
        Joining match: {{ joiningPassword.toUpperCase() }} ...
      </p>
    </div>
    
  <router-view/>
</template>

<style>
a {
	text-decoration: none;
	color: #1a1a1a;
}

a:link {
	color: #1a1a1a;
}
a:hover {
	text-decoration: underline;
}
a:visited {
	color: #1a1a1a;
}	
</style>

<script lang="ts">
import Game from "./components/Game.vue";
import ProfileIcon from "./components/ProfileIcon.vue";
import Staking from "./components/Staking.vue";

import { ref, onMounted, watch } from "vue";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import RPC from "./web3RPC";
import ModalEnableNotifications from "./components/ModalEnableNotifications.vue";

// Plugins

// Adapters
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { mapState } from 'vuex';
import store from './store';

const CHAIN_ID_MAINNET = "0x1"
const CHAIN_ID_TESTNET = "0x118"
const CHAIN_ID_LOCALHOST = "0x10e"
const CHAIN_ID_LOCALHOST_HARDHAT = "0x7A69"
const CHAIN_ID_ARBITRUM_GOERLI = "0x66eed"
const CHAIN_ID_ARBITRUM_NOVA = "0xa4ba"

export const RPC_URLS = {
  [CHAIN_ID_MAINNET]: "https://rpc.ankr.com/eth",
  [CHAIN_ID_TESTNET]: "https://testnet.era.zksync.dev",
  [CHAIN_ID_LOCALHOST]: "http://localhost:3050/",
  [CHAIN_ID_LOCALHOST_HARDHAT]: "http://localhost:8545",
  [CHAIN_ID_ARBITRUM_GOERLI]: "https://goerli-rollup.arbitrum.io/rpc",
  [CHAIN_ID_ARBITRUM_NOVA]: "https://empty-proportionate-sunset.nova-mainnet.quiknode.pro/b34c277e5b6c584250278d2aad9b63452bb2188f/",
};

const CURRENT_CHAIN_ID = CHAIN_ID_ARBITRUM_NOVA;

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Home",
  props: {
    msg: String,
  },
  components: {
    Game,
    Staking,
    ProfileIcon,
    ModalEnableNotifications,
  },
  computed: mapState([
    'loggedin',
    'loading',
    'loginButtonStatus',
    'connecting',
    'activeAccount',
    'balance',
    'provider',
	'isInGame',
  'joiningPassword',
  'isJoiningPasswordMatch',
    'leaveText'
  ]),

  methods : {
	async leaveGame() {
	  await store.state.leaveGame();
	},
  },
 
  setup() {
    const checkJoiningPassword = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const joiningPassword = urlParams.get('game');
      const betAmount = urlParams.get('bet');

      store.dispatch("setJoiningPassword", "");
      store.dispatch("setIsJoiningPasswordMatch", false);

      if(joiningPassword && betAmount) {
        store.dispatch("setJoiningPassword", joiningPassword);
        store.commit("setJoiningBetAmount", betAmount);
        store.dispatch("setIsJoiningPasswordMatch", true);
      }
      
    }
  
    const staking = ref<boolean>(false);


    const clientId =
      "BNXP4nqNQ7AgD-kFeqeLjvBNM9RVVJJmhOgd1DVZw89SY7UzYGh_RwXK-YVIVFn8qFU6BbL3krmslFNJPpu71Bs"; // get from https://dashboard.web3auth.io

      

    const web3auth = new Web3Auth({
      clientId,
      web3AuthNetwork: "mainnet",
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: CURRENT_CHAIN_ID,
        rpcTarget: RPC_URLS[CURRENT_CHAIN_ID], // This is the public RPC we have added, please pass on your own endpoint while creating an app
        displayName: "Arbitrum Nova",
        blockExplorer: "https://nova.arbiscan.io/", 
        ticker: "ETH",
        tickerName: "ETH",
      },
      uiConfig: {
        defaultLanguage: "en",
      },
      
      //provider: new web3.providers.WebsocketProvider("ws://localhost:8545"),
    });

	
    console.log("web3auth provider", web3auth.provider);

    // plugins and adapters are optional and can be added as per your requirement
    // read more about plugins here: https://web3auth.io/docs/sdk/web/plugins/

    // adding torus wallet connector plugin

    // read more about adapters here: https://web3auth.io/docs/sdk/web/adapters/

    // adding wallet connect v1 adapter

    // const walletConnectV1Adapter = new WalletConnectV1Adapter({
    //   adapterSettings: {
    //     //bridge: "https://bridge.walletconnect.org",
    //   },
    //   clientId,
    // });

    // web3auth.configureAdapter(walletConnectV1Adapter);

    // adding metamask adapter

    // const metamaskAdapter = new MetamaskAdapter({
    //   clientId,
    //   sessionTime: 360000, // 1 hour in seconds
    //   web3AuthNetwork: "mainnet",
    //   chainConfig: {
    //     chainNamespace: CHAIN_NAMESPACES.EIP155,
    //     chainId: CURRENT_CHAIN_ID,
    //     rpcTarget: RPC_URLS[CURRENT_CHAIN_ID] ,
    //     blockExplorer: "https://nova.arbiscan.io/",  
    //     displayName: "Arbitrum Nova",
    //     ticker: "ETH",
    //     tickerName: "ETH",
    //   },
    // });

    // it will add/update  the metamask adapter in to web3auth class
    //web3auth.configureAdapter(metamaskAdapter);

  
    // const injected = injectedModule()
    // const walletConnect = walletConnectModule({projectId: '731ecc593b8d659e6155e34fb33dd8b2'})
    // const coinbaseWallet = coinbaseModule()

    // const appMetadata = {
    //   name: 'Web3-Onboard Vanilla JS Demo',
    //   icon: '<svg />',
    //   logo: '<svg />',
    //   description: 'Demo using Onboard',
    //   recommendedInjectedWallets: [
    //     { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
    //     { name: 'MetaMask', url: 'https://metamask.io' }
    //   ]
    // }

    // const onboard = Onboard({
    //   wallets: [injected, walletConnect, coinbaseWallet],
    //   chains: [
    //     {
    //       id: CURRENT_CHAIN_ID,
    //       token: 'ETH',
    //       label: 'Arbitrum Testnet',
    //       rpcUrl:  RPC_URLS[CURRENT_CHAIN_ID],
    //     }
    //   ],
    //   appMetadata,
    //   connect: {
    //     autoConnectLastWallet: true
    //   }
    // })

	//store.commit("setOnboard", onboard);
  web3auth.initModal();
    store.commit('setWeb3Auth', web3auth)


    onMounted(async () => {
      try {
        console.log("onMounted");
        checkJoiningPassword();

        store.dispatch('loginWeb3Auth')




        console.log("provider", store.state.provider);
      } catch (error) {
        console.log("error", error);
      } finally {
        store.dispatch("setLoading", false);
      }
    });
    const fetchBalance = async () => {
      if (!store.state.provider || !store.state.activeAccount) {
        return;
      }

      const rpc = new RPC(store.state.provider);
      const balanceEth = await rpc.getBalance();

      console.log("balanceEth", balanceEth);

      store.dispatch("setBalance", balanceEth);
    };

    const pollBalance = async () => {
      await fetchBalance();
      setTimeout(pollBalance, 1000); // Poll every 5000 milliseconds (5 seconds)
    };


    
watch(
  () => store.state.provider,
  async (newValue, oldValue) => {
    if (newValue) {
      // The provider value has changed, start polling the balance
      await pollBalance();
      await getAccounts();
    }

    if(newValue == null && oldValue != null) {
      // The provider value has changed, start polling the balance
      alert("You have disconnected from your wallet. Please reconnect to continue playing.");
    }
  },
  { immediate: true } // This option triggers the watch callback immediately with the current value
);

    const login = async () => {
      if (!web3auth) {
        uiConsole("web3auth not initialized yet");
        return;
      }
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
		}

      //await torusPlugin.connect()
      uiConsole("Logged in Successfully!");
    };    

    // const buyEth = async () => {
    //   console.log("torusPlugin", torusPlugin);
    //   if (!web3auth) {
    //     uiConsole("web3auth not initialized yet");
    //     return;
    //   }
    //   // await torusPlugin.initiateTopup("moonpay", {
    //   //   selectedAddress: activeAccount.value, // User's wallet address
    //   //   selectedCurrency: "USD", // Fiat currency
    //   //   fiatValue: 100, // Fiat Value
    //   //   selectedCryptoCurrency: "ETH", // Crypto currency
    //   //   chainNetwork: "mainnet", // Blockchain network
    //   // });

    //   const userInfo: any = await web3auth.getUserInfo();

    //   const transak = new Transak('PRODUCTION', {

    //     walletAddress: store.state.activeAccount,
    //     userData: {
    //       firstName: userInfo.name || '',
    //       email: userInfo.email || '',
    //     },
    //     //fiatCurrency: 'USD', // INR
    //     //defaultCryptoAmount: 100,
    //     //cryptoCurrencyCode: 'USDC',
    //     //cryptoAmount: 1000,
    //     network: 'arbitrum',
    //     exchangeScreenTitle: 'Buy ETH for your Handsy.io account',

    // }); 
    // transak.init();
    // }


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
      store.dispatch("setProvider", null);
      store.dispatch("setLoggedIn", false);
    };

    const getChainId = async () => {
      if (!store.state.provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(store.state.provider);
      const chainId = await rpc.getChainId();
      uiConsole(chainId);
    };

    const addChain = async () => {
      if (!store.state.provider) {
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
      if (!store.state.provider) {
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
      if (!store.state.provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(store.state.provider);
      const address = await rpc.getAccounts()
      store.dispatch("setActiveAccount", address[0]);
      uiConsole(address);
    };

    const getBalance = async () => {
      if (!store.state.provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(store.state.provider);
      const balance = await rpc.getBalance();
      uiConsole(balance);
    };

    const sendTransaction = async () => {
      if (!store.state.provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(store.state.provider);
      const receipt = await rpc.sendTransaction();
      uiConsole(receipt);
    };

    const signMessage = async () => {
      if (!store.state.provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(store.state.provider);
      const signedMessage = await rpc.signMessage();
      uiConsole(signedMessage);
    };

    const getPrivateKey = async () => {
      if (!store.state.provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const rpc = new RPC(store.state.provider);
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
      getWeb3: 
      web3auth,
      login,
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
