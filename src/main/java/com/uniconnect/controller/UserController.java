package com.uniconnect.controller;

import com.uniconnect.model.Post;
import com.uniconnect.model.User;
import com.uniconnect.repository.CommentRepository; // <--- IMPORT NOU
import com.uniconnect.repository.PostRepository;
import com.uniconnect.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository; // <--- CÂMP NOU

    // Injectăm și CommentRepository în constructor
    public UserController(UserRepository userRepository,
                          PostRepository postRepository,
                          CommentRepository commentRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    // 1. DATELE MELE
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.of(userRepository.findByEmail(email));
    }

    // 2. ACTUALIZARE PROFIL
    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> payload, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (payload.containsKey("bio")) user.setBio(payload.get("bio"));
        if (payload.containsKey("profilePicture")) user.setProfilePicture(payload.get("profilePicture"));

        return ResponseEntity.ok(userRepository.save(user));
    }

    // 3. POSTĂRILE MELE
    @GetMapping("/my-posts")
    public List<Post> getMyPosts(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return postRepository.findByAuthorOrderByTimestampDesc(user);
    }

    // --- FUNCȚIONALITĂȚI NOI PENTRU COMUNITATE ---

    // 4. CĂUTARE
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String query) {
        if (query == null || query.trim().isEmpty()) return List.of();
        List<User> results = new ArrayList<>();

        if (query.matches("\\d+")) {
            try {
                Long id = Long.parseLong(query);
                userRepository.findById(id).ifPresent(results::add);
            } catch (NumberFormatException ignored) {}
        }

        List<User> textMatches = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
        for (User u : textMatches) {
            if (results.stream().noneMatch(existing -> existing.getUserId().equals(u.getUserId()))) {
                results.add(u);
            }
        }
        return results;
    }

    // 5. STATISTICI USER (KARMA = Post Likes + Comment Likes)
    // Acest endpoint este nou și vital pentru profil!
    @GetMapping("/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        // 1. Număr total postări
        Integer postCount = postRepository.countByAuthor(user);


        // 2. Like-uri de la Postări
        // --- MODIFICARE: Acum e Long ---
        Long postLikesLong = postRepository.countTotalLikesByUser(user);
        int postLikes = (postLikesLong != null) ? postLikesLong.intValue() : 0;

        // 3. Like-uri de la Comentarii
        Long commentLikesLong = commentRepository.countTotalLikesOnCommentsByUser(user);
        int commentLikes = (commentLikesLong != null) ? commentLikesLong.intValue() : 0;

        // 4. Total
        int totalKarma = postLikes + commentLikes;
        Map<String, Object> stats = new HashMap<>();
        stats.put("postCount", postCount);
        stats.put("totalLikes", totalKarma); // Aici e suma totală

        return ResponseEntity.ok(stats);
    }

    // 6. PROFIL ALTCINEVA (Datele Userului)
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 7. POSTĂRILE ALTCUIVA
    @GetMapping("/{userId}/posts")
    public List<Post> getUserPosts(@PathVariable Long userId) {
        return postRepository.findByAuthorUserIdOrderByTimestampDesc(userId);
    }
}