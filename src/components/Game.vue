<template>
  <Modal 
    v-model:show="showModal"
    v-model:winnerPoints="winnerPoints"
    v-model:loserPoints="loserPoints"
    v-model:win="winModal"
    v-model:bet="selectedBet"
  >
    Hello world
  </Modal>
  <div class="content">
    <div v-if="!isInGame && !isWaiting">
      <p style="margin:0; margin-bottom:6px;">Your balance</p>
      <h1 style="margin:0; margin-bottom:22px;">
        <span
          class="currency-symbol"
        >$</span>
        {{this.balance?.toString().split(".")[0]}}
        <span
          class="decimals">
          .{{ this.balance?.toString().split(".")[1]?.substring(0,4)?? "00" }}

        </span>
      </h1>
      <div class="address-container">
        <profile-item :address="this.activeAccount" />
        &nbsp;
        <profile-item-burner v-if="isBurner" :address="this.burnerAddress" :balance="burnerBalance" />

      </div>
      
    </div>
    
    <!-- <button
      class="button-dark"
      @click="copyAffiliateLink"
    >
      Copy affiliate link
    </button> -->
    <!-- If in game-->
    <div v-if="isInGame">
      <!-- <button
        class="button-dark"
        @click="leaveGame"
      >
        Leave game
      </button> -->
      <!-- Round Id-->
      <div style="justify-content: center;">
        Round {{ currentRound }} for <a>{{ currentWager }} ETH</a>
      </div>
      <div> {{ roundStateString }}</div>
      <!-- Game view -->
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr;">
          <!-- Selected move-->
          <div 
          style="display: flex; flex-direction:column; gap: 35px; align-items: center;"

            v-if="shouldMove"
            >
            <div style="display:flex; gap:20px">
              <div :class="{ 'point': true, 'point-active': yourCurrentPoints >= 1 }"></div>
              <div :class="{ 'point': true, 'point-active': yourCurrentPoints >= 2 }"></div>
              <div :class="{ 'point': true, 'point-active': yourCurrentPoints >= 3 }"></div>
            </div>
            <GameMove v-if="bothRevealed" :move="selectedMove"/>
            <GameMove v-else :move="4"/>
            <div class="address-container">
              <div class="profile-mini"></div>
                <p class="address">{{ truncateAddress(yourAddress) }}</p>
            </div>
            <div class="player-balance">
              ${{ balance }}
            </div>
            <div 
                  style="display: flex; flex-direction:column; gap: 10px; align-items: center;"
              >
                  <GameMove :isNormal="true" :move="selectedMove"></GameMove>
                  <p>{{selectedMove == 1 ? "Rock" : selectedMove == 2 ? "Paper" : "Scissors"}}</p>
              </div>
            
          </div>
          <!-- Choose move-->
          <div
            style="display: flex; flex-direction:column; gap: 35px; align-items: center;"
            v-else
          >
          <div style="display:flex; gap:20px">
            <div :class="{ 'point': true, 'point-active': yourCurrentPoints >= 1 }"></div>
            <div :class="{ 'point': true, 'point-active': yourCurrentPoints >= 2 }"></div>
            <div :class="{ 'point': true, 'point-active': yourCurrentPoints >= 3 }"></div>
          </div>
          <GameMove v-if="bothRevealed" :move="selectedMove"/>
            <GameMove v-else :move="4"/>
          <div class="address-container">
            <div class="profile-mini"></div>
              <p class="address">{{ truncateAddress(yourAddress) }}</p>
          </div>
          <div class="player-balance">
            ${{ balance }}
          </div>
            <div 
              style="display: flex; justify-content: center; gap: 10px;"
            >
              <div 
                  style="display: flex; flex-direction:column; gap: 10px; align-items: center;"
                  :style="{ 'border-color': isRock ? 'yellow' : 'inherit' }" 
                  @click="onRock"
              >
                  <GameMove :isNormal="true" :move="1"/>
                  <p>Rock</p>
              </div>
              <div 
                style="display: flex; flex-direction:column; gap: 10px; align-items: center;"
                  :style="{ 'border-color': isPaper ? 'yellow' : 'inherit' }" 
                  @click="onPaper"
              >
                  <GameMove :isNormal="true" :move="2"/>
                  <p>Paper</p>
              </div>
              <div 
              style="display: flex; flex-direction:column; gap: 10px; align-items: center;"
                  :style="{ 'border-color': isScissors ? 'yellow' : 'inherit' }" 
                  @click="onScissors"
              >
                  <GameMove :isNormal="true" :move="3"/>
                  <p>Scissors</p>
              </div>
            </div>

            <!-- red button
            <button
              class="button-dark"
              @click="sendMove"
            >   
              Submit
            </button> -->

          </div>

          <div style="display:flex; flex-direction:column; height: 100%; align-items: center; gap:35px">
            <p>Your bet is</p>
            <h1 style="margin:0; margin-bottom:22px;">
              <span
                class="currency-symbol"
              >$</span>
              {{this.selectedBet?.toString().split(".")[0]}}
              <span
                class="decimals">
                .{{ this.selectedBet?.toString().split(".")[1]?.substring(0,4)?? "00" }}
      
              </span>
            </h1>
          </div>

          <!-- Opponent move-->
          <div 
          >
              <div class="flex flex-column"
                  style="display: flex; flex-direction:column; gap: 35px; align-items: center;"
              >
                <div style="display:flex; gap:20px">
                  <div :class="{ 'point': true, 'point-active': opponentCurrentPoints >= 1 }"></div>
                  <div :class="{ 'point': true, 'point-active': opponentCurrentPoints >= 2 }"></div>
                  <div :class="{ 'point': true, 'point-active': opponentCurrentPoints >= 3 }"></div>
                </div>
                <GameMove v-if="bothRevealed" class="flip" :move="opponentMove"/>
                  <GameMove class="flip" v-else-if="isOpponentMoveSent" :move="5"/>
                  <GameMove class="flip" v-else :move="4"/>
                <div class="address-container">
                  <div class="profile-mini"></div>
                   <p class="address">{{ truncateAddress(opponentAddress) }}</p>
                </div>
                <div class="player-balance">
                  ${{ opponentBalance }}
                </div>

                <div v-if="!isOpponentMoveSent"
                 class="loading"></div>
                <div v-else
                  class="checkmark"
                >

                </div>
                  
                  
              </div>
              
          </div>
      </div>

    </div>

    <!-- Should find game-->
    <div class="content" v-else>
        <!-- Previous Game Result -->
        <!-- <div v-if="previousGame">
          <h1 v-if="wonLastGame">You won {{ previousGameWager }} ETH against {{ previousGameOpponent }}</h1>
          <h1 v-else>You lost {{ previousGameWager }} ETH against {{ previousGameOpponent }}</h1>
          <h1> {{ previousGamePoints }} : {{ previousGameOpponentPoints }} </h1>
        </div> -->
        
        <!-- Game buttons -->
        <!-- <div v-if="!isRegistering && !isWaiting">
          <div>
            <button v-for="(step, index) in wagerSteps"
                    class="select"
                    :key="step"
                    :class="{ 'highlight-select': index === sliderIndex }"
                    @click="buttonClicked(index)">
              {{ step }} ETH
            </button>
          </div>
        </div> -->

        
        <div style="display:flex; align-items:start;">
          <button v-if="!isRegistering && !isWaiting" class="button-light" @click="buyEth">
             <div class="plus-symbol"></div><div>Add Funds</div>
            </button>
            <div>
              
        <button
          class="button-dark"
          v-if="!isWaiting"
          @click="registerGame"
        >   
          <div>
            {{ isRegistering ? "Registering..." : playWithFriend ? "Play With Friend" : "Play with random" }}
            &nbsp; 
          </div>
          <!-- <a>{{ this.wagerSteps[this.sliderIndex] }} ETH</a> -->
          <select 
          class="selector" 
          style="margin-right:-25px;"
          :value="this.selectedBet"
          @input="event => selectedBet = event.target.value"
          @click.stop
          >
            <option v-for="step in wagerSteps" :key="step" :value="step">
              <span class="currency-symbol">$</span>
              {{ step }} &nbsp;
            </option>
          </select>
        </button>
        <p 
          v-if="!isRegistering && !isWaiting"
          @click="togglePlayWithFriend"
          class="toggle-text"
          style="margin-top: 30px;"
          >
          {{ playWithFriend ? "Play with random instead?": "Play with friend instead?" }}
          <span style="color:#E19885; font-weight:bold; text-decoration:underline;">Switch</span>
        </p>
            </div>
          
        <div v-if="isWaiting" style="display:flex; flex-direction:column; align-items:center; margin-top:-70px;">
          <p>You wager is</p>
          <h1 style="margin:0;"> <span class="currency-symbol">$</span>{{ this.selectedBet }} <span class="decimals">.00</span> </h1>
          <p style="opacity:0.5;">Waiting for opponent ...</p>
          <div class="searching"></div>
          <button
            class="button-dark"
            @click="cancelGame"
          >
            Cancel
          </button>
        </div>
        
        </div>
        
        <button
          v-if="isWaiting && playWithFriend"
          class="button-dark"
          @click="copyPasswordGameLink"
        >
          Copy game link
        </button>
    </div>


    


    
    

    <!-- <div v-if="isUserConnected">

      <div v-if="pastGames && pastGames.length">
        <h2>Past games</h2>
        <table>
          <thead>
            <tr>
              <th>Game ID</th>
              <th>Player A</th>
              <th>Player B</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="game in pastGames" :key="game.gameId">
              <td>{{ game.gameId }}</td>
              <td>{{ game.playerA }} played {{ game.moveA }}</td>
              <td>{{ game.playerB }} played {{ game.moveB }}</td>
              <td>{{ game.outcome }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> -->
  </div>
  <game-list
   v-if="!isInGame"
   :activeData="activeGames"
   :completedData="completedGames"
   :pendingData="pendingGames"
   ></game-list>

</template>

<style>

</style>

<script>
import mainContracts from "../../../contracts/local-contracts.json"

function gameStateToString(state) {
    if(state == GameStates.Waiting)
        return "Waiting"
    if(state == GameStates.Sending)
        return "Sending move"
    if(state == GameStates.Revealing)
        return "Revealing move"
    if(state == GameStates.Revealed)
        return "Revealed move"
    if(state == GameStates.Matched)
        return "Matched with opponent"
    if(state == GameStates.Initial)
        return ""
    if(state == GameStates.Finished)
        return "Game complete"
    
    return ""
    
}

function opponentGameStateToString(state) {
  if(state == GameStates.Waiting)
        return "Waiting"
    if(state == GameStates.Sending)
        return "Sending move"
    if(state == GameStates.Revealing)
        return "Revealing move"
    if(state == GameStates.Revealed)
        return "Revealed move"
    if(state == GameStates.Matched)
        return "Matched with opponent"
    if(state == GameStates.Initial)
        return "initial"
    if(state == GameStates.Finished)
        return "Game complete"
    
    return ""
}
import RPC from "../web3RPC";

import GameMove from "./GameMove.vue";
import GameList from "./GameList.vue";
import Modal from "./Modal.vue";
import ProfileItem from "./ProfileItem.vue";
import { Moves, Outcomes, GameStates } from "../types";
import Web3 from "web3";
import { sha256 } from "js-sha256";
import RampInstantSDK from "@ramp-network/ramp-instant-sdk";
import { ethers } from 'ethers'
import GameListVue from './GameList.vue'
import store from '@/store'
import { getBurnerWallet, privateKeyToAccount } from '@/utils/burner'
import ProfileItemBurner from './ProfileItemBurner.vue'

const CONTRACT_ADDRESS = mainContracts.deployedContracts.Hands
const CONTRACT_ABI = mainContracts.deployedAbis.Hands

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
      GameMove,
      GameList,
      Modal,
      ProfileItem,
    ProfileItemBurner,
  },
  props: {
    provider: {
      type: String,
      default: null,
    },
    balance: {
      type: Number,
      default: null,  
    },
  },
  data() {
    return {
      stripeClientSecret: null,
      initialized: false,
      games: {},
      lastBlockSearched: 0,

      selectedMove: "",
      selectedBet: "",
      randomString: "",

      contractInstance: null,
      pastGames: [],

      playerRegisteredEvents: [],
      playerWaitingEvents: [],
      playersMatchedEvents: [],
      moveCommittedEvents: [],
      moveRevealedEvents: [],
      newRoundEvents: [],
      gameOutcomeEvents: [],
      playerCancelledEvents: [],

      wagerSteps: ["0.01", "0.1", "1", "5", "10"],
      sliderIndex: 0,

      _lastGameId: -1,
      activeAccount: null,

      rampSdk: null,

      affiliateContract: null,
      affiliateOfUser: null,

      playWithFriend: null,

      showModal: false,
      winnerPoints: 0,
      loserPoints: 0,
      winModal: false,

      handledEventIds: new Set(),

      burnerTopUpAmount: 0.001,
      burnerAddress: null,
      burnerPrivateKey: null,
      burnerContractInstance: null,

    };
  },
  computed: {
    isMetamask(){ return this.$store.state.isMetamask },
    isBurner(){ return this.burnerAddress != null && this.burnerPrivateKey != null && this.burnerContractInstance != null },
    //Game state
    getActiveAccount() {        
      return this.activeAccount?.toLowerCase()
    },
    getWeb3() {return new Web3(this.provider);},
    balance() {
      const value =  this.$store.state.balance;
      return (Math.round(value * 100) / 100).toFixed(2);
    },
    opponentBalance() {
      const value =  this.$store.state.balances[this.opponentAddress.toLowerCase()];
      return (Math.round(value * 100) / 100).toFixed(2);
    },
    burnerBalance() {
      const value =  this.$store.state.balances[this.burnerAddress?.toLowerCase()];
      return (Math.round(value * 100) / 100).toFixed(2);
    },
    //Game state
    isRock() { return this.selectedMove === Moves.Rock },
    isPaper() { return this.selectedMove === Moves.Paper },
    isScissors() { return this.selectedMove === Moves.Scissors;},
    gameState() {
      console.log("gameState", this.currentGameId, this.games);
      if (!this.games[this.currentGameId ?? "0"]) {
        return GameStates.Initial;
      }
      if(this.games[this.currentGameId ?? "0"].outcome != Outcomes.None) {
        return GameStates.Initial;
      }
      const currentRound = this.games[this.currentGameId ?? "0"].round;
      return this.games[this.currentGameId ?? "0"].states[currentRound][this.getActiveAccount] ?? GameStates.Matched
    },
    yourGameStateToString() { 
      switch(this.gameState) {
        case GameStates.Initial:
          return "Initial"
        case GameStates.Waiting:
          return "Waiting for opponent"
        case GameStates.Sending:
          return "Sending move"
        case GameStates.Sent:
          return "Sent move"
        case GameStates.Revealing:
          return "Revealing move"
        case GameStates.Revealed:
          return "Revealed move"
        case GameStates.Matched:
          return "Matched"
        case GameStates.Finished:
          return "Game complete"
        default:
          return ""
      }
    },
    isRegistering() { return this.gameState == GameStates.Registering },
    isWaiting() { return this.gameState == GameStates.Waiting },
    isRevealing() { return this.gameState == GameStates.Revealing },
    isRevealed() { return this.gameState == GameStates.Revealed },
    
    roundStateString() {
      if(this.bothRevealed){
        if(this.isWinner){
          return "You won!"
        } else if(this.isLoser){
          return "You lost!"
        } else {
          return "Draw!"
        }
      } 
      return null
      
    },
    isOpponentMoveRevealed() { return this.opponentState == GameStates.Revealed },
    bothRevealed() { return this.isRevealed && this.isOpponentMoveRevealed },
    isInGame() {

       return this.currentGameId !="0" && this.gameState != GameStates.Initial && this.gameState != GameStates.Registering && this.gameState != GameStates.Waiting 
    },
    isMoveSent() { return this.gameState == GameStates.Sent || this.gameState == GameStates.Revealing || this.gameState == GameStates.Revealed},
    isOpponentMoveSent() { return this.opponentState == GameStates.Sent || this.opponentState == GameStates.Revealing || this.opponentState == GameStates.Revealed},
    isGameFinished() { return this.gameState == GameStates.Finished},
    currentRound() { return this.games[this.currentGameId ?? "0"].round },
    opponentMove() { return this.games[this.currentGameId ?? "0"].moves[this.currentRound][this.getOpponentAccount] },
    isWinner() {
      //just compare opponentMove to selectedMove
      return calcWinner(this.selectedMove, this.opponentMove) == Outcomes.PlayerA
    },
    isLoser() {
      //just compare opponentMove to selectedMove
      return calcWinner(this.selectedMove, this.opponentMove) == Outcomes.PlayerB
    },

    //get current game id by checking list of games for the last game that is not finished that the current player is a part of
    currentGameId() {
      const games = Object.values(this.games).sort((a, b) => b.gameId - a.gameId)
      console.log("currentGameId", games)
      const currentGame = games.find(game => 
        game.outcome == Outcomes.None && 
        (game.playerA.toLowerCase() == this.activeAccount.toLowerCase() || 
        game.playerB == this.getActiveAccount)
      )


      console.log("games ordered by gameId", games)
      console.log("currentGameId", currentGame)
      return currentGame?.gameId ?? "0"
    },

    previousGame() { 
      //get previous game by searching for the last game that is not the current game
      //that has a state of finished
      //that the current player is a part of
      //search through all of the games by order of greatest gameId to least
      //find the first game that is not the current game and has a state of finished
      //that the current player is a part of
      const games = Object.values(this.games).sort((a, b) => b.gameId - a.gameId)
      const previousGame = games.find(game => game.gameId !== this.currentGameId && game.outcome != Outcomes.None)
      console.log("games ordered by gameId", games)
      console.log("previous game", previousGame)
      return previousGame
    },
    previousGameWager() { return this.previousGame?.bet ?? 0},
    currentWager() { return this.games[this.currentGameId]?.bet ?? 0},
    previousGamePoints() { 
      console.log("previousGamePoints", this.previousGame?.points[this.getActiveAccount.toLowerCase()])
      return this.previousGame?.points[this.getActiveAccount.toLowerCase()] ?? 0
    },
    previousGameOpponent() { 
      const playerA = this.previousGame?.playerA?.toLowerCase()
      const playerB = this.previousGame?.playerB?.toLowerCase()
      return playerA === this?.getActiveAccount?.toLowerCase() ? playerB : playerA
    },
    yourCurrentPoints() { return this.games[this.currentGameId]?.points[this.getActiveAccount?.toLowerCase()] ?? 0},
    opponentCurrentPoints() { return this.games[this.currentGameId]?.points[this.opponentAddress?.toLowerCase()] ?? 0},
    previousGameOpponentPoints() { return this.previousGame?.points[this.previousGameOpponent?.toLowerCase()] ?? 0},
    wonLastGame() { return this.previousGamePoints > this.previousGameOpponentPoints},
    yourAddress() { return this.getActiveAccount},
    yourMove() { return this.selectedMove },
    opponentAddress(){
      const playerA = this.games[this.currentGameId]?.playerA?.toLowerCase()
      const playerB = this.games[this.currentGameId]?.playerB?.toLowerCase()
      return playerA === this?.getActiveAccount?.toLowerCase() ? playerB : playerA
    },
    opponentMove() {
      const opponentAddress = this.opponentAddress?.toLowerCase()
      const currentGameId = this.currentGameId
      return this.games[currentGameId?.toLowerCase()]?.moves[this.currentRound]?.[opponentAddress?.toLowerCase()] ?? Moves.None
    },
    opponentState() {
      const opponentAddress = this.opponentAddress?.toLowerCase()
      const currentGameId = this?.currentGameId
      const currentRound = this.games[this.currentGameId ?? "0"]?.round ?? 0
      console.log("opponentState", this.games[currentGameId?.toLowerCase()]?.states[currentRound][opponentAddress?.toLowerCase()])
      return this.games[currentGameId?.toLowerCase()]?.states[currentRound][opponentAddress?.toLowerCase()] ?? GameStates.Initial
    },

    opponentStateToString() { 
      switch(this.opponentState) {
        case GameStates.Initial:
          return "Choosing move"
        case GameStates.Registering:
          return "Registering"
        case GameStates.Waiting:
          return "Waiting"
        case GameStates.Matched:
          return "Choosing move"
        case GameStates.Sending:
          return "Sending"
        case GameStates.Sent:
          return "Sent"
        case GameStates.Revealing:
          return "Revealing"
        case GameStates.Revealed:
          return "Revealed"
        case GameStates.Finished:
          return "Finished"
        default:
          return "Unknown"
      }
    },
    isMoveSending() { return this.gameState == GameStates.Sending },


    //Seamless transaction handler
    //Reveal move when both players have successfully sent their move
    //And not revealing move yet
    shouldReveal(){
      console.log("shouldReveal", this.isMoveSent, this.isOpponentMoveSent, this.isGameFinished, this.isRevealing)
      return this.isMoveSent && this.isOpponentMoveSent && !this.isGameFinished && !this.isRevealing && this.initialized && !this.isRevealed
    },
    //should move when in a game and has not sent move yet
    shouldMove(){
      return (this.isMoveSent || this.isMoveSending) && this.isInGame
    },
    shouldSetAffiliateCode() {
      //get affiliate code from local storage
      const affiliateCode = localStorage.getItem("affiliateCode")
      
      return affiliateCode && this.affiliateOfUser == ethers.constants.AddressZero
    },

    //Return array of games that are pending. Where a user is waiting for someone to join
    pendingGames(){
      const games = Object.values(this.games)
      return games.filter(game => game.outcome == Outcomes.None && game.playerB == "" && game.gameId != "0")
    },
    //Return array of games that are ongoing. Where a users are playing a game
    activeGames(){
      const games = Object.values(this.games)
      return games.filter(game => game.outcome == Outcomes.None && game.playerB != "" && game.gameId != "0")
    },

    completedGames(){
      const games = Object.values(this.games)
      return games.filter(game => game.outcome != Outcomes.None && game.gameId != "0")
    },

    
  },

  

  async mounted() {
    console.log("provider", this.provider)
    this.initialized = false
    this.fetchPastGames();
    this.subscribeToEvents();

    console.log("ramp sdk", RampInstantSDK)

    // Load the last sentMove and betAmount from the localStorage
    const lastSentMove = localStorage.getItem("lastSentMove");
    const lastRandomString = localStorage.getItem("lastRandomString");
    const lastBetAmount = localStorage.getItem("lastBetAmount");
    const playWithFriend = localStorage.getItem("playWithFriend");

    if (lastSentMove) {
      this.selectedMove = lastSentMove;
    }

    if (lastBetAmount) {
      this.selectedBet = lastBetAmount;
      this.sliderIndex = this.wagerSteps.indexOf(parseFloat(lastBetAmount));
    }

    if (lastRandomString) {
      this.randomString = lastRandomString;
    }

    this.playWithFriend = playWithFriend === "true" ? true : false;
    console.log("playWithFriend", this.playWithFriend);
    console.log("playWithFriend localStorage", localStorage.getItem("playWithFriend"));

    this.initialized = true

    //set active account
    await this.getAccount()

    //check affiliate code
    await this.checkAffililiateCode()

    //check if joining password match
    await this.checkJoiningPassword()
    
  },
  watch:{
    games: {
      handler(newValue, oldValue) {
        console.log("yourGameState", gameStateToString(this.gameState));
        console.log("games changed", this.games[this.currentGameId]);
        store.dispatch("setGames", this.games);

        console.log("store games", store.state.games);
      },
      deep: true
    },
    isInGame: {
      handler(newValue, oldValue) {
        if (newValue) {
          //fetch oppoennt balance
          this.$store.dispatch("setBalanceOf",this.opponentAddress)

          console.log("isInGame", newValue);
        }
        this.$store.dispatch("setIsInGame",newValue)
        this.$store.dispatch("setLeaveGame", this.leaveGame)
      },
      deep: true,
      immediate: true,
    },
    shouldReveal: {
      handler(newValue, oldValue) {
        if (newValue) {
          console.log("is calling revealMove");
          this.revealMove();
        }
      },
      deep: true,
    },
    isMetamask: {
      handler(newValue, oldValue) {
        if (newValue) {
          this.burnerPrivateKey = getBurnerWallet().value
          const account = this.getWeb3.eth.accounts.privateKeyToAccount(this.burnerPrivateKey);
          this.getWeb3.eth.accounts.wallet.add(account); // Add the account to web3.js's wallet
          this.burnerAddress = account.address;
          
          this.burnerContractInstance = new this.getWeb3.eth.Contract(
            CONTRACT_ABI,
            CONTRACT_ADDRESS,
            { from: this.burnerAddress }
          );

          this.$store.dispatch("setBalanceOf", this.burnerAddress)
        } 
      },
      immediate: true,
    },
  },
  methods: {
    truncateAddress(address) {
      return address?.slice(0, 6) + "..." + address?.slice(-4)
    },
    onRock() {
      this.selectedMove = Moves.Rock;
      this.sendMove();
    },
    onPaper() {
      this.selectedMove = Moves.Paper;
      this.sendMove();
    },
    onScissors() {
      this.selectedMove = Moves.Scissors;
      this.sendMove();
    },
    buttonClicked(index) {
      this.sliderIndex = index;
      this.sliderValueChanged();
    },
    sliderValueChanged() {
      this.selectedBet = this.wagerSteps[this.sliderIndex];
    },
    togglePlayWithFriend() {
      const localStoragePlayWithFriend = localStorage.getItem("playWithFriend");
      if (localStoragePlayWithFriend == "true") {
        console.log("setting playWithFriend to false");
        localStorage.setItem("playWithFriend", false);
        this.playWithFriend = false;
      } else {
        console.log("setting playWithFriend to true");
        localStorage.setItem("playWithFriend", true);
        this.playWithFriend = true;
      }
      
    },
    async getStripeClientSecret(){
      if(this.activeAccount){
        fetch("/api/stripe_intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setClientSecret(data.client_secret);
          });
      }
    },
    async getAccount() {
      const accounts = await this.getWeb3.eth.getAccounts();
      console.log("accounts", accounts);
      this.activeAccount = accounts[0];
      return accounts[0];
    },
    async setContract() {
      this.contractInstance = new this.getWeb3.eth.Contract(
        CONTRACT_ABI,
        CONTRACT_ADDRESS,
      );

      console.log("contractInstance", this.contractInstance);

      //Set Affiliate contract
      this.affiliateContract = new this.getWeb3.eth.Contract(
          mainContracts.deployedAbis.Affiliate,
          mainContracts.deployedContracts.Affiliate
      );
    },

    async getBlockNumber() {
      const blockNumber = await this.getWeb3.eth.getBlockNumber();
      //console.log("blockNumber", blockNumber);
      return blockNumber;
    },
    async getContract() {
      if (!this.contractInstance) {
        await this.setContract();
      }
      return this.contractInstance;
    },

    createGame(gameId, playerA= this.getActiveAccount){
      this.games[gameId] = {
        gameId,
        playerA: playerA.toLowerCase(),
        playerB: "",
        states: {
            [0]: {
                [playerA.toLowerCase()]: GameStates.Initial,
            }
        },
        bet: 0,
        moves: {
          [0]: {
            [playerA.toLowerCase()]: Moves.None,
          },
        },
        outcome: Outcomes.None,
        points: {
          [playerA.toLowerCase()]: 0,
        },
        round: 0,
      };
    },

    setLastGameId(gameId) {
      console.log("setting last game", gameId);
      this._lastGameId = parseInt(gameId);
    },

    isNewestGameId(gameId) {
      return parseInt(gameId) >= this._lastGameId && gameId >= this.currentGameId;
    },

    getGame(gameId) {
      return this.games[gameId]
    },

    getGameCurrentRound(gameId) {
      return this.games[gameId].length - 1;
    },

    convertTimestampToTime(timestamp) {
    const date = new Date(timestamp * 1000); // Convert to milliseconds by multiplying by 1000
    let hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strTime = hours + ':' + minutes.substr(-2) + ' ' + ampm;
    return strTime;
},
    
    //Whenever a new game is registered
    async handleRegisterEvent(event, userAddress) {
      console.log("PlayerRegistered event:", event.returnValues);
      const { gameId, playerAddress } = event.returnValues;
      
      //check if gameId is in games
      if (!this.getGame(gameId, 0)) 
        this.createGame(gameId, playerAddress);
      
      //set players state to waiting if hasnt already
      this.getGame(gameId).states[0][playerAddress.toLowerCase()] = GameStates.Waiting;  
      
      const block = await this.getWeb3.eth.getBlock(event.blockNumber);
      const timestamp = block.timestamp;
      this.getGame(gameId).time = this.convertTimestampToTime(timestamp)
      
      //set currentGameId if user is in game
    },

    //Whenever has created a match and is waiting for another player to join
    //We set the bet value and the state to waiting
    handleWaitingEvent(event) {
      console.log("PlayerWaiting event:", event.returnValues);
      const { gameId, bet } = event.returnValues;

      //check if gameId is in games
      if (!this.getGame(gameId, 0))
        this.createGame(gameId);
      
      //set players state to waiting
      const playerA = this.getGame(gameId).playerA.toLowerCase()
      const playerB = this.getGame(gameId).playerB.toLowerCase()
      this.getGame(gameId).states[0][playerA] = GameStates.Waiting;

      //set bet amount
      this.getGame(gameId).bet = bet * 10 ** -18;
    },


    handlePlayersMatchedEvent(event) {
      console.log("PlayersMatched event:", event.returnValues);
      const { gameId, playerA, playerB } = event.returnValues;

      //check if gameId is in games
      if (!this.getGame(gameId))
        this.createGame(gameId, playerA);
      
      //set player values
      this.getGame(gameId).playerA = playerA.toLowerCase()
      this.getGame(gameId).playerB = playerB.toLowerCase()

      //set player states
      this.getGame(gameId).states[0][playerA.toLowerCase()] = GameStates.Matched;
      this.getGame(gameId).states[0][playerB.toLowerCase()] = GameStates.Matched;

      //Check if player is in game
      console.log("setting game to matched");
    },

    handleMoveSentEvent(event) {
      console.log("MoveSent event:", event.returnValues);
      const { gameId, round, playerAddress } = event.returnValues;

      //check if gameId is in games
      if (!this.getGame(gameId))
        this.createGame(gameId, playerAddress);

      //Check if round is in moves
      if (!this.getGame(gameId).moves[round])
        this.getGame(gameId).moves[round] = {};
      
      //Check if round is in states
      if (!this.getGame(gameId).states[round])
        this.getGame(gameId).states[round] = {};

      //set player state
      this.getGame(gameId).states[round][playerAddress.toLowerCase()] = GameStates.Sent;
    },

    handleRevealedEvent(event) {
      console.log("MoveRevealed event:", event.returnValues);
      const { gameId, round, playerAddress, move } = event.returnValues;
      
      //check if gameId is in games
      if (!this.getGame(gameId))
        this.createGame(gameId, playerAddress);
      
      //Check if round is in moves
      if (!this.getGame(gameId).moves[round])
        this.getGame(gameId).moves[round] = {};

      //Check if round is in states
      if (!this.getGame(gameId).states[round])
        this.getGame(gameId).states[round] = {};

      //set player move
      this.games[gameId].moves[round][playerAddress.toLowerCase()] = move;

      //set player state
      this.games[gameId].states[round][playerAddress.toLowerCase()] = GameStates.Revealed;
    },

    //Handle new round event
    handleNewRoundEvent(event) {
      console.log("NewRound event:", event.returnValues);
      const { gameId, round, pointsA, pointsB } = event.returnValues;

      //check if gameId is in games
      if (!this.games[gameId])
        this.createGame(gameId);

      //Check if round is in states
      if (!this.games[gameId].states[round])
        this.games[gameId].states[round] = {};

      //Check if round is in moves
      if (!this.games[gameId].moves[round])
        this.games[gameId].moves[round] = {};

      //set round
      this.games[gameId].round = round;

      //set points
      this.games[gameId].points[this.games[gameId].playerA.toLowerCase()] = pointsA;
      this.games[gameId].points[this.games[gameId].playerB.toLowerCase()] = pointsB;

      console.log("setting new points for gameId", gameId, pointsA, pointsB);

      //reset game state to matched if not revealed or sent
      // this.games[gameId].states[round][this.games[gameId].playerA.toLowerCase()] = GameStates.Matched;
      
      // this.games[gameId].states[round][this.games[gameId].playerB.toLowerCase()] = GameStates.Matched;
      
      
    },
    
    handleOutcomeEvent(event, isSubscription = false) {
      console.log("GameOutcome event:", event.returnValues);
      const { gameId, outcome } = event.returnValues;

      //if subscription then set modal and make sure isSubscription is a boolean
      if (isSubscription === true && typeof isSubscription === "boolean") {
        console.log("setting modal");
        //get winner and loser points from yourCurrentPoints and opponentCurrentPoints
        this.winnerPoints = this.yourCurrentPoints > this.opponentCurrentPoints ? this.yourCurrentPoints : this.opponentCurrentPoints;
        this.loserPoints = this.yourCurrentPoints < this.opponentCurrentPoints ? this.yourCurrentPoints : this.opponentCurrentPoints;
        this.winModal = this.yourCurrentPoints > this.opponentCurrentPoints;
        this.showModal = true;
      }

      //check if gameId is in games
      if (!this.games[gameId])
        this.createGame(gameId);

      //set outcome
      this.games[gameId].outcome = outcome;

      //check if user is in game, if so reset game "0"
      if (this.games[gameId].playerA.toLowerCase() == this.activeAccount.toLowerCase() || this.games[gameId].playerB.toLowerCase() == this.activeAccount.toLowerCase()) {
        this.createGame("0");
      }
    },

    //If the game id that was cancelled was yours then reset the current game id and remove the game
    handlePlayerCancelledEvent(event) {
      console.log("PlayerCancelled event:", event.returnValues);
      const { gameId, playerAddress } = event.returnValues;

      //check if gameId is in games
      if (!this.games[gameId])
        this.createGame(gameId, playerAddress);

      //set game outcome
      this.games[gameId].outcome = Outcomes.Cancelled;

      if (this.games[gameId].playerA.toLowerCase() == this.activeAccount.toLowerCase() || this.games[gameId].playerB.toLowerCase() == this.activeAccount.toLowerCase()) {
        this.createGame("0");
      }
    },

    async subscribeToEvents() {
      const contract = await this.getContract();
      const userAddress = await this.getAccount();

      console.log("Polling for events...");
      console.log("contract:", contract);

      const eventNames = [
        "PlayerRegistered",
        "PlayerWaiting",
        "PlayersMatched",
        "MoveCommitted",
        "MoveRevealed",
        "NewRound",
        "GameOutcome",
        "PlayerCancelled",
      ];

      const eventHandlers = {
        PlayerRegistered: this.handleRegisterEvent,
        PlayerWaiting: this.handleWaitingEvent,
        PlayersMatched: this.handlePlayersMatchedEvent,
        MoveCommitted: this.handleMoveSentEvent,
        MoveRevealed: this.handleRevealedEvent,
        NewRound: this.handleNewRoundEvent,
        GameOutcome: this.handleOutcomeEvent,
        PlayerCancelled: this.handlePlayerCancelledEvent,
      };

      const pollingInterval = 1000; // Poll every 5 seconds

      let lastBlockChecked = await this.getBlockNumber()

      // Create a new set for keeping track of handled event ids

      setInterval(async () => {
        const currentBlock = await this.getBlockNumber();

        for (const eventName of eventNames) {
          const events = await contract.getPastEvents(eventName, {
            fromBlock: lastBlockChecked + 1,
            toBlock: currentBlock,
          });

          events.forEach((event) => {
            const eventId = `${event.transactionHash}-${eventName}-${event.logIndex}`;

            if (this.handledEventIds.has(eventId)) {
              return;
            }

            console.log(`New ${eventName} event detected:`, event);
            if(eventName == "GameOutcome") {
                eventHandlers[eventName].call(this, event, true);
            }
            if (eventName === "NewRound") {
              setTimeout(() => {
                eventHandlers[eventName].call(this, event, userAddress);

              }, 1000); // Add a 1-second delay before handling the NewRound event
            } else {
              eventHandlers[eventName].call(this, event, userAddress);
            }

            this.handledEventIds.add(eventId);
          });
        }

        lastBlockChecked = currentBlock;
        console.log("lastBlockChecked:", lastBlockChecked);
      }, pollingInterval);
    },

    async setPassword() {
      const password = await generateRandomString();
      const passwordHash = "0x" + sha256(password);
      //store in local storage
      localStorage.setItem("passwordHash", passwordHash);
      localStorage.setItem("password", password);
    },   
    
    getPassword() {
      const password = localStorage.getItem("password");
      return password;
    },

    getPasswordHash() {
      const passwordHash = localStorage.getItem("passwordHash");
      return passwordHash;
    },

    async getActiveGameId() {
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );
      }

      try {
        const accounts = await this.getWeb3.eth.getAccounts();
        const gameId = await this.contractInstance.methods
          .playerGame(accounts[0])
          .call({ from: accounts[0] });
        return gameId;
      } catch (error) {
        //console.error("Error getting active gameId:", error);
      }
    },

    //copy affiliate link to clipboard
    //affiliate link is the current url with the user's address appended to the end as a query string
    copyAffiliateLink() {
      const url = new URL(window.location.href);
      url.searchParams.set("ref", this.getActiveAccount);
      navigator.clipboard.writeText(url.href);
      alert("Copied to clipboard!");
    },

    copyPasswordGameLink(){
      const url = new URL(window.location.href);
      const password = this.getPassword();
      url.searchParams.set("game", password);
      const bet = this.selectedBet;
      url.searchParams.set("bet", bet);
      navigator.clipboard.writeText(url.href);
      alert("Copied to clipboard!");
    },

    //calls the affiliate contract this.affiliateContract
    async registerAsConsumer(){
      console.log("Registering as consumer...")
      alert("Registering as consumer...")
      if (this.affiliateContract){
        try {
          const accounts = await this.getWeb3.eth.getAccounts();
          const gasPrice = this.getWeb3.utils.toWei("0.1", "gwei");
          const gasLimit = 3000000;

          //get affilaite address from local storage 
          const affiliateAddress = localStorage.getItem("affiliateCode");
          console.log("affiliateAddress:", affiliateAddress);


          const result = await this.affiliateContract.methods.registerAsConsumer(affiliateAddress).send({
            from: this.activeAccount,
            gasPrice,
            gasLimit,
          });
          console.log("registerAsConsumer result:", result);
        } catch (error) {
          console.error("Error registering as consumer:", error);
        }
      }

    },


    //Join or create a new game
    async registerGame() {
      if(this.playWithFriend){
        await this.createPasswordGame();
        return;
      }
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );
      }

      if (!this.selectedBet) {
        alert("Please select a bet amount.");
        return;
      }

      if(this.shouldSetAffiliateCode){
        //await this.registerAsConsumer();
      }else{
        console.log("Not registering as consumer...")
      }

      try {
        console.log("Registering game...", this.currentGameId);
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0")
        this.games[this.currentGameId ?? "0"].states[0][this.getActiveAccount] = GameStates.Registering;

        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("0.3", "gwei");
        const gasLimit = 3000000;

        const betInWei = this.getWeb3.utils.toWei(this.selectedBet.toString(), "ether");

        //get playerGame mapping
        const gameId = await this.contractInstance.methods
          .playerGame(accounts[0])
          .call({ from: accounts[0] });
        console.log("gameId:", gameId);

        //check if burner
        if(this.isBurner){
          const totalValue = this.getWeb3.utils.toWei((this.burnerTopUpAmount + parseFloat(this.selectedBet)).toString(), "ether");
          console.log("totalValue:", totalValue);
          const result = await this.burnerContractInstance.methods
          .registerWithBurner(this.burnerAddress, betInWei)
          .send({ from: accounts[0], value: totalValue, gasPrice, gasLimit });

        }else{
          const result = await this.contractInstance.methods
          .register()
          .send({ from: accounts[0], value: betInWei, gasPrice, gasLimit });
        }
                

        localStorage.setItem("lastBetAmount", this.selectedBet);

        // Update the gameState to Waiting
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //set back to initial state
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0");
        this.games[this.currentGameId ?? "0"].states[0][this.getActiveAccount] = GameStates.Initial;

        //revert selected move
        console.error("Error registering game:", error);
      }
    },

    //Create password game
    async createPasswordGame() {
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );
      }

      if (!this.selectedBet) {
        alert("Please select a bet amount.");
        return;
      }

      try {
        console.log("Creating password game...", this.currentGameId);
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0")
        this.games[this.currentGameId ?? "0"].states[0][this.getActiveAccount] = GameStates.Registering;

        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("0.3", "gwei");
        const gasLimit = 3000000;

        const betInWei = this.getWeb3.utils.toWei(this.selectedBet.toString(), "ether");

        //get playerGame mapping
        const gameId = await this.contractInstance.methods
          .playerGame(accounts[0])
          .call({ from: accounts[0] });

        //set password
        await this.setPassword();
        const passwordHash = this.getPasswordHash();
        console.log("gameId:", gameId);
        if(this.isBurner){
          const totalValue = this.getWeb3.utils.toWei((this.burnerTopUpAmount + parseFloat(this.selectedBet)).toString(), "ether");
          const result = await this.burnerContractInstance.methods
          .createPasswordMatchWithBurner(this.burnerAddress, betInWei, passwordHash)
          .send({ from: accounts[0], value: totalValue, gasPrice, gasLimit });
        }else {
          const result = await this.contractInstance.methods
          .createPasswordMatch(passwordHash)
          .send({ from: accounts[0], value: betInWei, gasPrice, gasLimit });

        }
                

        localStorage.setItem("lastBetAmount", this.selectedBet);

        // Update the gameState to Waiting
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //set back to initial state
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0");
        this.games[this.currentGameId ?? "0"].states[0][this.getActiveAccount] = GameStates.Initial;

        //revert selected move
        console.error("Error registering game:", error);
      }
    },

    //Join password match
    async joinPasswordMatch(password, betAmount) {
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );
      }
      this.selectedBet = betAmount;
      if (!this.selectedBet) {
        alert("Please select a bet amount.");
        return;
      }

      if(this.shouldSetAffiliateCode){
        await this.registerAsConsumer();
      }else{
        console.log("Not registering as consumer...")
      }

      try {
        console.log("Joining password match...", this.currentGameId);
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0")
        this.games[this.currentGameId ?? "0"].states[0][this.getActiveAccount] = GameStates.Registering;

        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("0.3", "gwei");
        const gasLimit = 3000000;

        const betInWei = this.getWeb3.utils.toWei(this.selectedBet.toString(), "ether");

        //get playerGamje mapping
        const gameId = await this.contractInstance.methods
          .playerGame(accounts[0])
          .call({ from: accounts[0] });

        //set password
        console.log("gameId:", gameId);
        if(this.isBurner){
          const totalValue = this.getWeb3.utils.toWei((this.burnerTopUpAmount + parseFloat(this.selectedBet)).toString(), "ether");
          const result = await this.burnerContractInstance.methods
          .joinPasswordMatchWithBurner(this.burnerAddress, betInWei, password)
          .send({ from: accounts[0], value: totalValue, gasPrice, gasLimit });ce
        }else{
          const result = await this.contractInstance.methods
          .joinPasswordMatch(password)
          .send({ from: accounts[0], value: betInWei, gasPrice, gasLimit });
        }        

        localStorage.setItem("lastBetAmount", this.selectedBet);

        // Update the gameState to Waiting
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //set back to initial state
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0");
        this.games[this.currentGameId ?? "0"].states[0][this.getActiveAccount] = GameStates.Initial;

        //revert selected move
        console.error("Error registering game:", error);
      }
    },

    //Send move to the contract
    async sendMove(){
      const prevState = this.gameState;
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );
      }

      if (!this.selectedBet) {
        alert("Please select a bet amount.");
        return;
      }

      try {
        console.log("Sending game...", this.currentGameId);
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0")
        this.games[this.currentGameId ?? "0"].states[this.currentRound][this.getActiveAccount] = GameStates.Sending;
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
        this.randomString = generateRandomString(); // Save randomString
        const encryptedMove =
          "0x" + sha256(this.selectedMove + this.randomString);
        console.log("clearMove:", this.selectedMove + this.randomString);
        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("0.3", "gwei");
        const gasLimit = 3000000;

        if(this.isBurner){
          const result = await this.burnerContractInstance.methods
          .commit(parseInt(this.currentGameId), encryptedMove)
          .send({ from: this.burnerAddress, gasPrice, gasLimit });
        }else{
          const result = await this.contractInstance.methods
          .commit(parseInt(this.currentGameId), encryptedMove)
          .send({ from: accounts[0], gasPrice, gasLimit });
          console.log("Game registered:", result);
        }
        
        // Store the last sentMove and betAmount in the localStorage
        localStorage.setItem("lastSentMove", this.selectedMove);
        localStorage.setItem("lastRandomString", this.randomString);
        
        // Update the gameState to Waiting
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //set back to initial state
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0");
        this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = prevState

        //revert selected move
        this.selectedMove = "";
        console.error("Error registering game:", error);
      }
    },

    async cancelGame(){
      const prevState = this.gameState;
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );
      }

      try {
        console.log("Cancelling game...", this.currentGameId);
        // if (!this.games[this.currentGameId ?? "0"]) 
        //   this.createGame(this.currentGameId ?? "0")
        // this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = GameStates.Cancelling;
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("0.3", "gwei");
        const gasLimit = 3000000;

        if(this.isBurner){
          const result = await this.burnerContractInstance.methods
          .cancel(parseInt(this.currentGameId))
          .send({ from: this.burnerAddress, gasPrice, gasLimit });
        }else{
          const result = await this.contractInstance.methods
            .cancel(parseInt(this.currentGameId))
            .send({ from: accounts[0], gasPrice, gasLimit });
          console.log("Game cancelled:", result);
        }

        // Update the gameState to Waiting
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //set back to initial state
        // if (!this.games[this.currentGameId ?? "0"]) 
        //   this.createGame(this.currentGameId ?? "0");
        // this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = prevState

        // //revert selected move
        // this.selectedMove = "";
        console.error("Error cancelling game:", error);
      }
    },

    async leaveGame(){
      const prevState = this.gameState;
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );
      }

      try {
        console.log("Leaving game...", this.currentGameId);
        // if (!this.games[this.currentGameId ?? "0"]) 
        //   this.createGame(this.currentGameId ?? "0")
        // this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = GameStates.Cancelling;
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("0.3", "gwei");
        const gasLimit = 3000000;

        if(this.isBurner){
          const result = await this.burnerContractInstance.methods
          .leave(parseInt(this.currentGameId))
          .send({ from: this.burnerAddress, gasPrice, gasLimit });
        } else {
        const result = await this.contractInstance.methods
          .leave(parseInt(this.currentGameId))
          .send({ from: accounts[0], gasPrice, gasLimit });
        console.log("Game left:", result);
        }

        // Update the gameState to Waiting
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //set back to initial state
        // if (!this.games[this.currentGameId ?? "0"]) 
        //   this.createGame(this.currentGameId ?? "0");
        // this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = prevState

        // //revert selected move
        // this.selectedMove = "";
        console.error("Error cancelling game:", error);
      }
    },

    async revealMove() {
      const prevState = this.gameState;
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );
      }

      try {
        // Update the gameState to Revealing
        if (!this.games[this.currentGameId]) 
          this.createGame(this.currentGameId)
        this.games[this.currentGameId].states[this.getActiveAccount] = GameStates.Revealing;

        const accounts = await this.getWeb3.eth.getAccounts();
        const clearMove = `${this.selectedMove}${this.randomString}`; // Use saved randomString
        const gasPrice = this.getWeb3.utils.toWei("0.3", "gwei");
        const gasLimit = 3000000;

        if(this.isBurner){
          const result = await this.burnerContractInstance.methods
          .reveal(parseInt(this.currentGameId), clearMove)
          .send({ from: this.burnerAddress, gasPrice, gasLimit });
        }else{
        const result = await this.contractInstance.methods
          .reveal(this.currentGameId, clearMove)
          .send({ from: accounts[0], gasPrice, gasLimit });
        }

        //console.log("Move revealed:", result);

        // Automatically update the gameId to get the outcome

        
        console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //Update the gameState to Matched
        if (!this.games[this.currentGameId]) 
          this.createGame(this.currentGameId)
        this.games[this.currentGameId].states[this.getActiveAccount] = GameStates.Sent
        console.error("Error revealing move:", error);
      }
    },
    async getGameOutcome() {
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );
      }

      try {
        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("0.1", "gwei");
        const gasLimit = 3000000;
        const result = await this.contractInstance.methods
          .getOutcome(this.currentGameId)
          .call({ from: accounts[0], gasPrice, gasLimit });
        console.log("Game outcome:", result);
        //this.gameInfo.outcome = result;
      } catch (error) {
        console.error("Error getting game outcome:", error);
      }
    },

    async fetchPlayerRegisteredEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("PlayerRegistered", {
        fromBlock,
      });
      this.playerRegisteredEvents = events;
      console.log("playerRegisteredEvents:", this.playerRegisteredEvents.map(e => e.returnValues));
    },

    async fetchPlayerWaitingEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("PlayerWaiting", {
        fromBlock,
      });
      this.playerWaitingEvents = events;
      console.log("playerWaitingEvents:", this.playerWaitingEvents.map(e => e.returnValues));
    },

    async fetchPlayersMatchedEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("PlayersMatched", {
        fromBlock,
      });
      this.playersMatchedEvents = events;
      console.log("playersMatchedEvents:", this.playersMatchedEvents.map(e => e.returnValues));
    },

    async fetchPlayersMoveCommittedEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("MoveCommitted", {
        fromBlock,
      });
      this.moveCommittedEvents = events;
      console.log("moveCommittedEvents:", this.moveCommittedEvents.map(e => e.returnValues));
    },

    async fetchMoveRevealedEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("MoveRevealed", {
        fromBlock,
      });
      this.moveRevealedEvents = events;
      console.log("moveRevealedEvents:", this.moveRevealedEvents.map(e => e.returnValues));
    },

    async fetchNewRoundEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("NewRound", {
        fromBlock,
      });
      this.newRoundEvents = events;
      console.log("newRoundEvents:", this.newRoundEvents.map(e => e.returnValues));
    },

    async fetchGameOutcomeEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("GameOutcome", {
        fromBlock,
      });
      this.gameOutcomeEvents = events;
      console.log("gameOutcomeEvents:", this.gameOutcomeEvents.map(e => e.returnValues));
    },

    async fetchPlayerCancelledEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("PlayerCancelled", {
        fromBlock,
      });
      this.playerCancelledEvents = events;
      console.log("playerCancelledEvents:", this.playerCancelledEvents.map(e => e.returnValues));
    },

    addToHandledEvents(event, eventName) {
      const eventId = `${event.transactionHash}-${eventName}-${event.logIndex}`;
      this.handledEventIds.add(eventId);
    },
    
    async processEvents() {
      // Get the current user's address
      const userAddress = await this.getAccount();

      // Iterate over the playerRegisteredEvents
      // Call handlePlayerRegisteredEvent for each event
      for (const event of this.playerRegisteredEvents) {
        this.handleRegisterEvent(event, userAddress);
        this.addToHandledEvents(event, "PlayerRegistered");
      }

      // Iterate over the playerWaitingEvents
      // Call handlePlayerWaitingEvent for each event
      for (const event of this.playerWaitingEvents) {
        this.handleWaitingEvent(event)
        this.addToHandledEvents(event, "PlayerWaiting");

      }

      // Iterate over the playerCancelledEvents
      // Call handlePlayerCancelledEvent for each event
      for (const event of this.playerCancelledEvents) {
        this.handlePlayerCancelledEvent(event)
        this.addToHandledEvents(event, "PlayerCancelled");
      }

      // Iterate over the playersMatchedEvents
      // Call handlePlayersMatchedEvent for each event
      for (const event of this.playersMatchedEvents) {
        this.handlePlayersMatchedEvent(event)
        this.addToHandledEvents(event, "PlayersMatched");
      }

      // Iterate over the moveCommittedEvents
      // Call handleMoveSentEvent for each event
      for (const event of this.moveCommittedEvents) {
        this.handleMoveSentEvent(event)
        this.addToHandledEvents(event, "MoveCommitted");
      }

      // Iterate over the moveRevealedEvents
      // Call handleMoveRevealedEvent for each event
      for (const event of this.moveRevealedEvents) {
        this.handleRevealedEvent(event)
        this.addToHandledEvents(event, "MoveRevealed");
      }

      // Iterate over the newRoundEvents
      // Call handleNewRoundEvent for each event
      for (const event of this.newRoundEvents) {
        this.handleNewRoundEvent(event)
        this.addToHandledEvents(event, "NewRound");
      }

      // Iterate over the gameOutcomeEvents
      // Call handleGameOutcomeEvent for each event
      for (const event of this.gameOutcomeEvents) {
        this.handleOutcomeEvent(event)
        this.addToHandledEvents(event, "GameOutcome");
      }

      
    },

    //checkAffiliateCode in ref query string
    async checkAffililiateCode() {
      const urlParams = new URLSearchParams(window.location.search);
      const affiliateCode = urlParams.get('ref');
      if (affiliateCode) {
        //set local storage affiliate code
        //if there is no affiliate code in local storage
        localStorage.setItem("affiliateCode", affiliateCode)

        
      }
      //set the affiliate address defined in the affiliate contract
      this.affiliateOfUser = await this.affiliateContract.methods.getAffiliateOfConsumer(this.activeAccount).call();

      console.log("affiliate of user", this.affiliateOfUser)

    },

    async checkJoiningPassword() {
      const urlParams = new URLSearchParams(window.location.search);
      const joiningPassword = urlParams.get('game');
      const betAmount = urlParams.get('bet');

      if(joiningPassword && !this.isInGame && !this.isJoiningGame && betAmount) {
        await this.joinPasswordMatch(joiningPassword, betAmount);
      }
      
    },

    async fetchPastGames() {
      const fromBlock = 31290509;

      await this.fetchPlayerRegisteredEvents(fromBlock);
      await this.fetchPlayerWaitingEvents(fromBlock);
      await this.fetchPlayersMatchedEvents(fromBlock);
      await this.fetchPlayersMoveCommittedEvents(fromBlock);
      await this.fetchMoveRevealedEvents(fromBlock);
      await this.fetchNewRoundEvents(fromBlock);
      await this.fetchGameOutcomeEvents(fromBlock);
      await this.fetchPlayerCancelledEvents(fromBlock);


      this.processEvents();
    },
  },
};
</script>
