<template>
  <div>
    
      Staking screen

      <div>
        <div>Hands token balance : {{handsTokenBalance}}</div>

        <div>Your staked amount : {{handsStakedBalance}}</div>
        <div>Share of total hands staked : {{(handsStakedBalance / totalHandsStakedBalance) * 100}}%</div>
        <div>Your claimable ETH for staking : {{claimableEthForStaking}}</div>
        <div>Protocol fee revenue : {{protocolFeeRevenue}}</div>
        <div>Protocol affiliate revenue : {{protocolAffiliateRevenue}}</div>
        <div>Total hands staked balance : {{totalHandsStakedBalance}}</div>

        <div>Your onboarded addresses : 
          <div v-for="address in onboardedAddresses" :key="address">
            {{address}}
          </div>
        </div>
        <div>Claimable Affiliate rewards : {{claimableEthForAffiliate}}</div>
        <div>Your affiliate link : {{affiliateLink}}</div>
      </div>

      <button @click="stake">Stake 10 HANDS</button>
      <button @click="unstake">Unstake 10 HANDS</button>
      <button @click="claim">Claim Staking Rewards</button>
      <button @click="claimAffiliateRewards">Claim Affiliate Rewards</button>
      <!-- <button @click="removeLiquidity">Remove Liquidity 10 WETH - 10 HANDS</button> -->
      <!-- <button @click="stakeLiquidity">Stake Liquidity</button> -->
      <!-- <button @click="stakeHands">Stake 100 Hands</button> -->
      <!-- <button @click="unstakeHands">Unstake Hands</button> -->

  </div>
</template>
  
  
<script>

  import RPC from "../web3RPC";
  
  import GameMove from "./GameMove.vue";
  import { Moves, Outcomes, GameStates } from "../types";
  import Hands from "../contracts/Hands.json";
  import Web3 from "web3";
  import { sha256 } from "js-sha256";
  
  import mainContracts from "../../../contracts/local-contracts.json"
  
  //EXAMPLE Game.
  // {
  //   gameId: "0x111C3E89Ce80e62EE88318C2804920D4c96f92bb",
  //   playerA: "0x111C3E89Ce80e62EE88318C2804920D4c96f92bb",
  //   playerB: "0x111C3E89Ce80e62EE88318C2804920D4c96f92bb",
  //   states: {}
  
  //   betAmount: 1,
  //   moveA: 1,
  //   moveB: 2,
  //   outcome: 2, // 0 = draw, 1 = playerA wins, 2 = playerB wins
  // }
  
  
  function generateRandomString() {
    return Math.random().toString(36).substring(2, 15);
  }
  
  function calcWinner(moveA, moveB) {
    if (moveA == moveB) {
      return Outcomes.Draw;
    }
  
    if (moveA == Moves.Rock) {
      if (moveB == Moves.Paper) {
        return Outcomes.PlayerB;
      } else {
        return Outcomes.PlayerA;
      }
    }
  
    if (moveA == Moves.Paper) {
      if (moveB == Moves.Scissors) {
        return Outcomes.PlayerB;
      } else {
        return Outcomes.PlayerA;
      }
    }
  
    if (moveA == Moves.Scissors) {
      if (moveB == Moves.Rock) {
        return Outcomes.PlayerB;
      } else {
        return Outcomes.PlayerA;
      }
    }
  }
  
  export default {
    components: {
    },
    props: {
      provider: {
        type: String,
        default: null,
      },
    },
    data() {
      return {
        stakingContract: null,
        handsTokenContract: null,
        affiliateContract: null,

        activeAccount: null,

        handsTokenBalance: 0,

        handsStakedBalance: 0,
        totalHandsStakedBalance: 0,

        claimableEthForStaking: 0,
        claimableEthForAffiliate: 0,

        affiliateLink: null,
        onboardedAddresses: [],

      };
    },
    computed: {
        getActiveAccount() { return this.activeAccount?.toLowerCase()},
        getWeb3() {return new Web3(this.provider);},
    },
    mounted() {
      console.log("provider", this.provider)
      console.log("mainContracts", mainContracts)
      this.init();

    },
    watch:{
    },
    methods: {
        async init(){
            await this.setAccount();
            await this.setContracts();
            this.setHandsTokenBalance();
            this.setHandsStakedBalance();
            this.setTotalHandsStakedAmount();
            this.setClaimableEthForStaking();
            this.setClaimableEthForAffiliate();

            // this.getWETHAddress();
            // this.getToken0Address();
            // this.getToken1Address();
            // this.getReserve0();
            // this.getReserve1();
        },
        async setAccount() {
            const accounts = await this.getWeb3.eth.getAccounts();
            console.log("accounts", accounts);
            this.activeAccount = accounts[0];
        },
        async setContracts() {


          //Set staking contract
          this.stakingContract = new this.getWeb3.eth.Contract(
              mainContracts.deployedAbis.Staking,
              mainContracts.deployedContracts.Staking
          );

          //Set HandsToken contract
          this.handsTokenContract = new this.getWeb3.eth.Contract(
              mainContracts.deployedAbis.HandsToken,
              mainContracts.deployedContracts.HandsToken
          );

          //Set Affiliate contract
          this.affiliateContract = new this.getWeb3.eth.Contract(
              mainContracts.deployedAbis.Affiliate,
              mainContracts.deployedContracts.Affiliate
          );

        },

        async setHandsTokenBalance() {
          if(!this.handsTokenContract) return 0;

          const balance = await this.handsTokenContract.methods.balanceOf(this.activeAccount).call();
          this.handsTokenBalance = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.handsTokenContract.methods.balanceOf(this.activeAccount).call();
            this.handsTokenBalance = balance / 10 ** 18;
          }, 5000);
        },

        async setHandsStakedBalance(){
          if(!this.stakingContract) return 0;

          const balance = await this.stakingContract.methods.stakedAmount(this.activeAccount).call();
          this.handsStakedBalance = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.stakingContract.methods.stakedAmount(this.activeAccount).call();
            this.handsStakedBalance = balance / 10 ** 18;
          }, 5000);
        },

        async setTotalHandsStakedAmount(){
          if(!this.stakingContract) return 0;

          const balance = await this.stakingContract.methods.viewTotalStaked().call();
          this.totalHandsStakedBalance = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.stakingContract.methods.viewTotalStaked().call();
            this.totalHandsStakedBalance = balance / 10 ** 18;
          }, 5000);
        },

        async setClaimableEthForStaking(){
          if(!this.stakingContract) return 0;

          const balance = await this.stakingContract.methods.viewClaimableRewards(this.activeAccount).call();
          this.claimableEthForStaking = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.stakingContract.methods.viewClaimableRewards(this.activeAccount).call();
            this.claimableEthForStaking = balance / 10 ** 18;
          }, 5000);
        },
        async setClaimableEthForAffiliate(){
          if(!this.affiliateContract) return 0;

          const balance = await this.affiliateContract.methods.viewClaimableRewards(this.activeAccount).call();
          this.claimableEthForAffiliate = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.affiliateContract.methods.viewClaimableRewards(this.activeAccount).call();
            this.claimableEthForAffiliate = balance / 10 ** 18;
          }, 5000);
        },
        async setOnboardedAddresses(){
          if(!this.affiliateContract) return 0;

          const balance = await this.affiliateContract.methods.getConsumersOfAffiliate(this.activeAccount).call();
          this.onboardedAddresses = balance;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.affiliateContract.methods.getConsumersOfAffiliate(this.activeAccount).call();
            this.onboardedAddresses = balance;
          }, 5000);
        },

        

 
        
        async stake() {        
          // Call the stake method
          try {
            const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
            const gasLimit = 3000000;

            const tx = await this.stakingContract.methods.stake(
              this.getWeb3.utils.toWei("10", "ether")
            ).send({ from: this.activeAccount, gasPrice, gasLimit });
        
            // Wait for the transaction to be mined
            await this.getWeb3.eth.getTransactionReceipt(tx.transactionHash);
        
            // Transaction was successful if we made it here
            console.log('Staked', tx);
            return tx;
          } catch (error) {
            console.log('Error staking', error);
            return error;
          }
        },

        async unstake() {
          // Call the unstake method
          try {
            const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
            const gasLimit = 3000000;

            const tx = await this.stakingContract.methods.unstake(
              this.getWeb3.utils.toWei("10", "ether")
            ).send({ from: this.activeAccount, gasPrice, gasLimit });
        
            // Wait for the transaction to be mined
            await this.getWeb3.eth.getTransactionReceipt(tx.transactionHash);
        
            // Transaction was successful if we made it here
            console.log('Unstaked', tx);
            return tx;
          } catch (error) {
            console.log('Error unstaking', error);
            return error;
          }
        },

        async claim() {
          // Call the claim method
          try {
            const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
            const gasLimit = 3000000;

            const tx = await this.stakingContract.methods.claimRewards().send({ from: this.activeAccount, gasPrice, gasLimit });
        
            // Wait for the transaction to be mined
            await this.getWeb3.eth.getTransactionReceipt(tx.transactionHash);
        
            // Transaction was successful if we made it here
            console.log('Claimed', tx);
            return tx;
          } catch (error) {
            console.log('Error claiming', error);
            return error;
          }
        },

        async claimAffiliateRewards() {
          // Call the claim method
          try {
            const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
            const gasLimit = 3000000;

            const tx = await this.affiliateContract.methods.claimRewards().send({ from: this.activeAccount, gasPrice, gasLimit });
        
            // Wait for the transaction to be mined
            await this.getWeb3.eth.getTransactionReceipt(tx.transactionHash);
        
            // Transaction was successful if we made it here
            console.log('Claimed', tx);
            return tx;
          } catch (error) {
            console.log('Error claiming', error);
            return error;
          }
        },

        async registerAsConsumer() {
          // Use an empty bytes data
          const data = '0x';
        
        
          // No callback
          const callback = '0x0000000000000000000000000000000000000000';
          const callbackData = '0x';
        
          // Call the addLiquidity method
          try {
            const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
            const gasLimit = 3000000;

            const tx = await this.affiliateContract.methods.registerAsConsumer(
              '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
            ).send({ from: this.activeAccount, gasPrice, gasLimit });
        
            // Wait for the transaction to be mined
            
        
            // Transaction was successful if we made it here
            console.log('Registered as consumer', tx);
            return tx;
          } catch (error) {
            console.log('Error registering as a consumer:', error);
            throw error;
          }
        },




        
    
        async getBlockNumber() {
            return await this.getWeb3.eth.getBlockNumber();
        },  
        
    },
  };
  </script>
  