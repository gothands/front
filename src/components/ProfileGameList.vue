<template>
    <div style="margin: 120px 80px;">
      <table style="table-layout: fixed;">
        <thead>
        
          <tr>
            <th><div class="table-header-item"><div class="prize-symbol-table"></div><p>Time</p></div></th>
            <th><div class="table-header-item"><div class="star-symbol-table"></div><p>Result</p></div></th>
            <th><div class="table-header-item"><div class="clock-symbol-table"></div><p>Score</p></div></th>
            <th><div class="table-header-item"><div class="user1-symbol-table"></div><p>Earned</p></div></th>
            <th><div class="table-header-item"><div class="user2-symbol-table"></div><p>Rounds</p></div></th>
            <th><div class="table-header-item"><div class="rounds-symbol-table"></div><p>Opponent</p></div></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in selectedData" :key="index">
            <td class="time">{{ timeString(item.time) }}</td>
            <td class="result">
              <div v-if="wasCancelled(item)" class="grey winnings">Cancelled</div>
              <div v-else-if="isLeaver(item, this.address)" class="winnings red">Left</div>
              <div v-else-if="isOpponentLeaver(item, this.address)" class="winnings green">Opponent Left</div>
              <div v-else-if="isWinner(item, this.address)" class="winnings green">Won</div>
              <div v-else-if="isLoser(item, this.address)" class="winnings red">Lost</div>
            </td>
            <td class="score">{{ item.points[item.playerA] }} : {{ item.points[item.playerB] ?? 0 }}</td>
            <td class="earned"
                :class="{ 'earned-positive': isWinner(item, this.address), 'earned-negative': isLoser(item, this.address) }"
            >
            <div v-if="isWinner(item, this.address)" class="winnings green">+{{ getPlayerWinnings(item, this.address) }} ETH <span class="blue">(-{{getApplicationFee(item)}})</span> </div>
            <div v-else-if="isLoser(item, this.address)" class="winnings red">{{ getPlayerWinnings(item, this.address) }} ETH </div>

          </td>
            <td class="rounds">{{ Object.keys(item.moves).length }}</td>
            <td class="player">
              <profile-item :address="this.address?.toLowerCase() == item.playerA?.toLowerCase() ? item.playerB : item.playerA"></profile-item>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>

<style scoped>
.earned-positive {
  color: #24B27F;
}

.earned-negative {
  color: #FF6969;
}
</style>
  
  <script>
import { timeAgo } from '@/utils'
import GameMove from './GameMove.vue'
import ProfileItem from './ProfileItem.vue'
import { APPLICATION_FEE, Outcomes } from '@/types'



  export default {
    components: {
        GameMove,
        ProfileItem,
    },
    data() {
      return {
        selectedTab: 'Completed',
      }
    },
    props: {
        address: {type: String,},
        games: {type: Array,},
    },
    computed: {
      selectedData() {
        console.log("profile game list", this.games)
        return this.games;
      }
    },
    methods:{
      timeString(time){
        const currentTimeInSec = this.$store.state.currentTime
        return timeAgo(time, currentTimeInSec)
      },
        truncateAddress(address) {
            return address?.slice(0, 6) + "..." + address?.slice(-4)
        },
        getWinnings(bet) {
        return (bet - (bet * 2 * APPLICATION_FEE)).toFixed(4)
      },
      getApplicationFee(game) {
        const bet = game.bet
        return bet * 2 * APPLICATION_FEE
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
      isOpponentLeaver(game, player){
        const isPlayerA = player?.toLowerCase() === game.playerA?.toLowerCase()
        return isPlayerA ? game.outcome == Outcomes.PlayerBLeft : game.outcome == Outcomes.PlayerALeft
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
  