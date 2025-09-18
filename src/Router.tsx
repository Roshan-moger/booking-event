"use client"

import React, { Suspense, lazy } from "react"
import { Routes, Route } from "react-router-dom"
import Layout from "./components/DashboardHelpers/Layout"
import { LoadingSpinner, SkeletonLoader } from "./components/LoadingSpinner"
// ✅ Lazy load pages
const Home = lazy(() => import("./pages/Home")) // Login Page
const HomePage = lazy(() => import("./pages/User/HomePage"))
const DetailPage = lazy(() => import("./pages/User/DetailPage"))
const CreateEvent = lazy(() => import("./pages/createEvent"))
const VenueSelectionPage = lazy(() => import("./pages/venue-selection"))
const VenueCreatorPage = lazy(() => import("./pages/createEvent/venue-creator"))
const MyTickets = lazy(() => import("./pages/my-tivkets"))
const MyEvents = lazy(() => import("./pages/my-events"))
const EventCards = lazy(() => import("./pages/event-card"))
const PaymentPage = lazy(() => import("./pages/payment"))
const Commen = lazy(() => import("./components/DashboardHelpers/Commen"))

class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Lazy loading error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong.</h2>
              <p className="text-gray-600 mb-4">Failed to load the page.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

const Router: React.FC = () => {
  return (
    <LazyLoadErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* ✅ Public Routes (Without Layout) */}
          <Route path="/" element={<Home />} />
          <Route path="/common" element={<Commen />} />

          {/* ✅ Dashboard Routes (With Layout) */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Suspense fallback={<SkeletonLoader />}>
                  <HomePage />
                </Suspense>
              </Layout>
            }
          />

          {/* ✅ Venue Selection - Inside Layout */}
          <Route
            path="/venue"
            element={
              <Layout>
                <Suspense fallback={<SkeletonLoader />}>
                  <VenueSelectionPage />
                </Suspense>
              </Layout>
            }
          />

          {/* ✅ Create Venue - Inside Layout */}
          <Route
            path="/venue/create"
            element={
              <Layout>
                <Suspense fallback={<SkeletonLoader />}>
                  <VenueCreatorPage />
                </Suspense>
              </Layout>
            }
          />
     <Route
            path="/venue/edit/:venueId"
            element={
              <Layout>
                <Suspense fallback={<SkeletonLoader />}>
                  <VenueCreatorPage />
                </Suspense>
              </Layout>
            }
          />

          {/* ✅ Create Event - Inside Layout */}
          <Route
            path="/tickets"
            element={
              <Layout>
                <Suspense fallback={<SkeletonLoader />}>
                  <MyTickets />
                </Suspense>
              </Layout>
            }
          />

          {/* ✅ Create Event with Venue ID - Inside Layout */}
          <Route
            path="event/add/:id"
            element={
              <Layout>
                <Suspense fallback={<SkeletonLoader />}>
                  <CreateEvent />
                </Suspense>
              </Layout>
            }
          />

             <Route
            path="event/edit/:id"
            element={
              <Layout>
                <Suspense fallback={<SkeletonLoader />}>
                  <CreateEvent />
                </Suspense>
              </Layout>
            }
          />
       <Route
            path="event/edit/:venueId"
            element={
              <Layout>
                <Suspense fallback={<SkeletonLoader />}>
                  <CreateEvent />
                </Suspense>
              </Layout>
            }
          />
          <Route
            path="/my-events"
            element={
              <Layout>
                <Suspense fallback={<SkeletonLoader />}>
                  <MyEvents/>
                </Suspense>
              </Layout>
            }
          />

       <Route
            path="/payment/evnet/:eventId"
            element={
              <Layout>
                <Suspense fallback={<SkeletonLoader />}>
                  <PaymentPage/>
                </Suspense>
              </Layout>
            }
          />
         <Route
            path="event/show/:id"
            element={
              <Layout>
                <Suspense fallback={<SkeletonLoader />}>
                  <EventCards />
                </Suspense>
              </Layout>
            }
          />
          <Route
            path="/detail/:id"
            element={
              <Layout>
                <Suspense fallback={<LoadingSpinner />}>
                  <DetailPage />
                </Suspense>
              </Layout>
            }
          />

          {/* ✅ Static Pages Inside Dashboard */}
          <Route
            path="/world-cup"
            element={
              <Layout>
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="p-6 text-white">World Cup Content</div>
                </Suspense>
              </Layout>
            }
          />

          <Route
            path="/bollywood"
            element={
              <Layout>
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="p-6 text-white">Bollywood Content</div>
                </Suspense>
              </Layout>
            }
          />

          <Route
            path="/support"
            element={
              <Layout>
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="p-6 text-white">Support Page</div>
                </Suspense>
              </Layout>
            }
          />

          <Route
            path="/settings"
            element={
              <Layout>
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="p-6 text-white">Settings Page</div>
                </Suspense>
              </Layout>
            }
          />
        </Routes>
      </Suspense>
    </LazyLoadErrorBoundary>
  )
}

export default Router
