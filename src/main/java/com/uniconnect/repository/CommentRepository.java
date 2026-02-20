package com.uniconnect.repository;

import com.uniconnect.model.Comment;
import com.uniconnect.model.Post;
import com.uniconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Comentariile unei postări, în ordine cronologică
    List<Comment> findByPostOrderByTimestampAsc(Post post);
    @Query("SELECT COUNT(u) FROM Comment c JOIN c.likedByUsers u WHERE c.author = :user")
    Long countTotalLikesOnCommentsByUser(@Param("user") User user);

    List<Comment> findByAuthor(User author);
}