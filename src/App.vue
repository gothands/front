<template>
	<nav>
		<div class="title">
		  Handsy.io
		</div>

		<div
			
		 	class="nav-right"
		>
			<router-link v-if="!isInGame && loggedin" to="/affiliate">Affiliate</router-link>
			<router-link v-if="!isInGame && loggedin" to="/staking">Staking</router-link>
			<button
			v-if="isInGame"
			class="button-light"
			@click="leaveGame">
			Leave
		</button> 
			<div
				v-if="loggedin"
				class="profile"
			>
			</div>
		</div>
		
		
	  </nav>
    <p v-if="joiningPassword">
      Joining match: {{ joiningPassword }} ...
    </p>
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
import Staking from "./components/Staking.vue";
import Web3 from "web3";


import Transak from '@biconomy/transak';


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
import { mapState } from 'vuex';
import store from '@/store';

const CHAIN_ID_MAINNET = "0x1"
const CHAIN_ID_TESTNET = "0x118"
const CHAIN_ID_LOCALHOST = "0x10e"
const CHAIN_ID_LOCALHOST_HARDHAT = "0x7A69"
const CHAIN_ID_ARBITRUM_GOERLI = "0x66eed"

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
	'isInGame',
  'joiningPassword',
  'isJoiningPasswordMatch',
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
        store.dispatch("setIsJoiningPasswordMatch", false);

      }
      
    }
  
    const staking = ref<boolean>(false);
    const rampInstantSdk = ref<any>(null);


    const clientId =
      "BNXP4nqNQ7AgD-kFeqeLjvBNM9RVVJJmhOgd1DVZw89SY7UzYGh_RwXK-YVIVFn8qFU6BbL3krmslFNJPpu71Bs"; // get from https://dashboard.web3auth.io

      

    const web3auth = new Web3Auth({
      clientId,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: CURRENT_CHAIN_ID,
        rpcTarget: RPC_URLS[CURRENT_CHAIN_ID], // This is the public RPC we have added, please pass on your own endpoint while creating an app
        displayName: "Arbitrum Testnet",
        blockExplorer: "https://goerli.arbiscan.io/", 
        ticker: "ETH",
        tickerName: "ETH",
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
        //bridge: "https://bridge.walletconnect.org",
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
        rpcTarget: RPC_URLS[CURRENT_CHAIN_ID] ,
        blockExplorer: "https://goerli.arbiscan.io/",  
        displayName: "Arbitrum Testnet",
        ticker: "ETH",
        tickerName: "ETH",
      },
    });
    // we can change the above settings using this function
    metamaskAdapter.setAdapterSettings({
      sessionTime: 86400, // 1 day in seconds
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: CURRENT_CHAIN_ID,
        rpcTarget: RPC_URLS[CURRENT_CHAIN_ID],
        blockExplorer: "https://goerli.arbiscan.io/", 
        displayName: "Arbitrum Testnet",
        ticker: "ETH",
        tickerName: "ETH",
      },
      web3AuthNetwork: "testnet",
    });

    // it will add/update  the metamask adapter in to web3auth class
    web3auth.configureAdapter(metamaskAdapter);

    const torusWalletAdapter = new TorusWalletAdapter({
      clientId,
    });

    // it will add/update  the torus-evm adapter in to web3auth class
    web3auth.configureAdapter(torusWalletAdapter);

	store.dispatch("setWeb3Auth", web3auth);


    onMounted(async () => {
      try {
        checkJoiningPassword();
        store.dispatch("setLoading", true);
        store.dispatch("setLoggedIn", false);
        await web3auth.initModal();
        const userInfo: any = await web3auth.getUserInfo();
        await web3auth.addPlugin(torusPlugin);
        if (web3auth.provider) {
          store.dispatch("setProvider", web3auth.provider);
		  console.log("setProvider", web3auth.provider);
          console.log("userInfo", userInfo)
          //const initVal = await torusPlugin.initWithProvider(store.state.provider, userInfo);
          store.dispatch("setLoggedIn", true);

        }
        store.dispatch("setLoading", false);

		//check if logged in through metamask
		if (web3auth.connectedAdapterName === "metamask") {
			store.dispatch("setIsMetamask", true);
		}

		console.log("adapter", web3auth.connectedAdapterName);



        console.log("provider", store.state.provider);
      } catch (error) {
        uiConsole("error", error);
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
      setTimeout(pollBalance, 5000); // Poll every 5000 milliseconds (5 seconds)
    };


    
watch(
  () => store.state.provider,
  async (newValue, oldValue) => {
    if (newValue) {
      // The provider value has changed, start polling the balance
      await pollBalance();
      await getAccounts();
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

    const buyEth = async () => {
      console.log("torusPlugin", torusPlugin);
      if (!web3auth) {
        uiConsole("web3auth not initialized yet");
        return;
      }
      // await torusPlugin.initiateTopup("moonpay", {
      //   selectedAddress: activeAccount.value, // User's wallet address
      //   selectedCurrency: "USD", // Fiat currency
      //   fiatValue: 100, // Fiat Value
      //   selectedCryptoCurrency: "ETH", // Crypto currency
      //   chainNetwork: "mainnet", // Blockchain network
      // });

      const userInfo: any = await web3auth.getUserInfo();

      const transak = new Transak('PRODUCTION', {

        walletAddress: store.state.activeAccount,
        userData: {
          firstName: userInfo.name || '',
          email: userInfo.email || '',
        },
        //fiatCurrency: 'USD', // INR
        //defaultCryptoAmount: 100,
        //cryptoCurrencyCode: 'USDC',
        //cryptoAmount: 1000,
        network: 'arbitrum',
        exchangeScreenTitle: 'Buy ETH for your Handsy.io account',

    }); 
    transak.init();
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
