import { use } from "react"
import { MenuContext } from "../types/menu.types"

const useMenu=()=>{
    const menuData= use(MenuContext);
    if(!menuData){
        throw new Error("useMenu must be used within a MenuProvider")
    }
    return menuData
}

export default useMenu