

import { useState } from "react"
import { User, Mail, Phone, CreditCard, Shield, Clock, Badge } from "lucide-react"
import { initiateRazorpayPayment, type PaymentData, type RazorpayResponse } from "../api/razorpay"
import { Card, CardContent, CardHeader, CardTitle } from "./UI/card"
import Label from "./UI/label"
import { Input } from "./UI/input"
import { Button } from "./UI/button"


interface PaymentFormProps {
  eventTitle: string
  selectedSeats: any[]
  totalAmount: number
  eventId: number
  onPaymentSuccess: (response: RazorpayResponse
  ) => void
  onPaymentError: (error: any) => void
}

export default function PaymentForm({
  eventTitle,
  selectedSeats,
  totalAmount,
  eventId,
  onPaymentSuccess,
  onPaymentError,
}: PaymentFormProps) {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!userDetails.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!userDetails.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(userDetails.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!userDetails.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(userDetails.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    setIsProcessing(true)

    const paymentData: PaymentData = {
      eventId,
      selectedSeats,
      totalAmount,
      userDetails,
    }

    try {
      await initiateRazorpayPayment(
        paymentData,
        (response) => {
          setIsProcessing(false)
          onPaymentSuccess(response)
        },
        (error) => {
          setIsProcessing(false)
          onPaymentError(error)
        },
      )
    } catch (error) {
      setIsProcessing(false)
      onPaymentError(error)
    }
  }

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName) {
      case "VIP":
        return "bg-yellow-100 text-yellow-800"
      case "Regular":
        return "bg-blue-100 text-blue-800"
      case "Balcony":
        return "bg-green-100 text-green-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">{eventTitle}</h4>
              <div className="space-y-2">
                {selectedSeats.map((seat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getCategoryColor(seat.categoryName)}>{seat.categoryName}</Badge>
                      <span className="font-medium">
                        Seat {seat.row}
                        {seat.number}
                      </span>
                    </div>
                    <span className="font-semibold">₹{seat.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-indigo-600">₹{totalAmount}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Inclusive of all taxes and fees</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={userDetails.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={userDetails.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={userDetails.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Security Info */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-slate-900">Secure Payment</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>PCI DSS compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Instant confirmation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 text-lg font-semibold flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay ₹{totalAmount} with Razorpay
          </>
        )}
      </Button>

      {/* Timer Info */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Clock className="w-4 h-4" />
        <span>Your seats are reserved for 10 minutes</span>
      </div>
    </div>
  )
}
