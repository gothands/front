<template>
  <transition name="fade">
    <div class="modal-container" v-if="show">
      <div class="modal">
        <h2>Connect your Twitter account</h2>
        <button class="button-light" @click="connectTwitter">Connect to Twitter</button>
        <button class="button-dark" @click="connectEthereum">Connect to Ethereum</button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { SiweModule } from '@siwe/api';
import Twitter from 'twitter-lite';

export default defineComponent({
  name: 'ModalConnectTwitter',
  props: {
    show: {
      type: Boolean,
      default: false
    },
  },
  setup() {
    const siwe = new SiweModule();
    const user = new Twitter({
      consumer_key: "your consumer key",
      consumer_secret: "your consumer secret",
      access_token_key: "user access token",
      access_token_secret: "user access token secret"
    });

    const connectTwitter = async () => {
        try {
          const response = await user.getBearerToken();
          if (response.token_type === 'bearer') {
            // Store the bearer token for future requests
            localStorage.setItem('twitter_bearer_token', response.access_token);
            // Prompt the user to sign in with Twitter
            window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${response.access_token}`;
          } else {
            throw new Error('Invalid token type, expected a bearer token');
          }
        } catch (error) {
          console.error('Failed to connect to Twitter:', error);
        }
    };

    const connectEthereum = async () => {
      const message = 'Your Twitter handle';
      const signature = await siwe.signMessage(message);
      const signer = await siwe.verifySignature(message, signature);
      // Store the association between the Twitter handle and the Ethereum address
    };

    return {
      connectTwitter,
      connectEthereum
    };
  }
});
</script>

<style scoped>
.modal-container {
  /* Add your modal styles here */
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.fade-enter, .fade-leave-to {
  transform: scale(0.9,0.9) translatey(10%);
  opacity: 0;
}

.button-light {
  /* Add your button styles here */
}

.button-dark {
  /* Add your button styles here */
}
</style>