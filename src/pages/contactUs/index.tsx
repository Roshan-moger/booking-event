import React, { useState } from "react"
import {
  Mail,
  Phone,
  MapPin,
  Send,
  User,
  MessageSquare,
  Building,
  Shield,
  FileText,
  HelpCircle,
  ExternalLink,
} from "lucide-react"
import { Input } from "../../components/UI/input"
import Label from "../../components/UI/label"
import Textarea from "../../components/UI/textarea"
import { Button } from "../../components/UI/button"

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  // const [toast, setToast] = useState({
  //   isOpen: false,
  //   type: "success" as "success" | "error",
  //   message: "",
  // })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      // setToast({
      //   isOpen: true,
      //   type: "error",
      //   message: "Please fill in all required fields.",
      // })
      return
    }

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // setToast({
      //   isOpen: true,
      //   type: "success",
      //   message: "Message sent successfully! We'll get back to you within 24 hours.",
      // })
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      // setToast({
      //   isOpen: true,
      //   type: "error",
      //   message: "Failed to send message. Please try again.",
      // })
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Numbers",
      details: ["+91 8147563285", "+91 9964876361"],
      subtext: "Available Mon-Fri 9AM-6PM IST"
    },
    {
      icon: Mail,
      title: "Email Addresses",
      details: ["ruchi.mys@gmail.com", "mahimnmyso@gmail.com"],
      subtext: "We'll respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Our Office",
      details: ["Sharavi Tech India LLP", "No.156, D No. 520/2, 1st Floor", "Lokanayakanagar, Metagalli", "Mysore - 570016, Karnataka, India"],
      subtext: "Visit us during business hours"
    }
  ]


  const quickLinks = [
    { icon: Shield, name: "Privacy Policy", href: "#" },
    { icon: FileText, name: "Terms of Service", href: "#" },
    { icon: HelpCircle, name: "FAQ", href: "#" }
  ]

  const subjectOptions = [
    "General Inquiry",
    "Business Partnership",
    "Technical Support",
    "Product Information",
    "Custom Development",
    "Investment Opportunities",
    "Media & Press",
    "Other"
  ]

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-6">
          <div className="">
            <h1 className="text-2xl font-bold text-slate-900">
              Contact Us
            </h1>
            <p className="text-sm text-slate-600">
              Get in touch with Sharavi Tech India LLP. We're here to help you succeed.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Contact Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  Contact Information
                </h2>
                
                <div className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 mb-2">
                            {info.title}
                          </h3>
                          <div className="space-y-1 mb-2">
                            {info.details.map((detail, idx) => (
                              <p key={idx} className="text-slate-700 font-medium text-sm">
                                {detail}
                              </p>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">
                            {info.subtext}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Office Hours */}
              {/* <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-900">Business Hours</h3>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monday - Friday</span>
                    <span className="font-medium text-slate-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Saturday</span>
                    <span className="font-medium text-slate-900">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sunday</span>
                    <span className="font-medium text-slate-900">Closed</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">All times in Indian Standard Time (IST)</span>
                  </div>
                </div>
              </div> */}

              {/* Social Media */}
              {/* <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Follow Us</h3>
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon
                    return (
                      <button
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-xl border border-slate-200 transition-all ${social.color} ${social.bg}`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium text-sm">{social.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div> */}

              {/* Quick Links */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {quickLinks.map((link, index) => {
                    const IconComponent = link.icon
                    return (
                      <a
                        key={index}
                        href={link.href}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <IconComponent className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                          {link.name}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Send us a message
                </h2>
                <p className="text-slate-600 mb-8">
                  Have a question or want to work with us? Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <div className="space-y-6">
                  {/* Name and Email Row */}
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

                  {/* Company and Subject Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                        Company (Optional)
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                          placeholder="Enter your company name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                        Subject *
                      </Label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                      >
                        <option value="">Select a subject</option>
                        {subjectOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message *
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all resize-none"
                        placeholder="Tell us about your project, questions, or how we can help you..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">
                      <strong>Response Time:</strong> We typically respond within 24 hours during business days.
                    </p>
                    <p className="text-sm text-slate-600">
                      <strong>Urgent Matters:</strong> For immediate assistance, please call us directly at +91 8147563285.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          {/* <div className="mt-12">
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Visit Our Office
              </h2>
              <p className="text-slate-600 mb-6">
                Located in the heart of Mysore, Karnataka. We'd love to meet you in person!
              </p>
              
              <div className="bg-slate-100 rounded-xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">Interactive Map</p>
                  <p className="text-sm text-slate-500">
                    Sharavi Tech India LLP, Lokanayakanagar, Metagalli, Mysore
                  </p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

   
    </div>
  )
}

export default ContactUsPage