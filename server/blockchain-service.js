/**
 * @modules
 */
const cote  = require('cote')
const Minter   = require('@aloborio/blockchain/dist/index')
const env  = require('../env')

/**
 * @connections
 */
const requester = new cote.Requester({ name:"blockchain-service-requester", key:"transactions" });

const minter = new Minter.default()

module.exports = class Watcher {
    constructor ({ order_id, profile, chain, temp_wallet, amount, final_wallet, post_details }) {
        this.order_id     = order_id
        this.profile      = profile
        this.chain        = chain
        this.temp_wallet  = temp_wallet
        this.amount       = amount
        this.final_wallet = final_wallet
        this.post_details = post_details

        this.expirationCalc = 0
        this.transaction_submited_msg_sent = false
        
        this.run()
    }

    async run () {
        const payment_confirmed = async (coin) => {
            requester.send({ type:"transaction_submited", data:this.post_details })
            this.transaction_submited_msg_sent = true

            const amount_to_forward = this.amount - (this.amount / 100 * env.FEE)

            const payment = await minter.payment(this.final_wallet, amount_to_forward, coin)
            const signed = await minter.wallet.signTransaction(payment, this.findKey())
            
            minter.submitSigned(signed)
        }
        
        try {
            if (Number(this.expirationCalc) < 1800000) {
                this.expirationCalc += 1000

                let balance = await minter.getBalanceAll(this.temp_wallet)

                for (let i = 0; i < balance.length; i++) {
                    if (balance[i].coin == "BIP") {
                        const _balance = balance[i].amount
                        if (Number(_balance) >= Number(this.amount) && !this.transaction_submited_msg_sent) {
                            this.returned = true
                            payment_confirmed("BIP")
                        }
                    }
                    else {
                        const value = await minter.getSellPrice(balance[i].coin, balance[i].amount, "BIP")
                        const _value = Math.round(value/Math.pow(10, 18) * 100) / 100
                        if (Number(_value) >= Number(this.amount) && !this.transaction_submited_msg_sent) {
                            this.returned = true
                            payment_confirmed(balance[i].coin)
                        }
                    }
                }

                if (!this.returned) {
                    let that = this
                    setTimeout(function () {
                        that.run()
                    }, 2500)
                }
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    findKey () {
        try {
            for (let i = 0; i < this.profile.pendingWallets.length; i++) {
                let el = this.profile.pendingWallets[i]
                if (Object.keys(el)[0] == this.order_id) {
                    return el[this.order_id][this.chain].private
                }
            }
        }
        catch (e) {
            console.log(e)
        }
    }
}