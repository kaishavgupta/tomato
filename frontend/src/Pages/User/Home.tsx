import { use } from "react";
import { AppContext } from "../../types/user.type";

// Home.tsx
const Home = () => {
  const context = use(AppContext);

  if (!context) return null;

  const { userData, isError, isLoading } = context;
  console.log(userData);

  if (isLoading) return <div>Loading Profile...</div>;

  if (isError) return <div>Error loading data. Are you logged in?</div>;

  if (!userData) return <div>Loading Profile...</div>; 

  return (
    <div>
      <h1>Welcome, {userData?.name}</h1>
      <p>Email: {userData?.email}</p>
      <img
        src={userData?.image}
        alt={userData?.name}
        referrerPolicy="no-referrer" // ✅ required for Google profile images
        onError={(e) => {
          e.currentTarget.src = "/fallback-avatar.png"; // optional fallback
        }}
      />
    </div>
  );
};

export default Home;
