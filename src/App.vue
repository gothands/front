<template>
  <div>
    <Navbar />

    <main class="w-full flex custom-center items-center">
      <keep-alive>
        <router-view />
      </keep-alive>
    </main>
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
