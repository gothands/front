<script setup>
import { Moves } from '../types';
import Rock from '../assets/Rock'
import Paper from '../assets/Paper'
import Scissors from '../assets/Scissors'
</script>
<template>
    <div class="flex justify-evenly">
        <div 
            class="p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray"
            :class="{rock: 'border-red-100'}"
            @click="onRock"
        >
            <GameMove move
        </div>
        <div 
            class="p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray"
            :class="{paper: 'border-red-100'}" 
            @click="onPaper"
        >
            <div v-html="Paper"></div>
        </div>
        <div 
            class="p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray"
            :class="{Scissors: 'border-red-100'}" 
            @click="onScissors"
        >
            <div v-html="Scissors"></div>
        </div>
    </div>
</template>

<script>
import { Moves } from '../types';
import GameMove from './GameMove.vue';

export default {
    components: {
        GameMove
    },
    props: {
        move: Number,
        onRock: Function,
        onPaper, Function,
        onScissors, Function
    },
    data(){
        return {
            rock: this.move == Moves.Rock,
            paper: this.move == Moves.Paper,
            scissors: this.move == Moves.Scissors
        }
    }
}
</script>

  