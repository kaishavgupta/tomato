import { NavLink } from "react-router-dom";
import useUser from "../../Hooks/useUser";

const Logo = () => {
  const { userData } = useUser();
  return (
    <NavLink
      to="/restaurant"
      className="flex items-center gap-2 select-none flex-shrink-0"
      style={{ textDecoration: "none" }}
    >
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
        style={{ background: "linear-gradient(135deg,#E23774,#FF6B35)" }}
      >
        🍅
      </span>
      {userData.role!="user" ?
        <div className="flex flex-col leading-none">
          <span
            className="text-2xl tracking-widest"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: "#E23774",
              lineHeight: 1,
            }}
          >
            Tomato
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "#FF6B35", lineHeight: 1, marginTop: 1 }}
          >
            {userData.role}
          </span>
        </div>:<></>
      }
    </NavLink>
  );
};

export default Logo;
