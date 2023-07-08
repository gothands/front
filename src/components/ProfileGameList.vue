<template>
    <div style="margin: 120px 80px;">
      <table style="table-layout: fixed;">
        <thead>
        
          <tr>
            <th><div class="table-header-item"><div class="star-symbol-table"></div><p>Result</p></div></th>
            <th><div class="table-header-item"><div class="clock-symbol-table"></div><p>Score</p></div></th>
            <th><div class="table-header-item"><div class="user1-symbol-table"></div><p>Earned</p></div></th>
            <th><div class="table-header-item"><div class="user2-symbol-table"></div><p>Rounds</p></div></th>
            <th><div class="table-header-item"><div class="prize-symbol-table"></div><p>Date</p></div></th>
            <th><div class="table-header-item"><div class="rounds-symbol-table"></div><p>Opponent</p></div></th>
                
            
            
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in selectedData" :key="index">
            <td class="result"> {{ item.points[item.playerA] > item.points[item.playerB] ? 'Win' : 'Loss' }} </td>
            <td class="score">{{ item.points[item.playerA] }} : {{ item.points[item.playerB] ?? 0 }}</td>
            <td class="earned"
                :class="{ 'earned-positive': item.points[item.playerA] > item.points[item.playerB], 'earned-negative': item.points[item.playerA] < item.points[item.playerB] }"
            >${{ item.bet }}</td>
            <td class="rounds">{{ Object.keys(item.moves).length }}</td>
            <td class="time">{{ item.time }}</td>
            <td class="player">
              <profile-item :address="address?.toLowerCase() === item.playerA?.toLowerCase() ? item.playerA : item.playerB"></profile-item>
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
import GameMove from './GameMove.vue'
import ProfileItem from './ProfileItem.vue'
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
        truncateAddress(address) {
            return address?.slice(0, 6) + "..." + address?.slice(-4)
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
  