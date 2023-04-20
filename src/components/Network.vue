<template>
    <select
      class="bg-white text-blue-500 rounded-md px-4 py-1"
      v-model="selectedChainId"
      @change="switchChain(selectedChainId)"
    >
      <option v-for="chain in chains" :key="chain.id" :value="chain.id">
        {{ chain.name }}
      </option>
    </select>
  </template>
  
  <script>
  import { mapState, mapActions } from "vuex";
  
  export default {
    name: "Network",
    computed: {
      ...mapState("accounts", ["chainId", "chainName"]),
      selectedChainId: {
        get() {
            console.log("chainName", this.chainName)
            console.log("this.chainId", this.chainId)
            console.log("parsed chainId", parseInt(this.chainId, 16))
            return parseInt(this.chainId, 16);
        },
        set(value) {
          this.switchChain(value);
        },
      },
      chains() {
        return [
          { id: 1, name: "Mainnet" },
          { id: 3, name: "Ropsten" },
          { id: 4, name: "Rinkeby" },
          { id: 5, name: "Goerli" },
          { id: 42, name: "Kovan" },
          { id: 270, name: "ZkSync Local" },
          { id: 31337, name: "Localhost" },
        ];
      },
    },
    methods: {
      ...mapActions("accounts", ["switchChainById"]),
      async switchChain(chainId) {
        await this.switchChainById(parseInt(chainId, 10));
      },
    },
  };
  </script>
  