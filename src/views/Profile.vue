<template>
  <nav>
    <div class="title">
      Handsy.io
    </div> 
  </nav>
  <div>
    <router-link class="back" to="/"></router-link>
    <div class="content">
      <div class="profile-big"></div>
      <p>Your balance</p>
      <div style="display:flex;">
        <h1 style="margin:0; margin-bottom:22px;">
          <span
            class="currency-symbol"
          >$</span>
          {{this.balance?.toString().split(".")[0]}}
          <span
            class="decimals">
            .{{ this.balance?.toString().split(".")[1]?.substring(0,4)?? "00" }}
  
          </span>
        </h1>
        <div style="display:flex; gap:20px;">
          <h3 style="margin:0; margin-bottom:22px;">
            <span
              class="currency-symbol"
            >$</span>
            {{this.earnings?.toString().split(".")[0]}}
            <span
              class="decimals">
              .{{ this.earnings?.toString().split(".")[1]?.substring(0,4)?? "00" }}
    
            </span>
          </h3>
          <p>earned</p>
        </div>
      </div>
      <profile-item :address="address" />
      <profile-game-list :games="games" />
    </div>

  </div>
</template>

<style>
.back {
  position: absolute;
  left: 0;
  top: 0;
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
  mounted() {
    this.$store.dispatch('setBalanceOf', this.address)
    console.log("mounted")
  },
  computed: {
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
        const playerPoints = game.points[this.address]
        const won = playerPoints >= 3
        const bet = game.bet

        if (won) {
          earnings += bet
        } else {
          earnings -= bet
        }
      }

      return earnings
    }


  },
  props: {

  },

  //output the value of move
  created(){
    console.log(this.move)
  }
}
</script>

