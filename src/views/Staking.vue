<template>
    <div 
        style="gap:50px"
        class="content staking-view">
        <router-link class="back" to="/">
        </router-link>
        <div style="margin-bottom:56;" class="profile-big"></div>
        <p >Your balance</p>
        <div style="display:flex; justify-content:center; gap:40px; align-items:end;">
        <h1 style="margin:0; margin-top: -20px; margin-bottom:70px; padding:0; align-items:end; margin-bottom:-20px; font-size: 100px;">
            {{this.handsTokenBalance?.toString().split(".")[0]}}.{{ this.handsTokenBalance?.toString().split(".")[1]?.substring(0,4)?? "00" }}
            <span
                style="font-size: 50px;"
                class="currency-symbol"
            >HANDS</span>
        </h1>
        </div>

        <button style="margin-top:60px; margin-bottom:90px;" class="button-dark">
          Buy HANDS
        </button>

        <div style="width:100%;display:grid; grid-template-columns: 1fr auto 1fr; margin-bottom:70px;">
            <div style="display:flex; gap:20px; align-items:center; flex-direction:column;">
                <p>Total staked</p>
                <h2>{{totalHandsStakedBalance}} HANDS</h2>
            </div>

            <div style="display:flex; gap:20px; align-items:center; flex-direction:column;">
                <p>Protocol Revenue</p>
                <h2>
                    {{protocolFeeRevenue}} 
                    <span class="currency-symbol">ETH</span>
                </h2>
            </div>

            <div style="display:flex; gap:20px; align-items:center; flex-direction:column;">
                <p>Stakers</p>
                <h2>{{stakerAmount}}</h2>
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; gap:40px;">
            <div class="card">
                <p>Your stake</p>
                <h1>
                    {{handsStakedBalance}}
                    <span class="currency-symbol">HANDS</span>
                </h1>
                <div style="display:flex;">
                    <button
                        @click="showStakeModal"
                        class="button-dark">
                        Stake
                    </button>
                    <button 
                        @click="showUnstakeModal"
                        class="button-light">
                        Unstake
                    </button>
                </div>
            </div>

            <div  class="card">
                <p>Your rewards</p>
                <h1>{{claimableEthForStaking}} ETH</h1>
                <button 
                    @click="claim" 
                    class="button-dark">
                    Claim
                </button>
            </div>

            
    
      </div>
      <div>
        <p>Revenue Events</p>
        <list-staking 
            :events="recivedFundsList" 
            :address="activeAccount"
        />
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
import ListStaking from '@/components/ListStaking.vue';
    
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
            ListStaking
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

          yourStakeAtBlock: {},
          totalStakeAtBlock: {},
          recivedFundsList : [],

            stakeEvents: [],
            unstakeEvents: [],
            recievedFundsEvents: [],
            handledEventIds: new Set(),
  
        };
      },
      computed: {
        provider() { return this.$store.state.provider },
        getActiveAccount() { return this.activeAccount?.toLowerCase()},
        getWeb3() {return new Web3(this.provider);},
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
            this.$store.commit('setStakeContract', this.stakingContract);
  
            //Set HandsToken contract
            this.handsTokenContract = new this.getWeb3.eth.Contract(
                mainContracts.deployedAbis.HandsToken,
                mainContracts.deployedContracts.HandsToken
            );
            this.$store.commit('setHandsTokenContract', this.handsTokenContract);
  
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
          
          
          addToHandledEvents(event, eventName) {
            const eventId = `${event.transactionHash}-${eventName}-${event.logIndex}`;
            this.handledEventIds.add(eventId);
            },
   
          
          async stake() {
            // Call the stake method
            try {
              const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
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
              const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
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
              const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
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
              const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
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
              const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
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
  
          //handle staking event by getting the event and updating the user's staked balance at the current block number
          // set the value of this.yourStakeAtBlock and this.totalStakedAtBlock. These are both objects with the block number as the key and the staked balance as the value
          handleStakingEvent(event) {
            console.log('Staking event stakerman', event);

            const { staker, amount } = event.returnValues;
            const blockNumber = event.blockNumber;

            if (staker.toLowerCase() === this.activeAccount.toLowerCase()) {
              //check if the block number is already in the object, if so add the amount to the existing value
                if (this.yourStakeAtBlock[blockNumber]) {
                    this.yourStakeAtBlock[blockNumber] += parseInt(amount);
                } else {
                    this.yourStakeAtBlock[blockNumber] = parseInt(amount);
                }
            }

            //check if the block number is already in the object, if so add the amount to the existing value
            if (this.totalStakeAtBlock[blockNumber]) {
              this.totalStakeAtBlock[blockNumber] += parseInt(amount);
            } else {
              this.totalStakeAtBlock[blockNumber] = parseInt(amount);
            }            
          },

          handleUnstakingEvent(event) {
            console.log('Unstaking event', event);

            const { staker, amount } = event.returnValues;
            const blockNumber = event.blockNumber;

            if (staker.toLowerCase() === this.activeAccount.toLowerCase()) {
              //check if the block number is already in the object, if so add the amount to the existing value
                if (this.yourStakeAtBlock[blockNumber]) {
                    this.yourStakeAtBlock[blockNumber] -= parseInt(amount);
                } else {
                    this.yourStakeAtBlock[blockNumber] = parseInt(amount);
                }
            }

            //check if the block number is already in the object, if so add the amount to the existing value
            if (this.totalStakeAtBlock[blockNumber]) {
              this.totalStakeAtBlock[blockNumber] -= parseInt(amount);
            } else {
              this.totalStakeAtBlock[blockNumber] = parseInt(amount);
            }
          },

          //append the event to the events array
          //add object with the following attributes to the events array: timestamp, amount, your share, and total staked
          async handleRecievedFundsForStaking(event){
            console.log('Recieved funds for staking event', event);

            const { amount } = event.returnValues;
            const block = await this.getWeb3.eth.getBlock(event.blockNumber);
            const timestamp = block.timestamp;

            //get total staked at block, get the block number from keys of totalStakedAtBlock that is closest to the event block number and less than or equal to the event block number
            const blockNumber = Object.keys(this.totalStakeAtBlock)?.reduce((a, b) => {
              return b <= event.blockNumber && b > a ? b : a;
            }, 0);



            //get the total staked at the block number
            const totalStaked = this.totalStakeAtBlock[blockNumber];


            //get the user's stake at the block number
            const yourStake = this.yourStakeAtBlock[blockNumber];

            //add object with the following attributes to the events array: timestamp, amount, your share, and total staked
            this.recivedFundsList.push({
              timestamp,
              amount,
              yourStake,
              totalStaked
            });
          },

          async subscribeToEvents() {
      const contract = this.stakingContract;
      const userAddress = this.activeAccount;

      console.log("Polling for events...");
      console.log("contract:", contract);

      const eventNames = [
        "Staked",
        "Unstaked",
        "ReceivedFundsForStaking",
      ];

      const eventHandlers = {
        Staked: this.handleStakingEvent,
        Unstaked: this.handleUnstakingEvent,
        ReceivedFundsForStaking: this.handleRecievedFundsForStaking,
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

    async fetchStakeEvents(fromBlock) {
        const contract = this.stakingContract;

        const events = await contract.getPastEvents("Staked", {
          fromBlock,
        });
        this.stakeEvents = events;
        },

        async fetchUnstakeEvents(fromBlock) {
            const contract = this.stakingContract;

            const events = await contract.getPastEvents("Unstaked", {
              fromBlock,
            });
            this.unstakeEvents = events;
            },

            async fetchRecievedFundsEvents(fromBlock) {
                const contract = this.stakingContract;

                const events = await contract.getPastEvents("ReceivedFundsForStaking", {
                  fromBlock,
                });
                this.recievedFundsEvents = events;
                },

                processEvents() {
                    this.stakeEvents.forEach((event) => {
                      this.handleStakingEvent(event);
                      this.addToHandledEvents(event, "Staked");
                    });
                    this.unstakeEvents.forEach((event) => {
                      this.handleUnstakingEvent(event);
                        this.addToHandledEvents(event, "Unstaked");
                    });
                    this.recievedFundsEvents.forEach((event) => {
                      this.handleRecievedFundsForStaking(event);
                        this.addToHandledEvents(event, "ReceivedFundsForStaking");
                    });
                  },

        async fetchPastEvents() {
            const fromBlock = 0;

      await this.fetchStakeEvents(fromBlock);
      await this.fetchUnstakeEvents(fromBlock);
      await this.fetchRecievedFundsEvents(fromBlock);

      this.processEvents();

        },

  
  
          
      
          async getBlockNumber() {
              return await this.getWeb3.eth.getBlockNumber();
          },  
          
      },
        
    };
    </script>
    