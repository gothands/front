<script setup>
import { Moves } from '../types';
</script>
<template>
  <div class="svg" v-if="move == Moves.Rock" v-html="Rock"></div>
  <div class="svg" v-else-if="move == Moves.Paper" v-html="Paper"></div>
  <div class="svg" v-else-if="move == Moves.Scissors" v-html="Scissors"></div>
  <div class="svg" v-else-if="move == Moves.LoadingMark" >
    <svg version="1.1" id="L9" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
  viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
    <path fill="#000"
    d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
      <animateTransform 
         attributeName="transform" 
         attributeType="XML" 
         type="rotate"
         dur="1s" 
         from="0 50 50"
         to="360 50 50" 
         repeatCount="indefinite" />
  </path>
</svg>
  </div>
  <div class="svg" v-else-if="move == Moves.CheckMark" >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>
  </div>
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

  