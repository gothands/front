<template>
    <div class="home">
      <h2 style="">Fund wallet</h2>
        <p>Get some ETH onto your Arbitrum Nova account</p>

        <p class="grey" style="text-align:start">Step 1</p>
        <div class="card-small">
            <h3>Bridge ETH to Arb Nova</h3>
            <a
            style="cursor: pointer;"
            target="_blank"
             href="https://www.orbiter.finance/?source=Ethereum&dest=Arbitrum%20Nova">Bridge</a>
        </div>

        <p class="grey" style="text-align:start">Step 2</p>
        <div class="card-small">
            <h3>Deposit to your wallet</h3>
            <a
            style="cursor: pointer;"
            @click="()=>{copyTextToClipboard(store.state.activeAccount)}"
            >Copy address</a>
        </div>


        <p class="grey">Your balance {{balance}} ETH</p>


      <div style="margin-top: 20px; text-align: center; display: flex; justify-content: end; gap: 20px;">
        <button
          class="button-light"
          @click="()=>{closeCallBack()}"
        >
          Cancel
        </button>
    
      </div>
      <!-- <a href="https://www.orbiter.finance/?source=Ethereum&dest=Arbitrum%20Nova">Or use to Orbiter</a> -->

    </div>
  </template>
  
  <script lang="ts">
  import { Web3Provider } from '@ethersproject/providers'
  import { ethers } from 'ethers'
  import { computed, reactive, watch, defineProps } from 'vue'
  import { Bridge, BridgeChain, BridgeToken } from 'orbiter-sdk'
  import { ElNotification } from 'element-plus'
  import store from '@/store'
  </script>
  
  <script setup lang="ts">
import { CURRENT_CHAIN_ID, RPC_URLS } from '@/types'
import Web3 from 'web3'
import { copyTextToClipboard } from '@/utils'

  const state = reactive({
    tokens: [] as BridgeToken[],
    fromChains: [] as BridgeChain[],
    toChains: [] as BridgeChain[],
  
    tokenAddress: '',
    fromChainId: undefined as undefined | number,
    toChainId: undefined as undefined | number,
  
    amount: 0.01,
  
    amounts: undefined as
      | undefined
      | { payAmount: ethers.BigNumber; payAmountHm: string; receiveAmountHm: string },
    amountsError: '',
  
    transferList: [] as {
      token: BridgeToken
      fromChain: BridgeChain
      toChain: BridgeChain
      amount: string
      result: any
    }[],
    collapseActive: 0,
    transferring: false,
    complete: false,
    sentToBridge: false,
    sentToDestination: false,
    fromBalance: '0',
    toBalance: '0',
  })

  //props
  const props = defineProps({
    minimumFundsToAdd: {
      type: Number,
      required: false,
      default: 0.01
    },
    callback: {
      type: Function,
      required: false,
      default: () => {}
    }, 
    closeCallBack: {
      type: Function,
      required: false,
      default: () => {}
    },
    // Add more props here if needed
  })
  
  // computeds
  const balance = computed(() => store.state.balance)
  const addFundsMessage = computed(() =>{
    if(props.minimumFundsToAdd){
      const isJoiningMatch = store.state.isJoiningPasswordMatch;
      const joiningPassword = store.state.joiningPassword;
      if(isJoiningMatch){
        return `Add atleast ${props.minimumFundsToAdd} ETH to join match ${joiningPassword}`
      }
      return `Add atleast ${props.minimumFundsToAdd} ETH to complete that transaction`
      
    }else{
      return ""
    }
  })
  const closeCallBack = computed(() => props.closeCallBack)
  const currentToken = computed(() =>
    state.tokens.find((item) => item.address.toLowerCase() == state.tokenAddress.toLowerCase())
  )
  const currentFromChain = computed(() =>
    state.fromChains.find((item) => item.id == state.fromChainId)
  )
  const currentToChain = computed(() => state.toChains.find((item) => item.id == state.toChainId))
  
  // methods
  //check if current url is handsy.io if so, use mainnet
  const updateBalances = async () => {
  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      if (state.fromChainId) {
        state.fromBalance = await getBalance(ethereum.selectedAddress, state.fromChainId.toString());
      }
      if (state.toChainId) {
        state.toBalance = await getBalance(ethereum.selectedAddress, '42170');
      }
      // If both calls are successful, break out of the loop
      break;
    } catch (error) {
      console.error("Error fetching balance. Attempt:", i + 1, error);
      // If it's the last attempt, rethrow the error
      if (i === maxRetries - 1) {
        throw error;
      }
    }
  }
};

  const url = window.location.href;
  //const network = url.includes("handsy.io") ? "Mainnet" : "Testnet";
  const network = "Mainnet";
  const bridge = new Bridge(network)
  const refreshBridgeSupports = async () => {
    const supports = await bridge.supports(currentFromChain.value, currentToChain.value)
    
    const onlyToChainAllowed = network == "Mainnet" ? '42170' : '421611';
    state.fromChains = supports.fromChains
    state.toChains = supports.toChains.filter((item) => item.networkId == onlyToChainAllowed)

    console.log("toChains", state.toChains)
    console.log("initial toChains", supports.toChains)

    state.fromChainId = state.fromChains.find(
      (item, index) => (!currentFromChain.value && index == 0) || currentFromChain.value.id == item.id
    )?.id
    state.toChainId = state.toChains.find(
      (item, index) => (!currentToChain.value && index == 0) || currentToChain.value.id == item.id
    )?.id

    console.log("to chains", state.toChains)

    //update balances
    //await updateBalances();
  
    // Token deduplicate
    state.tokens = supports.tokens
      .map((item) => {
        if (state.fromChainId == item.chainId) {
          return item
        }
        return undefined
      })
      .filter((item) => item !== undefined)
    state.tokenAddress = state.tokens.find(
      (item, index) =>
        (!currentToken.value && index == 0) || currentToken.value.address == item.address
    )?.address

    //update balances
    await updateBalances();

  }
  refreshBridgeSupports()
  
  const getAmounts = async () => {
    if (!state.amount) {
      return
    }
  
    try {
      state.amounts = await bridge.getAmounts(
        currentToken.value,
        currentFromChain.value,
        currentToChain.value,
        state.amount
      )
      state.amountsError = ''
    } catch (err) {
      state.amounts = undefined
      state.amountsError = err.message
    }
  }
  
  const ethereum = (window as any).ethereum

  const getBalance = async (address: string, chainId: string) => {
    //convert chainId to hex,
    // if "1" it should be "0x1"
    // if "42170" it should be "0xA4B1"
    let chainId1 = "0x" + Number(chainId).toString(16);
    let providerEndpoint = RPC_URLS[chainId1] ?? RPC_URLS["0x1"];

    console.log("providerEndpoint", providerEndpoint)

    const web3Instance = new Web3(new Web3.providers.HttpProvider(providerEndpoint))
    const balance = await web3Instance.eth.getBalance(address);
    const ethBalance = parseFloat(web3Instance.utils.fromWei(balance, 'ether')).toFixed(6);
    return ethBalance;
  };

  const waitForDestination = async (destinationAddress: string, toChainId: string) => {
    const initialDestinationBalance = await getBalance(destinationAddress, toChainId);
    while (true) {
      const newDestinationBalance = await getBalance(destinationAddress, toChainId);
      if (parseFloat(newDestinationBalance) - parseFloat(initialDestinationBalance) >= (state.amount * 0.6)) {
        return true;
      }
      // Wait for 5 seconds before checking again
      await new Promise(r => setTimeout(r, 5000));
    }
  };

  const onConfirmTransfer = async () => {
    try {
      state.transferring = true
      if(network == "Testnet"){
        state.complete = true;
        state.transferring = false;

        //await delay by 1 seconds
        await new Promise(r => setTimeout(r, 1000));
        
        //call callback
        props.callback()
        return;
      }
      const result = await bridge.transfer(
        new Web3Provider(ethereum).getSigner(),
        currentToken.value,
        currentFromChain.value,
        currentToChain.value,
        state.amount
      )
  
      // state.transferList.unshift({
      //   token: currentToken.value,
      //   fromChain: currentFromChain.value,
      //   toChain: currentToChain.value,
      //   amount: state.amount,
      //   result,
      // })

      state.sentToBridge = true;

      await waitForDestination(store.state.activeAccount, currentToChain.value?.networkId as string);

      await updateBalances();

      state.complete = true;
      state.transferring = false;

      await store.state.onboard.setChain({chainId: CURRENT_CHAIN_ID})

      //await delay by 1 seconds
      await new Promise(r => setTimeout(r, 1000));
      
      //call callback
      props.callback()
      
    } catch (err) {
      state.complete = false;
      state.transferring = false;
      alert(err.message)
    }
  }
  
  // watchs
  watch(
    () => [state.tokenAddress, state.fromChainId, state.toChainId],
    () => {
      refreshBridgeSupports()
      getAmounts()
    }
  )
  watch(
    () => state.amount,
    () => {
      getAmounts()
    }
  )
  </script>
  
  <style>
  .home {
    margin: 0 auto;
  }
  .select {
    margin-right: 12px;
  }
  .el-button {
    margin-top: 12px;
  }
  .home-item {
    margin-top: 20px;
  }
  .amounts-error {
    text-align: start;
    margin-left: auto;
    margin-right: auto;
    color: #666666;
    font-weight: bold;
    font-size: small;
    margin-left: 20px;

  }
  .amounts {
    font-weight: bold;
    color: #666666;
    font-size: small;
    text-align: start;
    margin-left: 20px;
  }
  .amounts span {
    color: var(--el-color-success);
  }
  .transfer-list__result {
    text-align: left;
    line-height: 15px;
    max-height: 200px;
    padding: 10px;
    overflow-y: scroll;
    word-wrap: break-word;
  }
  </style>