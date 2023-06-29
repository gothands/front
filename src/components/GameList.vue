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
  