import { use } from "react"
import { OrderContext } from "../types/Order.type";

const useOrder=()=>{
    const orderData= use(OrderContext);
    if(!orderData){
        throw new Error("useOrder must be used within a OrderProvider")
    }
    return orderData
}



export default useOrder