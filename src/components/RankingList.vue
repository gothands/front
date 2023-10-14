<template>
    <div class="table-content">
      <table style="">
        <thead>
        
          <tr>
            <th><div class="table-header-item"><div class="prize-symbol-table"></div><p>Rank</p></div></th>
            <th><div class="table-header-item"><div class="star-symbol-table"></div><p>Player</p></div></th>
            <th><div class="table-header-item"><div class="clock-symbol-table"></div><p>Earnings</p></div></th>
            <th><div class="table-header-item"><div class="user1-symbol-table"></div><p>Games Played</p></div></th>
            <th><div class="table-header-item"><div class="user1-symbol-table"></div><p>Points</p></div></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in selectedData" :key="index">
            <td class="rank">{{ index + 1 }}</td>
            <td class="player">
              <profile-item :address="item.address"></profile-item>
            </td>
            
            <td v-if="item.earnings > 0" class="winnings green">+{{ item.earnings }} ETH</td>
            <td v-else-if="item.earnings <= 0" class="winnings red">{{ item.earnings }} ETH </td>
            <td class="games-played">{{ item.gamesPlayed }}</td>
            <td class="points">
              <div>
                <div style="" class="points-button">{{ item.points }} points</div>
              </div>
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
        ProfileItem,
    },
    data() {
      return {
        selectedTab: 'Completed',
      }
    },
    props: {
        rankings: {type: Array,},
    },
    computed: {
      selectedData() {
        console.log("profile game list", this.rankings)
        return this.rankings
      }
    },
    methods:{}
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
  