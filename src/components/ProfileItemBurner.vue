<template>
    <div>
        <div class="burner-item" :to="'/profile/' + address">
            <div class="burner-icon"></div>
            <p>{{ truncateAddress(address) }}</p>
        </div>
    </div>
    
</template>

<style>

.burner-item {
    display: flex;
    align-items: center;
    font-size: 15px;
    gap: 10px;
    color: #353535;
    text-decoration: underline;
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
  
  