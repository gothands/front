<template>
  <div 
      style="gap:50px"
      class="content staking-view">
      <router-link class="back" to="/">
      </router-link>
      <div style="margin-bottom:56;" class="profile-big"></div>
      <p >Your Affiliate Rewards</p>
      <div style="display:flex; justify-content:center; gap:40px; align-items:end;">
      <h1 style="margin:0; margin-top: -20px; margin-bottom:70px; padding:0; align-items:end; margin-bottom:-20px; font-size: 100px;">
          {{this.claimableEthForAffiliate?.toString().split(".")[0]}}.{{ this.claimableEthForAffiliate?.toString().split(".")[1]?.substring(0,4)?? "00" }}
          <span
              style="font-size: 50px;"
              class="currency-symbol"
          >ETH</span>
      </h1>
      </div>
      <div style="display: flex; margin-top:60px; margin-bottom:90px;">
        <button 
            @click="claimAffiliateRewards"
          class="button-dark"
        >
          Claim Rewards
        </button>
        <button
          @click="copyAffiliateLink"
          class="button-light"
        >
          Copy Link
        </button>
  
      </div>

          
  
    <div>
      <p>Your Onboarded Users</p>
      <list-affiliate
        :events="onboardedConsumerList"
        :address="activeAccount"
      ></list-affiliate>
      </div>
  <div>
    
      Staking screen

      <div>
        <div>Hands token balance : {{handsTokenBalance}}</div>

        <div>Your staked amount : {{handsStakedBalance}}</div>
        <div>Share of total hands staked : {{(handsStakedBalance / totalHandsStakedBalance) * 100}}%</div>
        <div>Your claimable ETH for staking : {{claimableEthForStaking}}</div>
        <div>Protocol fee revenue : {{protocolFeeRevenue}}</div>
        <div>Protocol affiliate revenue : {{protocolAffiliateRevenue}}</div>
        <div>Total hands staked balance : {{totalHandsStakedBalance}}</div>

        <div>Your onboarded addresses : 
          <div v-for="address in onboardedAddresses" :key="address">
            {{address}}
          </div>
        </div>
        <div>Claimable Affiliate rewards : {{claimableEthForAffiliate}}</div>
        <div>Your affiliate link : {{affiliateLink}}</div>
      </div>

      <button @click="stake">Stake 10 HANDS</button>
      <button @click="unstake">Unstake 10 HANDS</button>
      <button @click="claim">Claim Staking Rewards</button>
      <button @click="claimAffiliateRewards">Claim Affiliate Rewards</button>
      <!-- <button @click="removeLiquidity">Remove Liquidity 10 WETH - 10 HANDS</button> -->
      <!-- <button @click="stakeLiquidity">Stake Liquidity</button> -->
      <!-- <button @click="stakeHands">Stake 100 Hands</button> -->
      <!-- <button @click="unstakeHands">Unstake Hands</button> -->

  </div>
  </div>

  <modal-stake 
  v-model:show="showModal"
  v-model:isStake="isStake"
  v-modal:stakeFunction="stakeFunction"
>
  Hello world
  </modal-stake>
</template>

<style>
.profile-big {
width: 240px;
height: 240px;
flex-shrink: 0;
border-radius: 240px;
background:  #E9E9E9 -105.215px 0px / 149.927% 100% no-repeat;
box-shadow: 0px 50px 120px 0px rgba(0, 0, 0, 0.08);
}

.staking-view{
}

.staking-view p {
  color: #000;
text-align: center;
font-size: 24px;
font-family: Sen;
font-style: normal;
font-weight: 400;
line-height: 160%;
}

.staking-view h1 {
  margin: 0;
}

.staking-view h2 {
  color: #353535;
text-align: center;
font-size: 60px;
font-family: Sen;
font-style: normal;
font-weight: 10000;
line-height: normal;
letter-spacing: -3px;
margin: 0;
}

.staking-view p {
  margin: 0;
}




.earnings {
text-align: center;
font-size: 32px;
font-family: Sen;
font-style: normal;
font-weight: 800;
line-height: normal;
display: flex;
gap: 0px;
align-items: end;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  border-radius: 24px;
  background: #FFF;
  padding: 100px;
  width: 514px;

}


</style>

  
<script>

  import RPC from "../web3RPC";
  
  import { Moves, Outcomes, GameStates } from "../types";
  import Hands from "../contracts/Hands.json";
  import Web3 from "web3";
  import { sha256 } from "js-sha256";
  
  import mainContracts from "../../../contracts/local-contracts.json"
import GameMove from '@/components/GameMove.vue';
import ModalStake from '@/components/ModalStake.vue';
import ListAffiliate from '@/components/ListAffiliate.vue';
  
  //EXAMPLE Game.
  // {
  //   gameId: "0x111C3E89Ce80e62EE88318C2804920D4c96f92bb",
  //   playerA: "0x111C3E89Ce80e62EE88318C2804920D4c96f92bb",
  //   playerB: "0x111C3E89Ce80e62EE88318C2804920D4c96f92bb",
  //   states: {}
  
  //   betAmount: 1,
  //   moveA: 1,
  //   moveB: 2,
  //   outcome: 2, // 0 = draw, 1 = playerA wins, 2 = playerB wins
  // }
  
  
  function generateRandomString() {
    return Math.random().toString(36).substring(2, 15);
  }
  
  function calcWinner(moveA, moveB) {
    if (moveA == moveB) {
      return Outcomes.Draw;
    }
  
    if (moveA == Moves.Rock) {
      if (moveB == Moves.Paper) {
        return Outcomes.PlayerB;
      } else {
        return Outcomes.PlayerA;
      }
    }
  
    if (moveA == Moves.Paper) {
      if (moveB == Moves.Scissors) {
        return Outcomes.PlayerB;
      } else {
        return Outcomes.PlayerA;
      }
    }
  
    if (moveA == Moves.Scissors) {
      if (moveB == Moves.Rock) {
        return Outcomes.PlayerB;
      } else {
        return Outcomes.PlayerA;
      }
    }
  }
  
  export default {
    components: {
          ModalStake,
          ListAffiliate,
    },
  //   props: {
  //     provider: {
  //       type: String,
  //       default: null,
  //     },
  //   },
    data() {
      return {
        stakingContract: null,
        handsTokenContract: null,
        affiliateContract: null,

        activeAccount: null,

        handsTokenBalance: 0,

        handsStakedBalance: 0,
        totalHandsStakedBalance: 0,
        stakerAmount: 0,

        claimableEthForStaking: 0,
        claimableEthForAffiliate: 0,

        affiliateLink: null,
        onboardedAddresses: [],

        protocolFeeRevenue: 0,

        //userSharePerBlock: null,
        totalStakedPerBlock: null,

        showModal:false,
        isStake:false,
        stakeFunction: ()=>{console.log("stakeFunction")},

        yourConsumers: [],
        timeConsumerJoined: {},
        totalRewardsFromConsumer: {},
        rewardsArrayFromConsumer: {},
        recivedFundsList : [],

          consumerRegisteredEvents: [],
          rewardRecievedEvents: [],
          handledEventIds: new Set(),

      };
    },
    computed: {
      provider() { return this.$store.state.provider },
      getActiveAccount() { return this.activeAccount?.toLowerCase()},
      getWeb3() {return new Web3(this.provider);},
      onboardedConsumerList(){
        return this.yourConsumers.map((consumer) => {
          return {
            user: consumer,
            totalRevenue: this.totalRewardsFromConsumer[consumer],
            revenueTimestamps: this.rewardsArrayFromConsumer[consumer],
            timestamp: this.timeConsumerJoined[consumer],
          };
        });
      },
    },
    mounted() {
      console.log("provider", this.provider)
      console.log("mainContracts", mainContracts)

    },
    watch: {
      provider: {
          handler(newProvider, oldProvider) {
              console.log('provider changed', newProvider);
              if(newProvider){
                  console.log('provider changed', newProvider);
                  this.init()
              }
          },
          immediate: true
      }
  },
    methods: {
      //copy affiliate link to clipboard
    //affiliate link is the current url with the user's address appended to the end as a query string
    copyAffiliateLink() {
      const url = new URL(window.location.href);
      url.searchParams.set("ref", this.activeAccount);
      navigator.clipboard.writeText(url.href);
      alert("Copied to clipboard!");
    },
        async init(){
            await this.setAccount();
            await this.setContracts();
            this.setHandsTokenBalance();
            this.setHandsStakedBalance();
            this.setTotalHandsStakedAmount();
            this.setClaimableEthForStaking();
            this.setClaimableEthForAffiliate();
            this.setProtocolFeeRevenue();

            this.fetchPastEvents();
            this.subscribeToEvents();



            // this.getWETHAddress();
            // this.getToken0Address();
            // this.getToken1Address();
            // this.getReserve0();
            // this.getReserve1();
        },
        async setAccount() {
            const accounts = await this.getWeb3.eth.getAccounts();
            console.log("accounts", accounts);
            this.activeAccount = accounts[0];
        },
        async setContracts() {


          //Set staking contract
          this.stakingContract = new this.getWeb3.eth.Contract(
              mainContracts.deployedAbis.Staking,
              mainContracts.deployedContracts.Staking
          );

          //Set HandsToken contract
          this.handsTokenContract = new this.getWeb3.eth.Contract(
              mainContracts.deployedAbis.HandsToken,
              mainContracts.deployedContracts.HandsToken
          );

          //Set Affiliate contract
          this.affiliateContract = new this.getWeb3.eth.Contract(
              mainContracts.deployedAbis.Affiliate,
              mainContracts.deployedContracts.Affiliate
          );

        },

        async setHandsTokenBalance() {
          if(!this.handsTokenContract) return 0;

          const balance = await this.handsTokenContract.methods.balanceOf(this.activeAccount).call();
          this.handsTokenBalance = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.handsTokenContract.methods.balanceOf(this.activeAccount).call();
            this.handsTokenBalance = balance / 10 ** 18;
          }, 5000);
        },

        async setHandsStakedBalance(){
          if(!this.stakingContract) return 0;

          const balance = await this.stakingContract.methods.stakedAmount(this.activeAccount).call();
          this.handsStakedBalance = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.stakingContract.methods.stakedAmount(this.activeAccount).call();
            this.handsStakedBalance = balance / 10 ** 18;
          }, 5000);
        },

        async setTotalHandsStakedAmount(){
          if(!this.stakingContract) return 0;

          const balance = await this.stakingContract.methods.viewTotalStaked().call();
          this.totalHandsStakedBalance = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.stakingContract.methods.viewTotalStaked().call();
            this.totalHandsStakedBalance = balance / 10 ** 18;
          }, 5000);
        },

        async setClaimableEthForStaking(){
          if(!this.stakingContract) return 0;

          const balance = await this.stakingContract.methods.viewClaimableRewards(this.activeAccount).call();
          this.claimableEthForStaking = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.stakingContract.methods.viewClaimableRewards(this.activeAccount).call();
            this.claimableEthForStaking = balance / 10 ** 18;
          }, 5000);
        },
        async setClaimableEthForAffiliate(){
          if(!this.affiliateContract) return 0;

          const balance = await this.affiliateContract.methods.viewClaimableRewards(this.activeAccount).call();
          this.claimableEthForAffiliate = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.affiliateContract.methods.viewClaimableRewards(this.activeAccount).call();
            this.claimableEthForAffiliate = balance / 10 ** 18;
          }, 5000);
        },
        async setOnboardedAddresses(){
          if(!this.affiliateContract) return 0;

          const balance = await this.affiliateContract.methods.getConsumersOfAffiliate(this.activeAccount).call();
          this.onboardedAddresses = balance;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.affiliateContract.methods.getConsumersOfAffiliate(this.activeAccount).call();
            this.onboardedAddresses = balance;
          }, 5000);
        },

        async setProtocolFeeRevenue(){
          //Get the balance of the Bank contract
          const balance = await this.getWeb3.eth.getBalance(mainContracts.deployedContracts.Bank);
          this.protocolFeeRevenue = balance / 10 ** 18;

          //Poll for balance every 5 seconds
          setInterval(async () => {
            const balance = await this.getWeb3.eth.getBalance(mainContracts.deployedContracts.Bank);
            this.protocolFeeRevenue = balance / 10 ** 18;
          }, 5000);
        },

        // async setUserSharePerBlock(){
        //   if(!this.stakingContract) return 0;

          
        //   const currentBlock = await this.getWeb3.eth.getBlockNumber();
        //   this.userSharePerBlock = await this.stakingContract.methods.getUserShareAtBlock(this.activeAccount, currentBlock).call();
        //   console.log(userSharesPerBlock);

        //   //Poll for balance every 5 seconds
        //   setInterval(async () => {
        //     const currentBlock = await this.getWeb3.eth.getBlockNumber();
        //     this.userSharePerBlock = await this.stakingContract.methods.getUserShareAtBlock(this.activeAccount, currentBlock).call();
        //     console.log(userSharesPerBlock);
        //   }, 5000);
        // },
        
        
          
 
        
        async stake() {
          // Call the stake method
          try {
            const gasPrice = this.getWeb3.utils.toWei("0.1", "gwei");
            const gasLimit = 30000000;

            // give allowance to staking contract
            const tx1 = await this.handsTokenContract.methods.approve(
              mainContracts.deployedContracts.Staking,
              this.getWeb3.utils.toWei("10", "ether")
            ).send({ from: this.activeAccount, gasPrice, gasLimit });
            

            const tx = await this.stakingContract.methods.stake(
              this.getWeb3.utils.toWei("10", "ether")
            ).send({ from: this.activeAccount, gasPrice, gasLimit });
            
            // Wait for the transaction to be mined
            await this.getWeb3.eth.getTransactionReceipt(tx.transactionHash);
            
            // Transaction was successful if we made it here
            console.log('Staked', tx);
            return tx;
          } catch (error) {
            // Log more detailed information about the error
            console.error('Error staking. Message:', error.message);
            
            // Log error reason if available. This can be the error message from a require statement in a smart contract
            if (error.reason) {
              console.error('Error reason:', error.reason);
            }
            
            // Log the error stack trace for debugging
            console.error('Error stack trace:', error.stack);
            
            return error;
          }
        },


        async unstake() {
          // Call the unstake method
          try {
            const gasPrice = this.getWeb3.utils.toWei("0.1", "gwei");
            const gasLimit = 3000000;

            const tx = await this.stakingContract.methods.unstake(
              this.getWeb3.utils.toWei("10", "ether")
            ).send({ from: this.activeAccount, gasPrice, gasLimit });
        
            // Wait for the transaction to be mined
            await this.getWeb3.eth.getTransactionReceipt(tx.transactionHash);
        
            // Transaction was successful if we made it here
            console.log('Unstaked', tx);
            return tx;
          } catch (error) {
            console.log('Error unstaking', error);
            return error;
          }
        },

        showStakeModal() {
            this.showModal = true;
            this.isStake = true;
            this.stakeFunction = this.stake;
          },

          showUnstakeModal() {
            this.showModal = true;
            this.isStake = false;
              this.stakeFunction = this.unstake;
          },

        async claim() {
          // Call the claim method
          try {
            const gasPrice = this.getWeb3.utils.toWei("0.1", "gwei");
            const gasLimit = 3000000;

            const tx = await this.stakingContract.methods.claimRewards().send({ from: this.activeAccount, gasPrice, gasLimit });
        
            // Wait for the transaction to be mined
            await this.getWeb3.eth.getTransactionReceipt(tx.transactionHash);
        
            // Transaction was successful if we made it here
            console.log('Claimed', tx);
            return tx;
          } catch (error) {
            console.log('Error claiming', error);
            return error;
          }
        },

        async claimAffiliateRewards() {
          // Call the claim method
          try {
            const gasPrice = this.getWeb3.utils.toWei("0.1", "gwei");
            const gasLimit = 3000000;

            const tx = await this.affiliateContract.methods.claimRewards().send({ from: this.activeAccount, gasPrice, gasLimit });
        
            // Wait for the transaction to be mined
            await this.getWeb3.eth.getTransactionReceipt(tx.transactionHash);
        
            // Transaction was successful if we made it here
            console.log('Claimed', tx);
            return tx;
          } catch (error) {
            console.log('Error claiming', error);
            return error;
          }
        },

        async registerAsConsumer() {
          // Use an empty bytes data
          const data = '0x';
        
        
          // No callback
          const callback = '0x0000000000000000000000000000000000000000';
          const callbackData = '0x';
        
          // Call the addLiquidity method
          try {
            const gasPrice = this.getWeb3.utils.toWei("0.1", "gwei");
            const gasLimit = 3000000;

            const tx = await this.affiliateContract.methods.registerAsConsumer(
              '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
            ).send({ from: this.activeAccount, gasPrice, gasLimit });
        
            // Wait for the transaction to be mined
            
        
            // Transaction was successful if we made it here
            console.log('Registered as consumer', tx);
            return tx;
          } catch (error) {
            console.log('Error registering as a consumer:', error);
            throw error;
          }
        },


        async handleConsumerRegisteredEvent(event) {
          console.log('Consumer registered event', event);

          const { consumer, affiliate } = event.returnValues;
          const block = await this.getWeb3.eth.getBlock(event.blockNumber);
            const timestamp = block.timestamp;

          //check if user is affiliate, if so add to consumer list
          if (affiliate.toLowerCase() === this.activeAccount.toLowerCase()) {
            this.yourConsumers.push(consumer);
            this.timeConsumerJoined[consumer] = timestamp;
          }
          
        },

        async handleRewardRecievedEvent(event) {
          console.log('Reward recieved event', event);

          const { affiliate, consumer, amount } = event.returnValues;
          const block = await this.getWeb3.eth.getBlock(event.blockNumber);
          const timestamp = block.timestamp;

          //append reward amount to totalRewardsForConsumer object
          if (this.totalRewardsFromConsumer[consumer]) {
            this.totalRewardsFromConsumer[consumer] += parseInt(amount);
          } else {
            this.totalRewardsFromConsumer[consumer] = parseInt(amount);
          }
          
          //append reward amount to rewardsArrayFromConsumer
          if (this.rewardsArrayFromConsumer[consumer]) {
            this.rewardsArrayFromConsumer[consumer].push({
              amount:parseFloat(amount),
              timestamp,
            });
          } else {
            this.rewardsArrayFromConsumer[consumer] = [parseInt(amount)];
          }
          
        },

        async subscribeToEvents() {
    const contract = this.affiliateContract;
    const userAddress = this.activeAccount;

    console.log("Polling for events...");
    console.log("contract:", contract);

    const eventNames = [
      "ConsumerRegistered",
      "RewardRecieved",
    ];

    const eventHandlers = {
      ConsumerRegistered: this.handleConsumerRegisteredEvent,
      RewardRecieved: this.handleRewardRecievedEvent,
    };

    const pollingInterval = 1000; // Poll every 5 seconds

    let lastBlockChecked = await this.getBlockNumber()

    // Create a new set for keeping track of handled event ids

    setInterval(async () => {
      const currentBlock = await this.getBlockNumber();

      for (const eventName of eventNames) {
        const events = await contract.getPastEvents(eventName, {
          fromBlock: lastBlockChecked + 1,
          toBlock: currentBlock,
        });

        events.forEach((event) => {
          const eventId = `${event.transactionHash}-${eventName}-${event.logIndex}`;

          if (this.handledEventIds.has(eventId)) { return }

          console.log(`New ${eventName} event detected:`, event);
          eventHandlers[eventName].call(this, event, userAddress);

          this.handledEventIds.add(eventId);
        });
      }

      lastBlockChecked = currentBlock;
      console.log("lastBlockChecked:", lastBlockChecked);
    }, pollingInterval);
  },

  async fetchConsumerRegisteredEvents(startBlock, endBlock) {
    const blockLimit = 50000;
    const contract = this.affiliateContract;

    this.consumerRegisteredEvents = [];

    let fromBlock = startBlock;
    let toBlock = Math.min(fromBlock + blockLimit, endBlock);

    while (fromBlock <= endBlock) {
      console.log(`Fetching ConsumerRegistered events from blocks ${fromBlock} to ${toBlock}...`);

      const events = await contract.getPastEvents("ConsumerRegistered", {
        fromBlock,
        toBlock,
      });

      this.consumerRegisteredEvents.push(...events)

      fromBlock = toBlock + 1;
      toBlock = Math.min(fromBlock + blockLimit, endBlock);
    }
  },

      async fetchRewardRecievedEvents(startBlock, endBlock) {
        const blockLimit = 50000;
        const contract = this.affiliateContract;

        this.rewardRecievedEvents = [];

        let fromBlock = startBlock;
        let toBlock = Math.min(fromBlock + blockLimit, endBlock);

        while (fromBlock <= endBlock) {
          console.log(`Fetching RewardRecieved events from blocks ${fromBlock} to ${toBlock}...`);

          const events = await contract.getPastEvents("RewardRecieved", {
            fromBlock,
            toBlock,
          });

          this.rewardRecievedEvents.push(...events)

          fromBlock = toBlock + 1;
          toBlock = Math.min(fromBlock + blockLimit, endBlock);
        }
      },

              processEvents() {
          this.consumerRegisteredEvents.forEach((event) => {
            this.handleConsumerRegisteredEvent(event);
          });

          this.rewardRecievedEvents.forEach((event) => {
            this.handleRewardRecievedEvent(event);
          });

                },

      async fetchPastEvents() {
        const fromBlock = 32000576;
        const toBlock = await this.getWeb3.eth.getBlockNumber();

        await this.fetchConsumerRegisteredEvents(fromBlock, toBlock);
        await this.fetchRewardRecievedEvents(fromBlock, toBlock);


        this.processEvents();

      },



        
    
        async getBlockNumber() {
            return await this.getWeb3.eth.getBlockNumber();
        },  
        
    },
      
  };
  </script>
  