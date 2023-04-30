<template>
  <div style="width: 100%; height:100%;">
    <Navbar />

      <keep-alive>
        <router-view />
      </keep-alive>
  </div>
</template>

<style>
.custom-center {
  display: flex;
  justify-content: center;
}
</style>

<script>
import Navbar from "./components/Navbar.vue";

export default {
  name: "App",
  components: {
    Navbar,
  },
};
</script>
