<template>
    <div class="home">
      <h2 style="">Adding funds</h2>
      <p class="green" style="margin-top:-15px; margin-bottom:20px; font-size:20px;">{{addFundsMessage}}</p>
      <select v-model="state.tokenAddress" placeholder="Select" size="large">
        <option
          v-for="item in state.tokens"
          :key="item.address"
          :label="item.name"
          :value="item.address"
        />
      </select>
      <select v-model="state.fromChainId" placeholder="Select" size="large">
        <option
          v-for="item in state.fromChains"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </select>
      <select v-model="state.toChainId" placeholder="Select" size="large">
        <option
          v-for="item in state.toChains"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </select>
      <div class="home-item">
        <input
          size="large"
          v-model="state.amount"
          placeholder="Please input amount."
          style="width: 300px"
        />
      </div>
      <div v-if="state.amountsError" class="home-item amounts-error">{{ state.amountsError }}</div>
      <div v-if="state.amounts" class="home-item amounts">
        <div>
          payAmount: <span>{{ state.amounts.payAmountHm }}</span>
        </div>
        <div>
          receiveAmount: <span>{{ state.amounts.receiveAmountHm }}</span>
        </div>
      </div>
      
      <el-collapse
        class="home-item"
        v-if="state.transferList.length > 0"
        v-model="state.collapseActive"
      >
        <div
          v-for="(item, index) in state.transferList"
          :key="index"
        >
        {{ `token: ${item.token.name}, fromChain: ${item.fromChain.name}, toChain: ${item.toChain.name}, amount: ${item.amount}` }}
        <div class="transfer-list__result">
          {{ JSON.stringify(item.result) }}
        </div>
      </div>

          
        
      </el-collapse>

      <div style="margin-top: 20px; text-align: center; display: flex; justify-content: center; gap: 20px;">
        <button
        :disabled="state.amountsError != '' || state.transferring || state.complete"
        size="large"
        
        @click="onConfirmTransfer"
        class="button-dark"
      >
        {{ (state.complete ? 'Complete' : state.transferring ? 'Transferring' : 'Transfer') }}
    </button>
    <button
                    class="button-light"
                    @click="()=>{closeCallBack()}">
                        Close
                    </button>
      </div>
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

  const state = reactive({
    tokens: [] as BridgeToken[],
    fromChains: [] as BridgeChain[],
    toChains: [] as BridgeChain[],
  
    tokenAddress: '',
    fromChainId: undefined as undefined | number,
    toChainId: undefined as undefined | number,
  
    amount: '',
  
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
  const url = window.location.href;
  const network = url.includes("handsy.io") ? "Mainnet" : "Testnet";
  //const network = "Mainnet";
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
  const onConfirmTransfer = async () => {
    try {
      state.transferring = true
      if(network == "Testnet"){
        state.complete = true;

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
  
      state.transferList.unshift({
        token: currentToken.value,
        fromChain: currentFromChain.value,
        toChain: currentToChain.value,
        amount: state.amount,
        result,
      })

      state.complete = true;

      //await delay by 1 seconds
      await new Promise(r => setTimeout(r, 1000));
      
      //call callback
      props.callback()
      
    } catch (err) {
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
    width: 500px;
    margin-left: auto;
    margin-right: auto;
    color: var(--el-color-danger);
    font-weight: bold;
  }
  .amounts {
    font-weight: bold;
    color: #666666;
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