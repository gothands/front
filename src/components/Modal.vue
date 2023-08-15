<template>
    <transition name="fade">
        <div class="modal-container" v-if="show">
            <div class="modal">
                <div class="trophy" v-if="isWinner"></div>

                <!-- Result text-->
                <h4 v-if="isWinner">You won! <span style="color:#E19885; font-weight:bold;"> {{getWinnings(bet)}} ETH</span>  <span style="color:#c5edff; font-weight:bold;"> (-{{getApplicationFee(bet)}} ETH)</span> </h4>
                <h4 v-else style="margin-top:60px" >You lose! <span style="color:#E19885; font-weight:bold;">$ {{bet}}</span> </h4>

                <p v-if="isLeaver && !noOneLeft">You left the game! <span style="color:#E19885; font-weight:bold;">$ {{bet}}</span> </p>
                <p v-else-if="opponentIsLeaver && !noOneLeft">Your opponent left the game! <span style="color:#E19885; font-weight:bold;">$ {{bet}}</span> </p>

                <!-- Points ratio -->
                <h1 style="margin:0; margin-bottom:24px; padding:0;" v-if="isWinner"><span style="color:#E19885">{{winnerPoints}}</span> : {{loserPoints}}</h1>
                <h1 style="margin:0; margin-bottom:24px; padding:0;" v-else><span style="color:#E19885">{{loserPoints}}</span> : {{winnerPoints}}</h1>

                <!-- Buttons-->
                <div class="modal-button-holder">
                    <button
                    class="button-light"
                    @click="toggleShow">
                        Homepage
                    </button> 
                    <button
                    class="button-dark"
                    @click="toggleShow">
                        Close
                    </button>
                </div>
                
            </div>
        </div>
    </transition>
</template>
<style scoped>  
  
  h4 {
    margin: 0;
    color: #353535;
text-align: center;
font-size: 40px;
font-family: Sen;
font-style: normal;
font-weight: 400;
line-height: normal;
  }
  
  .modal-container{
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0px;
    left: 0px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.5);  
    z-index: 1000000000;
  }
  
  .modal {
    color: black;
    padding: 20px;
    width: auto;
    position: fixed;
    align-self: center;
    border-radius: 48px;
background: #FFF;
width: 678px;
flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .modal-button-holder {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    width: 100%;
  }
  
  .fade-enter-active, .fade-leave-active {
    transition: all 0.3s ease-in-out;
  }
  
  .fade-enter, .fade-leave-to {
    transform: scale(0.9,0.9) translatey(10%);
    opacity: 0;
  }

  .modal-container h1 {
text-align: center;
font-size: 80px;
font-family: Sen;
font-style: normal;
font-weight: 800;
line-height: normal;
  }
  
  .bk {
    
  }
  .trophy{
    margin-top: -100px;
  }
  
  .blur {
    filter: blur(10px) opacity(50%);
    transition: all 0.3s ease-in-out;

  }
</style>

<script>
const APPLICATION_FEE = 0.05;

export default {
    model: {
        prop: 'show',
        event: 'update:show'
    },
    props: {
      player: {
        type: String,
        default: null
      },
      show: {
          type: Boolean,
          default: false
      },
      win: {
          type: Boolean,
          default: true
      },
      winnerPoints: {
          type: Number,
          default: 0
      },
      loserPoints: {
          type: Number,
          default: 0
      },
      bet: {
          type: Number,
          default: 0
      },
      leaver: {
          type: String,
          default: null
      }
    },
    methods: {
      getWinnings(bet) {
        return (bet - (bet * 2 * APPLICATION_FEE)).toFixed(4)
      },
      getApplicationFee(bet) {
        return bet * 2 * APPLICATION_FEE
      },
      toggleShow() {
        this.$emit('update:show', !this.show)
      },
      
            
    },

    computed: {
      isWinner(){
        return this.win || (this.leaver != null && this.leaver.toLowerCase() != this.player.toLowerCase())
      },
      isLeaver(){
        console.log("Modal stats: isLeaver: " + this.leaver + " player: " + this.player)
        return this.leaver.toLowerCase() == this.player.toLowerCase()
      },
      opponentIsLeaver(){
        console.log("Modal stats: isLeaver: " + this.leaver + " player: " + this.player)
        return this.leaver.toLowerCase() != this.player.toLowerCase() && this.leaver != null
      },
      noOneLeft(){
        console.log("Modal stats: isLeaver: " + this.leaver + " player: " + this.player)
        return this.leaver == null
      }
    },

    //output the value of move
    created(){
        console.log(this.move)
    }
}
</script>

  