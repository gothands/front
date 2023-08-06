<template>
    <div style="margin: 120px 80px;">
      <table>
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
                <profile-item :address="item.playerA"></profile-item>
                <div v-if="wasCancelled(item)" class="grey">Cancelled</div>
                <div v-else-if="isLeaver(item, item.playerA)" class="red">Left</div>
                <div v-else-if="isWinner(item, item.playerA)" class="green">{{ getPlayerWinnings(item, item.playerA) }}  <span class="blue">(-{{getApplicationFee(item)}})</span> </div>
                <div v-else-if="isLoser(item, item.playerA)" class="red">{{ getPlayerWinnings(item, item.playerA) }} </div>
            </td>

            <td class="player">
              <profile-item :address="item.playerB"></profile-item>
              <div v-if="isLeaver(item, item.playerA)" class="red">Left</div>
              <div v-else-if="isWinner(item, item.playerA)" class="green">{{ getPlayerWinnings(item, item.playerB) }}  <span class="blue">(-{{getApplicationFee(item)}})</span> </div>
              <div v-else-if="isLoser(item, item.playerA)" class="red">{{ getPlayerWinnings(item, item.playerB) }} </div>
            </td>
            <td class="prize">${{ item.bet }}</td>
            <td class="round" colspan="2">
              <ul class="rounds-container">
                <template v-if="item.moves > 1">
                  <div v-for="(round, roundIndex) in item.moves" :key="roundIndex" class="rounds-list">
                    <game-move :isSmall="true" :move="round[item.playerA]"></game-move> : <game-move :isSmall="true" :move="round[item.playerB]"></game-move>
                  </div>
                </template>
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
        return bet * 2 * (1 - APPLICATION_FEE)
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
        const isPlayerA = player.toLocaleCase() === game.playerA.toLowerCase()
        if (outcome === Outcomes.Cancelled) {
          return 0
        } else if (outcome === Outcomes.PlayerALeft && isPlayerA) {
          return -bet
        } else if (outcome === Outcomes.PlayerBLeft && isPlayerA) {
          return winnings
        } else if (outcome === Outcomes.PlayerALeft && !isPlayerA) {
          return winnings
        } else if (outcome === Outcomes.PlayerBLeft && !isPlayerA) {
          return -bet
        }
         else if (outcome === Outcomes.Draw) {
          return 0
        } else if (outcome === Outcomes.PlayerA && isPlayerA) {
          return winnings
        } else if (outcome === Outcomes.PlayerB && isPlayerA) {
          return -bet
        } else if (outcome === Outcomes.PlayerA && !isPlayerA) {
          return -bet
        } else if (outcome === Outcomes.PlayerB && !isPlayerA) {
          return winnings
        }
      },
      wasCancelled(game){
        const outcome = game.outcome
        return outcome === Outcomes.Cancelled
      },
      isLeaver(game, player){
        const outcome = game.outcome
        return outcome === Outcomes.Left && game.leaver.toLowerCase() === player.toLowerCase()
      },
      isWinner(game, player){
        const winnings = this.getPlayerWinnings(game, player)
        return winnings > 0
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
  