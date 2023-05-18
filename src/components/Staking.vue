<template>
  <div>
    
      Staking screen
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
        activeAccount: null,
      };
    },
    computed: {
        getActiveAccount() { return this.activeAccount?.toLowerCase()},
        getWeb3() {return new Web3(this.provider);},
        getHandsTokenBalance() { return this.handsTokenContract.methods.balanceOf(this.activeAccount).call();},
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
              mainContracts.dependencyAbis.Staking,
              mainContracts.dependencyContracts.Staking
          );

          //Set LpStaking contract
          this.lpStakingContract = new this.getWeb3.eth.Contract(
              deployedAbis.LpStaking,
              mainContracts.deployedContracts.LpStaking
          );

          //Set HandsToken contract
          this.handsTokenContract = new this.getWeb3.eth.Contract(
              deployedAbis.HandsToken,
              mainContracts.deployedContracts.HandsToken
          );

          //Set WETH contract
          this.wethContract = new this.getWeb3.eth.Contract(
              mainContracts.dependencyAbis.wEth,
              mainContracts.dependencyContracts.wEth
          );

        },
    
        async getBlockNumber() {
            return await this.getWeb3.eth.getBlockNumber();
        },  
    },
  };
  </script>
  