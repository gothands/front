<script setup>
import { Moves } from '../types';
</script>
<template>
  <div class="svg" v-if="move == Moves.Rock" v-html="Rock"></div>
  <div class="svg" v-else-if="move == Moves.Paper" v-html="Paper"></div>
  <div class="svg" v-else-if="move == Moves.Scissors" v-html="Scissors"></div>
  <div class="svg" v-else>None</div>
</template>

<style>
  svg {
    width: 100px;
    height: 100px;
  }
</style>

<script>
import Rock from '../assets/Rock.js'
import Paper from '../assets/Paper.js'
import Scissors from '../assets/Scissors.js'
import { onMounted } from 'vue';

export default {
  data() {
    return {
      Rock,
      Paper,
      Scissors
    }
  },
  props: {
    move: Number
  },

  //output the value of move
  created(){
    console.log(this.move)
  }
}
</script>

  