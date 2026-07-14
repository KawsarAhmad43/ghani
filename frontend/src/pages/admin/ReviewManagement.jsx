import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Check, X, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import API_URL from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function ReviewManagement() {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewIds, setSelectedReviewIds] = useState([]);

  const handleBulkApprove = async () => {
    try {
      await Promise.all(selectedReviewIds.map(id => axios.put(`${API_URL}/api/admin/reviews/${id}/status`, { status: 'approved' })));
      toast.success('Selected reviews approved successfully!');
      setSelectedReviewIds([]);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to approve some reviews');
    }
  };

  const handleBulkReject = async () => {
    try {
      await Promise.all(selectedReviewIds.map(id => axios.put(`${API_URL}/api/admin/reviews/${id}/status`, { status: 'rejected' })));
      toast.success('Selected reviews rejected successfully!');
      setSelectedReviewIds([]);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to reject some reviews');
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedReviewIds.length} selected reviews?`)) {
      try {
        await Promise.all(selectedReviewIds.map(id => axios.delete(`${API_URL}/api/admin/reviews/${id}`)));
        toast.success('Selected reviews deleted successfully!');
        setSelectedReviewIds([]);
        fetchReviews();
      } catch (err) {
        toast.error('Failed to delete some reviews');
      }
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/admin/reviews`)
      .then(res => {
        setReviews(res.data || []);
      })
      .catch(err => {
        console.error('Error fetching reviews:', err);
      })
      .finally(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/admin/reviews/${id}/status`, { status });
      fetchReviews();
    } catch (err) {
      toast.error('Failed to update review status');
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`${API_URL}/api/admin/reviews/${id}`);
        fetchReviews();
      } catch (err) {
        toast.error('Failed to delete review');
      }
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5 text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            fill={i < rating ? "currentColor" : "none"} 
            className={i < rating ? "" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="text-brand-green" /> Review Management
        </h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
            <AlertCircle size={40} className="opacity-50" />
            <p className="text-sm">No customer reviews submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedReviewIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm text-red-800 font-semibold shadow-sm w-full animate-fade-in">
                <span>Selected {selectedReviewIds.length} {selectedReviewIds.length === 1 ? 'review' : 'reviews'}</span>
                
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                  <button 
                    onClick={handleBulkApprove}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded font-bold shadow-sm transition flex items-center gap-1"
                  >
                    <Check size={13} /> Approve Selected
                  </button>
                  <button 
                    onClick={handleBulkReject}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1.5 rounded font-bold shadow-sm transition flex items-center gap-1"
                  >
                    <X size={13} /> Reject Selected
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded font-bold shadow-sm transition flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Delete Selected
                  </button>
                  <button 
                    onClick={() => setSelectedReviewIds([])}
                    className="text-gray-550 hover:text-gray-800 text-xs underline font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                  <tr>
                    <th className="p-4 w-10">
                      <input 
                        type="checkbox"
                        className="rounded border-gray-300 text-[#2d4b3e] focus:ring-[#2d4b3e] cursor-pointer"
                        checked={reviews.length > 0 && selectedReviewIds.length === reviews.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReviewIds(reviews.map(r => r.id));
                          } else {
                            setSelectedReviewIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="p-4">Customer Info</th>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Comment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Submitted At</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map(review => (
                    <tr key={review.id} className="hover:bg-gray-50/50">
                      <td className="p-4 w-10">
                        <input 
                          type="checkbox"
                          className="rounded border-gray-300 text-[#2d4b3e] focus:ring-[#2d4b3e] cursor-pointer"
                          checked={selectedReviewIds.includes(review.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedReviewIds([...selectedReviewIds, review.id]);
                            } else {
                              setSelectedReviewIds(selectedReviewIds.filter(id => id !== review.id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-800">{review.customer_name}</div>
                        {review.phone && <div className="text-xs text-gray-400">{review.phone}</div>}
                      </td>
                      <td className="p-4 font-medium text-gray-700">
                        {review.product_name || `Product ID: ${review.product_id}`}
                      </td>
                      <td className="p-4">{renderStars(review.rating)}</td>
                      <td className="p-4 text-gray-600 max-w-xs truncate" title={review.comment}>
                        {review.comment}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          review.status === 'approved' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : review.status === 'rejected' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                        {new Date(review.created_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          {review.status !== 'approved' && (
                            <button
                              onClick={() => updateStatus(review.id, 'approved')}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded transition"
                              title="Approve Review"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {review.status !== 'rejected' && (
                            <button
                              onClick={() => updateStatus(review.id, 'rejected')}
                              className="p-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded transition"
                              title="Reject Review"
                            >
                              <X size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              deleteReview(review.id).then(() => {
                                setSelectedReviewIds(selectedReviewIds.filter(id => id !== review.id));
                              });
                            }}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition"
                            title="Delete Review"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
