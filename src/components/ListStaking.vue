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
            <td class="result"> {{timeString(item.timestamp)}} </td>
            <td class="score">{{item.amount}} ETH</td>
            <td class="earned">{{ (item.yourStake/item.totalStaked) * item.amount }} ETH</td>
            <td class="rounds">{{ item.yourStake }} / {{item.totalStaked}} HANDS</td>
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
import { timeAgo } from '@/utils'

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
      timeString(time){
        const currentTimeInSec = this.$store.state.currentTime
        return timeAgo(time, currentTimeInSec)
      },
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
  