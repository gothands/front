<template>
    <div style="margin: 0 80px; overflow:auto; width:90vw; text-align:center; display:flex; align-items:center;">
      <table style="border-collapse: collapse; min-width:90vw;">
        <thead>
        
          <tr>
            <th><div class="table-header-item"><div class="star-symbol-table"></div><p>Date</p></div></th>
            <th><div class="table-header-item"><div class="clock-symbol-table"></div><p>Protocol Revenue</p></div></th>
            <th><div class="table-header-item"><div class="user1-symbol-table"></div><p>Your earnings</p></div></th>
            <th><div class="table-header-item"><div class="user2-symbol-table"></div><p>Your stake</p></div></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in selectedData" :key="index">
            <td class="result"> {{item.timestamp}} </td>
            <td class="score">{{item.amount}}</td>
            <td class="earned">{{ (item.yourStaked/item.totalStaked) * item.amount }}</td>
            <td class="rounds">{{ item.yourStaked }} / {{item.totalStaked}} HANDS</td>
            <td class="time">{{ item.time }}</td>
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
        events: {type: Array,},
        address: {type: String,},
    },
    computed: {
      selectedData() {
        console.log("profile game list", this.events)
        return this.events;
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
  