import type React from "react";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Team } from "../types/team";
import { createTeam, getAllTeams } from "../services/teamService";

export default function AddTeamPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [nextTeamNumber, setNextTeamNumber] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    teamName: "",
    schoolName: "",
  });

  // Form validation state
  const [errors, setErrors] = useState({
    teamName: "",
    schoolName: "",
  });

  // Get next available team number
  useEffect(() => {
    const fetchNextTeamNumber = async () => {
      try {
        const teams = await getAllTeams();
        if (teams.length > 0) {
          // Find the highest team number and add 1
          const highestTeamNumber = Math.max(
            ...teams.map((team) => team.teamNumber)
          );
          setNextTeamNumber(highestTeamNumber + 1);
        }
      } catch (error) {
        console.error("Error fetching teams for next team number:", error);
        // Continue with default team number 1
      }
    };

    fetchNextTeamNumber();
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    let valid = true;
    const newErrors = { teamName: "", schoolName: "" };

    if (!formData.teamName.trim()) {
      newErrors.teamName = "Team name is required";
      valid = false;
    }

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = "School is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError("");

    try {
      // Create a new team object that matches the backend model
      const newTeam: Omit<Team, "id" | "createdAt" | "updatedAt"> = {
        teamNumber: nextTeamNumber,
        teamName: formData.teamName,
        schoolName: formData.schoolName,
        vehicleIds: [], // Start with an empty array
      };

      // Create team in the backend
      await createTeam(newTeam);

      // Redirect to teams page after successful creation
      navigate("/teams");
    } catch (error) {
      console.error("Error creating team:", error);
      setFormError("Failed to create team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-400 text-light-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">Add New Team</span>
          </h1>
          <p className="text-light-500 mt-2">
            Create a new team for the competition
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form error message */}
          {formError && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Team Number (Read-only) */}
          <div className="space-y-2">
            <label
              htmlFor="teamNumber"
              className="block text-sm font-medium text-light-300"
            >
              Team Number (Auto-assigned)
            </label>
            <input
              type="text"
              id="teamNumber"
              value={nextTeamNumber}
              disabled
              className="w-full px-4 py-3 bg-dark-300 border border-dark-100 rounded-md focus:outline-none text-light-500 cursor-not-allowed"
            />
          </div>

          {/* Team Name */}
          <div className="space-y-2">
            <label
              htmlFor="teamName"
              className="block text-sm font-medium text-light-300"
            >
              Team Name <span className="text-accent1-DEFAULT">*</span>
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
              placeholder="Enter team name"
              className={`w-full px-4 py-3 bg-dark-300 border ${
                errors.teamName ? "border-red-500" : "border-dark-100"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
            />
            {errors.teamName && (
              <p className="text-red-500 text-sm">{errors.teamName}</p>
            )}
          </div>

          {/* School */}
          <div className="space-y-2">
            <label
              htmlFor="schoolName"
              className="block text-sm font-medium text-light-300"
            >
              School <span className="text-accent1-DEFAULT">*</span>
            </label>
            <input
              type="text"
              id="schoolName"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="Enter school name"
              className={`w-full px-4 py-3 bg-dark-300 border ${
                errors.schoolName ? "border-red-500" : "border-dark-100"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
            />
            {errors.schoolName && (
              <p className="text-red-500 text-sm">{errors.schoolName}</p>
            )}
          </div>

          <div className="mt-2">
            <p className="text-light-500 text-sm">
              Note: Vehicles can be added to the team after creating it from the
              Teams page.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link to="/teams">
              <button
                type="button"
                className="px-6 py-3 bg-dark-200 text-light-100 rounded-md hover:bg-dark-100 transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-accent2-DEFAULT text-light-100 rounded-md hover:bg-accent2-light transition-colors flex items-center justify-center min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="animate-spin h-5 w-5 border-2 border-light-100 border-t-transparent rounded-full"></div>
              ) : (
                "Create Team"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
