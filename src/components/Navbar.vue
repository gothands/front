<template>
  <nav class="bg-blue-500 px-6 py-2 shadow-md h-16">
    <div class="flex justify-between items-center h-full">
      <div class="flex items-center">
        <div v-html="logo" class="h-10 w-10 text-white mr-2"></div>
        <div class="font-bold text-xl">Handsy.io</div>
      </div>
      <div class="flex items-center">
        <Network />
        <Auth />
      </div>
    </div>
  </nav>
</template>

<script>
import logo from "../assets/logo.js";
import Auth from "./Auth.vue";
import Network from "./Network.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      logo,
    };
  },
  components: {
    Auth,
    Network,
  },
  name: "Navbar",
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "isUserConnected", "getWeb3Modal"]),
  },
  created() {
    this.$store.dispatch("accounts/initWeb3Modal");
    this.$store.dispatch("accounts/ethereumListener");
    this.$store.dispatch("accounts/pollActiveBalance");
  },
  methods: {
    ...mapActions("accounts", ["connectWeb3Modal", "disconnectWeb3Modal"]),
  }
}
</script>
