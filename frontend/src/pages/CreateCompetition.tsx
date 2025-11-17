import type React from "react"
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { createCompetition } from "../services/competitionService"

type CompetitionFormData = {
  name: string
  description: string
  date: string
  location: string
  isFinal: boolean
}

export default function CreateCompetitionPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const [formData, setFormData] = useState<CompetitionFormData>({
    name: "",
    description: "",
    date: "",
    location: "",
    isFinal: false,
  })

  const [errors, setErrors] = useState<Record<keyof CompetitionFormData, string>>({
    name: "",
    description: "",
    date: "",
    location: "",
    isFinal: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement
    const { name, value, type } = target
    const newValue = type === "checkbox" ? (target as HTMLInputElement).checked : value

    setFormData((prev) => ({ ...prev, [name]: newValue }))

    if (errors[name as keyof CompetitionFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors: typeof errors = {
      name: "",
      description: "",
      date: "",
      location: "",
      isFinal: "",
    }

    if (!formData.name.trim()) {
      newErrors.name = "Competition name is required"
      valid = false
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
      valid = false
    }

    if (!formData.date.trim()) {
      newErrors.date = "Date is required"
      valid = false
    } else if (new Date(formData.date) < new Date()) {
      newErrors.date = "Please choose a future date"
      valid = false
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setFormError("")

    try {
      const trimmedData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        location: formData.location.trim(),
        isFinal: formData.isFinal,
        teamIds: [],
        eventIds: [],
      }
      console.log("Creating competition with data:", trimmedData)
      await createCompetition(trimmedData)

      navigate("/competitions")
    } catch (error) {
      console.error("Error creating competition:", error)
      setFormError("Failed to create competition. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-400 text-light-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">Create New Competition</span>
          </h1>
          <p className="text-light-500 mt-2">Create a new Competition</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-light-300">
              Competition Name <span className="text-accent1-DEFAULT">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter competition name"
              className={`w-full px-4 py-3 bg-dark-300 border ${errors.name ? "border-red-500" : "border-dark-100"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-light-300">
              Competition Description <span className="text-accent1-DEFAULT">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter competition description"
              className={`w-full px-4 py-3 bg-dark-300 border ${errors.description ? "border-red-500" : "border-dark-100"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
              rows={4}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-light-300">
              Competition Date <span className="text-accent1-DEFAULT">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 bg-dark-300 border ${errors.date ? "border-red-500" : "border-dark-100"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-light-300">
              Competition Location <span className="text-accent1-DEFAULT">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter competition location"
              className={`w-full px-4 py-3 bg-dark-300 border ${errors.location ? "border-red-500" : "border-dark-100"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
          </div>

          {/* Is Final */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFinal"
              name="isFinal"
              checked={formData.isFinal}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-4 h-4 text-accent2-DEFAULT bg-dark-300 border border-dark-100 rounded focus:ring-2 focus:ring-accent2-light"
            />
            <label htmlFor="isFinal" className="text-light-300 text-sm select-none">
              Mark as Final Competition
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link to="/competitions">
              <button
                type="button"
                className="px-6 py-3 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-md text-sm font-semibold bg-blue-800 hover:bg-blue-900 text-white transition-colors flex items-center justify-center min-w-[120px] ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                }`}
            >
              {isSubmitting ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                "Create Competition"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
