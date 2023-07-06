<template>
    <router-link class="player" :to="'/profile/' + address">
      <div class="profile-mini"></div>
      <p>{{ truncateAddress(address) }}</p>
    </router-link>
</template>

<style>
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
  
  