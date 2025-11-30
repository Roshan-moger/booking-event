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
    if (role !== "ADMIN") {
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
      loadUsers()
  
  }, [currentPage, selectedRoleRef.current, searchTerm, sortConfig, itemsPerPage])

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
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      onClick={closeViewModal}
    />
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
          </div>
          <button
            onClick={closeViewModal}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {viewModal.loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-500"></div>
          </div>
        ) : (
          viewModal.user && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 border rounded-lg p-3 bg-gray-50">
                <User className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-800">{viewModal.user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border rounded-lg p-3 bg-gray-50">
                <Mail className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{viewModal.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border rounded-lg p-3 bg-gray-50">
                <Phone className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">{viewModal.user.phone}</p>
                </div>
              </div>
            </div>
          )
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={closeViewModal}
            className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </>
)}

{/* Edit Modal */}
{editModal.isOpen && (
  <>
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      onClick={closeEditModal}
    />
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-800">Edit User</h2>
          </div>
          <button
            onClick={closeEditModal}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {editModal.loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-amber-500"></div>
          </div>
        ) : (
          editModal.user && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <User className="w-4 h-4 text-blue-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={editModal.user.name}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      user: prev.user ? { ...prev.user, name: e.target.value } : null,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  Email
                </label>
                <input
                  type="email"
                  value={editModal.user.email}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      user: prev.user ? { ...prev.user, email: e.target.value } : null,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  Phone
                </label>
                <input
                  type="text"
                  value={editModal.user.phone}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      user: prev.user ? { ...prev.user, phone: e.target.value } : null,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          )
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={closeEditModal}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleEditSave}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  </>
)}

{/* Delete Modal */}
{showDelete && userToDelete && (
  <>
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      onClick={closeDeleteModal}
    />
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-800">Delete User</h2>
          </div>
          <button
            onClick={closeDeleteModal}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-700 mb-4">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>

        <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-6 flex items-center gap-3">
          <User className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-700">{userToDelete.name}</p>
            <p className="text-sm text-red-600">{userToDelete.email}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={closeDeleteModal}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  </>
)}


    </div>
  )
}

export default UserManagementTable