<template>
    <div>
        <router-link class="player-item" :to="'/profile/' + address">
            <div class="profile-mini"></div>
            <p>{{ truncateAddress(address) }}</p>
          </router-link>
    </div>
    
</template>

<style>
.player-item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #353535;
}
</style>

<script>
import { Outcomes } from '@/types'
export default {
    props: {
        address: {
            type: String,
            required: true
        }
    },
    methods: {
        truncateAddress(address) {
            return address?.slice(0, 6) + "..." + address?.slice(-4)
        }
    }
}
</script>
  
  