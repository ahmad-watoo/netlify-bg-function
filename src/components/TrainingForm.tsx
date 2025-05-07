import React, { useState } from "react";
import { FormData } from "../types/training";
const TrainingForm = ({
  onFinalSubmit,
}: {
  onFinalSubmit: () => Promise<void>;
}) => {
  const [step, setStep] = useState(1);
  // Pre-populate form data for quicker testing
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    birthDate: new Date().getFullYear(),
    gender: "",
    location: "",
    locationObject: null, // Initialize locationObject to null
    age: 1,
    experienceLevel: "", // Beginner, Intermediate, Advanced, Elite
    raceDistance: "", // Half Marathon, Marathon
    hasRaceDate: false, //(may 'null' it) Initialize to null so no option is selected by default
    raceDate: undefined, // Set initial raceDate to undefined
    planLength: "", // 12, 16, or 19 weeks
    measurementUnit: "", // Kilometers, Miles
    desiredRaceTime: "", // For Half: Sub-2:15, Sub-2:00, Sub-1:40, Sub-1:20
    email: "",
    marketingConsent: false,
    termsAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      // Generate a unique request ID
      const requestId = Date.now();
      const response = await fetch(
        "http://localhost:8888/.netlify/functions/generateTrainingPlan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formData,
            requestId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate plan");
      }
      const result = await response.json();
      console.log("Plan generated successfully:", result);

      // Open PDF in new tab if URL is returned
      if (result.pdfUrl) {
        window.open(result.pdfUrl, "_blank");
      }
      alert("Your training plan has been generated!");
      // Then trigger the background function
      await onFinalSubmit();
      // Show success message

      console.log("Form data submitted:", formData);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate training plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[50%] mx-auto p-6 bg-white rounded-lg shadow-md">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <h1 className="text-2xl font-bold mb-6 text-center font-mono">
        {step === 1 && "Create Your FREE Personalized Training Plan"}
        {step === 2 && "Experience Level"}
        {step === 3 && "Race Information"}
        {step === 4 && "What is your desired marathon time?"}
        {step === 5 && "Contact Information"}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Experience Level */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="mb-4">Choose your current running experience:</p>
            {["Beginner", "Intermediate", "Advanced", "Elite"].map((level) => (
              <div key={level} className="flex items-center mb-2">
                <input
                  type="radio"
                  id={level.toLowerCase()}
                  name="experienceLevel"
                  value={level.toLowerCase()}
                  checked={formData.experienceLevel === level.toLowerCase()}
                  onChange={handleChange}
                  className="mr-2"
                  required
                />
                <label htmlFor={level.toLowerCase()}>
                  <strong>{level}</strong>
                  <p className="text-sm text-gray-600">
                    {level === "Beginner" &&
                      "You can run 5km and are new to structured training"}
                    {level === "Intermediate" &&
                      "You run 5-10km regularly but without a plan"}
                    {level === "Advanced" &&
                      "You comfortably run 10km with structured workouts"}
                    {level === "Elite" &&
                      "You regularly run half marathons or longer"}
                  </p>
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Race Information */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Race Distance
              </label>
              <select
                name="raceDistance"
                value={formData.raceDistance}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select</option>
                <option value="half-marathon">Half Marathon (21.1km)</option>
                <option value="marathon">Marathon (42.2km)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Units</label>
              <div className="flex space-x-4">
                {["kilometers", "miles"].map((unit) => (
                  <label key={unit} className="flex items-center">
                    <input
                      type="radio"
                      name="measurementUnit"
                      value={unit}
                      checked={formData.measurementUnit === unit}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Do you have a race date?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasRaceDate"
                    value="yes"
                    checked={formData.hasRaceDate}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, hasRaceDate: true }))
                    }
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasRaceDate"
                    value="no"
                    checked={!formData.hasRaceDate}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, hasRaceDate: false }))
                    }
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>

            {formData.hasRaceDate && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Race Date
                </label>
                <input
                  type="date"
                  name="raceDate"
                  value={
                    formData.raceDate instanceof Date
                      ? formData.raceDate.toISOString().split("T")[0]
                      : typeof formData.raceDate === "string"
                      ? formData.raceDate
                      : ""
                  }
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required={
                    formData.raceDate === undefined && formData.raceDate // update to undefined if no date is selected
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Target Time */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="mb-4">Select your target finish time:</p>
            {[
              { value: "sub-215", label: "Sub-2:15", level: "Beginner" },
              { value: "sub-200", label: "Sub-2:00", level: "Intermediate" },
              { value: "sub-140", label: "Sub-1:40", level: "Advanced" },
              { value: "sub-120", label: "Sub-1:20", level: "Elite" },
            ].map((time) => (
              <div key={time.value} className="flex items-center mb-2">
                <input
                  type="radio"
                  id={time.value}
                  name="desiredRaceTime"
                  value={time.value}
                  checked={formData.desiredRaceTime === time.value}
                  onChange={handleChange}
                  className="mr-2"
                  required
                />
                <label htmlFor={time.value}>
                  <strong>{time.label}</strong>
                  <span className="text-sm text-gray-600 ml-2">
                    ({time.level})
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Step 5: Contact Information */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="marketingConsent"
                  checked={formData.marketingConsent}
                  onChange={handleChange}
                  className="mr-2"
                />
                I would like to receive training tips and offers
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="mr-2"
                  required
                />
                I accept the Terms of Service and Privacy Policy
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Back
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-auto"
              disabled={
                (step === 1 &&
                  (!formData.fullName ||
                    !formData.age ||
                    !formData.gender ||
                    !formData.location)) ||
                (step === 2 && !formData.experienceLevel) ||
                (step === 3 &&
                  (!formData.raceDistance ||
                    (formData.hasRaceDate && !formData.raceDate))) ||
                (step === 4 && !formData.desiredRaceTime)
              }
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded hover:bg-green-600 ml-auto ${
                isSubmitting ? "bg-green-300" : "bg-green-500"
              } `}
              disabled={!formData.email || !formData.desiredRaceTime}
            >
              {isSubmitting ? "Generating..." : "Generate Training Plan"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TrainingForm;
