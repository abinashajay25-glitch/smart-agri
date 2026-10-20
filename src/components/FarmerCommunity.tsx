import React, { useState } from 'react'
import {
  Users,
  MessageSquare,
  Heart,
  Share2,
  ShieldCheck,
  Send,
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  Trash2,
  Edit2,
  CheckCircle2,
  BadgeCheck,
  MapPin,
  Sparkles,
  PhoneOff,
  Languages,
  X,
  Flag
} from 'lucide-react'
import { CommunityPost, CommunityComment, UserProfile } from '../types'
import { saveStoredCommunityPosts } from '../storageService'

interface CommunityProps {
  user: UserProfile
  posts: CommunityPost[]
  setPosts: (posts: CommunityPost[]) => void
  language: 'en' | 'ta'
}

export const FarmerCommunity: React.FC<CommunityProps> = ({
  user,
  posts,
  setPosts,
  language,
}) => {
  const isTa = language === 'ta'

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL')

  // Create post modal state
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false)
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postCategory, setPostCategory] = useState<CommunityPost['category']>('Crop Tips')
  const [postLang, setPostLang] = useState<'en' | 'ta'>(language)

  // Edit post state
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  // Comment input state per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null)

  // Extract unique voluntary districts from posts
  const uniqueDistricts = Array.from(
    new Set(posts.map(p => p.authorDistrict).filter(Boolean))
  )

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postTitle.trim() || !postContent.trim()) return

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorDistrict: user.district || user.location.split(',')[0].trim() || 'Tamil Nadu',
      authorCrops: user.primaryCrops || ['Tomato', 'Onion'],
      isVerifiedExpert: false,
      title: postTitle.trim(),
      content: postContent.trim(),
      category: postCategory,
      language: postLang,
      likes: [],
      comments: [],
      reports: [],
      createdAt: new Date().toISOString(),
    }

    const updated = [newPost, ...posts]
    setPosts(updated)
    saveStoredCommunityPosts(updated)

    setPostTitle('')
    setPostContent('')
    setIsNewPostModalOpen(false)
  }

  const handleLikePost = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id !== postId) return p
      const alreadyLiked = p.likes.includes(user.id)
      const newLikes = alreadyLiked
        ? p.likes.filter(id => id !== user.id)
        : [...p.likes, user.id]
      return { ...p, likes: newLikes }
    })
    setPosts(updated)
    saveStoredCommunityPosts(updated)
  }

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim()
    if (!text) return

    const newComment: CommunityComment = {
      id: `comm-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorDistrict: user.district || user.location.split(',')[0].trim() || 'Local Farm',
      text,
      createdAt: new Date().toISOString(),
      isExpert: false,
      verifiedExpertBadge: false,
    }

    const updated = posts.map(p => {
      if (p.id !== postId) return p
      return { ...p, comments: [...p.comments, newComment] }
    })

    setPosts(updated)
    saveStoredCommunityPosts(updated)
    setCommentInputs({ ...commentInputs, [postId]: '' })
  }

  const handleDeletePost = (postId: string) => {
    if (window.confirm(isTa ? 'உங்கள் பதிவை நீக்க உறுதி செய்கிறீர்களா?' : 'Are you sure you want to delete your post?')) {
      const updated = posts.filter(p => p.id !== postId)
      setPosts(updated)
      saveStoredCommunityPosts(updated)
    }
  }

  const handleStartEdit = (post: CommunityPost) => {
    setEditingPostId(post.id)
    setEditTitle(post.title)
    setEditContent(post.content)
  }

  const handleSaveEdit = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id !== postId) return p
      return {
        ...p,
        title: editTitle.trim(),
        content: editContent.trim(),
        updatedAt: new Date().toISOString(),
      }
    })
    setPosts(updated)
    saveStoredCommunityPosts(updated)
    setEditingPostId(null)
  }

  const handleReportPost = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post?.reports.includes(user.id)) {
      alert(isTa ? 'நீங்கள் ஏற்கனவே இந்த பதிவை புகாரளித்துள்ளீர்கள்.' : 'You have already reported this post for moderator review.')
      return
    }

    if (window.confirm(isTa ? 'பொருத்தமற்ற அல்லது தவறான உள்ளடக்கமாக புகாரளிக்க விரும்புகிறீர்களா?' : 'Report this post to agricultural moderators for inappropriate or misleading content?')) {
      const updated = posts.map(p => {
        if (p.id !== postId) return p
        return { ...p, reports: [...p.reports, user.id] }
      })
      setPosts(updated)
      saveStoredCommunityPosts(updated)
      alert(isTa ? 'நன்றி. உங்கள் புகார் பதிவாகியுள்ளது.' : 'Thank you. Report received for community moderation.')
    }
  }

  // Filter posts
  const filteredPosts = posts.filter(post => {
    // Hide posts with 3 or more reports
    if (post.reports && post.reports.length >= 3) return false

    const matchesCategory = selectedCategory === 'ALL' || post.category === selectedCategory
    const matchesDistrict = selectedDistrict === 'ALL' || post.authorDistrict.toLowerCase().includes(selectedDistrict.toLowerCase())
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorDistrict.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesCategory && matchesDistrict && matchesSearch
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            {isTa ? 'ஸ்மார்ட் உழவர் சமூகம்' : 'Smart Farmer Community & Peer Exchange'}
          </h1>
          <p className="text-xs text-slate-500">
            {isTa
              ? 'தமிழ் & ஆங்கிலத்தில் பயிர் ஆலோசனைகள், உழவர் குழு விற்பனை மற்றும் அனுபவப் பகிர்வு'
              : 'Collaborate with verified local growers, organize bulk group-selling, and exchange crop tips'}
          </p>
        </div>

        <button
          onClick={() => setIsNewPostModalOpen(true)}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950/20 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-lime-400" />
          <span>{isTa ? 'புதிய பதிவு வெளியிடுக' : 'Create Farmer Post'}</span>
        </button>
      </div>

      {/* Privacy & Expert Notice Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <div>
            <span className="font-bold block">{isTa ? 'தனிநபர் பாதுகாப்பு' : 'Strict Farmer Privacy'}</span>
            <span className="text-emerald-800 text-[11px]">
              {isTa
                ? 'உங்கள் தொலைபேசி எண் மற்றும் துல்லிய பண்ணை இருப்பிடம் பொதுவில் பகிரப்படாது.'
                : 'Phone numbers and precise coordinates are protected. Only voluntarily shared districts appear.'}
            </span>
          </div>
        </div>

        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 flex items-center gap-2.5">
          <BadgeCheck className="w-5 h-5 text-sky-700 flex-shrink-0" />
          <div>
            <span className="font-bold block">{isTa ? 'சான்றளிக்கப்பட்ட வல்லுநர்கள்' : 'Credential-Verified Expert Badges'}</span>
            <span className="text-sky-800 text-[11px]">
              {isTa
                ? 'பல்கலைக்கழக அல்லது ICAR வேளாண் விஞ்ஞானிகளுக்கு மட்டுமே சரிபார்க்கப்பட்ட பேட்ஜ் வழங்கப்படும்.'
                : 'Verified badges require ICAR / State Agri University institutional verification.'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isTa ? 'தலைப்பு, மாவட்டம் அல்லது பயிரை தேடுக...' : 'Search discussions, district, crop topic...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* District filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Districts ({posts.length})</option>
              {uniqueDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pill Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
          {['ALL', 'Group Selling', 'Crop Tips', 'Pest & Health', 'Seed & Equipment', 'Market Discussion', 'General Q&A'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'Group Selling' ? '🤝 Group Selling' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isOwn = post.authorId === user.id
          const isLiked = post.likes.includes(user.id)
          const isEditing = editingPostId === post.id
          const commentsOpen = activeCommentPostId === post.id

          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 hover:border-emerald-200 transition-colors"
            >
              {/* Post Author & Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    post.isVerifiedExpert ? 'bg-sky-100 text-sky-800 border-2 border-sky-400' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {post.authorName.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900">{post.authorName}</span>
                      {post.isVerifiedExpert && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-300">
                          <BadgeCheck className="w-3.5 h-3.5 text-sky-600" />
                          Verified Agronomist
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {post.authorDistrict}
                      </span>
                    </div>
                    {post.expertTitle && (
                      <p className="text-[11px] text-sky-700 italic font-medium">{post.expertTitle}</p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold">{post.category}</span>
                      <span>•</span>
                      <span className="uppercase text-[9px] font-bold text-emerald-700">{post.language === 'ta' ? 'தமிழ்' : 'English'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Edit/Delete if own, Report if other */}
                <div className="flex items-center gap-1">
                  {isOwn ? (
                    <>
                      <button
                        onClick={() => handleStartEdit(post)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit post"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleReportPost(post.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                      title="Report inappropriate content"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Post Body (or Editing Form) */}
              {isEditing ? (
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                  <textarea
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingPostId(null)}
                      className="px-3 py-1 bg-slate-200 rounded-lg text-xs font-bold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(post.id)}
                      className="px-3 py-1 bg-emerald-800 rounded-lg text-xs font-bold text-white"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>
              )}

              {/* Group Selling Highlight Badge */}
              {post.category === 'Group Selling' && (
                <div className="p-2.5 bg-lime-50 rounded-xl border border-lime-200 text-xs text-emerald-950 flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    Collaborative Transport / Bulk Lot Inquiry
                  </span>
                  <button
                    onClick={() => setActiveCommentPostId(post.id)}
                    className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950"
                  >
                    Join Cargo Discussion
                  </button>
                </div>
              )}

              {/* Footer Bar: Likes & Comments Count */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1.5 font-bold transition-colors ${
                      isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
                    <span>{post.likes.length} Likes</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentPostId(commentsOpen ? null : post.id)}
                    className="flex items-center gap-1.5 font-bold text-slate-500 hover:text-emerald-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} Comments</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  {post.authorCrops.slice(0, 2).join(', ')} Grower
                </span>
              </div>

              {/* Expandable Comments Section */}
              {commentsOpen && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="space-y-2">
                    {post.comments.map((comm) => (
                      <div key={comm.id} className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-800">{comm.authorName}</span>
                            {comm.verifiedExpertBadge && (
                              <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-bold">
                                Expert Verified
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">({comm.authorDistrict})</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700">{comm.text}</p>
                      </div>
                    ))}

                    {post.comments.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-2">
                        {isTa ? 'இன்னும் கருத்துகள் இல்லை. முதல் கருத்தை பதிவிடுங்கள்!' : 'No comments yet. Share your experience or advice first!'}
                      </p>
                    )}
                  </div>

                  {/* Add comment input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isTa ? 'உங்கள் கருத்தை அல்லது ஆலோசனையை எழுதவும்...' : 'Write your comment or answer...'}
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id)
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">
              {isTa ? 'எந்த பதிவுகளும் பொருந்தவில்லை' : 'No Community Discussions Found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isTa ? 'தேடல் சொற்களை மாற்றவும் அல்லது ஒரு புதிய பதிவை உருவாக்கவும்.' : 'Try adjusting your district or topic filter, or create a new post to ask fellow farmers.'}
            </p>
          </div>
        )}
      </div>

      {/* Create New Post Modal */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                {isTa ? 'புதிய உழவர் பதிவு உருவாக்கம்' : 'Create Farmer Community Discussion'}
              </h2>
              <button
                onClick={() => setIsNewPostModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category / Purpose</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Crop Tips">Crop Tips & Practice (பயிர் வழிகாட்டல்)</option>
                    <option value="Group Selling">Group Selling / Bulk Cargo (குழு விற்பனை)</option>
                    <option value="Pest & Health">Pest & Health Diagnosis (பூச்சி & நோய்)</option>
                    <option value="Seed & Equipment">Seed & Equipment Rental (விதை & உபகரணங்கள்)</option>
                    <option value="Market Discussion">Market & APMC Trends (சந்தை நிலவரம்)</option>
                    <option value="General Q&A">General Q&A (பொதுக் கேள்விகள்)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Post Language</label>
                  <select
                    value={postLang}
                    onChange={(e) => setPostLang(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="en">English</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Discussion Title</label>
                <input
                  type="text"
                  placeholder="e.g. Group Selling: 3 tons tomatoes from Dindigul to Koyambedu"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Discussion Details & Questions</label>
                <textarea
                  rows={4}
                  placeholder="Describe your question, farming experience, required freight sharing, or equipment specs..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 leading-relaxed"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>
                  Author will display as: <strong>{user.name}</strong> ({user.district || user.location.split(',')[0].trim()}). Contact info remains hidden.
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition-colors shadow-md shadow-emerald-950/20"
                >
                  Publish Discussion Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
