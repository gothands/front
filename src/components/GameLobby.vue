<script setup>
import { Moves, GameStates } from '../types';

function gameStateToString(state) {
    if(state == GameStates.Waiting)
        return "Waiting"
    if(state == GameStates.Sending)
        return "Sending move"
    if(state == GameStates.Revealing)
        return "Revealing move"
    if(state == GameStates.Revealed)
        return "Revealed move"
    if(state == GameStates.Matched)
        return "Matched with opponent"
    if(state == GameStates.Initial)
        return ""
    if(state == GameStates.Finished)
        return "Game complete"
    
    return ""
    
}
</script>
<template>
    <div class="flex justify-evenly">
        <div class="p-20 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray">
            <div class="flex flex-column">
                <p>{{ gameStateToString(state) }}</p>
                <GameMove :move="move"/>
            </div>
            
        </div>
        <h1>VS</h1>
        <div class="p-20 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray">
            <div class="flex flex-column">
                <p>{{ gameStateToString(opponentState) }}</p>
                <GameMove :move="opponentMove"/>
            </div>
            
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
        state: Number,
        opponentMove: Number,
        opponentState: Number,
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

  