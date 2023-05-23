<template>
  <div>
    
      Staking screen

      <div>
        <div>Hands token balance : {{handsTokenBalance}}</div>
        <div>WETH balance : {{wethBalance}}</div>

        <div>You LP token balance : {{poolTokenBalance}}</div>
        <div>Your LP staked balance : {{lpStakedBalance}}</div>
        <div>Total LP staked balance : {{totalLpStakedBalance}}</div>

        <div>You claimable ETH for staking : {{claimableEthForStaking}}</div>

        <div>Your claimable ETH for LP staking : {{claimableEthForLpStaking}}</div>
        <div>Your claimable Hands for LP staking : {{claimableHandsForLpStaking}}</div>

        <div>You hands staked balance : {{handsStakedBalance}}</div>
        <div>Total hands staked balance : {{totalHandsStakedBalance}}</div>

        <div> WETH address {{ wethAddress }}</div>

        <div> Token0 address {{ token0Address }}</div>
        <div> Token1 address {{ token1Address }}</div>

        <div> Reserve0 {{ reserve0 }}</div>
        <div> Reserve1 {{ reserve1 }}</div>

        <div> Vault Address {{ vaultAddress }}</div>
      </div>

      <button @click="addLiquidity">Add Liquidity 10 WETH - 10 HANDS</button>
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
        routerContract: null,
        stakingContract: null,
        lpStakingContract: null,
        handsTokenContract: null,
        poolTokenAddress: null,
        classicPoolAddress: null,
        wethAddress: null,

        activeAccount: null,

        handsTokenBalance: 0,
        poolTokenBalance: 0,
        wethBalance: 0,

        lpStakedBalance: 0,
        handsStakedBalance: 0,

        totalLpStakedBalance: 0,
        totalHandsStakedBalance: 0,

        claimableEthForStaking: 0,
        claimableEthForLpStaking: 0,
        claimableHandsForLpStaking: 0,

        token0Address: null,
        token1Address: null,
        reserve0: 110,
        reserve1: 110,
        vaultAddress: null,

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
            await this.getVaultAddress();
            this.setHandsTokenBalance();
            this.setWethBalance();
            this.setPoolTokenBalance();
            this.setLpStakedBalance();
            this.setHandsStakedBalance();
            this.setTotalLpStakedAmount();
            this.setTotalHandsStakedAmount();
            this.setClaimableEthForStaking();
            this.setClaimableETHandHandsForLpStaking();

            this.getWETHAddress();
            this.getToken0Address();
            this.getToken1Address();
            this.getReserve0();
            this.getReserve1();
        },
        async setAccount() {
            const accounts = await this.getWeb3.eth.getAccounts();
            console.log("accounts", accounts);
            this.activeAccount = accounts[0];
        },
        async setContracts() {

          //Set router contract
          this.routerContract = new this.getWeb3.eth.Contract(
              mainContracts.dependencyAbis.router,
              mainContracts.dependencyContracts.router
          );

          //Set staking contract
          this.stakingContract = new this.getWeb3.eth.Contract(
              mainContracts.deployedAbis.Staking,
              mainContracts.deployedContracts.Staking
          );

          //Set LpStaking contract
          this.lpStakingContract = new this.getWeb3.eth.Contract(
              mainContracts.deployedAbis.LpStaking,
              mainContracts.deployedContracts.LpStaking
          );

          //Set HandsToken contract
          this.handsTokenContract = new this.getWeb3.eth.Contract(
              mainContracts.deployedAbis.HandsToken,
              mainContracts.deployedContracts.HandsToken
          );

          //Set WETH contract
          this.wethContract = new this.getWeb3.eth.Contract(
              mainContracts.dependencyAbis.wETH,
              mainContracts.dependencyContracts.wETH
          );

          //Set Pool ERC20 contract
          this.poolTokenAddress = mainContracts.deployedContracts.Pool;
          this.poolTokenContract = new this.getWeb3.eth.Contract(
              mainContracts.dependencyAbis.classicPool,
              this.poolTokenAddress
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

        async setWethBalance() {
          if(!this.wethContract) return 0;

          const balance = await this.wethContract.methods.balanceOf(this.activeAccount).call();
          this.wethBalance = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.wethContract.methods.balanceOf(this.activeAccount).call();
            this.wethBalance = balance / 10 ** 18;
          }, 5000);
        },

        async setPoolTokenBalance() {
          if(!this.poolTokenContract) return 0;

          const balance = await this.poolTokenContract.methods.balanceOf(this.activeAccount).call();
          this.poolTokenBalance = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.poolTokenContract.methods.balanceOf(this.activeAccount).call();
            this.poolTokenBalance = balance / 10 ** 18;
          }, 5000);
        },

        async setLpStakedBalance(){
          if(!this.lpStakingContract) return 0;

          const balance = await this.lpStakingContract.methods.getUserStakedBalance(this.activeAccount).call();
          this.lpStakedBalance = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.lpStakingContract.methods.getUserStakedBalance(this.activeAccount).call();
            this.lpStakedBalance = balance / 10 ** 18;
          }, 5000);
        },

        async setHandsStakedBalance(){
          if(!this.stakingContract) return 0;

          const balance = await this.stakingContract.methods.viewStakedAmount(this.activeAccount).call();
          this.handsStakedBalance = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.stakingContract.methods.viewStakedAmount(this.activeAccount).call();
            this.handsStakedBalance = balance / 10 ** 18;
          }, 5000);
        },

        async setTotalLpStakedAmount(){
          if(!this.lpStakingContract) return 0;

          const balance = await this.lpStakingContract.methods.getTotalStakedBalance().call();
          this.totalLpStakedBalance = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.lpStakingContract.methods.getTotalStakedBalance().call();
            this.totalLpStakedBalance = balance / 10 ** 18;
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

        async setClaimableETHandHandsForLpStaking(){
          if(!this.lpStakingContract) return 0;

          const returned = await this.lpStakingContract.methods.getClaimableRewards().call();
          const balanceEth = returned.bankRollRewards;
          const balanceHands = returned.rewardTokenAmount;
          this.claimableEthForLpStaking = balanceEth / 10 ** 18;
          this.claimableHandsForLpStaking = balanceHands / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const returned = await this.lpStakingContract.methods.getClaimableRewards().call();
            const balanceEth = returned.bankRollRewards;
            const balanceHands = returned.rewardTokenAmount;
            this.claimableEthForLpStaking = balanceEth / 10 ** 18;
            this.claimableHandsForLpStaking = balanceHands / 10 ** 18;
          }, 5000);
        },

        async getWETHAddress() {
            // Assumes that 'this.routerContract' is the instance of SyncSwapRouter contract
            try {
                const wethAddress = await this.routerContract.methods.wETH().call();
                console.log('wETH address:', wethAddress);
                this.wethAddress = wethAddress;
            } catch (error) {
                console.error('Error getting wETH address:', error);
                throw error;
            }
        },

        async getToken0Address() {
            // Assumes that 'this.routerContract' is the instance of SyncSwapRouter contract
            try {
                const token0Address = await this.poolTokenContract.methods.token0().call();
                console.log('token0 address:', token0Address);
                this.token0Address = token0Address;
            } catch (error) {
                console.error('Error getting token0 address:', error);
                throw error;
            }
        },

        async getToken1Address() {
            // Assumes that 'this.routerContract' is the instance of SyncSwapRouter contract
            try {
                const token1Address = await this.poolTokenContract.methods.token1().call();
                console.log('token1 address:', token1Address);
                this.token1Address = token1Address;
            } catch (error) {
                console.error('Error getting token1 address:', error);
                throw error;
            }
        },

        async getReserve0() {
            // Assumes that 'this.routerContract' is the instance of SyncSwapRouter contract
            try {
                const reserve0 = await this.poolTokenContract.methods.reserve0().call();
                console.log('reserve0:', reserve0);
                this.reserve0 = reserve0;
            } catch (error) {
                console.error('Error getting reserve0:', error);
                throw error;
            }
        },

        async getReserve1() {
            // Assumes that 'this.routerContract' is the instance of SyncSwapRouter contract
            try {
                const reserve1 = await this.poolTokenContract.methods.reserve1().call();
                console.log('reserve1:', reserve1);
                this.reserve1 = reserve1;
            } catch (error) {
                console.error('Error getting reserve1:', error);
                throw error;
            }
        },

        async getVaultAddress() {
            // Assumes that 'this.routerContract' is the instance of SyncSwapRouter contract
            try {
                const vaultAddress = await this.routerContract.methods.vault().call();
                console.log('vault address:', vaultAddress);
                this.vaultAddress = vaultAddress;
            } catch (error) {
                console.error('Error getting vault address:', error);
                throw error;
            }
        },
        

 
        
        

        async addLiquidity() {
          const poolAddress = this.poolTokenAddress;
          const amountToApprove = 1000;
          const amountWeth = 10;
          const amountHands = 10;
        
          // Define token inputs
          const inputs = [
            {
              token: mainContracts.dependencyContracts.wETH,
              amount: this.getWeb3.utils.toWei(amountToApprove.toString(), 'ether')  // Convert to wei
            },
            {
              token: mainContracts.deployedContracts.HandsToken,
              amount: this.getWeb3.utils.toWei(amountToApprove.toString(), 'ether')  // Convert to wei
            }
          ];
        
          // Approve router to spend tokens
          for (let i = 0; i < inputs.length; i++) {
            const tokenContract = new this.getWeb3.eth.Contract(mainContracts.dependencyAbis.wETH, inputs[i].token);
            const reciept = await tokenContract.methods.approve(mainContracts.dependencyContracts.vault, inputs[i].amount).send({ from: this.activeAccount });
            console.log("reciept of approval", reciept)
          }
        
          // Use an empty bytes data
          const data = '0x';
        
          // Define the minimum liquidity you want to receive
          const minLiquidity = this.getWeb3.utils.toWei('1', 'ether');  // Minimum 1 LP token
        
          // No callback
          const callback = '0x0000000000000000000000000000000000000000';
          const callbackData = '0x';
        
          // Call the addLiquidity method
          try {
            const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
            const gasLimit = 3000000;

            const tx = await this.routerContract.methods.addLiquidity(
              poolAddress,
              inputs,
              data,
              minLiquidity,
              callback,
              callbackData
            ).send({ from: this.activeAccount, gasPrice, gasLimit });
        
            // Wait for the transaction to be mined
            
        
            // Transaction was successful if we made it here
            console.log('Liquidity added successfully', tx);
            return tx;
          } catch (error) {
            console.log('Error adding liquidity:', error);
            throw error;
          }
        },




        
    
        async getBlockNumber() {
            return await this.getWeb3.eth.getBlockNumber();
        },  
        
    },
  };
  </script>
  