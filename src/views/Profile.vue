<template>
  <div class="content profile-view">
    <router-link class="back" to="/">
    </router-link>
      <div class="profile-big"></div>
      <p>User balance</p>
      <div style="display:flex; justify-content:center; gap:40px; align-items:end;">
        <h1 style="margin:0; margin-top: -50px; padding:0; align-items:end; margin-bottom:-20px; font-size: 100px;">
          <span
            class="currency-symbol"
          >$</span>
          {{this.balance?.toString().split(".")[0]}}
          <span
            class="decimals">
            .{{ this.balance?.toString().split(".")[1]?.substring(0,4)?? "00" }}
  
          </span>
        </h1>
        <div style="display:flex; gap:20px; align-items:end">
          <div class="earnings">
            <span
              class="currency-symbol"
            >$</span>
            {{this.earnings?.toString().split(".")[0]}}
            <span
              >
              .{{ this.earnings?.toString().split(".")[1]?.substring(0,4)?? "00" }}
    
            </span>
          </div>
          <p style="margin:0;">earned</p>
        </div>
      </div>
      <profile-item :address="address" />

  </div>
  <profile-game-list :games="games" />

</template>

<style>
.profile-big {
  width: 240px;
height: 240px;
flex-shrink: 0;
  border-radius: 240px;
background:  lightgray -105.215px 0px / 149.927% 100% no-repeat;
box-shadow: 0px 50px 120px 0px rgba(0, 0, 0, 0.08);
}

.profile-view{
  gap: 0px;
}


.earnings {
  text-align: center;
font-size: 32px;
font-family: Sen;
font-style: normal;
font-weight: 800;
line-height: normal;
display: flex;
gap: 0px;
align-items: end;
}
</style>

<script>
import ProfileItem from '@/components/ProfileItem.vue'
import ProfileGameList from '@/components/ProfileGameList.vue'
import { Outcomes } from '@/types'
export default {
  components: {
    ProfileItem,
    ProfileGameList
  },
  data() {

  },
  // mounted() {
  //   this.$store.dispatch('setBalanceOf', this.address)
  //   console.log("mounted")
  // },
  computed: {
    provider() {
      return this.$store.state.provider
    },
    address() {
      return this.$route.params.id
    },
    balance() {
      //call get balance function from store and passin address
      return this.$store.getters.balance(this.address)
    },
    truncatedAddress() {
      return this.address.substring(0, 6) + '...' + this.address.substring(this.address.length - 4, this.address.length)
    },
    games() {
      return Object.values(this.$store.state.games)
        .filter(
          game => 
            game.gameId != "0" &&
            (game.playerA.toLowerCase() == this.address.toLowerCase() || 
            game.playerA.toLowerCase() == this.address.toLowerCase())
        )
    },
    completedGames() {
      console.log("completed games", this.games.filter(game => game.outcome != Outcomes.None))
      return this.games.filter(game => game.outcome != Outcomes.None)
    },
    earnings(){
      let earnings = 0

      for (let game of this.completedGames) {
        const playerPoints = game.points[this.address.toLowerCase()]
        const won = playerPoints >= 3
        const bet = game.bet

        if (won) {
          earnings += bet
          console.log("won", bet)
        } else {
          earnings -= bet
          console.log("lost", bet)
        }

      }

      console.log("earnings", earnings)

      return earnings
    }


  },
  props: {

  },

  //output the value of move
  watch: {
    provider: {
      handler() {
        this.$store.dispatch('setBalanceOf', this.address)
      },
      immediate: true
    }
  }
}
</script>

