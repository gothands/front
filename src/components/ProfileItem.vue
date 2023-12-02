<template>
    <div>
        <router-link class="player-item" :to="'/profile/' + address">
            <div class="profile-mini" ref="profileMini"></div>
            <p>{{ user }}</p>
          </router-link>
    </div>
    
</template>

<style>
.player-item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #353535;
    text-decoration: underline;
    font-weight: bolder;
}
</style>

<script>
import jazzicon from '@metamask/jazzicon'

export default {
    props: {
        address: {
            type: String,
            required: true
        },
        alwaysShow: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        isYou() {
            console.log("is you", this.address?.toLowerCase(), this.$store.state.activeAccount.toLowerCase())
            return this.address?.toLowerCase() == this.$store.state.activeAccount.toLowerCase()
        },
        user() {
            if(this.isYou && !this.alwaysShow) {
                return "You"
            }else {
                return this.truncateAddress(this.address)
            }
        },
    },
    methods: {
        updateJazzicon() {
        const seed = parseInt(this.address?.slice(2, 10), 16); // Convert the address slice to a number
        const icon = jazzicon(32, seed); // Use the seed to generate the Jazzicon
        const profileMini = this.$refs.profileMini;
        profileMini.innerHTML = ''; // Clear previous jazzicon
        profileMini.appendChild(icon);
        console.log("updated jazzicon");
    },
        truncateAddress(address) {
            return address?.slice(0, 6) + "..." + address?.slice(-4)
        }
    },
    watch: {
        address: 'updateJazzicon'
    },
    mounted() {
        this.updateJazzicon();
    }
}
</script>
  
  