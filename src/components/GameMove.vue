<script setup>
import { Moves } from '../types';
</script>
<template>
  <div :class= "isSmall ? 'small' : isNormal ? 'normal' : 'large'" v-if="move == Moves.Rock" class="Rock"></div>
  <div :class= "isSmall ? 'small' : isNormal ? 'normal' : 'large'" v-else-if="move == Moves.Paper" class="Paper"></div>
  <div :class= "isSmall ? 'small' : isNormal ? 'normal' : 'large'" v-else-if="move == Moves.Scissors" class="Scissors"></div>
  <div :class= "isSmall ? 'small' : isNormal ? 'normal' : 'large'" v-else-if="move == Moves.LoadingMark" class="None" >
  </div>
  <div :class= "isSmall ? 'small' : isNormal ? 'normal' : 'large'" v-else-if="move == Moves.CheckMark" class="Rock" >
  </div>
</template>

<style>
  svg  {
    width: inherit;
    height: inherit;
  }

  .small {
    width: 32px;
    height: 32px;
    border: 1px solid #00000010;
    border-radius: 100px;
    box-shadow: 0px 0px 1px 0px #00000014;
  }

  .normal {
    cursor: pointer;
    width: 160px;
    height: 160px;
  }

  .normal:hover {
    cursor: pointer;
    width: 200px;
    height: 200px;
  }

  .large {
    width: 240px;
    height: 240px;
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
    move: Number,
    isSmall: {
      default: false
    },
    isNormal: {
      default: false
    },
  },

  //output the value of move
  created(){
    console.log(this.move)
  }
}
</script>

  