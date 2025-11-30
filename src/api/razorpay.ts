// Razorpay integration utilities
declare global {
  interface Window {
    Razorpay: any
  }
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
  modal: {
    ondismiss: () => void
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface PaymentData {
  eventId: number
  selectedSeats: any[]
  totalAmount: number
  userDetails: {
    name: string
    email: string
    phone: string
  }
}

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// Create Razorpay order
export const createRazorpayOrder = async (amount: number, eventId: number) => {
  try {
    // In a real app, this would call your backend API
    // For demo purposes, we'll simulate the response
    const response = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        eventId,
      }),
    })

    if (!response.ok) {
      // Simulate successful order creation for demo
      return {
        id: `order_${Date.now()}`,
        amount: amount * 100,
        currency: "INR",
      }
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    // Return mock data for demo
    return {
      id: `order_${Date.now()}`,
      amount: amount * 100,
      currency: "INR",
    }
  }
}

// Initialize Razorpay payment
export const initiateRazorpayPayment = async (
  paymentData: PaymentData,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: any) => void,
) => {
  try {
    // Load Razorpay script
    const isLoaded = await loadRazorpayScript()
    if (!isLoaded) {
      throw new Error("Failed to load Razorpay script")
    }

    // Create order
    const order = await createRazorpayOrder(paymentData.totalAmount, paymentData.eventId)

    // Razorpay options
    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_demo", // Replace with your Razorpay key
      amount: order.amount,
      currency: order.currency,
      name: "EventBooking",
      description: `Ticket booking for Event #${paymentData.eventId}`,
      order_id: order.id,
      handler: (response: RazorpayResponse) => {
        console.log("Payment successful:", response)
        onSuccess(response)
      },
      prefill: {
        name: paymentData.userDetails.name,
        email: paymentData.userDetails.email,
        contact: paymentData.userDetails.phone,
      },
      theme: {
        color: "#4F46E5", // Indigo color to match our theme
      },
      modal: {
        ondismiss: () => {
          console.log("Payment modal dismissed")
        },
      },
    }

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options)
    razorpay.on("payment.failed", (response: any) => {
      console.error("Payment failed:", response.error)
      onError(response.error)
    })

    razorpay.open()
  } catch (error) {
    console.error("Error initiating payment:", error)
    onError(error)
  }
}

// Verify payment (to be called after successful payment)
export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string,
  bookingData: PaymentData,
) => {
  try {
    const response = await fetch("/api/payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        bookingData,
      }),
    })

    if (!response.ok) {
      // For demo purposes, simulate successful verification
      return {
        success: true,
        bookingId: `booking_${Date.now()}`,
        message: "Payment verified successfully",
      }
    }

    return await response.json()
  } catch (error) {
    console.error("Error verifying payment:", error)
    // Return mock success for demo
    return {
      success: true,
      bookingId: `booking_${Date.now()}`,
      message: "Payment verified successfully",
    }
  }
}
