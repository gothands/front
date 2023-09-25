<template>
    <div style="margin: 120px 50px; overflow:auto;">
      <table style="border-collapse: collapse;">
        <thead>
        
          <tr>
            <th><div class="table-header-item"><div class="star-symbol-table"></div><p>Score</p></div></th>
            <th><div class="table-header-item"><div class="clock-symbol-table"></div><p>Time</p></div></th>
            <th><div class="table-header-item"><div class="user1-symbol-table"></div><p>Player 1</p></div></th>
            <th><div class="table-header-item"><div class="user2-symbol-table"></div><p>Player 2</p></div></th>
            <th><div class="table-header-item"><div class="prize-symbol-table"></div><p>Prize</p></div></th>
            <th><div class="table-header-item"><div class="rounds-symbol-table"></div><p>Rounds</p></div></th>
            <th>
                <div class="tabs-container">
                    <div class="tabs">
                        <button 
                          v-for="(tab, index) in tabs" 
                          :key="index"
                          @click="selectedTab = tab"
                          :class="{ active: selectedTab === tab }"
                        >
                          {{ tab }}
                        </button>
                      </div>
                    </div>
            </th>
                
            
            
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in selectedData" :key="index">
            <td class="score">{{ item.points[item.playerA] }} : {{ item.points[item.playerB] ?? 0 }}</td>
            <td class="time">{{ timeString(item.time) }}</td>
            <td class="player">
              <div>
                <profile-item :address="item.playerA"></profile-item>
                <div v-if="wasCancelled(item)" class="grey winnings">Cancelled</div>
                <div v-else-if="isTimedOut(item, item.playerA)" class="winnings red">Timeout</div>
                <div v-else-if="isLeaver(item, item.playerA)" class="winnings red">Left</div>
                <div v-else-if="isWinner(item, item.playerA)" class="winnings green">+{{ item.bet }} ETH <span class="blue">(-{{getApplicationFee(item)}})</span> </div>
                <div v-else-if="isLoser(item, item.playerA)" class="winnings red">{{ getPlayerWinnings(item, item.playerA) }} ETH </div>
              </div>
            </td>

            <td class="player">
              <div>
                <profile-item :address="item.playerB"></profile-item>
                <div v-if="isLeaver(item, item.playerB)" class="winnings red">Left</div>
                <div v-else-if="isTimedOut(item, item.playerB)" class="winnings red">Timeout</div>
                <div v-else-if="isWinner(item, item.playerB)" class="winnings green"> +{{ item.bet }} ETH  <span class="blue">(-{{getApplicationFee(item)}})</span> </div>
                <div v-else-if="isLoser(item, item.playerB)" class="winnings red">{{ getPlayerWinnings(item, item.playerB) }} ETH </div>
              </div>
            </td>
            <td class="prize">{{ item.bet }} ETH</td>
            <td class="round" colspan="2">
              <ul class="rounds-container">
                  <div v-for="(round, roundIndex) in item.moves" :key="roundIndex" class="rounds-list">
                    <template v-if="Object.keys(round).length > 1">
                      <game-move :isSmall="true" :move="round[item.playerA]"></game-move> : <game-move :isSmall="true" :move="round[item.playerB]"></game-move>
                    </template>
                  </div>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
import GameMove from './GameMove.vue'
import ProfileItem from './ProfileItem.vue'
import {timeAgo} from '../utils/index.ts'
import { Outcomes } from '@/types'


const APPLICATION_FEE = 0.05;

  export default {
    components: {
        GameMove,
        ProfileItem
    },
    data() {
      return {
        tabs: ['Completed', 'Active', 'Pending'],
        selectedTab: 'Completed',
      }
    },
    props: {
        activeData: {
      type: Array,
      default: () => Array(10).fill({
        score: 'Score',
        time: new Date().toLocaleString(),
        player1: 'Player 1',
        player2: 'Player 2',
        prize: 'Prize',
        rounds: ['Round 1', 'Round 2']
      })
    },
    completedData: {
      type: Array,
      default: () => Array(10).fill({
        score: 'Score',
        time: new Date().toLocaleString(),
        player1: 'Player 1',
        player2: 'Player 2',
        prize: 'Completed',
        rounds: ['Round 1', 'Round 2']
      })
    },
    pendingData: {
      type: Array,
      default: () => Array(10).fill({
        score: 'Score',
        time: new Date().toLocaleString(),
        player1: 'Player 1',
        player2: 'Player 2',
        prize: 'Pending',
        rounds: ['Round 1', 'Round 2']
      })
    }
    },
    computed: {
      selectedData() {
        console.log("selected tab", this.selectedTab)
        switch(this.selectedTab) {
          case 'Active':
          console.log("active data", this.activeData)
            return this.activeData;
          case 'Completed':
            console.log("completed data", this.completedData)
            return this.completedData;
          case 'Pending':
            console.log("pending data", this.pendingData)
            return this.pendingData;
          default:
            return [];
        }
      }
    },
    methods:{
      truncateAddress(address) {
        return address?.slice(0, 6) + "..." + address?.slice(-4)
      },
      timeString(time){
        const currentTimeInSec = this.$store.state.currentTime
        return timeAgo(time, currentTimeInSec)
      },
      getWinnings(bet) {
        return (bet - (bet * 2 * APPLICATION_FEE)).toFixed(4)
      },
      getApplicationFee(game) {
        const bet = game.bet
        return bet * 2 * APPLICATION_FEE
      },
      getPlayerPoints(game, player){
        return game.points[player]
      },
      getPlayerWinnings(game, player){
        const bet = game.bet
        const winnings = this.getWinnings(bet)
        const outcome = game.outcome
        const isPlayerA = player?.toLowerCase() === game.playerA?.toLowerCase()

        console.log("getting player winnings", game, player, winnings, outcome, isPlayerA)
        if (outcome == Outcomes.Cancelled) {
          console.log("cancelled")
          return 0
        } else if (outcome == Outcomes.PlayerALeft && isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerBLeft && isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerALeft && !isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerBLeft && !isPlayerA) {
          return -bet
        }
         else if (outcome == Outcomes.Draw) {
          return 0
        } else if (outcome == Outcomes.PlayerA && isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerB && isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerA && !isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerB && !isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerATimeout && isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerBTimeout && isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerATimeout && !isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerBTimeout && !isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.BothTimeout) {
          return 0
        }
      },
      wasCancelled(game){
        const outcome = game.outcome
        return outcome == Outcomes.Cancelled
      },
      isLeaver(game, player){
        const isPlayerA = player?.toLowerCase() === game.playerA?.toLowerCase()
        return isPlayerA ? game.outcome == Outcomes.PlayerALeft : game.outcome == Outcomes.PlayerBLeft
      },
      isTimedOut(game, player){
        const isPlayerA = player?.toLowerCase() === game.playerA?.toLowerCase()
        return (isPlayerA ? game.outcome == Outcomes.PlayerATimeout : game.outcome == Outcomes.PlayerBTimeout) || game.outcome == Outcomes.BothTimeout
      },
      isWinner(game, player){
        const winnings = this.getPlayerWinnings(game, player)
        console.log("getting winnings for player", winnings, player)
        return winnings > 0
      },
      isLoser(game, player){
        const winnings = this.getPlayerWinnings(game, player)
        return winnings < 0
      },
      getColorBasedOnWinnings(game, player){
        const winnings = this.getPlayerWinnings(game, player)
        if (winnings > 0) {
          return 'green'
        } else if (winnings < 0) {
          return 'red'
        } else {
          return 'grey'
        }
      },
    }
  }
  </script>
  
  <style scoped>
 
  
  

  
  .tabs {

  }
  
  .tabs button {

  }
  
  .tabs .active {
    font-weight: bold;
  }
  </style>
  