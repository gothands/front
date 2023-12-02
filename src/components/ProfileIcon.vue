<template>
    <div 
    ref="profileAppend"
    class="profile-icon"
    style="border-radius: 10000px;"
    ></div>
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

.profile-icon div {
    border-radius: 1000px !important;
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
        isMini: {
            type: Boolean,
            default: false
        },
        isSuperMini: {
            type: Boolean,
            default: false
        },
        isMedium: {
            type: Boolean,
            default: false
        },
        isLarge: {
            type: Boolean,
            default: false
        },
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
            console.log("isSuperMini", this.isSuperMini)
            const size = this.isMini ? 32 : this.isMedium ? 72 : this.isLarge ? 160 : this.isSuperMini ? 20 : 32;
            const icon = jazzicon(size, seed); // Use the seed to generate the Jazzicon
            const profileMini = this.$refs.profileAppend;
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
  
  