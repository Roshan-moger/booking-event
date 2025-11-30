import React, { useState } from "react"
import {
  HelpCircle,
  AlertCircle,
  FileText,
  Upload,
  User,
  Mail,
  Bug,
  Settings,
  Zap,
  Clock,
  CheckCircle,
  Search,
  Book,
  MessageCircle,
  Phone,
  Video,
  ArrowRight,
} from "lucide-react"

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    accountId: "",
    issueType: "",
    priority: "",
    subject: "",
    description: "",
    stepsToReproduce: "",
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({
    isOpen: false,
    type: "success" as "success" | "error",
    message: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.issueType || !formData.subject || !formData.description) {
      setToast({
        isOpen: true,
        type: "error",
        message: "Please fill in all required fields.",
      })
      return
    }

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const ticketNumber = `SUP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      
      setToast({
        isOpen: true,
        type: "success",
        message: `Support ticket ${ticketNumber} created successfully! We'll respond within 2 hours.`,
      })
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        accountId: "",
        issueType: "",
        priority: "",
        subject: "",
        description: "",
        stepsToReproduce: "",
      })
      setSelectedFile(null)
    } catch (error) {
      setToast({
        isOpen: true,
        type: "error",
        message: "Failed to create support ticket. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const issueTypes = [
    { value: "technical", label: "Technical Issue", icon: Settings },
    { value: "bug", label: "Bug Report", icon: Bug },
    { value: "account", label: "Account Problem", icon: User },
    { value: "billing", label: "Billing Question", icon: FileText },
    { value: "feature", label: "Feature Request", icon: Zap },
    { value: "other", label: "Other", icon: HelpCircle },
  ]

  const priorityLevels = [
    { value: "low", label: "Low", color: "text-slate-600", bg: "bg-slate-100" },
    { value: "normal", label: "Normal", color: "text-blue-600", bg: "bg-blue-100" },
    { value: "high", label: "High", color: "text-orange-600", bg: "bg-orange-100" },
    { value: "urgent", label: "Urgent", color: "text-red-600", bg: "bg-red-100" },
  ]

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      status: "Available now",
      statusColor: "text-emerald-600",
      action: "Start Chat"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our technical experts",
      status: "Mon-Fri 9AM-6PM EST",
      statusColor: "text-blue-600",
      action: "Call Now"
    },
    {
      icon: Video,
      title: "Screen Sharing",
      description: "Let us help you with a guided session",
      status: "By appointment",
      statusColor: "text-purple-600",
      action: "Schedule"
    }
  ]

  const quickHelp = [
    { icon: Book, title: "Documentation", description: "Browse our comprehensive guides" },
    { icon: HelpCircle, title: "FAQ", description: "Find answers to common questions" },
    { icon: Video, title: "Video Tutorials", description: "Watch step-by-step tutorials" },
    { icon: MessageCircle, title: "Community Forum", description: "Connect with other users" },
  ]

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Support Center
            </h1>
            <p className="text-lg text-slate-600">
              Get the help you need. We're here to resolve your issues quickly.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Quick Support Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {supportOptions.map((option, index) => {
              const IconComponent = option.icon
              return (
                <div key={index} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl">
                      <IconComponent className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className={`text-sm font-medium ${option.statusColor}`}>
                      {option.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {option.description}
                  </p>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
                    {option.action}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Quick Help */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-600" />
                  Quick Help
                </h2>
                
                <div className="space-y-4">
                  {quickHelp.map((help, index) => {
                    const IconComponent = help.icon
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                        <IconComponent className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-slate-900 mb-1">
                            {help.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {help.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Response Times */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-900">Response Times</h3>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Urgent Issues</span>
                    <span className="font-medium text-red-600">: 1 hour</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">High Priority</span>
                    <span className="font-medium text-orange-600">: 2 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Normal Priority</span>
                    <span className="font-medium text-blue-600">: 4 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Low Priority</span>
                    <span className="font-medium text-slate-600">: 24 hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Ticket Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Create Support Ticket
                </h2>
                <p className="text-slate-600 mb-8">
                  Describe your issue in detail and we'll help you resolve it quickly.
                </p>

                <div className="space-y-6">
                  {/* Personal Info Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account ID */}
                  <div>
                    <label htmlFor="accountId" className="block text-sm font-medium text-slate-700 mb-2">
                      Account ID (Optional)
                    </label>
                    <input
                      type="text"
                      id="accountId"
                      name="accountId"
                      value={formData.accountId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                      placeholder="Enter your account ID if available"
                    />
                  </div>

                  {/* Issue Type and Priority */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="issueType" className="block text-sm font-medium text-slate-700 mb-2">
                        Issue Type *
                      </label>
                      <select
                        id="issueType"
                        name="issueType"
                        required
                        value={formData.issueType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                      >
                        <option value="">Select issue type</option>
                        {issueTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-2">
                        Priority Level
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                      >
                        <option value="">Select priority</option>
                        {priorityLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all resize-none"
                      placeholder="Please describe your issue in detail..."
                    />
                  </div>

                  {/* Steps to Reproduce */}
                  <div>
                    <label htmlFor="stepsToReproduce" className="block text-sm font-medium text-slate-700 mb-2">
                      Steps to Reproduce (For Bugs)
                    </label>
                    <textarea
                      id="stepsToReproduce"
                      name="stepsToReproduce"
                      rows={3}
                      value={formData.stepsToReproduce}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all resize-none"
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Attach Screenshot/File (Optional)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-400 transition-colors">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 mb-2">
                        {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                      </p>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                      >
                        Browse Files
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Creating Ticket...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5" />
                          Create Support Ticket
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.isOpen && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md">
          <div className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-medium text-sm">{toast.message}</span>
            </div>
            <button
              onClick={() => setToast({ ...toast, isOpen: false })}
              className="text-slate-400 hover:text-slate-600 ml-2 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportPage