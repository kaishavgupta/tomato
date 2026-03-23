import axios from "axios";

export const orderService = axios.create({
  baseURL: "http://localhost:4000/",
  withCredentials: true,
});

// Create Order
// Payload paymentmethod, addressId
interface dataType{
  addressId:string;
  paymentMethod:string
}
export const create_Order = async (data:dataType) => {
  console.log(data.paymentMethod,data.addressId);
  try {
    if((typeof data.addressId)!="string"){
      console.log(`Can't send since addresId is string`);
      
      return null
    }
    const response = await orderService.post("/api/order/create-order", {
      paymentmethod:data.paymentMethod,
      addressId:data.addressId,
    });
    
    return response.data;
  } catch (error) {
    throw error?.response?.data ?? error;
  }
};

export const get_All_orders = async (page: number) => {
  try {
    const response = await orderService.get(
      `/api/order/get-all-orders/?page=${page}`,
    );
    return response.data;
  } catch (error) {
    throw error?.response?.data ?? error;
  }
};

export const fetch_order_details = async (orderId: string) => {
  try {
    const response=await orderService.get(`/api/order/fetch-order-details/?${orderId}`)
    return response.data
  } catch (error) {
    throw error?.response?.data ?? error;
  }
};
