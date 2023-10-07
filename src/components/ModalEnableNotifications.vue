<template>
    <transition name="fade">
        <div class="modal-container" v-if="show">
            <div class="modal">
                <!-- Enable notifications text-->
                <h2 style="margin-top:60px">Enable notifications </h2>

                <p style="margin-top:20px; margin-bottom:20px;">Enable notifications within your browser to receive updates on in game activities.</p>

                <!-- Buttons-->
                <div class="modal-button-holder">
                    <button
                    class="button-dark"
                    style="width: 200px;"
                    @click="enableNotifications">
                        Enable
                    </button> 
                    <button
                    class="button-light"
                    @click="close">
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
    max-width: 95vw;
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
    methods: {
      enableNotifications() {this.$store.dispatch('requestNotificationPermission')},   
      close() {this.$store.commit('setIsNotificationsEnabled', true)},   
    },
    computed: {
        show() {return !this.$store.state.isNotificationsEnabled && this.$store.state.loggedin},
    },

    //output the value of move
    created(){
        console.log(this.move)
    }
}
</script>

  