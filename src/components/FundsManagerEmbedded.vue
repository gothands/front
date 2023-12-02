<template>
    <div class="home funds-manager">
      <h2 style=""> {{ state.isWithdrawPage ? "Withdraw" : "Fund wallet" }}
        <span @click="toggleWithdraw" style="cursor:pointer;font-size:20px; font-weight:100; letter-spacing:normal; text-decoration:underline;">{{ state.isWithdrawPage ? "or deposit" : "or withdraw" }}</span>
      </h2>
      <template v-if="!state.isWithdrawPage">
        <p style="padding-bottom:20px;">Get some ETH onto your Arbitrum Nova account</p>

        <p class="grey" style="font-size:15px; text-align:start">Deposit Arb Nova ETH to your Handsy.io wallet <a href="https://discord.gg/ZjqqaZvw" target="_blank">Join Discord</a></p>
        <div class="card-small">
            <h4>Copy address and send funds</h4>

            
            <a
            style="cursor: pointer; display:flex; gap:10px;"
            @click="()=>{copyTextToClipboard(store.state.activeAccount)}"
            ><div>{{ truncateAddress(store.state.activeAccount) }}</div> <div class="copy"></div></a>

        </div>
        <p class="grey" style="font-size:15px;text-align:start">Your balance {{balance}} ETH</p>

        </template>
        <template v-else>
          
          <p style="padding-bottom:20px;">Get your funds to an external account</p>

        <p class="grey" style="font-size:15px; text-align:start">Export your private key and import it into an external wallet</p>
        <div class="card-small">
            <h4>Copy your private key</h4>

            
            <a
            style="cursor: pointer; display:flex; gap:10px;"
            @click="()=>{store.dispatch(`exportPrivateKey`)}"
            ><div>Copy PK</div> <div class="copy"></div></a>

        </div>
        <p class="grey" style="font-size:15px;text-align:start">Your balance {{balance}} ETH</p>

        </template>


      <div class="modal-button-holder">
        
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
  import { ElNotification } from 'element-plus'
  import store from '../store'
  </script>
  
  <script setup lang="ts">
import { CURRENT_CHAIN_ID, RPC_URLS } from '../types'
import Web3 from 'web3'
import { copyTextToClipboard, truncateAddress } from '../utils'

  const state = reactive({

  
    tokenAddress: '',
    fromChainId: undefined as undefined | number,
    toChainId: undefined as undefined | number,
  
    amount: 0.01,
  
    amounts: undefined as
      | undefined
      | { payAmount: ethers.BigNumber; payAmountHm: string; receiveAmountHm: string },
    amountsError: '',
  
    collapseActive: 0,
    transferring: false,
    complete: false,
    sentToBridge: false,
    sentToDestination: false,
    fromBalance: '0',
    toBalance: '0',
    isWithdrawPage: false,
    amountToWithdraw: 0,
    withdrawAddress: '',
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
  const mainnetBalance = computed(() => store.state.mainnetBalance)
  const bridgingEthToMainnetFromNova = computed(() => store.state.bridgingEthToMainnetFromNova)
  const completedBridgingEthToMainnetFromNova = computed(() => store.state.completedBridgingEthToMainnetFromNova)
  const withdrawingToAddress = computed(() => store.state.withdrawingToAddress)
  const completedWithdrawingToAddress = computed(() => store.state.completedWithdrawingToAddress)
  //Create a stepper computed function that determines the current step
  //Bridging to mainnet from nova is the first step
  //Withdrawing to address is the second step
  const withdrawalStepper = computed(() => {
    if(bridgingEthToMainnetFromNova.value){
      return 1;
    }
    if(completedBridgingEthToMainnetFromNova.value){
      return 2;
    }
    if(withdrawingToAddress.value){
      return 3;
    }
    if(completedWithdrawingToAddress.value){
      return 4;
    }
    return 0;
  })
  const canWithdraw = computed(() => {
    return withdrawalStepper.value == 0 || withdrawalStepper.value == 4;
  })
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

  // methods
  const withdraw = async () => {
    await store.dispatch('withdrawNovaEth', {amount: state.amountToWithdraw, address: state.withdrawAddress})
  }
  const toggleWithdraw = () => {
    state.isWithdrawPage = !state.isWithdrawPage;

  }


  const url = window.location.href;
  //const network = url.includes("handsy.io") ? "Mainnet" : "Testnet";
  const network = "Mainnet";
  
  

  
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

  

  
  
  // watchs
  watch(
    () => [state.tokenAddress, state.fromChainId, state.toChainId],
    () => {
    }
  )
  watch(
    () => state.amount,
    () => {
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