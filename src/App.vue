<template>
  <div>

    <Navbar />
    <div class="container-fluid">
      <div class="row">
        <main class="">

          <keep-alive>
            <router-view />
          </keep-alive>

        </main>
      </div>
    </div>

  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',
  components: {
    Navbar,
  }
}
</script>
