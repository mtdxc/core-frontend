import { $Keys } from 'utility-types'
import EventEmitter from 'events'
import uuid from 'uuid'
import type { Hash } from '$shared/types/web3-types'
const emitter = new EventEmitter()
export enum actionTypes {
    CREATE= 'CREATE',
    UPDATE= 'UPDATE',
    SUBSCRIPTION= 'SUBSCRIPTION',
    // user subscribed
    PAYMENT= 'PAYMENT',
    // user received payment
    ADD= 'ADD',
    SHARE= 'SHARE',
    DEPLOY= 'DEPLOY',
    UNDEPLOY= 'UNDEPLOY',
    PUBLISH= 'PUBLISH',
    UNPUBLISH= 'UNPUBLISH',
}
type Action = $Keys<typeof actionTypes>
export enum resourceTypes {
    STREAM = 'STREAM',
    PRODUCT = 'PRODUCT',
}
export type ResourceType = $Keys<typeof resourceTypes>
type Params = {
    id?: string
    timestamp?: Date
    action: Action
    txHash?: Hash
    userId?: string | null | undefined
    resourceId?: string | null | undefined
    resourceType?: ResourceType | null | undefined
}
const events = {
    PUSH: 'ACTIVITY/PUSH',
}

class Activity {
    id: string
    timestamp: Date
    action: Action
    txHash: Hash | null | undefined
    userId: string | null | undefined
    resourceId: string | null | undefined
    resourceType: ResourceType | null | undefined

    static push(params: Params) {
        emitter.emit(events.PUSH, new Activity(params))
    }

    static subscribe(handler: (arg0: Activity) => void) {
        emitter.on(events.PUSH, handler)
    }

    static unsubscribe(handler: (arg0: Activity) => void) {
        emitter.removeListener(events.PUSH, handler)
    }

    static deserialize(data: any) {
        const params = {
            id: data.id,
            timestamp: data.timestamp,
            action: data.action,
            userId: data.userId,
            txHash: data.txHash,
            resourceId: data.resourceId,
            resourceType: data.resourceType,
        }
        return new Activity(params)
    }

    constructor(params: Params) {
        this.id = params.id || uuid()
        this.timestamp = params.timestamp || new Date()
        this.action = params.action
        this.userId = params.userId || null
        this.txHash = params.txHash || null
        this.resourceId = params.resourceId || null
        this.resourceType = params.resourceType || null
    }

    serialize() {
        return {
            id: this.id,
            timestamp: this.timestamp,
            action: this.action,
            userId: this.userId,
            txHash: this.txHash,
            resourceId: this.resourceId,
            resourceType: this.resourceType,
        }
    }
}

export default Activity
