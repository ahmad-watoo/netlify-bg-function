import React from "react";
import TrainingForm from "./TrainingForm";
// import dotenv from "dotenv";
// const myData = [
//   { id: 1, name: "John Doe", age: 25 },
//   { id: 2, name: "Jane Smith", age: 30 },
//   { id: 2, name: "Jane Smith", age: 30 },
//   { id: 3, name: "Alice Johnson", age: 28 },
//   { id: 4, name: "Bob Brown", age: 35 },
// ];
const TriggerBackground: React.FC = () => {
  // const SITE_URL = import.meta.env.VITE_SITE_URL;
  // const SITE_URL = import.meta.env.VITE_SITE_URL;
  const triggerBackgroundFunction = async (formData?: any) => {
    try {
      const response = await fetch(
        `http://localhost:8888/.netlify/functions/netlifyBgFunction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: formData || { message: "Default background task" },
          }),
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
      <h2 className="text-4xl text-center font-mono p-4 text-white">
        Generate Training Plan..
      </h2>

      <>
        <TrainingForm
          onFinalSubmit={() =>
            triggerBackgroundFunction({
              name: "Form User",
              status: "completed",
              // Include actual form data here
            })
          }
        />
      </>
    </div>
  );
};

export default TriggerBackground;
