<template>
    <div class="w-full">
      <div class="flex justify-between text-gray-800">
        <div v-for="step in steps" :key="step">{{ step }}</div>
      </div>
      <div class="flex items-center mt-2">
        <input type="range"
               :min="0"
               :max="steps.length - 1"
               v-model="sliderIndex"
               @input="valueChanged"
               class="slider w-full h-1 bg-gray-200 rounded-full outline-none appearance-none cursor-pointer" />
        <p class="ml-4 text-gray-800">{{ steps[sliderIndex] }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      steps: {
        type: Array,
        required: true
      },
      onValueChange: {
        type: Function,
        default: () => {}
      },
      value: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        sliderIndex: this.steps.indexOf(this.value),
      };
    },
    watch: {
      value(newVal) {
        this.sliderIndex = this.steps.indexOf(newVal);
      }
    },
    methods: {
      valueChanged() {
        this.onValueChange(this.steps[this.sliderIndex]);
      }
    }
  };
  </script>
  
  <style scoped>
  .slider::-webkit-slider-thumb {
    width: 25px;
    height: 25px;
    background: #4B5563;
    border-radius: 50%;
    appearance: none;
    cursor: pointer;
    transition: background .15s ease-in-out;
  }
  .slider::-webkit-slider-thumb:hover,
  .slider::-webkit-slider-thumb:active {
    background: #1F2937;
  }
  </style>
  