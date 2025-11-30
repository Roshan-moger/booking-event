
import React from "react"
import { useEffect, useState } from "react"
import {  Building2, CreditCard, Pencil, PlusCircle, Eye, EyeOff, Shield, Plus } from "lucide-react"
import axios from "axios"
import axiosInstance from "../../../api/axiosInstance"
import { Input } from "../../../components/UI/input"

interface BankDetails {
  accountHolderName: string
  accountNumber: string
  confirmAccountNumber?: string
  ifscCode: string
  bankName: string
  branchName?: string
}

export default function BankDetailsPage() {
  const [form, setForm] = useState<BankDetails>({
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
  })

  const [existingBankDetails, setExistingBankDetails] = useState<BankDetails | null>(null)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showAccount, setShowAccount] = useState(false)

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const res = await axiosInstance.get("/vendor/me")

        if (res.status === 200) {
          const bank = res.data

          setExistingBankDetails({
            accountHolderName: bank.accountHolderName,
            accountNumber: bank.accountNumber,
            ifscCode: bank.ifscCode,
            bankName: bank.bankName,
            branchName: bank.branch,
          })
        }
      } catch {
        setExistingBankDetails(null)
      }
    }

    fetchBankDetails()
  }, [])

  const openEditForm = () => {
    if (existingBankDetails) {
      setForm({
        ...existingBankDetails,
        confirmAccountNumber: existingBankDetails.accountNumber,
      })
    }
    setShowForm(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (success) setSuccess(false)
    if (error) setError(null)
  }

  const handleIFSCBlur = async () => {
    if (!form.ifscCode || form.ifscCode.length < 4) return
    try {
      const res = await axios.get(`https://ifsc.razorpay.com/${form.ifscCode}`)
      if (res.data?.BANK) {
        setForm((prev) => ({
          ...prev,
          bankName: res.data.BANK,
          branchName: res.data.BRANCH || "",
        }))
      }
    } catch {
      setError("Invalid IFSC code")
    }
  }

  const handleSubmit = async () => {
    if (form.accountNumber !== form.confirmAccountNumber) {
      setError("Account numbers do not match")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const body = {
        accountHolderName: form.accountHolderName,
        accountNumber: form.accountNumber,
        bankName: form.bankName,
        ifscCode: form.ifscCode,
        branch: form.branchName,
      }

      await axiosInstance.post("/vendor", body)

      const meRes = await axiosInstance.get("/vendor/me")
      const updatedBank = meRes.data

      if (!updatedBank) throw new Error("Missing updated bank details")

      setExistingBankDetails({
        accountHolderName: updatedBank.accountHolderName,
        accountNumber: updatedBank.accountNumber,
        bankName: updatedBank.bankName,
        ifscCode: updatedBank.ifscCode,
        branchName: updatedBank.branch,
      })

      setSuccess(true)
      setShowForm(false)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    form.accountHolderName && form.accountNumber && form.confirmAccountNumber && form.ifscCode && form.bankName

  return (
 <div className="bg-slate-50 min-h-[88vh] flex justify-center">
      <div className="w-full">
        {/* -------------------------------------- */}
        {/* Page Header (Beautiful) */}
        {/* -------------------------------------- */}
        <div className="px-6 py-4 flex flex-row items-start sm:items-center justify-between gap-4 bg-white shadow border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bank Details</h1>
            <p className="text-sm text-slate-600 mt-1">
              Add & manage your payout account securely
            </p>
          </div>

          {!existingBankDetails && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r 
              from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
              text-white px-4 py-2 rounded-xl font-semibold shadow-lg 
              hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Account
            </button>
          )}
        </div>

        {/* -------------------------------------- */}
        {/* Existing Bank Details */}
        {/* -------------------------------------- */}
        <div className="mt-8 w-full max-w-md mx-auto">
          {!showForm && existingBankDetails && (
            <div className="rounded-xl shadow-md border p-6 bg-white w-full transition-all duration-300 hover:shadow-lg">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    Account Holder
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {existingBankDetails.accountHolderName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Account Number
                    </p>
                    <p className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      {existingBankDetails.accountNumber.replace(
                        /\d(?=\d{4})/g,
                        "•"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      IFSC
                    </p>
                    <p className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      {existingBankDetails.ifscCode}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    Bank
                  </p>
                  <p className="text-sm text-slate-700">
                    {existingBankDetails.bankName}
                  </p>
                </div>

                {existingBankDetails.branchName && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Branch
                    </p>
                    <p className="text-sm text-slate-700">
                      {existingBankDetails.branchName}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={openEditForm}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 
                  bg-blue-600 text-white rounded-lg font-medium text-sm 
                  hover:bg-blue-700 hover:shadow-md active:scale-[.98] transition-all"
              >
                <Pencil className="w-4 h-4" /> Edit Details
              </button>
            </div>
          )}

          {/* -------------------------------------- */}
          {/* Empty State */}
          {/* -------------------------------------- */}
          {!showForm && !existingBankDetails && (
            <div className="text-center bg-white rounded-lg shadow border border-slate-200 p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                No Bank Account
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Add your bank details to receive payouts
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 
                bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors 
                font-medium text-sm"
              >
                <PlusCircle className="w-4 h-4" /> Add Account
              </button>
            </div>
          )}

          {/* -------------------------------------- */}
          {/* FORM */}
          {/* -------------------------------------- */}
          {showForm && (
            <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
              <div className="bg-blue-600 p-4">
                <h2 className="text-sm font-semibold text-white">
                  {existingBankDetails ? "Update" : "Add"} Bank Details
                </h2>
              </div>

              <div className="p-5 space-y-4">
                {/* Account Holder Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Holder <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="accountHolderName"
                    value={form.accountHolderName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showAccount ? "text" : "password"}
                      name="accountNumber"
                      value={form.accountNumber}
                      onChange={handleChange}
                      placeholder="XXXXXXXXXXXX"
                      className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccount((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showAccount ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Account */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm Account <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="confirmAccountNumber"
                    value={form.confirmAccountNumber}
                    onChange={handleChange}
                    placeholder="Re-enter account"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* IFSC + Bank */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      IFSC <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="ifscCode"
                      value={form.ifscCode}
                      onChange={handleChange}
                      onBlur={handleIFSCBlur}
                      placeholder="SBIN0001234"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Bank <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="bankName"
                      value={form.bankName}
                      disabled
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Branch{" "}
                    <span className="text-slate-400 text-xs font-normal">
                      (Optional)
                    </span>
                  </label>
                  <Input
                    type="text"
                    name="branchName"
                    value={form.branchName}
                    onChange={handleChange}
                    placeholder="Main Branch"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-4 border-t border-slate-200 flex gap-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !isFormValid}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Footer */}
          <div className="mt-4 flex items-center justify-center gap-2 text-slate-600">
            <Shield className="w-4 h-4 text-green-600" />
            <p className="text-xs">Encrypted with 256-bit SSL</p>
          </div>
        </div>
      </div>
    </div>

  )
}
