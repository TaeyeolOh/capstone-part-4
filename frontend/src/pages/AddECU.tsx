"use client"

import type React from "react"

import { useState } from "react"
import { Check, ChevronDown, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function AddECUPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    status: "Active",
  })

  // Form validation state
  const [errors, setErrors] = useState({
    name: "",
    serialNumber: "",
  })

  // Status options
  const statusOptions = [
    { value: "Active", label: "Active", color: "bg-green-500" },
    { value: "Inactive", label: "Inactive", color: "bg-gray-500" },
    { value: "Warning", label: "Warning", color: "bg-yellow-500" },
  ]

  // Status dropdown state
  const [isStatusOpen, setIsStatusOpen] = useState(false)

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Handle status selection
  const handleStatusSelect = (status: string) => {
    setFormData((prev) => ({ ...prev, status }))
    setIsStatusOpen(false)
  }

  // Validate form
  const validateForm = () => {
    let valid = true
    const newErrors = { name: "", serialNumber: "" }

    if (!formData.name.trim()) {
      newErrors.name = "ECU name is required"
      valid = false
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Serial number is required"
      valid = false
    } else if (!/^[A-Za-z0-9-]+$/.test(formData.serialNumber)) {
      newErrors.serialNumber = "Serial number can only contain letters, numbers, and hyphens"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setFormError("")

    try {
      // In a real app, this would be an API call to create the ECU
      // For now, we'll simulate a successful creation with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to monitors page after successful creation
      navigate("/monitors")
    } catch (error) {
      console.error("Error creating ECU:", error)
      setFormError("Failed to create ECU. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-400 text-light-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">Add New ECU</span>
          </h1>
          <p className="text-light-500 mt-2">Create a new Energy Control Unit to monitor and configure</p>
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

          {/* ECU Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-light-300">
              Name of ECU <span className="text-accent1-DEFAULT">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter ECU name"
              className={`w-full px-4 py-3 bg-dark-300 border ${
                errors.name ? "border-red-500" : "border-dark-100"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Serial Number */}
          <div className="space-y-2">
            <label htmlFor="serialNumber" className="block text-sm font-medium text-light-300">
              Serial Number <span className="text-accent1-DEFAULT">*</span>
            </label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              placeholder="Enter serial number"
              className={`w-full px-4 py-3 bg-dark-300 border ${
                errors.serialNumber ? "border-red-500" : "border-dark-100"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light`}
            />
            {errors.serialNumber && <p className="text-red-500 text-sm">{errors.serialNumber}</p>}
            <p className="text-light-500 text-sm">
              Serial number should be unique and can contain letters, numbers, and hyphens.
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium text-light-300">
              Status
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-dark-300 border border-dark-100 rounded-md focus:outline-none focus:ring-2 focus:ring-accent2-light"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
              >
                <div className="flex items-center">
                  <span
                    className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      statusOptions.find((option) => option.value === formData.status)?.color || "bg-gray-500"
                    }`}
                  ></span>
                  {formData.status}
                </div>
                <ChevronDown size={18} className={`transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
              </button>

              {isStatusOpen && (
                <div className="absolute z-10 mt-1 w-full bg-dark-200 border border-dark-100 rounded-md shadow-lg">
                  <ul className="py-1">
                    {statusOptions.map((option) => (
                      <li key={option.value}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-dark-100 flex items-center justify-between"
                          onClick={() => handleStatusSelect(option.value)}
                        >
                          <div className="flex items-center">
                            <span className={`h-2.5 w-2.5 rounded-full mr-2 ${option.color}`}></span>
                            {option.label}
                          </div>
                          {formData.status === option.value && <Check size={16} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link to="/monitors">
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
                "Create ECU"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
