<template>
    <div style="margin: 0 80px;">
      <table style="table-layout: fixed;">
        <thead>
        
          <tr>
            <th><div class="table-header-item"><div class="star-symbol-table"></div><p>Time Joined</p></div></th>
            <th><div class="table-header-item"><div class="clock-symbol-table"></div><p>User</p></div></th>
            <th><div class="table-header-item"><div class="user1-symbol-table"></div><p>Total Revenue Generated</p></div></th>
            <th><div class="table-header-item"><div class="user2-symbol-table"></div><p>Revenue Timestamps</p></div></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in selectedData" :key="index">
            <td class="result"> {{item.timestamp}} </td>
            <profile-item :address="item.user"></profile-item>
            <td class="earned">{{item.totalRevenue }}</td>
            <td class="round" colspan="2">
                <ul class="rounds-container">
                  <div v-for="(revenueTimestamp, index) in item.revenueTimestamps" :key="index" class="rounds-list">
                    <p>{{ revenueTimestamp.amount }} at {{ revenueTimestamp.timestamp }}</p>
                  </div>
                </ul>
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
  