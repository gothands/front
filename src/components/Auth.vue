<template>
    <div>
      <button
        v-if="!isUserConnected"
        class="bg-white text-blue-500 rounded-md px-4 py-1 mx-2"
        @click="connectWeb3Modal"
      >
        Connect
      </button>
      <div v-if="isUserConnected" class="flex items-center">
        <span class="text-blue-500 mx-2">{{ truncatedActiveAccount }}</span>
      </div>
    </div>
  </template>
  
  <script>
  import { mapGetters, mapActions } from "vuex";
  
  export default {
    name: "Auth",
    computed: {
      ...mapGetters("accounts", ["isUserConnected", "getActiveAccount", "getActiveBalanceEth"]),
      truncatedActiveAccount() {
        if (this.getActiveAccount) {
          return (
            this.getActiveAccount.slice(0, 6) +
            "..." +
            this.getActiveAccount.slice(-4)
          );
        }
        return "";
      },
    },
    methods: {
      ...mapActions("accounts", ["connectWeb3Modal"]),
    },
  };
  </script>
  