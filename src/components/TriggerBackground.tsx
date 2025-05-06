import React from "react";
// import dotenv from "dotenv";
const TriggerBackground: React.FC = () => {
  // const SITE_URL = import.meta.env.VITE_SITE_URL;
  const triggerBackgroundFunction = async () => {
    try {
      const response = await fetch(
        `http://localhost:8888/.netlify/functions/netlifyBgFunction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: "Data" }),
          credentials: "same-origin", // Include credentials for same-origin requests
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data message:-", data.message);
      console.log("Background function response:", data);
      alert(`Success! ${data.message}`);
    } catch (error) {
      console.error("Error:", error);
      alert(
        `Failed to trigger function: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div>
      <h2 className="text-2xl text-blue-400">Netlify functions</h2>
      <button
        className="rounded-xl font-serif border-none bg-green-500 text-white px-4 py-2 mt-4 hover:bg-green-700 transition duration-300"
        onClick={triggerBackgroundFunction}
      >
        Trigger Background Function
      </button>
    </div>
  );
};

export default TriggerBackground;
