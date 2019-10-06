/**
 * @modules
 */
const cote    = require('cote')

/**
 * @connections
 */
const responder = new cote.Responder({ name: "pin-service-responder", key:"pin-service" })
const pin_requester = new cote.Requester({ name:"pin-service-requester", key:"pin-back-service" })


class CountDown {
    constructor (obj) {
        Object.assign(this, obj)

        this.numerationInMilseconds()
        this.start()
    }

    numerationInMilseconds () {
        switch (this.numeration) {
            case 'sec' :
                this.period = this.period * 1000
                break

            case 'min' :
                this.period = this.period * 60000
                break

            case 'hour' :
                this.period = this.period * 3600000
                break

            case 'day' :
                this.period = this.period * 86400000
                break

            case 'week' :
                this.period = this.period * 604800000
                break

            case 'month' :
                this.period = this.period * 2592000000
                break

            case 'year' :
                this.period = this.period * 31536000000
                break
        }
    }

    start () {
        setTimeout(() => {
            pin_requester.send({ type:'unpin_post', data:{
                pinned_msg_id: this.pinned_msg_id,
                channel: this.channel,
                admin: this.admin,
                client: this.client,
                hash: this.hash
            }})
        }, this.period)
    }
}

responder.on('start_countdown', async (msg) => {
    new CountDown(msg.data)
})
