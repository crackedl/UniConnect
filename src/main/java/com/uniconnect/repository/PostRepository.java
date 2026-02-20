package com.uniconnect.repository;

import com.uniconnect.model.Post;
import com.uniconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {



    List<Post> findByAuthorOrderByTimestampDesc(User author);

    // Pentru Feed-ul principal: Toate postările, cele noi primele
    List<Post> findAllByOrderByTimestampDesc();

    List<Post> findByAuthor(User author);

    // Căutare pe facultate, ordonată
    List<Post> findByFacultyOrderByTimestampDesc(String faculty);

    List<Post> findByDepartment(String department);

    List<Post> findByFacultyAndDepartment(String faculty, String department);

    List<Post> findByContentContainingIgnoreCase(String keyword);

    List<Post> findByAuthorUserIdOrderByTimestampDesc(Long userId);
    // NOU: Calculează suma like-urilor pentru toate postările unui user

    @Query("SELECT COUNT(u) FROM Post p JOIN p.likedByUsers u WHERE p.author = :user")
    Long countTotalLikesByUser(@Param("user") User user);
    // NOU: Numără postările unui user
    Integer countByAuthor(User author);
}