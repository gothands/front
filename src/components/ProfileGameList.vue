<template>
    <div style="margin: 120px 80px;">
      <table>
        <thead>
        
          <tr>
            <th><div class="table-header-item"><div class="star-symbol-table"></div><p>Result</p></div></th>
            <th><div class="table-header-item"><div class="clock-symbol-table"></div><p>Time</p></div></th>
            <th><div class="table-header-item"><div class="user1-symbol-table"></div><p>Player 1</p></div></th>
            <th><div class="table-header-item"><div class="user2-symbol-table"></div><p>Player 2</p></div></th>
            <th><div class="table-header-item"><div class="prize-symbol-table"></div><p>Prize</p></div></th>
            <th><div class="table-header-item"><div class="rounds-symbol-table"></div><p>Rounds</p></div></th>
            <th>
                
            </th>
                
            
            
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in selectedData" :key="index">
            <td class="score">{{ item.points[item.playerA] }} : {{ item.points[item.playerB] ?? 0 }}</td>
            <td class="time">{{ item.time }}</td>
            <td class="player">
                <div>
                    <div class="profile-mini"></div>
                    <p>{{  item.playerA?.slice(0, 6) + "..." + item.playerA?.slice(-4) }}</p>
                </div>
            </td>

            <td class="player">
                <div>
                    <div class="profile-mini"></div>
                    <p>{{ item.playerB?.slice(0, 6) + "..." + item.playerB?.slice(-4) }}</p>
                </div>
            </td>
            <td class="prize">${{ item.bet }}</td>
            <td class="round" colspan="2">
              <ul class="rounds-container">
                <div v-for="(round, roundIndex) in item.moves" :key="roundIndex" class="rounds-list">
                  <game-move :isSmall="true" :move="round[item.playerA]"></game-move> : <game-move :isSmall="true" :move="round[item.playerB]"></game-move>
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
  export default {
    components: {
        GameMove
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
  