<template>
    <transition name="fade">
        <div class="modal-container" v-if="show">
            <div class="modal">
                <!-- Result text-->
                <h4 style="margin-top:60px" v-if="isStake">Stake<span style="color:#E19885; font-weight:bold;">HANDS</span> </h4>
                <h4 style="margin-top:60px" v-else>Unstake<span style="color:#E19885; font-weight:bold;">HANDS</span> </h4>

                <!-- Points ratio -->

                <!-- Buttons-->
                <div class="modal-button-holder">
                    <button
                    v-if="isStake"
                    class="button-dark"
                    @click="stakeFunction">
                        Stake
                    </button> 
                    <button
                    v-else
                    class="button-dark"
                    @click="stakeFunction">
                        Unstake
                    </button>
                    <button
                    class="button-light"
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
export default {
    model: {
        prop: 'show',
        event: 'update:show'
    },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        isStake: {
            type: Boolean,
            default: true
        },
        stakeFunction: {
            type: Function,
            default: () => {}
        }
    },
    methods: {
        toggleShow() {
            this.$emit('update:show', !this.show)
        }
    },

    //output the value of move
    created(){
        console.log(this.move)
    }
}
</script>

  