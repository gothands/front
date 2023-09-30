<template>
  <transition name="fade">
    <div class="modal-container" v-if="show">
      <div class="modal-add-funds">
        <funds-manager
          v-if="isBurner"
          :minimumFundsToAdd="minimumFundsToAdd"
          :callback="callback"
          :closeCallBack="toggleShow"
        ></funds-manager>
        <funds-manager-embedded
          v-else
          :minimumFundsToAdd="minimumFundsToAdd"
          :callback="callback"
          :closeCallBack="toggleShow"
        ></funds-manager-embedded>
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

.modal-container {
  width: 100vw;
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

.modal-add-funds {
  color: black;
  padding: 20px;
  max-width: 95vw;
  width: 1000px;
  position: fixed;
  align-self: center;
  border-radius: 48px;
  background: #fff;
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

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  transform: scale(0.9, 0.9) translatey(10%);
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
.trophy {
  margin-top: -100px;
}

.blur {
  filter: blur(10px) opacity(50%);
  transition: all 0.3s ease-in-out;
}
</style>

<script>
import FundsManager from "./FundsManager.vue";
import FundsManagerEmbedded from "./FundsManagerEmbedded.vue";
export default {
  data() {
    return {
      amount: 0,
    };
  },
  components: {
    FundsManager,
    FundsManagerEmbedded,
  },
  model: {
    prop: "show",
    event: "update:show",
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    minimumFundsToAdd: {
      type: Number,
      default: null,
    },
    callback: {
      type: Function,
      default: () => {},
    },
  },
  methods: {
    toggleShow() {
      this.$emit("update:show", !this.show);
      //call callback
      console.log("callers callback");
      this.callback(true);
    },
  },
  computed: {
    isBurner() {
      return this.$store.state.isMetamask;
    },
  },

  //output the value of move
  created() {
    console.log(this.move);
  },
};
</script>
