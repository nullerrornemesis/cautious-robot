import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import defaultUserIcon from "/home/samuel/Documents/GitHub/cautious-robot/socialApp-client/src/depositphotos_137014128-stock-illustration-user-profile-icon.webp"; // Import default user icon image
import { IoMdHeartEmpty } from "react-icons/io";
import { BiRepost } from "react-icons/bi";
import { AiOutlineComment } from "react-icons/ai";
import { AiOutlineShareAlt } from "react-icons/ai";
import "../styles/post-details.css";

const CACHE_DURATION = 3600000;

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    const cachedPostData = localStorage.getItem(`post_${postId}`);
    const cachedUserData = localStorage.getItem(`user_${postId}`);
    const cacheTimestamp = localStorage.getItem(`cacheTimestamp_${postId}`);

    const isCacheValid =
      cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION;

    if (cachedPostData && cachedUserData && isCacheValid) {
      setPost(JSON.parse(cachedPostData));
      setUser(JSON.parse(cachedUserData));
    } else {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/posts/${postId}`
        );
        if (response.status === 200) {
          const postData = response.data;
          setPost(postData);
          localStorage.setItem(`post_${postId}`, JSON.stringify(postData));
          localStorage.setItem(
            `cacheTimestamp_${postId}`,
            Date.now().toString()
          );
          const userId = postData.userId;
          if (userId) {
            fetchUserDetails(userId);
          } else {
            setError("User ID not found in post details");
          }
        } else {
          setError("Failed to fetch post details");
        }
      } catch (error) {
        console.error("Error fetching post details:", error.message);
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/users/${userId}`
      );
      if (response.status === 200) {
        const userData = response.data;
        setUser(userData);
        localStorage.setItem(`user_${postId}`, JSON.stringify(userData));
      } else {
        setError("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      setError("Something went wrong. Please try again later.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    const formattedDate = new Date(dateString).toLocaleString("en-US", options);
    return formattedDate.replace(",", " •");
  };

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    post &&
    user && (
      <div className="post-detail-container">
        <div className="post-detail-header">
          <img
            src={user.profileImage || defaultUserIcon}
            alt="User Icon"
            className="user-icon"
          />
          <div>
            <p className="user-name">@{user.username}</p>
          </div>
        </div>
        <div className="post-detail-content">
          <p>{post.content}</p>
        </div>
        <small className="date-post">
          {formatDate(post.postDate)}
          {" • "}
          {post.views ? `${post.views} Views` : "N/A Views"}
        </small>
        <hr className="hr2" />
        <div className="shares-likes">
          <p>1 Likes</p>
          <p>3 Shares</p>
        </div>
        <hr className="hr3" />
        <div className="post-actions">
          <AiOutlineComment className="post-action-icon" />
          <IoMdHeartEmpty className="post-action-icon" />
          <BiRepost className="post-action-icon" />
          <AiOutlineShareAlt className="post-action-icon" />
        </div>
        <hr className="hr3" />
        <div className="comments">
          <ul className="list-comment">
            {post.commentsList.map((comment) => (
              <li key={comment.id} className="comment-item">
                <img
                  src={user.profileImage || defaultUserIcon}
                  alt="User Icon"
                  className="comm-icon"
                />
                <div>
                  <p className="user-id">@{comment.userId}</p>
                </div>
                <p className="comm-content">{comment.content}</p>
                <br />
                <small className="post-comment-date">
                  {formatDate(comment.commentDate)}
                  {" • "}
                  {comment.views ? `${comment.views} Views` : "N/A Views"}
                </small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  );
};

export default PostDetail;
