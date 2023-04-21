<script setup>
import { Moves } from '../types';
import Rock from '../assets/Rock'
import Paper from '../assets/Paper'
import Scissors from '../assets/Scissors'
</script>
<template>
  <div v-if="hand == Moves.Rock" v-html="Rock"></div>
  <div v-else-if="hand == Moves.Paper" v-html="Paper"></div>
  <div v-else-if="hand == Moves.Scissors" v-html="Scissors"></div>
</template>

<script>
export default {
  props: {
    move: Number
  }
}
</script>

  