<template>
    <div class="content profile-view">
      <router-link class="back" to="/">
      </router-link>
        <h1>Rankings</h1>  
    </div>
    <ranking-list :rankings="rankings" />
  
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
  import RankingList from '@/components/RankingList.vue'
  
  export default {
    components: {
      RankingList,
    },
    data() {
      return {
        balance: 0,
      }
    },
    async mounted() {
    },
    methods:{

    },
    computed: {
        provider() {
            return this.$store.state.provider
        },
        address() {
            return this.$route.params.id
        },
        truncatedAddress() {
            return this.address.substring(0, 6) + '...' + this.address.substring(this.address.length - 4, this.address.length)
        },
        //loop through list of profiles and rank them by points
        rankings() {
          console.log("profile list", this.$store.state.profiles)
          return Object.values(this.$store.state.profiles)
            .sort((a, b) => b.points - a.points)
        },
  
    },
    props: {
  
    },
  
    //output the value of move
    watch: {
      
    }
  }
  </script>
  
  