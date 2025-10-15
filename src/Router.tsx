"use client"

import React, { Suspense, lazy } from "react"
import { Routes, Route } from "react-router-dom"
import Layout from "./components/DashboardHelpers/Layout"
import { LoadingSpinner, SkeletonLoader } from "./components/LoadingSpinner"
import ProtectedRoute from "./helpers"

// Lazy load pages
const Home = lazy(() => import("./pages/Home"))
const HomePage = lazy(() => import("./pages/User/HomePage"))
const CreateEvent = lazy(() => import("./pages/createEvent"))
const VenueSelectionPage = lazy(() => import("./pages/venue-selection"))
const VenueCreatorPage = lazy(() => import("./pages/createEvent/venue-creator"))
const MyTickets = lazy(() => import("./pages/my-tivkets"))
const MyEvents = lazy(() => import("./pages/my-events"))
const EventCards = lazy(() => import("./pages/event-card"))
const PaymentPage = lazy(() => import("./pages/payment"))
const Commen = lazy(() => import("./components/DashboardHelpers/Commen"))
const NotFound = lazy(() => import("./components/DashboardHelpers/NotFound"))
const EventManagementTable = lazy(() => import("./pages/Admin/events"))
const VenueManagementTable = lazy(() => import("./pages/Admin/venues"))
const UserManagementTable = lazy(() => import("./pages/Admin/organizers"))
const ContactUsPage = lazy(() => import("./pages/contactUs"))
const SupportPage = lazy(() => import("./pages/support"))

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
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Oops! Something went wrong.
              </h2>
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
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/common" element={<Commen />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/*" element={<NotFound />} />

          {/* Customer / Organizer Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <HomePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/venues"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <VenueSelectionPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/venues/:action"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <VenueCreatorPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/venues/:action/:venueId"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <VenueCreatorPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <MyTickets />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-events"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <MyEvents />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/venues/event/:action/:venueId"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <CreateEvent />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
                    <Route
            path="my-events/event/:action/:venueId"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <CreateEvent />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/event/:eventId"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <PaymentPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-events/event/show/:id"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <EventCards />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/manage/events"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <EventManagementTable />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/venues"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <VenueManagementTable />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/organisers"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Layout>
                  <Suspense fallback={<SkeletonLoader />}>
                    <UserManagementTable />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Common for all logged-in users */}
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ContactUsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SupportPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="p-6 text-white">Settings Page</div>
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </LazyLoadErrorBoundary>
  )
}

export default Router
