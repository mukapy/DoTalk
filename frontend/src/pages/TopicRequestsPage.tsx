import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Clock, CheckCircle, XCircle, Filter, User, ShieldOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useRoomStore } from "../store/roomStore";
import type { TopicRequest } from "../types";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

export default function TopicRequestsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isModOrAdmin = user?.type === "moderator" || user?.type === "admin";

  const {
    pendingRequests,
    fetchPendingRequests,
    reviewTopicRequest,
    isLoading,
    error,
    clearError,
  } = useRoomStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!isModOrAdmin) return;
    const status = statusFilter === "all" ? undefined : statusFilter;
    fetchPendingRequests(status);
  }, [statusFilter, fetchPendingRequests, isModOrAdmin]);

  const handleReview = async (id: number, status: "approved" | "rejected") => {
    setReviewingId(id);
    setReviewError(null);
    try {
      await reviewTopicRequest(id, status);
    } catch {
      setReviewError(`Failed to ${status === "approved" ? "approve" : "reject"} request.`);
    } finally {
      setReviewingId(null);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={14} className="text-green-400" />;
      case "rejected":
        return <XCircle size={14} className="text-red-400" />;
      default:
        return <Clock size={14} className="text-amber-400" />;
    }
  };

  const statusBadge = (status: string) => {
    const base = "px-2 py-0.5 rounded-full text-xs font-medium capitalize";
    switch (status) {
      case "approved":
        return `${base} bg-green-500/15 text-green-400`;
      case "rejected":
        return `${base} bg-red-500/15 text-red-400`;
      default:
        return `${base} bg-amber-500/15 text-amber-400`;
    }
  };

  const filterTabs: { label: string; value: StatusFilter }[] = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "All", value: "all" },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isModOrAdmin) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24">
        <ShieldOff size={48} className="text-surface-600 mb-4" />
        <h1 className="text-xl font-bold text-surface-100 mb-2">Access Denied</h1>
        <p className="text-surface-400 text-sm mb-6">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-none"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Topic Requests</h1>
        <p className="text-surface-400 text-sm mt-0.5">
          Review and manage topic suggestions from users
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-surface-900 border border-surface-700 rounded-lg p-1 w-fit">
        <Filter size={14} className="text-surface-500 ml-2 mr-1" />
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border-none ${
              statusFilter === tab.value
                ? "bg-primary-600 text-white"
                : "bg-transparent text-surface-400 hover:text-surface-200 hover:bg-surface-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error display */}
      {(error || reviewError) && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-red-400 text-sm">{reviewError || error}</p>
          <button
            onClick={() => {
              setReviewError(null);
              clearError();
            }}
            className="p-1 text-red-400 hover:text-red-300 bg-transparent border-none cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && pendingRequests.length === 0 && (
        <div className="text-surface-500 text-sm py-8 text-center">
          Loading requests...
        </div>
      )}

      {/* Empty state */}
      {!isLoading && pendingRequests.length === 0 && (
        <div className="bg-surface-900 border border-surface-700 rounded-xl p-10 text-center">
          <Clock size={32} className="text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400 text-sm">
            {statusFilter === "pending"
              ? "No pending requests to review"
              : `No ${statusFilter === "all" ? "" : statusFilter} requests found`}
          </p>
        </div>
      )}

      {/* Requests list */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          {pendingRequests.map((request: TopicRequest) => (
            <div
              key={request.id}
              className="bg-surface-900 border border-surface-700 rounded-xl p-5 hover:border-surface-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left side: request info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    {statusIcon(request.status)}
                    <h3 className="text-surface-100 font-semibold text-sm">
                      {request.name}
                    </h3>
                    <span className={statusBadge(request.status)}>
                      {request.status}
                    </span>
                  </div>

                  {request.description && (
                    <p className="text-surface-400 text-xs mb-2 leading-relaxed">
                      {request.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-surface-500">
                    {request.created_by && (
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {request.created_by.username}
                      </span>
                    )}
                    <span>{formatDate(request.created_at)}</span>
                    {request.reviewed_by && (
                      <span className="text-surface-500">
                        Reviewed by {request.reviewed_by.username}
                        {request.reviewed_at && ` on ${formatDate(request.reviewed_at)}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side: action buttons (only for pending) */}
                {request.status === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReview(request.id, "approved")}
                      disabled={reviewingId === request.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(request.id, "rejected")}
                      disabled={reviewingId === request.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
