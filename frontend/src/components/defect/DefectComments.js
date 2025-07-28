// src/components/DefectComments.js
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Send, 
  Trash2, 
  Edit, 
  User,
  MessageSquare,
  AlertCircle,
  Loader,
  Clock
} from "lucide-react";

const DefectComments = ({ defectId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  
  // Mock user data - in a real app, this would come from auth context
  const currentUser = {
    id: "user123",
    name: "John Smith",
    avatar: null,
    role: "Quality Manager"
  };
  
  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        
        // Mock API call - replace with actual API call
        // const response = await api.getComments(defectId);
        
        // Mock data
        const mockComments = [
          {
            id: "comment1",
            userId: "user456",
            userName: "Sarah Johnson",
            userRole: "Production Supervisor",
            text: "I checked with the operator. This appears to be due to tension issues with the sewing machine. They'll be adjusting it for future production.",
            timestamp: new Date('2024-04-18T14:22:30'),
            isPrivate: false,
            edited: false
          },
          {
            id: "comment2",
            userId: "user789",
            userName: "Mike Chen",
            userRole: "Quality Inspector",
            text: "Similar defects were found in batch #4572. We should check if they're using the same thread supplier.",
            timestamp: new Date('2024-04-17T09:45:12'),
            isPrivate: false,
            edited: true
          },
          {
            id: "comment3",
            userId: "user123",
            userName: "John Smith",
            userRole: "Quality Manager",
            text: "I've requested a report from the materials team about recent thread quality issues.",
            timestamp: new Date('2024-04-16T16:30:45'),
            isPrivate: true,
            edited: false
          }
        ];
        
        // Sort comments by timestamp (newest first)
        const sortedComments = mockComments.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        setComments(sortedComments);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments");
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [defectId]);
  
  // Submit new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    try {
      setSubmitting(true);
      
      // Mock API call - replace with actual API call
      // await api.createComment(defectId, { text: newComment, isPrivate: false });
      
      // Mock success - add comment to list
      const newCommentObj = {
        id: `comment${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        text: newComment,
        timestamp: new Date(),
        isPrivate: false,
        edited: false
      };
      
      setComments([newCommentObj, ...comments]);
      setNewComment("");
      setSubmitting(false);
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("Failed to submit comment");
      setSubmitting(false);
    }
  };
  
  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    
    try {
      // Mock API call - replace with actual API call
      // await api.deleteComment(defectId, commentId);
      
      // Remove comment from list
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
    }
  };
  
  // Start editing comment
  const handleEditStart = (comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };
  
  // Cancel editing
  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditText("");
  };
  
  // Save edited comment
  const handleEditSave = async (commentId) => {
    if (!editText.trim()) return;
    
    try {
      // Mock API call - replace with actual API call
      // await api.updateComment(defectId, commentId, { text: editText });
      
      // Update comment in list
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, text: editText, edited: true } 
          : comment
      ));
      
      setEditingCommentId(null);
      setEditText("");
    } catch (err) {
      console.error("Error updating comment:", err);
      setError("Failed to update comment");
    }
  };
  
  // Format relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return format(commentTime, 'MMM d, yyyy');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-6 w-6 text-blue-600 animate-spin mr-3" />
        <span className="text-gray-600">Loading comments...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSubmitComment}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-800">{currentUser.name}</span>
                <span className="text-xs text-gray-500 ml-2">{currentUser.role}</span>
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              ></textarea>
              <div className="mt-2 flex justify-between items-center">
                <div className="flex items-center">
                  <label className="inline-flex items-center text-sm text-gray-600">
                    <input 
                      type="checkbox" 
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Mark as private note</span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    !newComment.trim() || submitting
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {submitting ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {/* Comments List */}
      <div className="space-y-4">
        <div className="flex items-center text-gray-500 text-sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          <span>{comments.length} Comments</span>
        </div>
        
        {comments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No comments yet</p>
            <p className="text-sm text-gray-400">Be the first to comment on this defect</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`p-4 rounded-lg ${
                  comment.isPrivate 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {/* User Avatar */}
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-800">{comment.userName}</span>
                        <span className="text-xs text-gray-500 ml-2">{comment.userRole}</span>
                        {comment.isPrivate && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Private
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span title={format(new Date(comment.timestamp), 'PPpp')}>
                          {getRelativeTime(comment.timestamp)}
                        </span>
                        {comment.edited && (
                          <span className="ml-2 italic">(edited)</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Comment Content - Editable or Static */}
                    {editingCommentId === comment.id ? (
                      <div className="mt-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        ></textarea>
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            onClick={handleEditCancel}
                            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditSave(comment.id)}
                            disabled={!editText.trim()}
                            className={`px-3 py-1 text-sm rounded ${
                              !editText.trim()
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-800 whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    )}
                    
                    {/* Actions - only if it's current user's comment and not editing */}
                    {comment.userId === currentUser.id && editingCommentId !== comment.id && (
                      <div className="mt-2 flex space-x-4 text-xs">
                        <button 
                          onClick={() => handleEditStart(comment)}
                          className="text-gray-500 hover:text-blue-600 flex items-center"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-500 hover:text-red-600 flex items-center"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DefectComments;