package com.uniconnect.service;

import com.uniconnect.exception.InvalidInputException;
import com.uniconnect.model.Comment;
import com.uniconnect.model.Post;
import com.uniconnect.model.User;
import com.uniconnect.repository.CommentRepository;
import com.uniconnect.repository.UserRepository; // <--- Import UserRepository
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostService postService;
    private final UserRepository userRepository; // <--- Avem nevoie de asta acum

    public CommentService(CommentRepository commentRepository,
                          PostService postService,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postService = postService;
        this.userRepository = userRepository;
    }

    public Comment createComment(User author, Long postId, String content, Long parentId) {
        if (content == null || content.trim().isEmpty()) {
            throw new InvalidInputException("Comment cannot be empty");
        }

        Post post = postService.getById(postId);

        Comment comment = new Comment();
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setContent(content);
        comment.setTimestamp(LocalDateTime.now());
        // Nu mai setăm likes = 0, se inițializează automat Set-ul gol

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new InvalidInputException("Parent comment not found"));
            if (!parent.getPost().getPostId().equals(postId)) {
                throw new InvalidInputException("Parent comment belongs to a different post");
            }
            comment.setParent(parent);
        }

        return commentRepository.save(comment);
    }

    // --- METODA NOUĂ DE LIKE INTELIGENT ---
    public Comment likeComment(Long commentId, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new InvalidInputException("Comment not found"));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidInputException("User not found"));

        // 1. REGULA: Nu poți da like la propriul comentariu
        if (comment.getAuthor().getUserId().equals(currentUser.getUserId())) {
            throw new InvalidInputException("You cannot like your own comment!");
        }

        // 2. TOGGLE: Dacă ai dat like -> scoate-l. Dacă nu -> pune-l.
        if (comment.getLikedByUsers().contains(currentUser)) {
            comment.getLikedByUsers().remove(currentUser); // Unlike
        } else {
            comment.getLikedByUsers().add(currentUser); // Like
        }

        return commentRepository.save(comment);
    }

    // ... restul metodelor (getByPost, getByUser, deleteComment) rămân la fel
    public List<Comment> getByPost(Long postId) {
        Post post = postService.getById(postId);
        return commentRepository.findByPostOrderByTimestampAsc(post);
    }

    public List<Comment> getByUser(User user) {
        return commentRepository.findByAuthor(user);
    }

    public void deleteComment(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new InvalidInputException("Comment not found");
        }
        commentRepository.deleteById(id);
    }
}