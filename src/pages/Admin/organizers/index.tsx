import React, { useState, useEffect, useRef } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  Mail,
  Phone,
  X,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  AlertTriangle,
  Save,
} from "lucide-react"
import axiosInstance from "../../../api/axiosInstance"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { InitialReduxStateProps } from "../../../redux/redux.props"

interface User {
  id: number
  name: string
  email: string
  phone: string
  role?: string
}

interface UserDetails {
  id: number
  name: string
  email: string
  phone: string
}

interface SortConfig {
  field: string
  direction: "asc" | "desc"
}

const UserManagementTable = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
const selectedRoleRef = useRef<"ALL" | "CUSTOMER" | "ORGANIZER">("ALL");
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "id",
    direction: "desc",
  })

  const navigate = useNavigate()
  const role = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo.roles[0]
  )

  useEffect(() => {
    if (role.toLocaleLowerCase() !== "admin") {
      navigate("/notfound")
    }
  }, [role, navigate])

  // View modal state
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean
    user: UserDetails | null
    loading: boolean
  }>({ isOpen: false, user: null, loading: false })

  // Edit modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    user: UserDetails | null
    loading: boolean
  }>({ isOpen: false, user: null, loading: false })

  // Delete popup state
  const [showDelete, setShowDelete] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const pageSizeOptions = [10, 20, 50, 100]

  useEffect(() => {
    if (role.toLocaleLowerCase() === "admin") {
      loadUsers()
    }
  }, [currentPage, selectedRoleRef.current, searchTerm, sortConfig, itemsPerPage, role])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: itemsPerPage.toString(),
        sort: `${sortConfig.field},${sortConfig.direction}`,
      })

      if (searchTerm.trim()) {
        params.append("q", searchTerm.trim())
      }

      let endpoint = "/users"
      if (selectedRoleRef.current !== "ALL") {
        endpoint = "/users/by-role"
        params.append("role", selectedRoleRef.current)
      }

      const res = await axiosInstance.get(`${endpoint}?${params.toString()}`)

      if (res.data.content) {
        setUsers(res.data.content)
        setTotalElements(res.data.totalElements)
        setTotalPages(res.data.totalPages)
      } else {
        setUsers(res.data)
        setTotalElements(res.data.length)
        setTotalPages(Math.ceil(res.data.length / itemsPerPage))
      }
    } catch (err) {
      console.error("Failed to fetch users", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-gray-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-gray-600" />
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setItemsPerPage(newPageSize)
    setCurrentPage(0)
  }

  // const handleRoleChange = (role: "ALL" | "CUSTOMER" | "ORGANIZER") => {
  //   setSelectedRole(role)
  //   setCurrentPage(0)
  // }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(0)
  }

  // -------- View --------
  const openViewModal = async (id: number) => {
    setViewModal({ isOpen: true, user: null, loading: true })
    try {
      const res = await axiosInstance.get(`/users/${id}`)
      setViewModal({ isOpen: true, user: res.data, loading: false })
    } catch (err) {
      console.error("Failed to load user", err)
      setViewModal({ isOpen: false, user: null, loading: false })
    }
  }

  const closeViewModal = () => {
    setViewModal({ isOpen: false, user: null, loading: false })
  }

  // -------- Edit --------
  const openEditModal = async (id: number) => {
    setEditModal({ isOpen: true, user: null, loading: true })
    try {
      const res = await axiosInstance.get(`/users/${id}`)
      setEditModal({ isOpen: true, user: res.data, loading: false })
    } catch (err) {
      console.error("Failed to load user", err)
      setEditModal({ isOpen: false, user: null, loading: false })
    }
  }

  const closeEditModal = () => {
    setEditModal({ isOpen: false, user: null, loading: false })
  }

  const handleEditSave = async () => {
    if (!editModal.user) return
    try {
      await axiosInstance.put(`/users/${editModal.user.id}`, editModal.user)
      setEditModal({ isOpen: false, user: null, loading: false })
      loadUsers()
    } catch (err) {
      console.error("Failed to update user", err)
    }
  }

  // -------- Delete --------
  const confirmDelete = (user: User) => {
    setUserToDelete(user)
    setShowDelete(true)
  }

  const closeDeleteModal = () => {
    setShowDelete(false)
    setUserToDelete(null)
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    try {
      await axiosInstance.delete(`/users/${userToDelete.id}`)
      setShowDelete(false)
      setUserToDelete(null)
      loadUsers()
    } catch (err) {
      console.error("Failed to delete user", err)
    }
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(0, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (range[0] > 0) {
      if (range[0] > 1) {
        rangeWithDots.push(0, "...")
      } else {
        rangeWithDots.push(0)
      }
    }

    rangeWithDots.push(...range)

    if (range[range.length - 1] < totalPages - 1) {
      if (range[range.length - 1] < totalPages - 2) {
        rangeWithDots.push("...", totalPages - 1)
      } else {
        rangeWithDots.push(totalPages - 1)
      }
    }

    return rangeWithDots
  }

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-900">
            User Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            View, edit and manage system users
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Search + Filter */}
          <div className="p-6 border-b border-slate-200 flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-full"
              />
            </div>
            {/* <select
              value={selectedRole}
              onChange={(e) =>
                handleRoleChange(e.target.value as "ALL" | "CUSTOMER" | "ORGANIZER")
              }
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Users</option>
              <option value="ORGANIZER">Organizers</option>
            </select> */}
          </div>

          {/* Table */}
          <div className="relative">
            <div className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 pl-5">
              <table className="w-full">
                <thead>
                  <tr>
                    <th
                      className="px-2 py-4 w-[15%] text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center gap-2">
                        User ID {getSortIcon("id")}
                      </div>
                    </th>
                    <th
                      className="px-2 py-4 w-[20%] text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        Name {getSortIcon("name")}
                      </div>
                    </th>
                    <th
                      className="px-2 py-4 w-[25%] text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center gap-2">
                        Email {getSortIcon("email")}
                      </div>
                    </th>
                    <th className="px-2 py-4 w-[20%] text-left text-xs font-semibold text-slate-700 uppercase">
                      Phone
                    </th>
                    <th className="px-2 py-4 w-[20%] text-center text-xs font-semibold text-slate-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable Body */}
            <div className="h-80 overflow-y-auto pl-5">
              <table className="w-full">
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-12 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          <span className="ml-3">Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-12 text-center">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-2 py-3 w-[15%]">#{user.id}</td>
                        <td className="px-2 py-3 w-[20%]">{user.name}</td>
                        <td className="px-2 py-3 w-[25%]">{user.email}</td>
                        <td className="px-2 py-3 w-[20%]">{user.phone}</td>
                        <td className="px-2 py-3 w-[20%]">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openViewModal(user.id)}
                              className="flex items-center gap-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" /> 
                            </button>
                            <button
                              onClick={() => openEditModal(user.id)}
                              className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" /> 
                            </button>
                            <button
                              onClick={() => confirmDelete(user)}
                              className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> 
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600">
                  Showing {currentPage * itemsPerPage + 1} to{" "}
                  {Math.min((currentPage + 1) * itemsPerPage, totalElements)} of{" "}
                  {totalElements} results
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    {pageSizeOptions.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <span className="text-sm text-slate-600">per page</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex gap-1">
                  {getVisiblePages().map((pageNum, index) => 
                    pageNum === '...' ? (
                      <span key={`dots-${index}`} className="px-3 py-2 text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum as number)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-indigo-600 text-white"
                            : "text-slate-600 bg-white border border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {(pageNum as number) + 1}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1 || totalPages === 0}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewModal.isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:left-64 md:top-18 left-0 sm:top-10 animate-[fadeIn_0.2s_ease-out]" 
               onClick={closeViewModal} />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 rounded-3xl p-8 w-full max-w-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] pointer-events-auto transform animate-[slideUp_0.3s_ease-out] border border-white/60">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform hover:scale-110 transition-transform duration-300">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        User Details
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">Complete user information</p>
                    </div>
                  </div>
                  <button
                    onClick={closeViewModal}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100/80 transition-all duration-200 group hover:rotate-90"
                  >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                </div>

                {viewModal.loading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-indigo-400 opacity-20"></div>
                    </div>
                    <span className="ml-4 text-gray-600 font-medium">Loading user details...</span>
                  </div>
                ) : viewModal.user ? (
                  <div className="space-y-4">
                    <div className="group flex items-center gap-4 p-5 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-100/50">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Full Name</p>
                        <p className="text-base font-bold text-gray-900 truncate">{viewModal.user.name}</p>
                      </div>
                    </div>

                    <div className="group flex items-center gap-4 p-5 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-100/50">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow duration-300">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Email Address</p>
                        <p className="text-base font-bold text-gray-900 truncate">{viewModal.user.email}</p>
                      </div>
                    </div>

                    <div className="group flex items-center gap-4 p-5 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-100/50">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow duration-300">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Phone Number</p>
                        <p className="text-base font-bold text-gray-900">{viewModal.user.phone}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {!viewModal.loading && (
                  <div className="flex justify-end mt-8">
                    <button
                      onClick={closeViewModal}
                      className="px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl text-gray-700 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:left-64 md:top-18 left-0 sm:top-10 animate-[fadeIn_0.2s_ease-out]" 
               onClick={closeEditModal} />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 rounded-3xl p-8 w-full max-w-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] pointer-events-auto transform animate-[slideUp_0.3s_ease-out] border border-white/60">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-yellow-400/30 to-amber-400/30 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 transform hover:scale-110 transition-transform duration-300">
                      <Pencil className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Edit User
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">Update user information</p>
                    </div>
                  </div>
                  <button
                    onClick={closeEditModal}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100/80 transition-all duration-200 group hover:rotate-90"
                  >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                </div>

                {editModal.loading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-amber-400 opacity-20"></div>
                    </div>
                    <span className="ml-4 text-gray-600 font-medium">Loading...</span>
                  </div>
                ) : editModal.user ? (
                  <div className="space-y-4">
                    <div className="group">
                      <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 block">
                        Full Name
                      </label>
                      <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 focus-within:bg-white/80 focus-within:border-amber-300 focus-within:shadow-lg transition-all duration-300">
                        <User className="w-5 h-5 text-amber-500" />
                        <input
                          type="text"
                          value={editModal.user.name}
                          onChange={(e) =>
                            setEditModal((prev) => ({
                              ...prev,
                              user: prev.user
                                ? { ...prev.user, name: e.target.value }
                                : null,
                            }))
                          }
                          className="flex-1 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400"
                          placeholder="Enter full name"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 block">
                        Email Address
                      </label>
                      <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 focus-within:bg-white/80 focus-within:border-amber-300 focus-within:shadow-lg transition-all duration-300">
                        <Mail className="w-5 h-5 text-emerald-500" />
                        <input
                          type="email"
                          value={editModal.user.email}
                          onChange={(e) =>
                            setEditModal((prev) => ({
                              ...prev,
                              user: prev.user
                                ? { ...prev.user, email: e.target.value }
                                : null,
                            }))
                          }
                          className="flex-1 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400"
                          placeholder="Enter email"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 block">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 focus-within:bg-white/80 focus-within:border-amber-300 focus-within:shadow-lg transition-all duration-300">
                        <Phone className="w-5 h-5 text-blue-500" />
                        <input
                          type="text"
                          value={editModal.user.phone}
                          onChange={(e) =>
                            setEditModal((prev) => ({
                              ...prev,
                              user: prev.user
                                ? { ...prev.user, phone: e.target.value }
                                : null,
                            }))
                          }
                          className="flex-1 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {!editModal.loading && (
                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      onClick={closeEditModal}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl text-gray-700 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSave}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {showDelete && userToDelete && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:left-64 md:top-18 left-0 sm:top-10 animate-[fadeIn_0.2s_ease-out]" 
               onClick={closeDeleteModal} />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-gradient-to-br from-white via-red-50/30 to-rose-50/40 rounded-3xl p-8 w-full max-w-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] pointer-events-auto transform animate-[slideUp_0.3s_ease-out] border border-white/60">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-400/30 to-rose-400/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-pink-400/30 to-red-400/30 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 transform hover:scale-110 transition-transform duration-300">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Delete User
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone</p>
                    </div>
                  </div>
                  <button
                    onClick={closeDeleteModal}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100/80 transition-all duration-200 group hover:rotate-90"
                  >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100/50 mb-6">
                  <p className="text-gray-700 mb-4">
                    Are you sure you want to delete this user? This action is permanent and cannot be reversed.
                  </p>
                  
                  <div className="bg-red-50/80 rounded-xl p-4 border border-red-200/50">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-900 mb-1">User Information</p>
                        <p className="text-sm text-red-800 font-medium truncate">{userToDelete.name}</p>
                        <p className="text-xs text-red-600 truncate">{userToDelete.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeDeleteModal}
                    className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl text-gray-700 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserManagementTable