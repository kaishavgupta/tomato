import { use } from "react";
import { AppContext } from "../context/AppProvider";

// Home.tsx
const Home = () => {
  const context = use(AppContext);
  
  if (!context) return null;

  const { data, isError, isLoading } = context;
  console.log(data);
  

  if (isLoading) return <div>Loading Profile...</div>;

  if (isError) return <div>Error loading data. Are you logged in?</div>;

  console.log("Actual User Data:", data);

  return (
    <div>
      <h1>Welcome, {data?.name}</h1>
      <p>Email: {data?.email}</p>
    </div>
  );
}

export default Home