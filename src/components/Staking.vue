<template>
  <div>
    
      Staking screen

      <div>
        Hands token balance : {{handsTokenBalance}}
        WETH balance : {{wethBalance}}

        You LP token balance : {{poolTokenBalance}}
        Your LP staked balance : {{lpStakedBalance}}
        Total LP staked balance : {{totalLpStakedBalance}}

        You claimable ETH for staking : {{claimableEthForStaking}}

        Your claimable ETH for LP staking : {{claimableEthForLpStaking}}
        Your claimable Hands for LP staking : {{claimableHandsForLpStaking}}

        You hands staked balance : {{handsStakedBalance}}
        Total hands staked balance : {{totalHandsStakedBalance}}

      </div>
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
            this.setWethBalance();
            this.setPoolTokenBalance();
            this.setLpStakedBalance();
            this.setHandsStakedBalance();
            this.setTotalLpStakedBalance();
            this.setTotalHandsStakedBalance();
            this.setClaimableEthForStaking();
            this.setClaimableEthForLpStaking();
            this.setClaimableHandsForLpStaking();
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
              mainContracts.dependencyAbis.wETH,
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

          const balance = await this.stakingContract.methods.viewClaimableEth(this.activeAccount).call();
          this.claimableEthForStaking = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.stakingContract.methods.viewClaimableEth(this.activeAccount).call();
            this.claimableEthForStaking = balance / 10 ** 18;
          }, 5000);
        },

        async setClaimableETHandHandsForLpStaking(){
          if(!this.lpStakingContract) return 0;

          const [balanceEth, balanceHands] = await this.lpStakingContract.methods.viewClaimableEth(this.activeAccount).call();
          this.claimableEthForLpStaking = balance / 10 ** 18;
          this.claimableHandsForLpStaking = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const [balanceEth, balanceHands] = await this.lpStakingContract.methods.viewClaimableEth(this.activeAccount).call();
            this.claimableEthForLpStaking = balance / 10 ** 18;
            this.claimableHandsForLpStaking = balance / 10 ** 18;
          }, 5000);
        },
        
        

        async addLiquidity() {
          const poolAddress = this.poolTokenAddress;
          const amountWeth = 10
          const amountHands = 10

          // Define token inputs
          const inputs = [
            {
              token: mainContracts.dependencyContracts.wETH,
              amount: this.getWeb3.utils.toWei(amountWeth, 'ether')  // Convert to wei
            },
            {
              token: mainContracts.deployedContracts.HandsToken,
              amount: this.getWeb3.utils.toWei(amountHands, 'ether')  // Convert to wei
            }
          ];

          // Use an empty bytes data
          const data = '0x';

          // Define the minimum liquidity you want to receive
          const minLiquidity = this.getWeb3.utils.toWei('1', 'ether');  // Minimum 1 LP token

          // No callback
          const callback = '0x0000000000000000000000000000000000000000';
          const callbackData = '0x';

          // Call the addLiquidity method
          try {
            const tx = await this.routerContract.methods.addLiquidity(
              poolAddress,
              inputs,
              data,
              minLiquidity,
              callback,
              callbackData
            ).send({ from: this.activeAccount });

            // Wait for the transaction to be mined
            const receipt = await tx.wait();

            // Transaction was successful if we made it here
            console.log('Liquidity added successfully');
            return receipt;
          } catch (error) {
            console.error('Error adding liquidity:', error);
            throw error;
          }
        },

        
    
        async getBlockNumber() {
            return await this.getWeb3.eth.getBlockNumber();
        },  
        
    },
  };
  </script>
  