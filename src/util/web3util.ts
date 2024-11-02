import { ethers } from 'ethers'

const getProvider = (rpc: string): ethers.JsonRpcProvider | ethers.WebSocketProvider | ethers.IpcSocketProvider => {

    if (rpc.startsWith('http')) {
        return new ethers.JsonRpcProvider(rpc)
    } else if (rpc.startsWith('ws')) {
        return new ethers.WebSocketProvider(rpc)
    } else if (rpc.startsWith('/')) {
        return new ethers.IpcSocketProvider(rpc)
    }
    throw new Error('Invalid RPC URL')
}

const eip55 = (address: string): string => {
    return ethers.getAddress(address)
}

const decodeAbi = (abi: string, data: string): null | ethers.TransactionDescription => {
    const iface = new ethers.Interface(abi)
    return iface.parseTransaction({ data })
}

export {
    getProvider,
    eip55,
    decodeAbi
}