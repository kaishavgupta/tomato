import { use } from "react";
import { AppContext } from "../context/AppProvider";

// Home.tsx
const Home = () => {
  const context = use(AppContext);
  
  if (!context) return null;

  const { userData, isError, isLoading } = context;
  console.log(userData);
  

  if (isLoading) return <div>Loading Profile...</div>;

  if (isError) return <div>Error loading data. Are you logged in?</div>;

  console.log("Actual User Data:", userData);

  return (
    <div>
      <h1>Welcome, {userData?.name}</h1>
      <p>Email: {userData?.email}</p>
      <img src={userData?.image} alt={userData?.name} />
    </div>
  );
}

export default Home