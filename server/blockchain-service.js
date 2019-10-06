/**
 * @modules
 */
const cote  = require('cote')
const Abr   = require('@aloborio/blockchain/dist/index')
const env  = require('../env')

/**
 * @connections
 */
const requester = new cote.Requester({ name:"blockchain-service-requester", key:"transactions" });

const abr = new Abr.default()


module.exports = class Watcher {
    constructor ({ order_id, profile, chain, temp_wallet, amount, final_wallet, post_details }) {
        this.order_id     = order_id
        this.profile      = profile
        this.chain        = chain
        this.temp_wallet  = temp_wallet
        this.amount       = amount
        this.final_wallet = final_wallet
        this.post_details = post_details

        this.run()
        this.expirationCalc = 0
        this.transaction_submited_msg_sent = false
    }

    async run () {
        try {
            if (this.expirationCalc < 1800000) {
                this.expirationCalc += 1000

                let balance = await abr[this.chain].getBalance(this.temp_wallet, 18)
                
                balance = Number(balance).toFixed(5)

                if (Number(balance) == Number(this.amount) && !this.transaction_submited_msg_sent) {
                    const history = await abr[this.chain].getHistory(this.temp_wallet)

                    /**
                     * @DEV add here sending history[0] to stats 
                     */
                    requester.send({ type:"transaction_submited", data:this.post_details })
                    this.transaction_submited_msg_sent = true

                    const payment = await abr[this.chain].payment(this.final_wallet, this.amount / (1 + env.FEE))
                    
                    const signed = await abr[this.chain].wallet.signTransaction(payment, this.findKey())
                    
                    abr[this.chain].submitSigned(signed)
                    .on('confirmation', (data) => {
                        /**
                         * save stats
                         */
                    })
                    .on('error', (e) => {
                        
                    })
                }
                else {
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