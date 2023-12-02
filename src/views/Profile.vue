<template>
  <div class="content profile-view">
    <router-link class="back" to="/">
    </router-link>
    <profile-icon class="profile-big" :address="address" :isLarge="true" />
      <p>Player history</p>
      <div class="profile-display">
        <h1 style="margin:0; margin-top: -50px; padding:0; align-items:end; margin-bottom:-20px; font-size: 100px;">
          
          {{this.balance?.toString().split(".")[0]}}
          <span
            class="decimals">
            .{{ this.balance?.toString().split(".")[1]?.substring(0,4)?? "00" }}
  
          </span>
          <span
            class="currency-symbol decimals"
            style="margin:0; margin-left:10px;"

          >ETH</span>
        </h1>
        <div style="display:flex; gap:20px; align-items:end">
          <div
            v-if="this.earnings > 0"
           class="earnings green">
            +{{this.earnings?.toString().split(".")[0]}}
            <span
              >
              .{{ this.earnings?.toString().split(".")[1]?.substring(0,4)?? "00" }}
    
            </span>
            <span
              class="green"
              style="margin-left:5px;"
            >ETH</span>
          </div>
          <div
            v-else-if="this.earnings <= 0"
           class="earnings red">
            {{this.earnings?.toString().split(".")[0]}}
            <span
              >
              .{{ this.earnings?.toString().split(".")[1]?.substring(0,4)?? "00" }}
    
            </span>
            <span
              class="red"
              style="margin-left:5px;"
            >ETH</span>
          </div>
          <p v-if="this.earnings > 0" class="green" style="margin:0;">earned</p>
          <p v-else-if="this.earnings <= 0" class="red" style="margin:0;">earned</p>

          
        </div>
        <div
              class="blue"
              >
              (-{{ this.feesGenerated?.toFixed(4).toString()}} ETH)
      </div>
      </div>
      <div class="points-button">{{points}} points</div>
      <profile-item :address="address" />

  </div>
  <profile-game-list :games="games" :address="address" />

</template>

<style>
.profile-big {
  width: 150px;
height: 150px;
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
import ProfileItem from '../components/ProfileItem.vue'
import ProfileIcon from '../components/ProfileIcon.vue'
import ProfileGameList from '../components/ProfileGameList.vue'
import { Outcomes } from '../types'
import RPC from '../web3RPC'
const APPLICATION_FEE = 0.05;

export default {
  components: {
    ProfileItem,
    ProfileGameList,
    ProfileIcon,
  },
  data() {
    return {
      balance: 0,
    }
  },
  async mounted() {
    this.$store.dispatch('setBalanceOf', this.address)
    const rpc = new RPC(this.$store.state.provider)
      //do this every 10 seconds
      const balance = await rpc.getBalanceOf(this.address)

      let balances = {...this.$store.state.balances}
      balances[this.address.toLowerCase()] = balance
      console.log("balances", balance)
      console.log("balances", balances)
      this.$store.commit('setBalances', balances)
      this.balance = balance
    console.log("mounted")
  },
  methods:{
    timeString(time){
        const currentTimeInSec = this.$store.state.currentTime
        return timeAgo(time, currentTimeInSec)
      },
      getBaseWinnings(bet){
        return bet
      },
      getWinnings(bet) {
        return (bet - (bet * 2 * APPLICATION_FEE)).toFixed(4)
      },
      getApplicationFee(game) {
        const bet = game.bet
        return bet * 2 * APPLICATION_FEE
      },
      getPlayerPoints(game, player){
        return game.points[player]
      },

      getBasePlayerWinnings(game, player){
        const bet = game.bet
        const winnings = this.getBaseWinnings(bet)
        const outcome = game.outcome
        const isPlayerA = player?.toLowerCase() === game.playerA?.toLowerCase()

        console.log("getting player winnings", game, player, winnings, outcome, isPlayerA)
        if (outcome == Outcomes.Cancelled) {
          console.log("cancelled")
          return 0
        } else if (outcome == Outcomes.PlayerALeft && isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerBLeft && isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerALeft && !isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerBLeft && !isPlayerA) {
          return -bet
        }
         else if (outcome == Outcomes.Draw) {
          return 0
        } else if (outcome == Outcomes.PlayerA && isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerB && isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerA && !isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerB && !isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerATimeout && isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerBTimeout && isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerATimeout && !isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerBTimeout && !isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.BothTimeout) {
          return 0
        }
      },

      getPlayerProtocolFees(game, player){
        const bet = game.bet
        const fee = this.getApplicationFee(game)
        const outcome = game.outcome
        
        const isPlayerA = player?.toLowerCase() === game.playerA?.toLowerCase()

        if (outcome == Outcomes.Cancelled) {
          console.log("cancelled")
          return 0
        } else if (outcome == Outcomes.PlayerALeft && isPlayerA) {
          return 0
        } else if (outcome == Outcomes.PlayerBLeft && isPlayerA) {
          return fee
        } else if (outcome == Outcomes.PlayerALeft && !isPlayerA) {
          return fee
        } else if (outcome == Outcomes.PlayerBLeft && !isPlayerA) {
          return 0
        }
         else if (outcome == Outcomes.Draw) {
          return 0
        } else if (outcome == Outcomes.PlayerA && isPlayerA) {
          return fee
        } else if (outcome == Outcomes.PlayerB && isPlayerA) {
          return 0
        } else if (outcome == Outcomes.PlayerA && !isPlayerA) {
          return 0
        } else if (outcome == Outcomes.PlayerB && !isPlayerA) {
          return fee
        } else if (outcome == Outcomes.PlayerATimeout && isPlayerA) {
          return 0
        } else if (outcome == Outcomes.PlayerBTimeout && isPlayerA) {
          return fee
        } else if (outcome == Outcomes.PlayerATimeout && !isPlayerA) {
          return fee
        } else if (outcome == Outcomes.PlayerBTimeout && !isPlayerA) {
          return 0
        } else if (outcome == Outcomes.BothTimeout) {
          return 0
        }
      },
      getPlayerWinnings(game, player){
        const bet = game.bet
        const winnings = this.getWinnings(bet)
        const outcome = game.outcome
        const isPlayerA = player?.toLowerCase() === game.playerA?.toLowerCase()

        console.log("getting player winnings", game, player, winnings, outcome, isPlayerA)
        if (outcome == Outcomes.Cancelled) {
          console.log("cancelled")
          return 0
        } else if (outcome == Outcomes.PlayerALeft && isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerBLeft && isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerALeft && !isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerBLeft && !isPlayerA) {
          return -bet
        }
         else if (outcome == Outcomes.Draw) {
          return 0
        } else if (outcome == Outcomes.PlayerA && isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerB && isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerA && !isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerB && !isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerATimeout && isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.PlayerBTimeout && isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerATimeout && !isPlayerA) {
          return winnings
        } else if (outcome == Outcomes.PlayerBTimeout && !isPlayerA) {
          return -bet
        } else if (outcome == Outcomes.BothTimeout) {
          return 0
        }
      },
  },
  computed: {
    provider() {
      return this.$store.state.provider
    },
    points(){
      return this.$store.getters.getPoints(this.address)
    },
    address() {
      return this.$route.params.id
    },
    truncatedAddress() {
      return this.address.substring(0, 6) + '...' + this.address.substring(this.address.length - 4, this.address.length)
    },
    games() {
      return Object.values(this.$store.state.games)
        .filter(
          game => 
            game.gameId != "0" &&
            (game.playerA.toLowerCase() == this.address.toLowerCase() || game.playerB.toLowerCase() == this.address.toLowerCase()) &&
            (game.outcome != Outcomes.None && game.outcome != Outcomes.Cancelled) &&
            (game.playerB != "" && game.playerA != "")
        )
        .sort((a, b) => parseInt(b.time ?? 0) - parseInt(a.time?? 0))
    },
    completedGames() {
      console.log("completed games", this.games.filter(game => game.outcome != Outcomes.None))
      return this.games.filter(game => game.outcome != Outcomes.None)
    },
    earnings(){
      let earnings = 0

      for (let game of this.games) {
        const playerWinnings = this.getBasePlayerWinnings(game, this.address)
        console.log("earnings value: for", this.address, playerWinnings, game.outcome)
        earnings += parseFloat(playerWinnings)
      }

      console.log("earnings", earnings)

      return earnings
    },

    feesGenerated(){
      let fees = 0

      for (let game of this.games) {
        const playerFees = this.getPlayerProtocolFees(game, this.address)
        console.log("fees value: for", this.address, playerFees, game.outcome)
        fees += parseFloat(playerFees)
      }

      console.log("fees", fees)

      return fees
    },


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
    },
    address: {
      async handler() {
        const rpc = new RPC(this.$store.state.provider)
      

      //do this every 10 seconds
        const balance = await rpc.getBalanceOf(this.address)

        let balances = {...this.$store.state.balances}
        balances[this.address.toLowerCase()] = balance
        console.log("balances", balance)
        console.log("balances", balances)
        this.$store.commit('setBalances', balances)
        this.balance = balance
    console.log("mounted")
      },
      immediate: true
    },
  }
}
</script>

